import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET /api/empleados - Listar empleados (mock por ahora)
export async function GET(request: NextRequest) {
  try {
    const empleados = await prisma.empleado.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, apellido: true },
      orderBy: { nombre: 'asc' },
    })
    return NextResponse.json(empleados)
  } catch (error) {
    return NextResponse.json({ error: 'Error al cargar empleados' }, { status: 500 })
  }
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
