import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Hora límite para alertas de horario inusual
const HORA_MINIMA = 7   // antes de las 7am = alerta
const HORA_MAXIMA = 23  // después de las 11pm = alerta

// Calcula las alertas de un turno
function calcularAlertas(
  horaEntrada: string,
  horaSalida: string,
  duracionHoras: number,
  limiteHorasDepto: number
): string[] {
  const alertas: string[] = []
  const horaE = parseInt(horaEntrada.split(':')[0])
  const horaS = parseInt(horaSalida.split(':')[0])

  if (duracionHoras > limiteHorasDepto) alertas.push('DURACION_EXCEDE_LIMITE')
  if (horaE < HORA_MINIMA || horaS > HORA_MAXIMA) alertas.push('HORARIO_INUSUAL')

  return alertas
}

// GET /api/turnos — lista con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Filtros opcionales
    const departamentoId = searchParams.get('departamentoId')
    const empleadoId     = searchParams.get('empleadoId')
    const estado         = searchParams.get('estado')
    const mes            = searchParams.get('mes') // formato: YYYY-MM
    const fechaDesde     = searchParams.get('fechaDesde')
    const fechaHasta     = searchParams.get('fechaHasta')

    const turnos = await prisma.turnoLimpieza.findMany({
      where: {
        ...(departamentoId && { departamentoId }),
        ...(empleadoId     && { empleadoId }),
        ...(estado         && { estado: estado as any }),
        ...(mes && {
          mes: new Date(`${mes}-01`)
        }),
        ...(fechaDesde && fechaHasta && {
          fecha: {
            gte: new Date(fechaDesde),
            lte: new Date(fechaHasta),
          }
        }),
      },
      include: {
        departamento: { select: { id: true, nombre: true } },
        empleado:     { select: { id: true, nombre: true, apellido: true } },
      },
      orderBy: { fecha: 'desc' },
    })

    return NextResponse.json(turnos)
  } catch (error) {
    console.error('Error al listar turnos:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST /api/turnos — crear turno
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      departamentoId,
      empleadoId,
      fecha,
      horaEntrada,
      horaSalida,
      viaticos = 0,
      esFeriadoFinde = false,
      comentarios,
      tipo = 'LIMPIEZA',
    } = body

    // Validaciones básicas
    if (!departamentoId || !empleadoId || !fecha || !horaEntrada || !horaSalida) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    // Calcular duración en horas
    const [hE, mE] = horaEntrada.split(':').map(Number)
    const [hS, mS] = horaSalida.split(':').map(Number)
    const duracionHoras = ((hS * 60 + mS) - (hE * 60 + mE)) / 60

    if (duracionHoras <= 0) {
      return NextResponse.json(
        { error: 'La hora de salida debe ser posterior a la de entrada' },
        { status: 400 }
      )
    }

    // Obtener precio hora del empleado y límite del departamento
    const [empleado, departamento] = await Promise.all([
      prisma.empleado.findUnique({ where: { id: empleadoId } }),
      prisma.departamento.findUnique({ where: { id: departamentoId } }),
    ])

    if (!empleado || !departamento) {
      return NextResponse.json(
        { error: 'Empleado o departamento no encontrado' },
        { status: 404 }
      )
    }

    const precioHora   = esFeriadoFinde
      ? Number(empleado.precioHoraFinde)
      : Number(empleado.precioHoraNormal)
    const montoTotal   = duracionHoras * precioHora + Number(viaticos)
    const fechaDate    = new Date(fecha)
    const mes          = new Date(fechaDate.getFullYear(), fechaDate.getMonth(), 1)

    // Calcular alertas automáticas
    const alertas = calcularAlertas(
      horaEntrada,
      horaSalida,
      duracionHoras,
      Number(departamento.limiteHoras)
    )

    const turno = await prisma.turnoLimpieza.create({
      data: {
        departamentoId,
        empleadoId,
        fecha:        fechaDate,
        horaEntrada,
        horaSalida,
        duracionHoras,
        viaticos,
        esFeriadoFinde,
        comentarios,
        tipo,
        precioHora,
        montoTotal,
        mes,
        alertas,
        // Si tiene alertas queda en revisión, si no va directo a aprobado
        estado: alertas.length > 0 ? 'PENDIENTE_REVISION' : 'APROBADO' as any,
      },
      include: {
        departamento: { select: { id: true, nombre: true } },
        empleado:     { select: { id: true, nombre: true, apellido: true } },
      },
    })

    return NextResponse.json(turno, { status: 201 })
  } catch (error) {
    console.error('Error al crear turno:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}