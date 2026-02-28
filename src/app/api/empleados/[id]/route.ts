import { NextRequest, NextResponse } from 'next/server'

// GET /api/empleados/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // TODO: Conectar con Prisma
  return NextResponse.json({ id: params.id, message: 'Empleado no encontrado' }, { status: 404 })
}

// PUT /api/empleados/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    // TODO: Implementar con Prisma
    return NextResponse.json({ id: params.id, ...body })
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

// DELETE /api/empleados/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // TODO: Implementar con Prisma
  return NextResponse.json({ message: 'Empleado dado de baja' })
}
