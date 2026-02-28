import { NextRequest, NextResponse } from 'next/server'

// GET /api/empleados - Listar empleados (mock por ahora)
export async function GET(request: NextRequest) {
  // TODO: Conectar con Prisma cuando el schema esté listo
  return NextResponse.json([])
}

// POST /api/empleados - Crear nuevo empleado
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // TODO: Implementar con Prisma
    return NextResponse.json({ message: 'Empleado creado', data: body }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear empleado' }, { status: 500 })
  }
}
