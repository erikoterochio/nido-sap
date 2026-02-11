import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Limpiar datos existentes
  await prisma.auditLog.deleteMany()
  await prisma.historialCambio.deleteMany()
  await prisma.anticipo.deleteMany()
  await prisma.pagoEmpleado.deleteMany()
  await prisma.liquidacion.deleteMany()
  await prisma.ingresoMensual.deleteMany()
  await prisma.gasto.deleteMany()
  await prisma.turnoLimpieza.deleteMany()
  await prisma.tipoGasto.deleteMany()
  await prisma.departamento.deleteMany()
  await prisma.empleado.deleteMany()
  await prisma.usuario.deleteMany()
  await prisma.configuracion.deleteMany()
  await prisma.diaEspecial.deleteMany()

  // Crear usuarios admin
  const adminPassword = await hash('admin123', 10)
  
  const adminJuana = await prisma.usuario.create({
    data: {
      email: 'juana@benveo.net',
      passwordHash: adminPassword,
      nombre: 'Juana López Mosteirin',
      rol: 'ADMIN',
    },
  })

  const adminCata = await prisma.usuario.create({
    data: {
      email: 'cata@benveo.net',
      passwordHash: adminPassword,
      nombre: 'Catalina Givogri',
      rol: 'ADMIN',
    },
  })

  console.log('✅ Usuarios admin creados')

  // Crear empleados de limpieza
  const staffPassword = await hash('1234', 10)

  const usuarioSandra = await prisma.usuario.create({
    data: {
      email: 'sandra@benveo.net',
      passwordHash: staffPassword,
      nombre: 'Sandra Lastra',
      rol: 'STAFF',
    },
  })

  const sandra = await prisma.empleado.create({
    data: {
      usuarioId: usuarioSandra.id,
      nombre: 'Sandra',
      apellido: 'Lastra',
      dni: '24249123',
      telefono: '1133416158',
      email: 'sandramarcelalastra74@gmail.com',
      precioHoraNormal: 6000,
      precioHoraFinde: 7000,
      cvuAlias: 'vaso.cebra.anafe.mp',
    },
  })

  const juliana = await prisma.empleado.create({
    data: {
      nombre: 'Juliana',
      apellido: 'García',
      telefono: '1166258820',
      precioHoraNormal: 6000,
      precioHoraFinde: 7000,
    },
  })

  const gladys = await prisma.empleado.create({
    data: {
      nombre: 'Gladys',
      apellido: 'Saban',
      precioHoraNormal: 6000,
      precioHoraFinde: 7000,
    },
  })

  console.log('✅ Empleados creados')

  // Crear departamentos
  const departamentos = await Promise.all([
    prisma.departamento.create({
      data: {
        nombre: 'Defensa I',
        direccion: 'Defensa 1035',
        duenos: ['Facundo Vega'],
        comisionPorcentaje: 0.20,
        quienPagaServicios: 'BENVEO',
        descuentoBajarDinero: true,
      },
    }),
    prisma.departamento.create({
      data: {
        nombre: 'Defensa II',
        direccion: 'Defensa 912',
        duenos: ['Facundo Vega'],
        comisionPorcentaje: 0.20,
        quienPagaServicios: 'BENVEO',
        descuentoBajarDinero: true,
      },
    }),
    prisma.departamento.create({
      data: {
        nombre: 'Eslovenia I (502)',
        direccion: 'Eslovenia 502',
        duenos: ['Bautista Leivar'],
        comisionPorcentaje: 0.20,
        quienPagaServicios: 'BENVEO',
      },
    }),
    prisma.departamento.create({
      data: {
        nombre: 'Eslovenia II (904)',
        direccion: 'Eslovenia 904',
        duenos: ['Bautista Leivar'],
        comisionPorcentaje: 0.20,
        quienPagaServicios: 'BENVEO',
      },
    }),
    prisma.departamento.create({
      data: {
        nombre: 'Araoz',
        direccion: 'Araoz 2288',
        duenos: ['Facundo Vega', 'Bautista Leivar'],
        comisionPorcentaje: 0.20,
        quienPagaServicios: 'BENVEO',
      },
    }),
    prisma.departamento.create({
      data: {
        nombre: 'Moreno',
        direccion: 'Moreno 550',
        duenos: ['Eduardo Fontenla'],
        comisionPorcentaje: 0.20,
        quienPagaServicios: 'DUENO',
      },
    }),
    prisma.departamento.create({
      data: {
        nombre: 'Petit',
        direccion: 'Petit',
        duenos: ['Owner'],
        comisionPorcentaje: 0.20,
        quienPagaServicios: 'BENVEO',
      },
    }),
    prisma.departamento.create({
      data: {
        nombre: 'Azopardo',
        direccion: 'Azopardo 770',
        duenos: ['Bautista Leivar'],
        comisionPorcentaje: 0,
        quienPagaServicios: 'DUENO',
      },
    }),
  ])

  console.log('✅ Departamentos creados')

  // Crear tipos de gasto
  const tiposGasto = await Promise.all([
    // Servicios
    prisma.tipoGasto.create({ data: { nombre: 'ABL', categoria: 'SERVICIOS', esServicio: true } }),
    prisma.tipoGasto.create({ data: { nombre: 'AYSA', categoria: 'SERVICIOS', esServicio: true } }),
    prisma.tipoGasto.create({ data: { nombre: 'Edenor', categoria: 'SERVICIOS', esServicio: true } }),
    prisma.tipoGasto.create({ data: { nombre: 'Edesur', categoria: 'SERVICIOS', esServicio: true } }),
    prisma.tipoGasto.create({ data: { nombre: 'Metrogas', categoria: 'SERVICIOS', esServicio: true } }),
    prisma.tipoGasto.create({ data: { nombre: 'Flow', categoria: 'SERVICIOS', esServicio: true } }),
    prisma.tipoGasto.create({ data: { nombre: 'Telecentro', categoria: 'SERVICIOS', esServicio: true } }),
    prisma.tipoGasto.create({ data: { nombre: 'Expensas ordinarias', categoria: 'SERVICIOS', esServicio: true } }),
    prisma.tipoGasto.create({ data: { nombre: 'Expensas extraordinarias', categoria: 'SERVICIOS', esServicio: true } }),
    // Limpieza
    prisma.tipoGasto.create({ data: { nombre: 'Lavadero', categoria: 'LIMPIEZA_LAVANDERIA' } }),
    prisma.tipoGasto.create({ data: { nombre: 'Insumos limpieza', categoria: 'INSUMOS_LIMPIEZA' } }),
    // Traslados
    prisma.tipoGasto.create({ data: { nombre: 'Uber', categoria: 'TRASLADOS' } }),
    prisma.tipoGasto.create({ data: { nombre: 'Taxi', categoria: 'TRASLADOS' } }),
    // Reposición
    prisma.tipoGasto.create({ data: { nombre: 'Pava eléctrica', categoria: 'REEMPLAZO_REPOSICION' } }),
    prisma.tipoGasto.create({ data: { nombre: 'Aspiradora', categoria: 'REEMPLAZO_REPOSICION' } }),
    prisma.tipoGasto.create({ data: { nombre: 'Sábanas', categoria: 'REEMPLAZO_REPOSICION' } }),
    // Mantenimiento
    prisma.tipoGasto.create({ data: { nombre: 'Cerrajero', categoria: 'MANTENIMIENTO' } }),
    prisma.tipoGasto.create({ data: { nombre: 'Plomero', categoria: 'MANTENIMIENTO' } }),
    prisma.tipoGasto.create({ data: { nombre: 'Electricista', categoria: 'MANTENIMIENTO' } }),
  ])

  console.log('✅ Tipos de gasto creados')

  // Crear algunos turnos de ejemplo
  const mesActual = new Date(2025, 0, 1) // Enero 2025

  const turnosEjemplo = [
    { depto: departamentos[0], empleado: sandra, fecha: new Date(2025, 0, 14), entrada: '11:00', salida: '15:00' },
    { depto: departamentos[0], empleado: sandra, fecha: new Date(2025, 0, 10), entrada: '11:20', salida: '15:00' },
    { depto: departamentos[3], empleado: sandra, fecha: new Date(2025, 0, 13), entrada: '09:00', salida: '12:00' },
    { depto: departamentos[4], empleado: sandra, fecha: new Date(2025, 0, 12), entrada: '10:00', salida: '14:30' },
    { depto: departamentos[6], empleado: sandra, fecha: new Date(2025, 0, 11), entrada: '11:00', salida: '23:00' }, // Turno con error
    { depto: departamentos[7], empleado: juliana, fecha: new Date(2025, 0, 8), entrada: '09:30', salida: '13:30' },
    { depto: departamentos[4], empleado: gladys, fecha: new Date(2025, 0, 6), entrada: '11:00', salida: '14:00' },
  ]

  for (const t of turnosEjemplo) {
    const [hE, mE] = t.entrada.split(':').map(Number)
    const [hS, mS] = t.salida.split(':').map(Number)
    const duracion = ((hS * 60 + mS) - (hE * 60 + mE)) / 60
    const esFinde = t.fecha.getDay() === 0 || t.fecha.getDay() === 6
    const precioHora = esFinde ? Number(t.empleado.precioHoraFinde) : Number(t.empleado.precioHoraNormal)
    const monto = duracion * precioHora

    const alertas: string[] = []
    if (duracion > 8) alertas.push('DURACION_INUSUAL')

    await prisma.turnoLimpieza.create({
      data: {
        departamentoId: t.depto.id,
        empleadoId: t.empleado.id,
        fecha: t.fecha,
        horaEntrada: t.entrada,
        horaSalida: t.salida,
        duracionHoras: duracion,
        esFeriadoFinde: esFinde,
        precioHora: precioHora,
        montoTotal: monto,
        mes: mesActual,
        estado: alertas.length > 0 ? 'PENDIENTE_REVISION' : 'VERIFICADO',
        alertas: alertas,
      },
    })
  }

  console.log('✅ Turnos de ejemplo creados')

  // Crear configuraciones
  await prisma.configuracion.createMany({
    data: [
      { clave: 'precio_hora_normal', valor: { monto: 6000 }, descripcion: 'Precio por hora día normal' },
      { clave: 'precio_hora_finde', valor: { monto: 7000 }, descripcion: 'Precio por hora finde/feriado' },
      { clave: 'tipo_cambio_default', valor: { tasa: 1150 }, descripcion: 'Tipo de cambio ARS/USD por defecto' },
      { clave: 'umbral_horas_alerta', valor: { horas: 8 }, descripcion: 'Umbral para alertar turnos inusuales' },
    ],
  })

  console.log('✅ Configuraciones creadas')

  // Crear algunos feriados de ejemplo
  await prisma.diaEspecial.createMany({
    data: [
      { fecha: new Date(2025, 0, 1), tipo: 'FERIADO', descripcion: 'Año Nuevo' },
      { fecha: new Date(2025, 2, 24), tipo: 'FERIADO', descripcion: 'Día de la Memoria' },
      { fecha: new Date(2025, 3, 2), tipo: 'FERIADO', descripcion: 'Día del Veterano' },
      { fecha: new Date(2025, 4, 1), tipo: 'FERIADO', descripcion: 'Día del Trabajador' },
      { fecha: new Date(2025, 4, 25), tipo: 'FERIADO', descripcion: 'Revolución de Mayo' },
      { fecha: new Date(2025, 5, 20), tipo: 'FERIADO', descripcion: 'Día de la Bandera' },
      { fecha: new Date(2025, 6, 9), tipo: 'FERIADO', descripcion: 'Día de la Independencia' },
    ],
  })

  console.log('✅ Feriados creados')

  console.log('')
  console.log('🎉 Seed completado!')
  console.log('')
  console.log('Usuarios de prueba:')
  console.log('  Admin: juana@benveo.net / admin123')
  console.log('  Admin: cata@benveo.net / admin123')
  console.log('  Staff: sandra@benveo.net / 1234')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
