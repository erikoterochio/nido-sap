import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET — lista deptos con limiteHoras
export async function GET() {
  try {
    const deptos = await prisma.departamento.findMany({
      where:   { estado: 'ACTIVO' },
      select:  { id: true, nombre: true, limiteHoras: true },
      orderBy: { nombre: 'asc' },
    })
    return NextResponse.json(deptos)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener departamentos' }, { status: 500 })
  }
}

// PATCH — actualizar limiteHoras de un depto
export async function PATCH(request: NextRequest) {
  try {
    const { id, limiteHoras } = await request.json()
    if (!id || !limiteHoras) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }
    const depto = await prisma.departamento.update({
      where:  { id },
      data:   { limiteHoras: Number(limiteHoras) },
      select: { id: true, nombre: true, limiteHoras: true },
    })
    return NextResponse.json(depto)
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar departamento' }, { status: 500 })
  }
}