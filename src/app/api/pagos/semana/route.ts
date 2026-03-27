// GET /api/pagos/semana?inicio=YYYY-MM-DD&fin=YYYY-MM-DD
// Devuelve el resumen de pagos del período: empleadas, turnos aprobados,
// anticipos pendientes y saldos anteriores.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Redondea a N decimales para evitar errores de float (ej: 706.829999...)
function redondear(n: number, decimales = 2) {
  return Math.round(n * Math.pow(10, decimales)) / Math.pow(10, decimales)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    let inicio = searchParams.get('inicio')
    let fin = searchParams.get('fin')

    // Si no vienen fechas, calculamos la semana actual (lunes a domingo)
    if (!inicio || !fin) {
      const hoy = new Date()
      const diaSemana = hoy.getDay()
      const diasDesdeElLunes = diaSemana === 0 ? 6 : diaSemana - 1
      const lunes = new Date(hoy)
      lunes.setDate(hoy.getDate() - diasDesdeElLunes)
      const domingo = new Date(lunes)
      domingo.setDate(lunes.getDate() + 6)
      inicio = lunes.toISOString().split('T')[0]
      fin = domingo.toISOString().split('T')[0]
    }

    // Día de pago: viernes de la semana siguiente al fin del período
    const fechaFin = new Date(fin + 'T12:00:00')
    const diasHastaViernes = (5 - fechaFin.getDay() + 7) % 7 || 7
    const diaPago = new Date(fechaFin)
    diaPago.setDate(fechaFin.getDate() + diasHastaViernes)
    const diaPagoStr = diaPago.toISOString().split('T')[0]

    // Turnos APROBADOS del período con empleada y departamento
    const turnos = await prisma.turnoLimpieza.findMany({
      where: {
        fecha: {
          gte: new Date(inicio + 'T00:00:00'),
          lte: new Date(fin + 'T23:59:59'),
        },
        estado: 'APROBADO',
      },
      include: {
        empleado: true,
        departamento: { select: { nombre: true } },
      },
      orderBy: { fecha: 'asc' },
    })

    // IDs únicos de empleadas con turnos en el período
    const empleadoIds = Array.from(new Set(turnos.map(t => t.empleadoId)))

    // Anticipos PENDIENTES de esas empleadas
    const anticipos = await prisma.anticipo.findMany({
      where: {
        empleadoId: { in: empleadoIds },
        estado: 'PENDIENTE',
      },
      orderBy: { fecha: 'asc' },
    })

    // Agrupamos por empleada
    const empleadosMap = new Map<string, any>()

    for (const turno of turnos) {
      const emp = turno.empleado
      if (!empleadosMap.has(emp.id)) {
        empleadosMap.set(emp.id, {
          id: emp.id,
          nombre: emp.nombre,
          apellido: emp.apellido,
          cvuAlias: emp.cvuAlias,
          precioHoraNormal: Number(emp.precioHoraNormal),
          precioHoraFinde: Number(emp.precioHoraFinde),
          saldoAnterior: Number(emp.saldoPendiente),
          horasNormales: 0,
          horasFinde: 0,
          viaticosTotal: 0,
          subtotalTurnos: 0,
          totalAnticipos: 0,
          totalAPagar: 0,
          turnos: [],
          anticipos: [],
        })
      }

      const datos = empleadosMap.get(emp.id)
      const horas = Number(turno.duracionHoras)

      if (turno.esFeriadoFinde) {
        datos.horasFinde += horas
      } else {
        datos.horasNormales += horas
      }

      datos.viaticosTotal += Number(turno.viaticos)
      datos.subtotalTurnos += Number(turno.montoTotal)

      // Fecha como string ISO para evitar Invalid Date en el cliente
      datos.turnos.push({
        id: turno.id,
        fecha: turno.fecha.toISOString().split('T')[0],
        departamento: turno.departamento.nombre,
        duracionHoras: horas,
        esFeriadoFinde: turno.esFeriadoFinde,
        viaticos: Number(turno.viaticos),
        montoTotal: Number(turno.montoTotal),
      })
    }

    // Agregamos anticipos
    for (const anticipo of anticipos) {
      const datos = empleadosMap.get(anticipo.empleadoId)
      if (!datos) continue
      datos.totalAnticipos += Number(anticipo.monto)
      datos.anticipos.push({
        id: anticipo.id,
        fecha: anticipo.fecha.toISOString().split('T')[0],
        monto: Number(anticipo.monto),
        motivo: anticipo.motivo,
      })
    }

    // Calculamos totales y redondeamos todo para evitar errores de float
    for (const [, datos] of Array.from(empleadosMap)) {
      datos.horasNormales  = redondear(datos.horasNormales, 2)
      datos.horasFinde     = redondear(datos.horasFinde, 2)
      datos.viaticosTotal  = redondear(datos.viaticosTotal, 2)
      datos.subtotalTurnos = redondear(datos.subtotalTurnos, 2)
      datos.totalAnticipos = redondear(datos.totalAnticipos, 2)
      // Fórmula: subtotalTurnos - anticipos + saldoAnterior
      // saldoAnterior > 0 = le debíamos de semanas anteriores
      // saldoAnterior < 0 = nos pagamos de más, se descuenta
      datos.totalAPagar = redondear(
        datos.subtotalTurnos - datos.totalAnticipos + datos.saldoAnterior,
        2
      )
    }

    return NextResponse.json({
      semana: { inicio, fin, diaPago: diaPagoStr },
      empleados: Array.from(empleadosMap.values()),
    })

  } catch (error) {
    console.error('[GET /api/pagos/semana]', error)
    return NextResponse.json(
      { error: 'Error al calcular pagos de la semana' },
      { status: 500 }
    )
  }
}