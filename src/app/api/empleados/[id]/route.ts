import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/empleados/[id] - Obtener empleado por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const empleado = await prisma.empleado.findUnique({
      where: { id: params.id },
      include: {
        turnosLimpieza: {
          orderBy: { fecha: 'desc' },
          take: 20,
          include: {
            departamento: {
              select: {
                id: true,
                nombre: true,
                direccion: true,
              },
            },
          },
        },
        liquidacionesSueldo: {
          orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
          take: 12,
        },
        adelantos: {
          where: {
            estado: { not: 'DESCONTADO' },
          },
          orderBy: { fecha: 'desc' },
        },
        horasExtra: {
          orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
          take: 6,
        },
      },
    })

    if (!empleado) {
      return NextResponse.json(
        { error: 'Empleado no encontrado' },
        { status: 404 }
      )
    }

    // Calcular estadísticas
    const turnosPendientes = empleado.turnosLimpieza.filter(t => !t.pagoEjecutado)
    const pagoPendiente = turnosPendientes.reduce(
      (sum, t) => sum + Number(t.pagoRealizar), 
      0
    )
    const horasDelMes = turnosPendientes.reduce(
      (sum, t) => sum + Number(t.duracionHoras), 
      0
    )

    return NextResponse.json({
      ...empleado,
      stats: {
        turnosPendientes: turnosPendientes.length,
        pagoPendiente,
        horasDelMes,
        adelantosPendientes: empleado.adelantos.reduce(
          (sum, a) => sum + Number(a.monto),
          0
        ),
      },
    })
  } catch (error) {
    console.error('Error fetching empleado:', error)
    return NextResponse.json(
      { error: 'Error al obtener empleado' },
      { status: 500 }
    )
  }
}

// PUT /api/empleados/[id] - Actualizar empleado
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      status,
      fechaIngreso,
      tipoSueldo,
      sueldoBase,
      precioHora,
      horasMensuales,
      cvuAlias,
    } = body

    // Verificar que el empleado existe
    const existingEmpleado = await prisma.empleado.findUnique({
      where: { id: params.id },
    })

    if (!existingEmpleado) {
      return NextResponse.json(
        { error: 'Empleado no encontrado' },
        { status: 404 }
      )
    }

    // Si cambió el DNI, verificar que no exista otro empleado con ese DNI
    if (dni !== existingEmpleado.dni) {
      const dniExists = await prisma.empleado.findFirst({
        where: {
          dni,
          id: { not: params.id },
        },
      })

      if (dniExists) {
        return NextResponse.json(
          { error: 'Ya existe otro empleado con ese DNI' },
          { status: 400 }
        )
      }
    }

    // Actualizar el empleado
    const empleado = await prisma.empleado.update({
      where: { id: params.id },
      data: {
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
        status: status || existingEmpleado.status,
        fechaIngreso: fechaIngreso ? new Date(fechaIngreso) : existingEmpleado.fechaIngreso,
        tipoSueldo,
        sueldoBase: sueldoBase ? parseFloat(sueldoBase) : null,
        precioHora: precioHora ? parseFloat(precioHora) : null,
        horasMensuales: horasMensuales ? parseInt(horasMensuales) : null,
        cvuAlias: cvuAlias || null,
      },
    })

    return NextResponse.json(empleado)
  } catch (error) {
    console.error('Error updating empleado:', error)
    return NextResponse.json(
      { error: 'Error al actualizar empleado' },
      { status: 500 }
    )
  }
}

// DELETE /api/empleados/[id] - Dar de baja empleado (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar que el empleado existe
    const existingEmpleado = await prisma.empleado.findUnique({
      where: { id: params.id },
    })

    if (!existingEmpleado) {
      return NextResponse.json(
        { error: 'Empleado no encontrado' },
        { status: 404 }
      )
    }

    // Soft delete: cambiar status a INACTIVO y agregar fecha de egreso
    const empleado = await prisma.empleado.update({
      where: { id: params.id },
      data: {
        status: 'INACTIVO',
        fechaEgreso: new Date(),
      },
    })

    return NextResponse.json({ 
      message: 'Empleado dado de baja correctamente',
      empleado,
    })
  } catch (error) {
    console.error('Error deleting empleado:', error)
    return NextResponse.json(
      { error: 'Error al dar de baja empleado' },
      { status: 500 }
    )
  }
}
