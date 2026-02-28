import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/empleados - Listar empleados
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const puesto = searchParams.get('puesto')
    const status = searchParams.get('status')
    const unidadNegocio = searchParams.get('unidadNegocio')
    const search = searchParams.get('search')

    const where: any = {}

    if (puesto && puesto !== 'todos') {
      where.puesto = puesto
    }

    if (status && status !== 'todos') {
      where.status = status
    }

    if (unidadNegocio && unidadNegocio !== 'todos') {
      where.unidadNegocio = unidadNegocio
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { dni: { contains: search } },
      ]
    }

    const empleados = await prisma.empleado.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { apellido: 'asc' },
        { nombre: 'asc' },
      ],
      include: {
        turnosLimpieza: {
          where: {
            pagoEjecutado: false,
          },
          select: {
            id: true,
            pagoRealizar: true,
            duracionHoras: true,
          },
        },
      },
    })

    // Calcular datos agregados para cada empleado
    const empleadosConDatos = empleados.map(emp => {
      const turnosPendientes = emp.turnosLimpieza.length
      const pagoPendiente = emp.turnosLimpieza.reduce(
        (sum, t) => sum + Number(t.pagoRealizar), 
        0
      )
      const horasDelMes = emp.turnosLimpieza.reduce(
        (sum, t) => sum + Number(t.duracionHoras), 
        0
      )

      // Excluir turnosLimpieza del resultado
      const { turnosLimpieza, ...empleadoData } = emp

      return {
        ...empleadoData,
        turnosPendientes,
        pagoPendiente,
        horasDelMes,
      }
    })

    return NextResponse.json(empleadosConDatos)
  } catch (error) {
    console.error('Error fetching empleados:', error)
    return NextResponse.json(
      { error: 'Error al obtener empleados' },
      { status: 500 }
    )
  }
}

// POST /api/empleados - Crear nuevo empleado
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      nombre,
      apellido,
      fechaNacimiento,
      dni,
      cuil,
      telefono,
      email,
      domicilio,
      puesto,
      unidadNegocio,
      fechaIngreso,
      tipoSueldo,
      sueldoBase,
      precioHora,
      horasMensuales,
      cvuAlias,
      crearUsuario,
    } = body

    // Validaciones básicas
    if (!nombre || !apellido || !dni || !cuil || !puesto || !unidadNegocio || !tipoSueldo) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un empleado con ese DNI
    const existingEmpleado = await prisma.empleado.findFirst({
      where: { dni },
    })

    if (existingEmpleado) {
      return NextResponse.json(
        { error: 'Ya existe un empleado con ese DNI' },
        { status: 400 }
      )
    }

    // Obtener la organización (asumiendo que hay una por defecto)
    // En producción, esto vendría del contexto de autenticación
    const organizacion = await prisma.organizacion.findFirst()
    
    if (!organizacion) {
      return NextResponse.json(
        { error: 'No se encontró la organización' },
        { status: 400 }
      )
    }

    // Crear el empleado
    const empleado = await prisma.empleado.create({
      data: {
        organizacionId: organizacion.id,
        nombre,
        apellido,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
        dni,
        cuil,
        telefono: telefono || null,
        email: email || null,
        domicilio: domicilio || null,
        puesto,
        unidadNegocio,
        fechaIngreso: new Date(fechaIngreso),
        tipoSueldo,
        sueldoBase: sueldoBase ? parseFloat(sueldoBase) : null,
        precioHora: precioHora ? parseFloat(precioHora) : null,
        horasMensuales: horasMensuales ? parseInt(horasMensuales) : null,
        cvuAlias: cvuAlias || null,
        status: 'ACTIVO',
      },
    })

    // Si se pidió crear usuario, crear el registro de usuario
    if (crearUsuario && email) {
      // TODO: Implementar creación de usuario con Supabase Auth
      // await createUserAccount(email, empleado.id)
    }

    return NextResponse.json(empleado, { status: 201 })
  } catch (error) {
    console.error('Error creating empleado:', error)
    return NextResponse.json(
      { error: 'Error al crear empleado' },
      { status: 500 }
    )
  }
}
