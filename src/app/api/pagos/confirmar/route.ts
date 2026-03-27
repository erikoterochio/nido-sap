// POST /api/pagos/confirmar
// Registra el pago a una empleada:
//   1. Crea registro en PagoEmpleado
//   2. Marca los anticipos como DESCONTADO
//   3. Actualiza saldoPendiente de la empleada
//   4. Registra en AuditLog para auditoría (HistorialCambio no tiene FK a PagoEmpleado)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { empleadoId, montoPagado, totalCalculado, anticiposIds, periodo } = body

    // Validaciones básicas
    if (!empleadoId || !montoPagado || !totalCalculado) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos: empleadoId, montoPagado, totalCalculado' },
        { status: 400 }
      )
    }
    if (montoPagado <= 0) {
      return NextResponse.json(
        { error: 'El monto pagado debe ser mayor a cero' },
        { status: 400 }
      )
    }

    // Verificamos que la empleada exista
    const empleado = await prisma.empleado.findUnique({ where: { id: empleadoId } })
    if (!empleado) {
      return NextResponse.json({ error: 'Empleada no encontrada' }, { status: 404 })
    }

    // Todo en una transacción para evitar estados inconsistentes
    const resultado = await prisma.$transaction(async (tx) => {

      // 1. Registrar el pago
      const pago = await tx.pagoEmpleado.create({
        data: {
          empleadoId,
          fecha: new Date(),
          monto: montoPagado,
          concepto: `Liquidación semanal ${periodo || ''}`.trim(),
          periodo: periodo || null,
          metodoPago: 'TRANSFERENCIA',
          notas: totalCalculado !== montoPagado
            ? `Total calculado: $${totalCalculado}. Diferencia: $${montoPagado - totalCalculado}`
            : null,
          updatedAt: new Date(),
        },
      })

      // 2. Marcar anticipos como descontados
      if (anticiposIds?.length > 0) {
        await tx.anticipo.updateMany({
          where: {
            id: { in: anticiposIds },
            empleadoId, // seguridad: solo los de esta empleada
            estado: 'PENDIENTE',
          },
          data: {
            estado: 'DESCONTADO',
            descontadoEn: new Date(),
            updatedAt: new Date(),
          },
        })
      }

      // 3. Recalcular saldoPendiente
      // positivo = le debemos a ella, negativo = nos pagamos de más
      const nuevoSaldo = Math.round((totalCalculado - montoPagado) * 100) / 100

      await tx.empleado.update({
        where: { id: empleadoId },
        data: { saldoPendiente: nuevoSaldo, updatedAt: new Date() },
      })

      // 4. ✅ Fix: usar AuditLog en lugar de HistorialCambio
      // HistorialCambio tiene FK duras solo a TurnoLimpieza y Gasto,
      // no a PagoEmpleado — usarlo acá tiraría constraint error.
      await tx.auditLog.create({
        data: {
          usuarioId: 'system', // TODO: reemplazar con ID de sesión cuando implementes auth
          accion: 'PAGO_CONFIRMADO',
          entidad: 'PagoEmpleado',
          entidadId: pago.id,
          detalles: {
            montoPagado,
            totalCalculado,
            diferencia: totalCalculado - montoPagado,
            nuevoSaldo,
            anticiposDescontados: anticiposIds?.length || 0,
            periodo: periodo || null,
          },
        },
      })

      return { pago, nuevoSaldo }
    })

    // Mensaje para el toast de éxito
    const diferencia = totalCalculado - montoPagado
    let mensaje = `Pago de $${montoPagado.toLocaleString('es-AR')} registrado.`
    if (diferencia > 0) {
      mensaje += ` Saldo pendiente: $${diferencia.toLocaleString('es-AR')}`
    } else if (diferencia < 0) {
      mensaje += ` Crédito a favor: $${Math.abs(diferencia).toLocaleString('es-AR')}`
    }

    return NextResponse.json({
      ok: true,
      mensaje,
      pagoId: resultado.pago.id,
      nuevoSaldo: resultado.nuevoSaldo,
    })

  } catch (error) {
    console.error('[POST /api/pagos/confirmar]', error)
    return NextResponse.json(
      { error: 'Error al registrar el pago. Intentá de nuevo.' },
      { status: 500 }
    )
  }
}