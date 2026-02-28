'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Sparkles,
  CheckCircle2,
  Clock,
  User,
  Building2,
  Calendar,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ArrowRight,
  AlertCircle,
  ChevronRight,
  MapPin,
  DollarSign,
  X,
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type StatusTurno = 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADO' | 'CANCELADO'

interface TurnoLimpieza {
  id: string
  fecha: string
  horaInicio: string
  departamento: string
  departamentoId: string
  empleadoId: string | null
  empleadoNombre: string | null
  horas: number
  precioHora: number
  viaticos: number
  esFindeFeriado: boolean
  status: StatusTurno
  motivoTurno: 'checkout' | 'ingreso' | 'mantenimiento' | 'rutina'
  notas: string | null
  reservaId?: string
  huespedSaliente?: string
  huespedEntrante?: string
}

// Mock data
const mockTurnos: TurnoLimpieza[] = [
  {
    id: 'tl1',
    fecha: '2026-02-28',
    horaInicio: '10:00',
    departamento: 'Depto A1 - Palermo',
    departamentoId: '1',
    empleadoId: 'emp1',
    empleadoNombre: 'Carolina Gómez',
    horas: 3,
    precioHora: 6000,
    viaticos: 2000,
    esFindeFeriado: false,
    status: 'PENDIENTE',
    motivoTurno: 'checkout',
    notas: null,
    reservaId: 'res1',
    huespedSaliente: 'John Smith',
    huespedEntrante: 'María García',
  },
  {
    id: 'tl2',
    fecha: '2026-02-28',
    horaInicio: '11:00',
    departamento: 'Depto B2 - Recoleta',
    departamentoId: '2',
    empleadoId: 'emp2',
    empleadoNombre: 'Miguel Fernández',
    horas: 2.5,
    precioHora: 6000,
    viaticos: 1500,
    esFindeFeriado: false,
    status: 'EN_PROGRESO',
    motivoTurno: 'checkout',
    notas: 'El huésped reportó mancha en el sillón, revisar',
    reservaId: 'res2',
    huespedSaliente: 'Roberto Martínez',
    huespedEntrante: null,
  },
  {
    id: 'tl3',
    fecha: '2026-03-01',
    horaInicio: '09:00',
    departamento: 'Depto C3 - Belgrano',
    departamentoId: '3',
    empleadoId: 'emp1',
    empleadoNombre: 'Carolina Gómez',
    horas: 4,
    precioHora: 6000,
    viaticos: 2000,
    esFindeFeriado: false,
    status: 'PENDIENTE',
    motivoTurno: 'checkout',
    notas: null,
    huespedSaliente: 'Ana López',
    huespedEntrante: 'Carlos Díaz',
  },
  {
    id: 'tl4',
    fecha: '2026-03-01',
    horaInicio: '14:00',
    departamento: 'Depto D4 - San Telmo',
    departamentoId: '4',
    empleadoId: null,
    empleadoNombre: null,
    horas: 3,
    precioHora: 6000,
    viaticos: 2000,
    esFindeFeriado: false,
    status: 'PENDIENTE',
    motivoTurno: 'checkout',
    notas: null,
    huespedSaliente: 'Felipe Torres',
    huespedEntrante: 'Lucía Morales',
  },
  {
    id: 'tl5',
    fecha: '2026-03-02',
    horaInicio: '10:00',
    departamento: 'Depto A1 - Palermo',
    departamentoId: '1',
    empleadoId: 'emp6',
    empleadoNombre: 'Roberto López',
    horas: 2,
    precioHora: 6000,
    viaticos: 0,
    esFindeFeriado: false,
    status: 'PENDIENTE',
    motivoTurno: 'rutina',
    notas: 'Limpieza de rutina semanal',
  },
  {
    id: 'tl6',
    fecha: '2026-02-27',
    horaInicio: '10:00',
    departamento: 'Depto E5 - Núñez',
    departamentoId: '5',
    empleadoId: 'emp2',
    empleadoNombre: 'Miguel Fernández',
    horas: 3,
    precioHora: 6000,
    viaticos: 1500,
    esFindeFeriado: false,
    status: 'COMPLETADO',
    motivoTurno: 'checkout',
    notas: null,
    huespedSaliente: 'Valentina Ruiz',
  },
  {
    id: 'tl7',
    fecha: '2026-02-26',
    horaInicio: '11:00',
    departamento: 'Depto B2 - Recoleta',
    departamentoId: '2',
    empleadoId: 'emp1',
    empleadoNombre: 'Carolina Gómez',
    horas: 4,
    precioHora: 6000,
    viaticos: 2000,
    esFindeFeriado: false,
    status: 'COMPLETADO',
    motivoTurno: 'checkout',
    notas: null,
    huespedSaliente: 'Diego Fernández',
    huespedEntrante: 'Roberto Martínez',
  },
  {
    id: 'tl8',
    fecha: '2026-03-01',
    horaInicio: '10:00',
    departamento: 'Depto F6 - Puerto Madero',
    departamentoId: '6',
    empleadoId: null,
    empleadoNombre: null,
    horas: 5,
    precioHora: 6000,
    viaticos: 3000,
    esFindeFeriado: true,
    status: 'PENDIENTE',
    motivoTurno: 'checkout',
    notas: null,
    huespedSaliente: 'Jennifer Adams',
    huespedEntrante: 'Marc Dupont',
  },
]

