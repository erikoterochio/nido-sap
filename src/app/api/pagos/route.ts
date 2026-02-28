import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/pagos - Obtener pagos pendientes y historial
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tipo = searchParams.get('tipo') || 'pendientes' // pendientes | historial
    const empleadoId = searchParams.get('empleadoId')
    const mes = searchParams.get('mes')
    const anio = searchParams.get('anio')

    if (tipo === 'pendientes') {
      // Obtener empleados con turnos pendientes de pago
      const where: any = {
        pagoEjecutado: false,
      }

      if (empleadoId) {
        where.empleadoId = empleadoId
      }

      const turnosPendientes = await prisma.turnoLimpieza.findMany({
        where,
        orderBy: { fecha: 'desc' },
        include: {
          empleado: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              puesto: true,
              cvuAlias: true,
            },
          },
          departamento: {
            select: {
              id: true,
              nombre: true,
              direccion: true,
            },
          },
        },
      })

      // Agrupar por empleado
      const empleadosMap = new Map<string, any>()

      turnosPendientes.forEach(turno => {
        const empId = turno.empleadoId
        if (!empleadosMap.has(empId)) {
          empleadosMap.set(empId, {
            id: turno.empleado.id,
            nombre: turno.empleado.nombre,
            apellido: turno.empleado.apellido,
            puesto: turno.empleado.puesto,
            cvuAlias: turno.empleado.cvuAlias,
            turnosPendientes: [],
            totalPendiente: 0,
            horasPendientes: 0,
          })
        }

        const emp = empleadosMap.get(empId)
        emp.turnosPendientes.push({
          id: turno.id,
          fecha: turno.fecha.toISOString().split('T')[0],
          departamento: `${turno.departamento.nombre} - ${turno.departamento.direccion}`,
          departamentoId: turno.departamento.id,
          horas: Number(turno.duracionHoras),
          monto: Number(turno.pagoRealizar) - Number(turno.viaticos),
          viaticos: Number(turno.viaticos),
          esFindeFeriado: turno.esFindeFeriado,
        })
        emp.totalPendiente += Number(turno.pagoRealizar)
        emp.horasPendientes += Number(turno.duracionHoras)
      })

      return NextResponse.json(Array.from(empleadosMap.values()))
    } else {
      // Historial de pagos (turnos ya pagados)
      const where: any = {
        pagoEjecutado: true,
      }

      if (empleadoId) {
        where.empleadoId = empleadoId
      }

      if (mes && anio) {
        const startDate = new Date(parseInt(anio), parseInt(mes) - 1, 1)
        const endDate = new Date(parseInt(anio), parseInt(mes), 0)
        where.fechaPago = {
          gte: startDate,
          lte: endDate,
        }
      }

      const turnosPagados = await prisma.turnoLimpieza.findMany({
        where,
        orderBy: { fechaPago: 'desc' },
        take: 50,
        include: {
          empleado: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
          departamento: {
            select: {
              nombre: true,
            },
          },
        },
      })

      const historial = turnosPagados.map(turno => ({
        id: turno.id,
        fecha: turno.fechaPago?.toISOString().split('T')[0],
        empleado: `${turno.empleado.nombre} ${turno.empleado.apellido}`,
        empleadoId: turno.empleado.id,
        concepto: `Turno ${turno.departamento.nombre}`,
        monto: Number(turno.pagoRealizar),
        metodo: 'Transferencia', // TODO: Agregar campo metodo al schema
      }))

      return NextResponse.json(historial)
    }
  } catch (error) {
    console.error('Error fetching pagos:', error)
    return NextResponse.json(
      { error: 'Error al obtener pagos' },
      { status: 500 }
    )
  }
}

// POST /api/pagos - Registrar un pago
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      empleadoId,
      turnoIds,
      metodo,
      nota,
    } = body

    if (!empleadoId || !turnoIds || turnoIds.length === 0) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Verificar que todos los turnos pertenecen al empleado y no están pagados
    const turnos = await prisma.turnoLimpieza.findMany({
      where: {
        id: { in: turnoIds },
        empleadoId,
        pagoEjecutado: false,
      },
    })

    if (turnos.length !== turnoIds.length) {
      return NextResponse.json(
        { error: 'Algunos turnos no son válidos o ya fueron pagados' },
        { status: 400 }
      )
    }

    // Marcar todos los turnos como pagados
    const fechaPago = new Date()
    
    await prisma.turnoLimpieza.updateMany({
      where: {
        id: { in: turnoIds },
      },
      data: {
        pagoEjecutado: true,
        fechaPago,
      },
    })

    // Calcular el total pagado
    const totalPagado = turnos.reduce((sum, t) => sum + Number(t.pagoRealizar), 0)

    // TODO: Registrar en tabla de movimientos financieros
    // await prisma.movimientoFinanciero.create({
    //   data: {
    //     organizacionId: ...,
    //     fecha: fechaPago,
    //     tipo: 'EGRESO',
    //     categoria: 'SUELDOS',
    //     subcategoria: 'TURNOS_LIMPIEZA',
    //     monto: totalPagado,
    //     moneda: 'ARS',
    //     metodoPago: metodo.toUpperCase(),
    //     concepto: `Pago turnos a empleado ${empleadoId}`,
    //     notas: nota,
    //     unidadNegocio: 'COLIVING',
    //   },
    // })

    return NextResponse.json({
      message: 'Pago registrado correctamente',
      turnosPagados: turnos.length,
      totalPagado,
      fechaPago: fechaPago.toISOString(),
    })
  } catch (error) {
    console.error('Error registering pago:', error)
    return NextResponse.json(
      { error: 'Error al registrar pago' },
      { status: 500 }
    )
  }
}
