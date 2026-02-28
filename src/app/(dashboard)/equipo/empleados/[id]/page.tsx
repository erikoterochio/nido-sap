'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Edit,
  MoreHorizontal,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Building2,
  Clock,
  DollarSign,
  FileText,
  TrendingUp,
  ChevronRight,
  Trash2,
  Download,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// Configuraciones
const puestoConfig = {
  STAFF_LIMPIEZA: { label: 'Staff de Limpieza', color: 'bg-blue-100 text-blue-800' },
  HOST: { label: 'Host', color: 'bg-purple-100 text-purple-800' },
  CO_HOST: { label: 'Co-Host', color: 'bg-purple-100 text-purple-800' },
  ADMINISTRACION: { label: 'Administración', color: 'bg-gray-100 text-gray-800' },
  MANTENIMIENTO: { label: 'Mantenimiento', color: 'bg-orange-100 text-orange-800' },
  ENCARGADO: { label: 'Encargado/a', color: 'bg-green-100 text-green-800' },
  BARISTA: { label: 'Barista', color: 'bg-amber-100 text-amber-800' },
  SEGURIDAD: { label: 'Seguridad', color: 'bg-red-100 text-red-800' },
  COCINERO: { label: 'Cocinero/a', color: 'bg-yellow-100 text-yellow-800' },
  COMUNICACION: { label: 'Comunicación', color: 'bg-pink-100 text-pink-800' },
}

const statusConfig = {
  ACTIVO: { label: 'Activo', color: 'bg-green-100 text-green-800' },
  INACTIVO: { label: 'Inactivo', color: 'bg-gray-100 text-gray-800' },
  VACACIONES: { label: 'Vacaciones', color: 'bg-yellow-100 text-yellow-800' },
  LICENCIA: { label: 'Licencia', color: 'bg-blue-100 text-blue-800' },
}

const tipoSueldoConfig = {
  UN_NETO: { label: 'Un Neto', descripcion: 'Sueldo neto único' },
  DOS_NETOS: { label: 'Dos Netos', descripcion: 'Sueldo dividido' },
  NETO_MAS_BRUTO: { label: 'Neto + Bruto', descripcion: 'Mixto' },
  MONOTRIBUTO: { label: 'Monotributo', descripcion: 'Factura' },
  POR_HORA: { label: 'Por Hora', descripcion: 'Variable' },
}

// Mock data del empleado
const mockEmpleado = {
  id: 'emp1',
  nombre: 'Carolina',
  apellido: 'Gómez',
  email: 'carolina@benveo.com',
  telefono: '+54 11 5555-1234',
  dni: '35.456.789',
  cuil: '27-35456789-4',
  fechaNacimiento: '1990-05-15',
  domicilio: 'Av. Corrientes 1234, CABA',
  puesto: 'STAFF_LIMPIEZA' as const,
  unidadNegocio: 'COLIVING' as const,
  status: 'ACTIVO' as const,
  tipoSueldo: 'POR_HORA' as const,
  sueldoBase: null,
  precioHora: 6000,
  horasMensuales: 40,
  fechaIngreso: '2024-03-15',
  cvuAlias: 'carolina.gomez.mp',
  createdAt: '2024-03-15',
}

// Mock turnos recientes
const mockTurnos = [
  { id: '1', fecha: '2026-02-10', departamento: 'Depto A1 - Palermo', horas: 4, monto: 24000, pagado: false },
  { id: '2', fecha: '2026-02-08', departamento: 'Depto B2 - Recoleta', horas: 3.5, monto: 21000, pagado: false },
  { id: '3', fecha: '2026-02-06', departamento: 'Depto A1 - Palermo', horas: 4, monto: 24000, pagado: true },
  { id: '4', fecha: '2026-02-04', departamento: 'Depto C3 - Belgrano', horas: 5, monto: 30000, pagado: true },
  { id: '5', fecha: '2026-02-01', departamento: 'Depto A1 - Palermo', horas: 4, monto: 24000, pagado: true },
]

// Mock pagos
const mockPagos = [
  { id: '1', fecha: '2026-02-05', concepto: 'Turnos semana 5', monto: 78000, metodo: 'Transferencia' },
  { id: '2', fecha: '2026-01-29', concepto: 'Turnos semana 4', monto: 66000, metodo: 'Transferencia' },
  { id: '3', fecha: '2026-01-22', concepto: 'Turnos semana 3', monto: 72000, metodo: 'Transferencia' },
  { id: '4', fecha: '2026-01-15', concepto: 'Turnos semana 2', monto: 60000, metodo: 'Efectivo' },
]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getInitials(nombre: string, apellido: string) {
  return `${nombre[0]}${apellido[0]}`.toUpperCase()
}

function calcularAntiguedad(fechaIngreso: string): string {
  const ingreso = new Date(fechaIngreso)
  const hoy = new Date()
  const meses = (hoy.getFullYear() - ingreso.getFullYear()) * 12 + (hoy.getMonth() - ingreso.getMonth())
  
  if (meses < 12) {
    return `${meses} meses`
  }
  const años = Math.floor(meses / 12)
  const mesesRestantes = meses % 12
  return mesesRestantes > 0 ? `${años} año${años > 1 ? 's' : ''} y ${mesesRestantes} meses` : `${años} año${años > 1 ? 's' : ''}`
}

