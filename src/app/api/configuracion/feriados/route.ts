import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET — lista feriados
export async function GET() {
  try {
    const feriados = await prisma.diaEspecial.findMany({
      orderBy: { fecha: 'asc' },
    })
    return NextResponse.json(feriados)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener feriados' }, { status: 500 })
  }
}

// POST — crear feriado
export async function POST(request: NextRequest) {
  try {
    const { fecha, tipo, descripcion } = await request.json()
    if (!fecha || !tipo) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }
    const feriado = await prisma.diaEspecial.create({
      data: { fecha: new Date(fecha), tipo, descripcion },
    })
    return NextResponse.json(feriado, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear feriado' }, { status: 500 })
  }
}

// DELETE — eliminar feriado
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    await prisma.diaEspecial.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar feriado' }, { status: 500 })
  }
}