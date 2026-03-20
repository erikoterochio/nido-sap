import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET /api/turnos/[id] — detalle con historial
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [turno, historial] = await Promise.all([
      prisma.turnoLimpieza.findUnique({
        where: { id: params.id },
        include: {
          departamento: { select: { id: true, nombre: true } },
          empleado:     { select: { id: true, nombre: true, apellido: true } },
        },
      }),
      // Consultamos el historial por separado para evitar el conflicto de relaciones
      prisma.historialCambio.findMany({
        where: { entidad: 'TurnoLimpieza', entidadId: params.id },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    if (!turno) {
      return NextResponse.json({ error: 'Turno no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ ...turno, historial })
  } catch (error) {
    console.error('Error al obtener turno:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PATCH /api/turnos/[id] — editar o cambiar estado
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { motivo, usuarioId, comentario, ...cambios } = body

    if (!motivo || !usuarioId) {
      return NextResponse.json(
        { error: 'El motivo y el usuarioId son obligatorios' },
        { status: 400 }
      )
    }

    const turnoActual = await prisma.turnoLimpieza.findUnique({
      where: { id: params.id },
    })

    if (!turnoActual) {
      return NextResponse.json({ error: 'Turno no encontrado' }, { status: 404 })
    }

    if (turnoActual.estado === 'PAGADO') {
      return NextResponse.json(
        { error: 'No se puede modificar un turno que ya fue pagado' },
        { status: 403 }
      )
    }

    // Registrar solo los campos que realmente cambiaron
    const registrosHistorial = Object.entries(cambios)
      .filter(([campo, valorNuevo]) => {
        const valorActual = turnoActual[campo as keyof typeof turnoActual]
        return String(valorActual) !== String(valorNuevo)
      })
      .map(([campo, valorNuevo]) => ({
        entidad:         'TurnoLimpieza',
        entidadId:       params.id,
        campoModificado: campo,
        valorAnterior:   String(turnoActual[campo as keyof typeof turnoActual] ?? ''),
        valorNuevo:      String(valorNuevo),
        motivo,
        comentario:      comentario || null,
        usuarioId,
      }))

    const turnoActualizado = await prisma.$transaction(async (tx) => {
      const turno = await tx.turnoLimpieza.update({
        where: { id: params.id },
        data:  cambios,
        include: {
          departamento: { select: { id: true, nombre: true } },
          empleado:     { select: { id: true, nombre: true, apellido: true } },
        },
      })

      if (registrosHistorial.length > 0) {
        await tx.historialCambio.createMany({ data: registrosHistorial })
      }

      return turno
    })

    return NextResponse.json(turnoActualizado)
  } catch (error) {
    console.error('Error al actualizar turno:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}