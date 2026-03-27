import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/pagos/confirmar
// Registra el pago, descuenta anticipos y actualiza saldo pendiente
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      empleadoId,
      montoPagado,       // lo que realmente se transfirió (puede ser redondeado)
      totalCalculado,    // lo que el sistema calculó que se debía
      anticiposIds,      // IDs de anticipos a marcar como DESCONTADO
      periodo,           // string "YYYY-MM-DD/YYYY-MM-DD" para el concepto
      notas,
    } = body

    // Validaciones básicas
    if (!empleadoId || montoPagado === undefined || !periodo) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: empleadoId, montoPagado, periodo' },
        { status: 400 }
      )
    }

    // Ejecutar todo en una transacción para garantizar consistencia
    const resultado = await prisma.$transaction(async (tx) => {

      // 1. Registrar el pago en pagoempleado
      const pago = await tx.pagoEmpleado.create({
        data: {
          id: `pago_${Date.now()}_${empleadoId}`,
          empleadoId,
          fecha: new Date(),
          monto: montoPagado,
          concepto: `Pago semanal ${periodo}`,
          periodo,
          metodoPago: 'transferencia',
          notas: notas || null,
        },
      })

      // 2. Marcar anticipos como DESCONTADO
      if (anticiposIds && anticiposIds.length > 0) {
        await tx.anticipo.updateMany({
          where: {
            id: { in: anticiposIds },
            empleadoId, // seguridad: solo anticipos de este empleado
          },
          data: {
            estado: 'DESCONTADO',
            descontadoEn: new Date(),
          },
        })
      }

      // 3. Actualizar saldo pendiente del empleado
      // Lógica: nuevoSaldo = totalCalculado - montoPagado
      // Si pagamos de más → saldo negativo (el empleado nos debe, se descuenta la próxima)
      // Si pagamos de menos → saldo positivo (le debemos, se suma la próxima)
      const diferencia = totalCalculado - montoPagado
      // diferencia > 0: pagamos menos de lo que debíamos → seguimos debiéndole (sumamos al saldo)
      // diferencia < 0: pagamos más de lo que debíamos → nos queda crédito (restamos del saldo)

      const empleadoActual = await tx.empleado.findUnique({
        where: { id: empleadoId },
        select: { saldoPendiente: true },
      })

      const saldoActual = Number(empleadoActual?.saldoPendiente ?? 0)
      // Restamos lo que ya estaba contemplado en el cálculo y sumamos la diferencia
      // El saldoAnterior ya fue incluido en totalCalculado, entonces el nuevo saldo es solo la diferencia
      const nuevoSaldo = diferencia

      await tx.empleado.update({
        where: { id: empleadoId },
        data: { saldoPendiente: nuevoSaldo },
      })

      return { pago, nuevoSaldo }
    })

    return NextResponse.json({
      ok: true,
      pagoId: resultado.pago.id,
      nuevoSaldo: resultado.nuevoSaldo,
      mensaje: resultado.nuevoSaldo === 0
        ? 'Pago exacto registrado'
        : resultado.nuevoSaldo > 0
          ? `Quedó un saldo a favor del empleado de $${resultado.nuevoSaldo.toLocaleString('es-AR')}`
          : `Quedó un crédito a favor de $${Math.abs(resultado.nuevoSaldo).toLocaleString('es-AR')} para descontar`,
    })
  } catch (error) {
    console.error('Error al confirmar pago:', error)
    return NextResponse.json(
      { error: 'Error al registrar el pago' },
      { status: 500 }
    )
  }
}