import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const departamentos = await prisma.departamento.findMany({
      where: { estado: 'ACTIVO' },
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    })
    return NextResponse.json(departamentos)
  } catch (error) {
    return NextResponse.json({ error: 'Error al cargar departamentos' }, { status: 500 })
  }
}