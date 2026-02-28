import { NextRequest, NextResponse } from 'next/server'

// GET /api/pagos
export async function GET(request: NextRequest) {
  // TODO: Conectar con Prisma
  return NextResponse.json([])
}

// POST /api/pagos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // TODO: Implementar con Prisma
    return NextResponse.json({ message: 'Pago registrado', data: body })
  } catch (error) {
    return NextResponse.json({ error: 'Error al registrar pago' }, { status: 500 })
  }
}
