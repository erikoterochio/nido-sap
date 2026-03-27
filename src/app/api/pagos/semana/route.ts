import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/pagos/semana?inicio=YYYY-MM-DD&fin=YYYY-MM-DD
// Si no se pasan fechas, calcula la semana actual (viernes a jueves)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    // Calcular semana actual: viernes pasado → jueves próximo
    const hoy = new Date()
    const diaSemana = hoy.getDay() // 0=dom, 1=lun, ... 5=vie, 6=sab

    // Días hasta el viernes anterior
    const diasHastaViernesAnterior = diaSemana >= 5
      ? diaSemana - 5          // ya pasó el viernes esta semana
      : diaSemana + 2          // el viernes fue la semana pasada

    const viernesInicio = new Date(hoy)
    viernesInicio.setDate(hoy.getDate() - diasHastaViernesAnterior)
    viernesInicio.setHours(0, 0, 0, 0)

    const juevesFin = new Date(viernesInicio)
    juevesFin.setDate(viernesInicio.getDate() + 6)
    juevesFin.setHours(23, 59, 59, 999)

    // Permitir override por query params
    const inicioParam = searchParams.get('inicio')
    const finParam = searchParams.get('fin')

    const fechaInicio = inicioParam ? new Date(inicioParam + 'T00:00:00') : viernesInicio
    const fechaFin = finParam ? new Date(finParam + 'T23:59:59') : juevesFin

    // Día de pago = viernes siguiente al fin de semana
    const diaPago = new Date(fechaFin)
    diaPago.setDate(fechaFin.getDate() + 1)

    // Traer empleados activos con sus turnos APROBADOS en el período
    const empleados = await prisma.empleado.findMany({
      where: { activo: true },
      include: {
        turnos: {
          where: {
            estado: 'APROBADO',
            fecha: {
              gte: fechaInicio,
              lte: fechaFin,
            },
          },
          include: {
            departamento: { select: { id: true, nombre: true } },
          },
          orderBy: { fecha: 'asc' },
        },
        anticipos: {
          where: {
            estado: 'PENDIENTE',
          },
          orderBy: { fecha: 'asc' },
        },
      },
      orderBy: { nombre: 'asc' },
    })

    // Calcular resumen por empleado
    const resumen = empleados
      .filter(emp => emp.turnos.length > 0 || Number(emp.saldoPendiente) !== 0)
      .map(emp => {
        const horasNormales = emp.turnos
          .filter(t => !t.esFeriadoFinde)
          .reduce((acc, t) => acc + Number(t.duracionHoras), 0)

        const horasFinde = emp.turnos
          .filter(t => t.esFeriadoFinde)
          .reduce((acc, t) => acc + Number(t.duracionHoras), 0)

        const viaticosTotal = emp.turnos
          .reduce((acc, t) => acc + Number(t.viaticos), 0)

        const subtotalTurnos = emp.turnos
          .reduce((acc, t) => acc + Number(t.montoTotal), 0)

        const totalAnticipos = emp.anticipos
          .reduce((acc, a) => acc + Number(a.monto), 0)

        const saldoAnterior = Number(emp.saldoPendiente)

        // Total a pagar = lo de esta semana - anticipos + saldo anterior
        // saldoAnterior > 0: te debemos de antes → sumamos
        // saldoAnterior < 0: nos debe de antes → restamos
        const totalAPagar = subtotalTurnos - totalAnticipos + saldoAnterior

        return {
          id: emp.id,
          nombre: emp.nombre,
          apellido: emp.apellido,
          cvuAlias: emp.cvuAlias,
          precioHoraNormal: Number(emp.precioHoraNormal),
          precioHoraFinde: Number(emp.precioHoraFinde),
          saldoAnterior,
          horasNormales,
          horasFinde,
          viaticosTotal,
          subtotalTurnos,
          totalAnticipos,
          totalAPagar,
          turnos: emp.turnos.map(t => ({
            id: t.id,
            fecha: t.fecha,
            departamento: t.departamento.nombre,
            duracionHoras: Number(t.duracionHoras),
            esFeriadoFinde: t.esFeriadoFinde,
            viaticos: Number(t.viaticos),
            montoTotal: Number(t.montoTotal),
          })),
          anticipos: emp.anticipos.map(a => ({
            id: a.id,
            fecha: a.fecha,
            monto: Number(a.monto),
            motivo: a.motivo,
          })),
        }
      })

    return NextResponse.json({
      semana: {
        inicio: fechaInicio.toISOString().split('T')[0],
        fin: fechaFin.toISOString().split('T')[0],
        diaPago: diaPago.toISOString().split('T')[0],
      },
      empleados: resumen,
    })
  } catch (error) {
    console.error('Error al calcular pagos de semana:', error)
    return NextResponse.json(
      { error: 'Error al calcular pagos' },
      { status: 500 }
    )
  }
}