import { NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import prisma from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const user = await prisma.usuario.findUnique({
      where: { email },
      include: { empleado: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    const isValidPassword = await compare(password, user.passwordHash)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    if (!user.activo) {
      return NextResponse.json(
        { error: 'Usuario desactivado' },
        { status: 401 }
      )
    }

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        usuarioId: user.id,
        accion: 'LOGIN',
        detalles: { email: user.email },
      },
    })

    // Devolver usuario (sin password)
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
        empleadoId: user.empleado?.id,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
