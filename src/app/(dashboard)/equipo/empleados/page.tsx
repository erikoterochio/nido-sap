'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  MoreHorizontal,
  User,
  Phone,
  Mail,
  DollarSign,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Clock,
  Building2,
  FileText,
  Download,
  Filter,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

// Tipos basados en el schema de Prisma
type PuestoEmpleado = 'ADMINISTRACION' | 'HOST' | 'BARISTA' | 'ENCARGADO' | 'STAFF_LIMPIEZA' | 'MANTENIMIENTO' | 'SEGURIDAD' | 'COCINERO' | 'COMUNICACION' | 'CO_HOST'
type StatusEmpleado = 'ACTIVO' | 'INACTIVO' | 'VACACIONES' | 'LICENCIA'
type UnidadNegocio = 'COWORK' | 'COLIVING' | 'TURISMO' | 'AMBOS' | 'GENERAL'
type TipoSueldo = 'UN_NETO' | 'DOS_NETOS' | 'NETO_MAS_BRUTO' | 'MONOTRIBUTO' | 'POR_HORA'

interface Empleado {
  id: string
  nombre: string
  apellido: string
  email: string | null
  telefono: string | null
  dni: string
  cuil: string
  puesto: PuestoEmpleado
  unidadNegocio: UnidadNegocio
  status: StatusEmpleado
  tipoSueldo: TipoSueldo
  sueldoBase: number | null
  precioHora: number | null
  fechaIngreso: string
  cvuAlias: string | null
  // Datos calculados
  turnosPendientes: number
  pagoPendiente: number
  horasDelMes: number
}

// Mock data completo
const mockEmpleados: Empleado[] = [
  {
    id: 'emp1',
    nombre: 'Carolina',
    apellido: 'Gómez',
    email: 'carolina@benveo.com',
    telefono: '+54 11 5555-1234',
    dni: '35.456.789',
    cuil: '27-35456789-4',
    puesto: 'STAFF_LIMPIEZA',
    unidadNegocio: 'COLIVING',
    status: 'ACTIVO',
    tipoSueldo: 'POR_HORA',
    sueldoBase: null,
    precioHora: 6000,
    fechaIngreso: '2024-03-15',
    cvuAlias: 'carolina.gomez.mp',
    turnosPendientes: 3,
    pagoPendiente: 42000,
    horasDelMes: 28,
  },
  {
    id: 'emp2',
    nombre: 'Miguel',
    apellido: 'Fernández',
    email: 'miguel@benveo.com',
    telefono: '+54 11 5555-2345',
    dni: '32.123.456',
    cuil: '20-32123456-7',
    puesto: 'STAFF_LIMPIEZA',
    unidadNegocio: 'COLIVING',
    status: 'ACTIVO',
    tipoSueldo: 'POR_HORA',
    sueldoBase: null,
    precioHora: 6000,
    fechaIngreso: '2024-06-01',
    cvuAlias: 'miguel.fernandez',
    turnosPendientes: 2,
    pagoPendiente: 24000,
    horasDelMes: 22,
  },
  {
    id: 'emp3',
    nombre: 'Laura',
    apellido: 'Martínez',
    email: 'laura@benveo.com',
    telefono: '+54 11 5555-3456',
    dni: '33.789.012',
    cuil: '27-33789012-5',
    puesto: 'HOST',
    unidadNegocio: 'COLIVING',
    status: 'ACTIVO',
    tipoSueldo: 'MONOTRIBUTO',
    sueldoBase: 450000,
    precioHora: null,
    fechaIngreso: '2023-11-20',
    cvuAlias: null,
    turnosPendientes: 0,
    pagoPendiente: 0,
    horasDelMes: 0,
  },
  {
    id: 'emp4',
    nombre: 'Pedro',
    apellido: 'Sánchez',
    email: 'pedro@benveo.com',
    telefono: '+54 11 5555-4567',
    dni: '30.567.890',
    cuil: '20-30567890-3',
    puesto: 'MANTENIMIENTO',
    unidadNegocio: 'AMBOS',
    status: 'ACTIVO',
    tipoSueldo: 'POR_HORA',
    sueldoBase: null,
    precioHora: 8000,
    fechaIngreso: '2024-01-10',
    cvuAlias: 'pedro.sanchez.cvu',
    turnosPendientes: 1,
    pagoPendiente: 32000,
    horasDelMes: 15,
  },
  {
    id: 'emp5',
    nombre: 'Ana',
    apellido: 'Rodriguez',
    email: 'ana@benveo.com',
    telefono: '+54 11 5555-5678',
    dni: '34.234.567',
    cuil: '27-34234567-8',
    puesto: 'ADMINISTRACION',
    unidadNegocio: 'GENERAL',
    status: 'ACTIVO',
    tipoSueldo: 'NETO_MAS_BRUTO',
    sueldoBase: 850000,
    precioHora: null,
    fechaIngreso: '2023-08-01',
    cvuAlias: null,
    turnosPendientes: 0,
    pagoPendiente: 0,
    horasDelMes: 0,
  },
  {
    id: 'emp6',
    nombre: 'Roberto',
    apellido: 'López',
    email: 'roberto@benveo.com',
    telefono: '+54 11 5555-6789',
    dni: '31.890.123',
    cuil: '20-31890123-1',
    puesto: 'STAFF_LIMPIEZA',
    unidadNegocio: 'COLIVING',
    status: 'VACACIONES',
    tipoSueldo: 'POR_HORA',
    sueldoBase: null,
    precioHora: 6000,
    fechaIngreso: '2024-02-20',
    cvuAlias: 'roberto.lopez.cvu',
    turnosPendientes: 0,
    pagoPendiente: 0,
    horasDelMes: 0,
  },
  {
    id: 'emp7',
    nombre: 'Sofía',
    apellido: 'García',
    email: 'sofia@benveo.com',
    telefono: '+54 11 5555-7890',
    dni: '36.345.678',
    cuil: '27-36345678-2',
    puesto: 'ENCARGADO',
    unidadNegocio: 'COWORK',
    status: 'ACTIVO',
    tipoSueldo: 'DOS_NETOS',
    sueldoBase: 750000,
    precioHora: null,
    fechaIngreso: '2023-05-15',
    cvuAlias: null,
    turnosPendientes: 0,
    pagoPendiente: 0,
    horasDelMes: 0,
  },
  {
    id: 'emp8',
    nombre: 'Martín',
    apellido: 'Díaz',
    email: 'martin@benveo.com',
    telefono: '+54 11 5555-8901',
    dni: '29.012.345',
    cuil: '20-29012345-9',
    puesto: 'BARISTA',
    unidadNegocio: 'COWORK',
    status: 'ACTIVO',
    tipoSueldo: 'UN_NETO',
    sueldoBase: 380000,
    precioHora: null,
    fechaIngreso: '2024-04-01',
    cvuAlias: null,
    turnosPendientes: 0,
    pagoPendiente: 0,
    horasDelMes: 0,
  },
]

