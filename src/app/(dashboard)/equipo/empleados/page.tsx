'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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

interface Empleado {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  puesto: 'STAFF_LIMPIEZA' | 'HOST' | 'ADMINISTRACION' | 'MANTENIMIENTO' | 'ENCARGADO'
  estado: 'activo' | 'inactivo' | 'vacaciones'
  fechaIngreso: string
  turnosPendientes: number
  pagoPendiente: number
  cvuAlias?: string
}

// Mock data
const mockEmpleados: Empleado[] = [
  {
    id: '1',
    nombre: 'Carolina',
    apellido: 'Gómez',
    email: 'carolina@benveo.com',
    telefono: '+54 11 5555-1234',
    puesto: 'STAFF_LIMPIEZA',
    estado: 'activo',
    fechaIngreso: '2024-03-15',
    turnosPendientes: 3,
    pagoPendiente: 18000,
    cvuAlias: 'carolina.gomez.mp',
  },
  {
    id: '2',
    nombre: 'Miguel',
    apellido: 'Fernández',
    email: 'miguel@benveo.com',
    telefono: '+54 11 5555-2345',
    puesto: 'STAFF_LIMPIEZA',
    estado: 'activo',
    fechaIngreso: '2024-06-01',
    turnosPendientes: 2,
    pagoPendiente: 12000,
    cvuAlias: 'miguel.fernandez',
  },
  {
    id: '3',
    nombre: 'Laura',
    apellido: 'Martínez',
    email: 'laura@benveo.com',
    telefono: '+54 11 5555-3456',
    puesto: 'HOST',
    estado: 'activo',
    fechaIngreso: '2023-11-20',
    turnosPendientes: 0,
    pagoPendiente: 0,
  },
  {
    id: '4',
    nombre: 'Pedro',
    apellido: 'Sánchez',
    email: 'pedro@benveo.com',
    telefono: '+54 11 5555-4567',
    puesto: 'MANTENIMIENTO',
    estado: 'activo',
    fechaIngreso: '2024-01-10',
    turnosPendientes: 1,
    pagoPendiente: 15000,
  },
  {
    id: '5',
    nombre: 'Ana',
    apellido: 'Rodriguez',
    email: 'ana@benveo.com',
    telefono: '+54 11 5555-5678',
    puesto: 'ADMINISTRACION',
    estado: 'activo',
    fechaIngreso: '2023-08-01',
    turnosPendientes: 0,
    pagoPendiente: 0,
  },
  {
    id: '6',
    nombre: 'Roberto',
    apellido: 'López',
    email: 'roberto@benveo.com',
    telefono: '+54 11 5555-6789',
    puesto: 'STAFF_LIMPIEZA',
    estado: 'vacaciones',
    fechaIngreso: '2024-02-20',
    turnosPendientes: 0,
    pagoPendiente: 0,
    cvuAlias: 'roberto.lopez.cvu',
  },
  {
    id: '7',
    nombre: 'Sofía',
    apellido: 'García',
    email: 'sofia@benveo.com',
    telefono: '+54 11 5555-7890',
    puesto: 'ENCARGADO',
    estado: 'activo',
    fechaIngreso: '2023-05-15',
    turnosPendientes: 0,
    pagoPendiente: 0,
  },
]

function getPuestoBadge(puesto: Empleado['puesto']) {
  const config: Record<Empleado['puesto'], { className: string; label: string }> = {
    STAFF_LIMPIEZA: { className: 'bg-blue-100 text-blue-800', label: 'Limpieza' },
    HOST: { className: 'bg-purple-100 text-purple-800', label: 'Host' },
    ADMINISTRACION: { className: 'bg-gray-100 text-gray-800', label: 'Admin' },
    MANTENIMIENTO: { className: 'bg-orange-100 text-orange-800', label: 'Mantenimiento' },
    ENCARGADO: { className: 'bg-green-100 text-green-800', label: 'Encargado' },
  }
  const { className, label } = config[puesto]
  return <Badge className={className} variant="secondary">{label}</Badge>
}

function getEstadoBadge(estado: Empleado['estado']) {
  const config: Record<Empleado['estado'], { className: string; label: string }> = {
    activo: { className: 'bg-green-100 text-green-800', label: 'Activo' },
    inactivo: { className: 'bg-gray-100 text-gray-800', label: 'Inactivo' },
    vacaciones: { className: 'bg-yellow-100 text-yellow-800', label: 'Vacaciones' },
  }
  const { className, label } = config[estado]
  return <Badge className={className} variant="secondary">{label}</Badge>
}

function getInitials(nombre: string, apellido: string) {
  return `${nombre[0]}${apellido[0]}`.toUpperCase()
}

export default function EmpleadosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPuesto, setFilterPuesto] = useState<string>('todos')
  const [filterEstado, setFilterEstado] = useState<string>('todos')

  const filteredEmpleados = mockEmpleados.filter(emp => {
    const matchesSearch = 
      `${emp.nombre} ${emp.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPuesto = filterPuesto === 'todos' || emp.puesto === filterPuesto
    const matchesEstado = filterEstado === 'todos' || emp.estado === filterEstado
    return matchesSearch && matchesPuesto && matchesEstado
  })

  const stats = {
    total: mockEmpleados.length,
    activos: mockEmpleados.filter(e => e.estado === 'activo').length,
    conPagoPendiente: mockEmpleados.filter(e => e.pagoPendiente > 0).length,
    totalPendiente: mockEmpleados.reduce((sum, e) => sum + e.pagoPendiente, 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empleados</h1>
          <p className="text-gray-500">Gestiona tu equipo de trabajo</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Empleado
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Empleados</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Activos</p>
            <p className="text-2xl font-bold text-green-600">{stats.activos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Con Pago Pendiente</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.conPagoPendiente}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Pendiente</p>
            <p className="text-2xl font-bold">$ {stats.totalPendiente.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterPuesto} onValueChange={setFilterPuesto}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Puesto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="STAFF_LIMPIEZA">Limpieza</SelectItem>
            <SelectItem value="HOST">Host</SelectItem>
            <SelectItem value="ADMINISTRACION">Administración</SelectItem>
            <SelectItem value="MANTENIMIENTO">Mantenimiento</SelectItem>
            <SelectItem value="ENCARGADO">Encargado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterEstado} onValueChange={setFilterEstado}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="inactivo">Inactivo</SelectItem>
            <SelectItem value="vacaciones">Vacaciones</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Puesto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ingreso</TableHead>
                <TableHead className="text-center">Turnos Pend.</TableHead>
                <TableHead className="text-right">Pago Pend.</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmpleados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No se encontraron empleados
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmpleados.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {getInitials(emp.nombre, emp.apellido)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{emp.nombre} {emp.apellido}</p>
                          {emp.cvuAlias && (
                            <p className="text-xs text-gray-400">{emp.cvuAlias}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Mail className="h-3 w-3" />
                          {emp.email}
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Phone className="h-3 w-3" />
                          {emp.telefono}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getPuestoBadge(emp.puesto)}</TableCell>
                    <TableCell>{getEstadoBadge(emp.estado)}</TableCell>
                    <TableCell className="text-gray-500">
                      {new Date(emp.fechaIngreso).toLocaleDateString('es-AR', {
                        month: 'short',
                        year: 'numeric'
                      })}
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
                          $ {emp.pagoPendiente.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Clock className="h-4 w-4 mr-2" />
                            Ver turnos
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <DollarSign className="h-4 w-4 mr-2" />
                            Registrar pago
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
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
    </div>
  )
}