export default function EmpleadoDetailPage() {
  const params = useParams()
  const empleadoId = params.id as string
  
  // En producción, cargaríamos el empleado desde la API
  const empleado = mockEmpleado
  const turnos = mockTurnos
  const pagos = mockPagos

  // Calcular estadísticas
  const turnosPendientes = turnos.filter(t => !t.pagado)
  const pagoPendiente = turnosPendientes.reduce((sum, t) => sum + t.monto, 0)
  const horasDelMes = turnos.reduce((sum, t) => sum + t.horas, 0)
  const ingresoDelMes = turnos.reduce((sum, t) => sum + t.monto, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/equipo/empleados">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                {getInitials(empleado.nombre, empleado.apellido)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {empleado.nombre} {empleado.apellido}
                </h1>
                <Badge className={statusConfig[empleado.status].color} variant="secondary">
                  {statusConfig[empleado.status].label}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-gray-500 mt-1">
                <Badge className={puestoConfig[empleado.puesto].color} variant="secondary">
                  {puestoConfig[empleado.puesto].label}
                </Badge>
                <span>•</span>
                <span>{calcularAntiguedad(empleado.fechaIngreso)} en la empresa</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/equipo/empleados/${empleadoId}/editar`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Exportar datos
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Ver recibos
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Dar de baja
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Horas este mes</p>
                <p className="text-xl font-bold">{horasDelMes}hs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ingresos del mes</p>
                <p className="text-xl font-bold">{formatCurrency(ingresoDelMes)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Turnos pendientes</p>
                <p className="text-xl font-bold">{turnosPendientes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cn(pagoPendiente > 0 && "border-orange-200 bg-orange-50")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", pagoPendiente > 0 ? "bg-orange-200" : "bg-gray-100")}>
                <DollarSign className={cn("h-5 w-5", pagoPendiente > 0 ? "text-orange-600" : "text-gray-600")} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pago pendiente</p>
                <p className={cn("text-xl font-bold", pagoPendiente > 0 && "text-orange-600")}>
                  {formatCurrency(pagoPendiente)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del empleado */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{empleado.email || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-medium">{empleado.telefono || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Domicilio</p>
                  <p className="font-medium">{empleado.domicilio || '-'}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">DNI</p>
                  <p className="font-medium">{empleado.dni}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">CUIL</p>
                  <p className="font-medium">{empleado.cuil}</p>
                </div>
              </div>
              {empleado.fechaNacimiento && (
                <div>
                  <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                  <p className="font-medium">{formatDate(empleado.fechaNacimiento)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información Laboral</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Unidad de Negocio</p>
                  <p className="font-medium">
                    {empleado.unidadNegocio === 'COLIVING' ? 'CoLiving' : 
                     empleado.unidadNegocio === 'COWORK' ? 'CoWork' : 
                     empleado.unidadNegocio === 'AMBOS' ? 'CoWork + CoLiving' : 
                     empleado.unidadNegocio}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Fecha de Ingreso</p>
                  <p className="font-medium">{formatDate(empleado.fechaIngreso)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Datos de Pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Tipo de Sueldo</p>
                <p className="font-medium">
                  {tipoSueldoConfig[empleado.tipoSueldo].label}
                  <span className="text-gray-400 text-sm ml-1">
                    ({tipoSueldoConfig[empleado.tipoSueldo].descripcion})
                  </span>
                </p>
              </div>
              {empleado.precioHora && (
                <div>
                  <p className="text-sm text-gray-500">Precio por Hora</p>
                  <p className="font-medium text-lg">{formatCurrency(empleado.precioHora)}</p>
                </div>
              )}
              {empleado.sueldoBase && (
                <div>
                  <p className="text-sm text-gray-500">Sueldo Base</p>
                  <p className="font-medium text-lg">{formatCurrency(empleado.sueldoBase)}</p>
                </div>
              )}
              {empleado.cvuAlias && (
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">CVU / Alias</p>
                    <p className="font-medium font-mono text-sm">{empleado.cvuAlias}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Historial */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="turnos" className="space-y-4">
            <TabsList>
              <TabsTrigger value="turnos">Turnos</TabsTrigger>
              <TabsTrigger value="pagos">Pagos</TabsTrigger>
            </TabsList>

            <TabsContent value="turnos">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Turnos Recientes</CardTitle>
                    <CardDescription>Últimos turnos registrados</CardDescription>
                  </div>
                  <Link href={`/operaciones/turnos?empleado=${empleadoId}`}>
                    <Button variant="outline" size="sm">
                      Ver todos
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Departamento</TableHead>
                        <TableHead className="text-center">Horas</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {turnos.map((turno) => (
                        <TableRow key={turno.id}>
                          <TableCell className="text-gray-500">
                            {formatDate(turno.fecha)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {turno.departamento}
                          </TableCell>
                          <TableCell className="text-center">
                            {turno.horas}hs
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(turno.monto)}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="secondary"
                              className={turno.pagado 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {turno.pagado ? 'Pagado' : 'Pendiente'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pagos">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Historial de Pagos</CardTitle>
                    <CardDescription>Pagos realizados al empleado</CardDescription>
                  </div>
                  {pagoPendiente > 0 && (
                    <Link href={`/equipo/pagos?empleado=${empleadoId}`}>
                      <Button size="sm">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Registrar Pago
                      </Button>
                    </Link>
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Concepto</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagos.map((pago) => (
                        <TableRow key={pago.id}>
                          <TableCell className="text-gray-500">
                            {formatDate(pago.fecha)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {pago.concepto}
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {pago.metodo}
                          </TableCell>
                          <TableCell className="text-right font-medium text-green-600">
                            {formatCurrency(pago.monto)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
