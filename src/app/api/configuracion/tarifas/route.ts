import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

const CLAVE = 'tarifas_historico'

// GET — devuelve el historial de tarifas
export async function GET() {
  try {
    const config = await prisma.configuracion.findUnique({ where: { clave: CLAVE } })
    const tarifas = config ? (config.valor as any[]) : []
    return NextResponse.json(tarifas)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener tarifas' }, { status: 500 })
  }
}

// POST — agrega una tarifa nueva y recalcula turnos no pagados
export async function POST(request: NextRequest) {
  try {
    const { precioHoraNormal, precioHoraFinde, fechaVigencia, nota } = await request.json()

    if (!precioHoraNormal || !precioHoraFinde || !fechaVigencia) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    // Obtener historial actual
    const config = await prisma.configuracion.findUnique({ where: { clave: CLAVE } })
    const historial = config ? (config.valor as any[]) : []

    // Agregar nueva tarifa
    const nuevaTarifa = {
      id: Date.now().toString(),
      precioHoraNormal: Number(precioHoraNormal),
      precioHoraFinde:  Number(precioHoraFinde),
      fechaVigencia,
      nota: nota || null,
      creadaEn: new Date().toISOString(),
    }

    const nuevoHistorial = [nuevaTarifa, ...historial]

    // Guardar en configuracion
    await prisma.configuracion.upsert({
      where:  { clave: CLAVE },
      create: { clave: CLAVE, valor: nuevoHistorial, descripcion: 'Historial de tarifas por hora' },
      update: { valor: nuevoHistorial },
    })

    // Recalcular todos los turnos no pagados
    const turnosNoPagados = await prisma.turnoLimpieza.findMany({
      where: { estado: { not: 'PAGADO' } },
    })

    // Actualizar cada turno con la nueva tarifa
    await Promise.all(turnosNoPagados.map(turno => {
      const precioHora  = turno.esFeriadoFinde ? precioHoraFinde : precioHoraNormal
      const montoTotal  = Number(turno.duracionHoras) * precioHora + Number(turno.viaticos)
      return prisma.turnoLimpieza.update({
        where: { id: turno.id },
        data:  { precioHora, montoTotal },
      })
    }))

    return NextResponse.json({
      tarifa: nuevaTarifa,
      turnosActualizados: turnosNoPagados.length,
    }, { status: 201 })
  } catch (error) {
    console.error('Error al guardar tarifa:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}