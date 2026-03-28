// GET /api/pagos/historial?meses=6
// Devuelve un resumen tipo grilla de las últimas N semanas:
// filas = semanas, columnas = empleadas, celdas = monto pagado o calculado

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Redondea a 2 decimales para evitar errores de float
function redondear(n: number) {
  return Math.round(n * 100) / 100
}

// Dado un Date, devuelve el viernes de esa semana (inicio del período)
function viernesDeEstaSemana(fecha: Date): Date {
  const dia = fecha.getDay()
  const diasDesdeViernes = (dia + 2) % 7
  const viernes = new Date(fecha)
  viernes.setDate(fecha.getDate() - diasDesdeViernes)
  viernes.setHours(0, 0, 0, 0)
  return viernes
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const meses = parseInt(searchParams.get('meses') ?? '4')

    // Rango: desde hace N meses hasta hoy
    const hoy = new Date()
    const desde = new Date(hoy)
    desde.setMonth(desde.getMonth() - meses)
    desde.setHours(0, 0, 0, 0)

    // Traemos todas las empleadas activas
    const empleadas = await prisma.empleado.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
      select: {
        id: true,
        nombre: true,
        apellido: true,
      },
    })

    // Pagos registrados en el período
    const pagos = await prisma.pagoEmpleado.findMany({
      where: {
        fecha: { gte: desde },
      },
      orderBy: { fecha: 'asc' },
    })

    // Turnos aprobados en el período (para semanas sin pago aún)
    const turnos = await prisma.turnoLimpieza.findMany({
      where: {
        fecha: { gte: desde },
        estado: 'APROBADO',
      },
      select: {
        empleadoId: true,
        fecha: true,
        montoTotal: true,
        viaticos: true,
        esFeriadoFinde: true,
        duracionHoras: true,
      },
      orderBy: { fecha: 'asc' },
    })

    // ── Construimos el mapa de semanas ────────────────────────────────────────
    // Clave: "YYYY-MM-DD" del viernes de esa semana
    const semanasMap = new Map<string, {
      inicio: string
      fin: string
      diaPago: string
      pagadoPorEmpleado: Map<string, { monto: number; pagado: boolean }>
      calculadoPorEmpleado: Map<string, number>
    }>()

    const getOrCreateSemana = (fecha: Date) => {
      const viernes = viernesDeEstaSemana(fecha)
      const jueves = new Date(viernes)
      jueves.setDate(viernes.getDate() + 6)
      const key = viernes.toISOString().split('T')[0]

      if (!semanasMap.has(key)) {
        semanasMap.set(key, {
          inicio: key,
          fin: jueves.toISOString().split('T')[0],
          diaPago: jueves.toISOString().split('T')[0],
          pagadoPorEmpleado: new Map(),
          calculadoPorEmpleado: new Map(),
        })
      }
      return semanasMap.get(key)!
    }

    // Agrupamos pagos por semana
    for (const pago of pagos) {
      const semana = getOrCreateSemana(new Date(pago.fecha))
      semana.pagadoPorEmpleado.set(pago.empleadoId, {
        monto: redondear(Number(pago.monto)),
        pagado: true,
      })
    }

    // Agrupamos turnos por semana para calcular lo no pagado aún
    for (const turno of turnos) {
      const semana = getOrCreateSemana(new Date(turno.fecha))
      const actual = semana.calculadoPorEmpleado.get(turno.empleadoId) ?? 0
      semana.calculadoPorEmpleado.set(
        turno.empleadoId,
        redondear(actual + Number(turno.montoTotal))
      )
    }

    // ── Ordenamos semanas de más reciente a más antigua ───────────────────────
    const semanasOrdenadas = Array.from(semanasMap.values())
      .sort((a, b) => b.inicio.localeCompare(a.inicio))

    // ── Serializamos para el cliente ──────────────────────────────────────────
    const semanas = semanasOrdenadas.map(semana => {
      let total = 0
      const montosPorEmpleado: Record<string, { monto: number; pagado: boolean } | null> = {}

      for (const emp of empleadas) {
        const pagado = semana.pagadoPorEmpleado.get(emp.id)
        const calculado = semana.calculadoPorEmpleado.get(emp.id)

        if (pagado) {
          montosPorEmpleado[emp.id] = { monto: pagado.monto, pagado: true }
          total += pagado.monto
        } else if (calculado && calculado > 0) {
          montosPorEmpleado[emp.id] = { monto: calculado, pagado: false }
          total += calculado
        } else {
          montosPorEmpleado[emp.id] = null
        }
      }

      // La semana se considera pagada si al menos una empleada tiene pago registrado
      // y ninguna tiene monto calculado sin pagar
      const tienePagos = semana.pagadoPorEmpleado.size > 0
      const tieneCalculados = Array.from(semana.calculadoPorEmpleado.entries())
        .some(([empId, monto]) => monto > 0 && !semana.pagadoPorEmpleado.has(empId))
      const pagadaCompleta = tienePagos && !tieneCalculados

      return {
        inicio: semana.inicio,
        fin: semana.fin,
        diaPago: semana.diaPago,
        total: redondear(total),
        pagada: pagadaCompleta,
        tienePagos,
        montosPorEmpleado,
      }
    })

    // Filtramos semanas vacías (sin turnos ni pagos)
    const semanasFiltradas = semanas.filter(s =>
      Object.values(s.montosPorEmpleado).some(v => v !== null)
    )

    return NextResponse.json({
      empleadas: empleadas.map(e => ({
        id: e.id,
        nombre: e.nombre,
        apellido: e.apellido,
      })),
      semanas: semanasFiltradas,
    })

  } catch (error) {
    console.error('[GET /api/pagos/historial]', error)
    return NextResponse.json(
      { error: 'Error al cargar historial de pagos' },
      { status: 500 }
    )
  }
}