const mockEmpleadosLimpieza = [
  { id: 'emp1', nombre: 'Carolina Gómez' },
  { id: 'emp2', nombre: 'Miguel Fernández' },
  { id: 'emp6', nombre: 'Roberto López' },
]

const statusConfig: Record<StatusTurno, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  EN_PROGRESO: { label: 'En progreso', color: 'bg-blue-100 text-blue-800', icon: Sparkles },
  COMPLETADO: { label: 'Completado', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  CANCELADO: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800', icon: X },
}

const motivoConfig: Record<TurnoLimpieza['motivoTurno'], { label: string; color: string }> = {
  checkout: { label: 'Checkout', color: 'bg-purple-100 text-purple-800' },
  ingreso: { label: 'Ingreso', color: 'bg-blue-100 text-blue-800' },
  mantenimiento: { label: 'Post-mant.', color: 'bg-orange-100 text-orange-800' },
  rutina: { label: 'Rutina', color: 'bg-gray-100 text-gray-800' },
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (date.getTime() === today.getTime()) return 'Hoy'
  if (date.getTime() === tomorrow.getTime()) return 'Mañana'
  if (date.getTime() === yesterday.getTime()) return 'Ayer'

  return date.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' })
}

function getInitials(nombre: string) {
  const parts = nombre.split(' ')
  return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : nombre.slice(0, 2).toUpperCase()
}