const puestoConfig: Record<PuestoEmpleado, { label: string; color: string }> = {
  STAFF_LIMPIEZA: { label: 'Limpieza', color: 'bg-blue-100 text-blue-800' },
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

const statusConfig: Record<StatusEmpleado, { label: string; color: string }> = {
  ACTIVO: { label: 'Activo', color: 'bg-green-100 text-green-800' },
  INACTIVO: { label: 'Inactivo', color: 'bg-gray-100 text-gray-800' },
  VACACIONES: { label: 'Vacaciones', color: 'bg-yellow-100 text-yellow-800' },
  LICENCIA: { label: 'Licencia', color: 'bg-blue-100 text-blue-800' },
}

const unidadConfig: Record<UnidadNegocio, { label: string; color: string }> = {
  COWORK: { label: 'CoWork', color: 'text-blue-600' },
  COLIVING: { label: 'CoLiving', color: 'text-green-600' },
  TURISMO: { label: 'Turismo', color: 'text-purple-600' },
  AMBOS: { label: 'CoWork + CoLiving', color: 'text-orange-600' },
  GENERAL: { label: 'General', color: 'text-gray-600' },
}

function getInitials(nombre: string, apellido: string) {
  return `${nombre[0]}${apellido[0]}`.toUpperCase()
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function EmpleadosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPuesto, setFilterPuesto] = useState<string>('todos')
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [filterUnidad, setFilterUnidad] = useState<string>('todos')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  const filteredEmpleados = mockEmpleados.filter(emp => {
    const matchesSearch = 
      `${emp.nombre} ${emp.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.dni.includes(searchTerm)
    const matchesPuesto = filterPuesto === 'todos' || emp.puesto === filterPuesto
    const matchesStatus = filterStatus === 'todos' || emp.status === filterStatus
    const matchesUnidad = filterUnidad === 'todos' || emp.unidadNegocio === filterUnidad
    return matchesSearch && matchesPuesto && matchesStatus && matchesUnidad
  })

  const stats = {
    total: mockEmpleados.length,
    activos: mockEmpleados.filter(e => e.status === 'ACTIVO').length,
    conPagoPendiente: mockEmpleados.filter(e => e.pagoPendiente > 0).length,
    totalPendiente: mockEmpleados.reduce((sum, e) => sum + e.pagoPendiente, 0),
    porUnidad: {
      coliving: mockEmpleados.filter(e => e.unidadNegocio === 'COLIVING' || e.unidadNegocio === 'AMBOS').length,
      cowork: mockEmpleados.filter(e => e.unidadNegocio === 'COWORK' || e.unidadNegocio === 'AMBOS').length,
    }
  }

  const handleDelete = (empleado: Empleado) => {
    setSelectedEmpleado(empleado)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    // TODO: Implementar lógica de eliminación
    console.log('Eliminando empleado:', selectedEmpleado?.id)
    setDeleteDialogOpen(false)
    setSelectedEmpleado(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empleados</h1>
          <p className="text-gray-500">Gestiona tu equipo de trabajo</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Link href="/equipo/empleados/nuevo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Empleado
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Empleados</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <User className="h-8 w-8 text-gray-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Activos</p>
                <p className="text-2xl font-bold text-green-600">{stats.activos}</p>
              </div>
              <div className="text-xs text-gray-400">
                <span className="text-green-600">{stats.porUnidad.coliving}</span> CoLiving
                <br />
                <span className="text-blue-600">{stats.porUnidad.cowork}</span> CoWork
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Con Pago Pendiente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.conPagoPendiente}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Pendiente</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats.totalPendiente)}
                </p>
              </div>
              <Link href="/equipo/pagos">
                <Button variant="ghost" size="sm" className="text-xs">
                  Ver pagos
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre, email o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterPuesto} onValueChange={setFilterPuesto}>
          <SelectTrigger className="w-full lg:w-[160px]">
            <SelectValue placeholder="Puesto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los puestos</SelectItem>
            {Object.entries(puestoConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterUnidad} onValueChange={setFilterUnidad}>
          <SelectTrigger className="w-full lg:w-[160px]">
            <SelectValue placeholder="Unidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas las unidades</SelectItem>
            {Object.entries(unidadConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full lg:w-[140px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {Object.entries(statusConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Alerta de pagos pendientes */}
      {stats.conPagoPendiente > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 flex items-center gap-4">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800">
                {stats.conPagoPendiente} empleados con pagos pendientes
              </p>
              <p className="text-sm text-yellow-700">
                Total acumulado: {formatCurrency(stats.totalPendiente)}
              </p>
            </div>
            <Link href="/equipo/pagos">
              <Button variant="outline" className="border-yellow-300 text-yellow-800 hover:bg-yellow-100">
                Gestionar Pagos
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Puesto</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-center">Turnos Pend.</TableHead>
                <TableHead className="text-right">Pago Pend.</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmpleados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    <User className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>No se encontraron empleados</p>
                    {searchTerm && (
                      <p className="text-sm">Intenta con otros términos de búsqueda</p>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmpleados.map((emp) => (
                  <TableRow key={emp.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                            {getInitials(emp.nombre, emp.apellido)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link 
                            href={`/equipo/empleados/${emp.id}`}
                            className="font-medium text-gray-900 hover:text-primary transition-colors"
                          >
                            {emp.nombre} {emp.apellido}
                          </Link>
                          <p className="text-xs text-gray-400">DNI: {emp.dni}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-0.5">
                        {emp.email && (
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-[160px]">{emp.email}</span>
                          </div>
                        )}
                        {emp.telefono && (
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Phone className="h-3 w-3" />
                            {emp.telefono}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={puestoConfig[emp.puesto].color} variant="secondary">
                        {puestoConfig[emp.puesto].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={cn("text-sm font-medium", unidadConfig[emp.unidadNegocio].color)}>
                        {unidadConfig[emp.unidadNegocio].label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[emp.status].color} variant="secondary">
                        {statusConfig[emp.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {emp.turnosPendientes > 0 ? (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          {emp.turnosPendientes}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {emp.pagoPendiente > 0 ? (
                        <span className="text-orange-600">
                          {formatCurrency(emp.pagoPendiente)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/equipo/empleados/${emp.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver perfil
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/equipo/empleados/${emp.id}/editar`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/operaciones/turnos?empleado=${emp.id}`}>
                              <Clock className="h-4 w-4 mr-2" />
                              Ver turnos
                            </Link>
                          </DropdownMenuItem>
                          {emp.pagoPendiente > 0 && (
                            <DropdownMenuItem asChild>
                              <Link href={`/equipo/pagos?empleado=${emp.id}`}>
                                <DollarSign className="h-4 w-4 mr-2" />
                                Registrar pago
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDelete(emp)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Dar de baja
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dar de baja a empleado</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas dar de baja a{' '}
              <strong>{selectedEmpleado?.nombre} {selectedEmpleado?.apellido}</strong>?
              <br /><br />
              El empleado pasará a estado "Inactivo" y no podrá ser asignado a nuevos turnos.
              Esta acción se puede revertir editando el empleado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Dar de baja
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