export default function TurnosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [filterEmpleado, setFilterEmpleado] = useState<string>('todos')
  const [viewTab, setViewTab] = useState<'proximos' | 'completados' | 'todos'>('proximos')
  const [newTurnoOpen, setNewTurnoOpen] = useState(false)
  const [detailTurno, setDetailTurno] = useState<TurnoLimpieza | null>(null)

  // Form state
  const [formFecha, setFormFecha] = useState('')
  const [formHora, setFormHora] = useState('10:00')
  const [formDepto, setFormDepto] = useState('')
  const [formEmpleado, setFormEmpleado] = useState('')
  const [formHoras, setFormHoras] = useState('3')
  const [formViaticos, setFormViaticos] = useState('2000')
  const [formMotivo, setFormMotivo] = useState<TurnoLimpieza['motivoTurno']>('checkout')
  const [formNotas, setFormNotas] = useState('')

  const today = new Date().toISOString().split('T')[0]

  const filteredTurnos = mockTurnos.filter(t => {
    const matchesSearch =
      t.departamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.empleadoNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (t.huespedSaliente?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    const matchesStatus = filterStatus === 'todos' || t.status === filterStatus
    const matchesEmpleado = filterEmpleado === 'todos' || t.empleadoId === filterEmpleado

    if (viewTab === 'proximos') {
      return matchesSearch && matchesStatus && matchesEmpleado && t.status !== 'COMPLETADO' && t.status !== 'CANCELADO'
    }
    if (viewTab === 'completados') {
      return matchesSearch && matchesEmpleado && t.status === 'COMPLETADO'
    }
    return matchesSearch && matchesStatus && matchesEmpleado
  })

  // Group by date for proximos view
  const groupedTurnos = filteredTurnos.reduce<Record<string, TurnoLimpieza[]>>((acc, turno) => {
    if (!acc[turno.fecha]) acc[turno.fecha] = []
    acc[turno.fecha].push(turno)
    return acc
  }, {})
  const sortedDates = Object.keys(groupedTurnos).sort()

  const stats = {
    hoy: mockTurnos.filter(t => t.fecha === today && t.status !== 'CANCELADO').length,
    pendientes: mockTurnos.filter(t => t.status === 'PENDIENTE').length,
    enProgreso: mockTurnos.filter(t => t.status === 'EN_PROGRESO').length,
    sinAsignar: mockTurnos.filter(t => t.status === 'PENDIENTE' && !t.empleadoId).length,
    completadosHoy: mockTurnos.filter(t => t.fecha === today && t.status === 'COMPLETADO').length,
  }

  const handleCreateTurno = () => {
    console.log('Crear turno:', { formFecha, formHora, formDepto, formEmpleado, formHoras, formViaticos, formMotivo, formNotas })
    setNewTurnoOpen(false)
    setFormFecha('')
    setFormNotas('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Turnos de Limpieza</h1>
          <p className="text-gray-500">Coordiná y seguí los turnos de limpieza por departamento</p>
        </div>
        <Button onClick={() => setNewTurnoOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Turno
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Turnos hoy</p>
                <p className="text-2xl font-bold">{stats.hoy}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendientes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">En progreso</p>
                <p className="text-2xl font-bold text-blue-600">{stats.enProgreso}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Sin asignar</p>
                <p className="text-2xl font-bold text-red-500">{stats.sinAsignar}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerta turnos sin asignar */}
      {stats.sinAsignar > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-4">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-red-800">
                {stats.sinAsignar} turno{stats.sinAsignar > 1 ? 's' : ''} sin empleado asignado
              </p>
              <p className="text-sm text-red-700">Asigná un empleado para que puedan coordinarse</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {(['proximos', 'completados', 'todos'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setViewTab(tab)}
            className={cn(
              'px-4 py-2 font-medium border-b-2 transition-colors capitalize',
              viewTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {tab === 'proximos' ? 'Próximos' : tab === 'completados' ? 'Completados' : 'Todos'}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por depto, empleado o huésped..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        {viewTab !== 'completados' && (
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              {Object.entries(statusConfig).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={filterEmpleado} onValueChange={setFilterEmpleado}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Empleado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los empleados</SelectItem>
            {mockEmpleadosLimpieza.map(emp => (
              <SelectItem key={emp.id} value={emp.id}>{emp.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content: grouped by date for proximos, table for completados/todos */}
      {viewTab === 'proximos' ? (
        <div className="space-y-6">
          {sortedDates.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay turnos próximos</p>
              </CardContent>
            </Card>
          ) : (
            sortedDates.map((fecha) => (
              <div key={fecha}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <h2 className="font-semibold text-gray-700">{formatDate(fecha)}</h2>
                    <span className="text-gray-400 text-sm">
                      {new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'long' })}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {groupedTurnos[fecha].length} turno{groupedTurnos[fecha].length > 1 ? 's' : ''}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {groupedTurnos[fecha].map((turno) => {
                    const StatusIcon = statusConfig[turno.status].icon
                    return (
                      <Card
                        key={turno.id}
                        className={cn(
                          'cursor-pointer hover:shadow-md transition-shadow',
                          turno.status === 'EN_PROGRESO' && 'border-blue-300 bg-blue-50/30',
                          !turno.empleadoId && 'border-red-200'
                        )}
                        onClick={() => setDetailTurno(turno)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              {/* Hora */}
                              <div className="text-center min-w-[50px]">
                                <p className="text-lg font-bold text-gray-900">{turno.horaInicio}</p>
                                <p className="text-xs text-gray-400">{turno.horas}hs</p>
                              </div>

                              <div className="flex-1 min-w-0">
                                {/* Departamento */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-semibold text-gray-900">{turno.departamento}</p>
                                  <Badge className={motivoConfig[turno.motivoTurno].color} variant="secondary">
                                    {motivoConfig[turno.motivoTurno].label}
                                  </Badge>
                                  {turno.esFindeFeriado && (
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                      Finde/Feriado
                                    </Badge>
                                  )}
                                </div>

                                {/* Huéspedes */}
                                {(turno.huespedSaliente || turno.huespedEntrante) && (
                                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                    {turno.huespedSaliente && (
                                      <span className="flex items-center gap-1">
                                        <ArrowRight className="h-3 w-3 text-red-400" />
                                        Sale: {turno.huespedSaliente}
                                      </span>
                                    )}
                                    {turno.huespedSaliente && turno.huespedEntrante && <span>·</span>}
                                    {turno.huespedEntrante && (
                                      <span className="flex items-center gap-1">
                                        <ArrowRight className="h-3 w-3 text-green-500" />
                                        Entra: {turno.huespedEntrante}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Notas */}
                                {turno.notas && (
                                  <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded mt-1.5 inline-block">
                                    {turno.notas}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 flex-shrink-0">
                              {/* Empleado */}
                              {turno.empleadoNombre ? (
                                <div className="flex items-center gap-2 text-sm">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                      {getInitials(turno.empleadoNombre)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-gray-700 hidden sm:block">{turno.empleadoNombre.split(' ')[0]}</span>
                                </div>
                              ) : (
                                <Badge variant="secondary" className="bg-red-100 text-red-700">
                                  Sin asignar
                                </Badge>
                              )}

                              {/* Monto */}
                              <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-900">
                                  {formatCurrency(turno.horas * turno.precioHora + turno.viaticos)}
                                </p>
                                {turno.viaticos > 0 && (
                                  <p className="text-xs text-gray-400">
                                    +{formatCurrency(turno.viaticos)} viát.
                                  </p>
                                )}
                              </div>

                              {/* Status */}
                              <Badge className={statusConfig[turno.status].color} variant="secondary">
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig[turno.status].label}
                              </Badge>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDetailTurno(turno) }}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Ver detalle
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  {turno.status === 'PENDIENTE' && (
                                    <DropdownMenuItem>
                                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                                      Marcar completado
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Cancelar turno
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Empleado</TableHead>
                  <TableHead className="text-center">Horas</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTurnos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                      <Sparkles className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                      No hay turnos que coincidan con los filtros
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTurnos.map((turno) => {
                    const StatusIcon = statusConfig[turno.status].icon
                    return (
                      <TableRow key={turno.id} className="group">
                        <TableCell>
                          <div>
                            <p className="font-medium">{formatDate(turno.fecha)}</p>
                            <p className="text-xs text-gray-400">{turno.horaInicio}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{turno.departamento}</TableCell>
                        <TableCell>
                          {turno.empleadoNombre ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {getInitials(turno.empleadoNombre)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{turno.empleadoNombre}</span>
                            </div>
                          ) : (
                            <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                              Sin asignar
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">{turno.horas}hs</TableCell>
                        <TableCell>
                          <Badge className={motivoConfig[turno.motivoTurno].color} variant="secondary">
                            {motivoConfig[turno.motivoTurno].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig[turno.status].color} variant="secondary">
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[turno.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(turno.horas * turno.precioHora + turno.viaticos)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setDetailTurno(turno)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver detalle
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              {turno.status === 'PENDIENTE' && (
                                <DropdownMenuItem>
                                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                                  Marcar completado
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* New Turno Dialog */}
      <Dialog open={newTurnoOpen} onOpenChange={setNewTurnoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Turno de Limpieza</DialogTitle>
            <DialogDescription>
              Registrá un nuevo turno de limpieza para un departamento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={formFecha}
                  onChange={(e) => setFormFecha(e.target.value)}
                  min={today}
                />
              </div>
              <div className="space-y-2">
                <Label>Hora inicio</Label>
                <Input
                  type="time"
                  value={formHora}
                  onChange={(e) => setFormHora(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Departamento</Label>
              <Select value={formDepto} onValueChange={setFormDepto}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Depto A1 - Palermo</SelectItem>
                  <SelectItem value="2">Depto B2 - Recoleta</SelectItem>
                  <SelectItem value="3">Depto C3 - Belgrano</SelectItem>
                  <SelectItem value="4">Depto D4 - San Telmo</SelectItem>
                  <SelectItem value="5">Depto E5 - Núñez</SelectItem>
                  <SelectItem value="6">Depto F6 - Puerto Madero</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Empleado</Label>
              <Select value={formEmpleado} onValueChange={setFormEmpleado}>
                <SelectTrigger>
                  <SelectValue placeholder="Asignar empleado (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin_asignar">Sin asignar</SelectItem>
                  {mockEmpleadosLimpieza.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Horas estimadas</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="1"
                  max="12"
                  value={formHoras}
                  onChange={(e) => setFormHoras(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Viáticos ($)</Label>
                <Input
                  type="number"
                  step="500"
                  min="0"
                  value={formViaticos}
                  onChange={(e) => setFormViaticos(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Motivo</Label>
              <Select value={formMotivo} onValueChange={(v) => setFormMotivo(v as TurnoLimpieza['motivoTurno'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checkout">Checkout de huésped</SelectItem>
                  <SelectItem value="ingreso">Preparación para ingreso</SelectItem>
                  <SelectItem value="mantenimiento">Post-mantenimiento</SelectItem>
                  <SelectItem value="rutina">Limpieza de rutina</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Textarea
                value={formNotas}
                onChange={(e) => setFormNotas(e.target.value)}
                placeholder="Instrucciones especiales, observaciones..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTurnoOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateTurno} disabled={!formFecha || !formDepto}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Turno
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      {detailTurno && (
        <Dialog open={!!detailTurno} onOpenChange={() => setDetailTurno(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Detalle del Turno</DialogTitle>
              <DialogDescription>{detailTurno.departamento}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-0.5">Fecha y hora</p>
                  <p className="font-semibold">{formatDate(detailTurno.fecha)} · {detailTurno.horaInicio}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-0.5">Estado</p>
                  <Badge className={statusConfig[detailTurno.status].color} variant="secondary">
                    {statusConfig[detailTurno.status].label}
                  </Badge>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-0.5">Horas</p>
                  <p className="font-semibold">{detailTurno.horas}hs</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-0.5">Motivo</p>
                  <Badge className={motivoConfig[detailTurno.motivoTurno].color} variant="secondary">
                    {motivoConfig[detailTurno.motivoTurno].label}
                  </Badge>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-2">
                <p className="font-medium text-gray-700">Liquidación</p>
                <div className="flex justify-between">
                  <span className="text-gray-500">{detailTurno.horas}hs × {formatCurrency(detailTurno.precioHora)}/h</span>
                  <span>{formatCurrency(detailTurno.horas * detailTurno.precioHora)}</span>
                </div>
                {detailTurno.viaticos > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Viáticos</span>
                    <span>{formatCurrency(detailTurno.viaticos)}</span>
                  </div>
                )}
                {detailTurno.esFindeFeriado && (
                  <div className="flex justify-between text-purple-700">
                    <span>Recargo finde/feriado</span>
                    <span>incluido</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total</span>
                  <span className="text-green-600">
                    {formatCurrency(detailTurno.horas * detailTurno.precioHora + detailTurno.viaticos)}
                  </span>
                </div>
              </div>

              {(detailTurno.huespedSaliente || detailTurno.huespedEntrante) && (
                <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                  <p className="font-medium text-gray-700">Huéspedes</p>
                  {detailTurno.huespedSaliente && (
                    <p className="text-gray-600 flex items-center gap-1.5">
                      <ArrowRight className="h-3 w-3 text-red-400" />
                      Sale: <span className="font-medium">{detailTurno.huespedSaliente}</span>
                    </p>
                  )}
                  {detailTurno.huespedEntrante && (
                    <p className="text-gray-600 flex items-center gap-1.5">
                      <ArrowRight className="h-3 w-3 text-green-500" />
                      Entra: <span className="font-medium">{detailTurno.huespedEntrante}</span>
                    </p>
                  )}
                </div>
              )}

              {detailTurno.notas && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                  <p className="font-medium text-amber-800 mb-0.5">Notas</p>
                  <p className="text-amber-700">{detailTurno.notas}</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailTurno(null)}>
                Cerrar
              </Button>
              {detailTurno.status === 'PENDIENTE' && (
                <Button>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Marcar Completado
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}