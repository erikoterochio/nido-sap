'use client'

import { useState } from 'react'
import {
  Plus,
  Search,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Building2,
  User,
  Calendar,
  ChevronDown,
  AlertCircle,
  CircleDot,
  X,
  Hammer,
  ZapOff,
  Droplets,
  Wifi,
  ThumbsUp,
  MessageSquare,
  ChevronRight,
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

type PrioridadMantenimiento = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE'
type StatusMantenimiento = 'ABIERTO' | 'EN_PROGRESO' | 'ESPERANDO_MATERIALES' | 'RESUELTO' | 'CANCELADO'
type CategoriaMantenimiento = 'PLOMERIA' | 'ELECTRICIDAD' | 'ELECTRODOMESTICOS' | 'INTERNET' | 'ESTRUCTURA' | 'PINTURA' | 'CERRAJERIA' | 'LIMPIEZA_ESPECIAL' | 'OTRO'

interface TareaMantenimiento {
  id: string
  titulo: string
  descripcion: string
  departamento: string
  departamentoId: string
  categoria: CategoriaMantenimiento
  prioridad: PrioridadMantenimiento
  status: StatusMantenimiento
  empleadoId: string | null
  empleadoNombre: string | null
  reportadoPor: string
  fechaCreacion: string
  fechaActualizacion: string
  fechaResolucion: string | null
  costoEstimado: number | null
  costoReal: number | null
  notas: string | null
}

// Mock data
const mockTareas: TareaMantenimiento[] = [
  {
    id: 'm1',
    titulo: 'Pérdida de agua en baño',
    descripcion: 'El canilla del baño principal gotea constantemente. El huésped reportó que lleva así desde que llegó.',
    departamento: 'Depto A1 - Palermo',
    departamentoId: '1',
    categoria: 'PLOMERIA',
    prioridad: 'ALTA',
    status: 'EN_PROGRESO',
    empleadoId: 'emp4',
    empleadoNombre: 'Pedro Sánchez',
    reportadoPor: 'Laura Martínez (Host)',
    fechaCreacion: '2026-02-26',
    fechaActualizacion: '2026-02-27',
    fechaResolucion: null,
    costoEstimado: 15000,
    costoReal: null,
    notas: 'Necesita repuesto de goma de canilla. Comprar en ferretería.',
  },
  {
    id: 'm2',
    titulo: 'Aire acondicionado no enfría',
    descripcion: 'El aire frío del cuarto principal no funciona, solo sale aire caliente.',
    departamento: 'Depto B2 - Recoleta',
    departamentoId: '2',
    categoria: 'ELECTRODOMESTICOS',
    prioridad: 'URGENTE',
    status: 'ABIERTO',
    empleadoId: null,
    empleadoNombre: null,
    reportadoPor: 'Ana Rodriguez (Admin)',
    fechaCreacion: '2026-02-28',
    fechaActualizacion: '2026-02-28',
    fechaResolucion: null,
    costoEstimado: null,
    costoReal: null,
    notas: null,
  },
  {
    id: 'm3',
    titulo: 'Internet lento / sin conexión',
    descripcion: 'Los huéspedes reportan que la conexión a internet es muy lenta y se corta frecuentemente.',
    departamento: 'Depto C3 - Belgrano',
    departamentoId: '3',
    categoria: 'INTERNET',
    prioridad: 'ALTA',
    status: 'ESPERANDO_MATERIALES',
    empleadoId: 'emp4',
    empleadoNombre: 'Pedro Sánchez',
    reportadoPor: 'Laura Martínez (Host)',
    fechaCreacion: '2026-02-25',
    fechaActualizacion: '2026-02-27',
    fechaResolucion: null,
    costoEstimado: 8000,
    costoReal: null,
    notas: 'Esperando que el proveedor envíe el nuevo router. ETA: 2-3 días.',
  },
  {
    id: 'm4',
    titulo: 'Pintura deteriorada en living',
    descripcion: 'Manchas de humedad en la pared del living, la pintura se está desprendiendo en una zona.',
    departamento: 'Depto D4 - San Telmo',
    departamentoId: '4',
    categoria: 'PINTURA',
    prioridad: 'MEDIA',
    status: 'ABIERTO',
    empleadoId: null,
    empleadoNombre: null,
    reportadoPor: 'Ana Rodriguez (Admin)',
    fechaCreacion: '2026-02-20',
    fechaActualizacion: '2026-02-20',
    fechaResolucion: null,
    costoEstimado: 25000,
    costoReal: null,
    notas: null,
  },
  {
    id: 'm5',
    titulo: 'Cerradura de puerta de entrada',
    descripcion: 'La cerradura principal tiene dificultad para abrir, la llave traba al girar.',
    departamento: 'Depto E5 - Núñez',
    departamentoId: '5',
    categoria: 'CERRAJERIA',
    prioridad: 'ALTA',
    status: 'ABIERTO',
    empleadoId: null,
    empleadoNombre: null,
    reportadoPor: 'Laura Martínez (Host)',
    fechaCreacion: '2026-02-28',
    fechaActualizacion: '2026-02-28',
    fechaResolucion: null,
    costoEstimado: 12000,
    costoReal: null,
    notas: null,
  },
  {
    id: 'm6',
    titulo: 'Lavarropas no centrifuga',
    descripcion: 'El lavarropas del depto lava normal pero no centrifuga, la ropa queda empapada.',
    departamento: 'Depto F6 - Puerto Madero',
    departamentoId: '6',
    categoria: 'ELECTRODOMESTICOS',
    prioridad: 'MEDIA',
    status: 'EN_PROGRESO',
    empleadoId: 'emp4',
    empleadoNombre: 'Pedro Sánchez',
    reportadoPor: 'Ana Rodriguez (Admin)',
    fechaCreacion: '2026-02-22',
    fechaActualizacion: '2026-02-26',
    fechaResolucion: null,
    costoEstimado: 18000,
    costoReal: null,
    notas: 'Técnico visitó el depto, necesita pieza de repuesto.',
  },
  {
    id: 'm7',
    titulo: 'Cambio de bombita en cocina',
    descripcion: 'La lámpara de la cocina se fundió.',
    departamento: 'Depto A1 - Palermo',
    departamentoId: '1',
    categoria: 'ELECTRICIDAD',
    prioridad: 'BAJA',
    status: 'RESUELTO',
    empleadoId: 'emp4',
    empleadoNombre: 'Pedro Sánchez',
    reportadoPor: 'Carolina Gómez',
    fechaCreacion: '2026-02-18',
    fechaActualizacion: '2026-02-19',
    fechaResolucion: '2026-02-19',
    costoEstimado: 2000,
    costoReal: 1800,
    notas: null,
  },
  {
    id: 'm8',
    titulo: 'Filtración en techo',
    descripcion: 'Hay una pequeña filtración en la esquina del dormitorio cuando llueve fuerte.',
    departamento: 'Depto B2 - Recoleta',
    departamentoId: '2',
    categoria: 'ESTRUCTURA',
    prioridad: 'ALTA',
    status: 'RESUELTO',
    empleadoId: 'emp4',
    empleadoNombre: 'Pedro Sánchez',
    reportadoPor: 'Ana Rodriguez (Admin)',
    fechaCreacion: '2026-02-10',
    fechaActualizacion: '2026-02-15',
    fechaResolucion: '2026-02-15',
    costoEstimado: 35000,
    costoReal: 42000,
    notas: 'Se tuvo que llamar a empresa especializada en impermeabilización.',
  },
]

const mockEmpleadosMantenimiento = [
  { id: 'emp4', nombre: 'Pedro Sánchez' },
]

const prioridadConfig: Record<PrioridadMantenimiento, { label: string; color: string; dotColor: string }> = {
  BAJA: { label: 'Baja', color: 'bg-gray-100 text-gray-700', dotColor: 'bg-gray-400' },
  MEDIA: { label: 'Media', color: 'bg-yellow-100 text-yellow-800', dotColor: 'bg-yellow-500' },
  ALTA: { label: 'Alta', color: 'bg-orange-100 text-orange-800', dotColor: 'bg-orange-500' },
  URGENTE: { label: 'Urgente', color: 'bg-red-100 text-red-800', dotColor: 'bg-red-500' },
}

const statusConfig: Record<StatusMantenimiento, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  ABIERTO: { label: 'Abierto', color: 'bg-blue-100 text-blue-800', icon: CircleDot },
  EN_PROGRESO: { label: 'En progreso', color: 'bg-yellow-100 text-yellow-800', icon: Wrench },
  ESPERANDO_MATERIALES: { label: 'Esperando mat.', color: 'bg-purple-100 text-purple-800', icon: Clock },
  RESUELTO: { label: 'Resuelto', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  CANCELADO: { label: 'Cancelado', color: 'bg-gray-100 text-gray-700', icon: X },
}

const categoriaConfig: Record<CategoriaMantenimiento, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  PLOMERIA: { label: 'Plomería', icon: Droplets },
  ELECTRICIDAD: { label: 'Electricidad', icon: ZapOff },
  ELECTRODOMESTICOS: { label: 'Electrodomésticos', icon: Hammer },
  INTERNET: { label: 'Internet/TV', icon: Wifi },
  ESTRUCTURA: { label: 'Estructura', icon: Building2 },
  PINTURA: { label: 'Pintura', icon: ThumbsUp },
  CERRAJERIA: { label: 'Cerrajería', icon: Wrench },
  LIMPIEZA_ESPECIAL: { label: 'Limpieza especial', icon: Wrench },
  OTRO: { label: 'Otro', icon: Wrench },
}

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

function getDaysOpen(fechaCreacion: string, fechaResolucion: string | null) {
  const end = fechaResolucion ? new Date(fechaResolucion) : new Date()
  const start = new Date(fechaCreacion)
  const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

function getInitials(nombre: string) {
  const parts = nombre.split(' ')
  return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : nombre.slice(0, 2).toUpperCase()
}

export default function MantenimientoPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('activos')
  const [filterPrioridad, setFilterPrioridad] = useState<string>('todos')
  const [filterCategoria, setFilterCategoria] = useState<string>('todos')
  const [newTareaOpen, setNewTareaOpen] = useState(false)
  const [detailTarea, setDetailTarea] = useState<TareaMantenimiento | null>(null)

  // Form state
  const [formTitulo, setFormTitulo] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formDepto, setFormDepto] = useState('')
  const [formCategoria, setFormCategoria] = useState<CategoriaMantenimiento>('OTRO')
  const [formPrioridad, setFormPrioridad] = useState<PrioridadMantenimiento>('MEDIA')
  const [formEmpleado, setFormEmpleado] = useState('')
  const [formCostoEst, setFormCostoEst] = useState('')

  const today = new Date().toISOString().split('T')[0]

  const filteredTareas = mockTareas.filter(t => {
    const matchesSearch =
      t.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.departamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.empleadoNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

    const matchesStatus =
      filterStatus === 'todos' ||
      (filterStatus === 'activos' && t.status !== 'RESUELTO' && t.status !== 'CANCELADO') ||
      t.status === filterStatus

    const matchesPrioridad = filterPrioridad === 'todos' || t.prioridad === filterPrioridad
    const matchesCategoria = filterCategoria === 'todos' || t.categoria === filterCategoria

    return matchesSearch && matchesStatus && matchesPrioridad && matchesCategoria
  })

  const stats = {
    abiertos: mockTareas.filter(t => t.status === 'ABIERTO').length,
    urgentes: mockTareas.filter(t => t.prioridad === 'URGENTE' && t.status !== 'RESUELTO').length,
    enProgreso: mockTareas.filter(t => t.status === 'EN_PROGRESO').length,
    resueltosEsteMes: mockTareas.filter(t => t.status === 'RESUELTO').length,
    sinAsignar: mockTareas.filter(t => t.status !== 'RESUELTO' && t.status !== 'CANCELADO' && !t.empleadoId).length,
    costoTotalAbiertos: mockTareas
      .filter(t => t.status !== 'RESUELTO' && t.status !== 'CANCELADO' && t.costoEstimado)
      .reduce((sum, t) => sum + (t.costoEstimado ?? 0), 0),
  }

  const handleCreateTarea = () => {
    console.log('Crear tarea:', { formTitulo, formDesc, formDepto, formCategoria, formPrioridad, formEmpleado, formCostoEst })
    setNewTareaOpen(false)
    setFormTitulo('')
    setFormDesc('')
    setFormCostoEst('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mantenimiento</h1>
          <p className="text-gray-500">Gestioná issues y reparaciones de los departamentos</p>
        </div>
        <Button onClick={() => setNewTareaOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Issue
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CircleDot className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Abiertos</p>
                <p className="text-2xl font-bold">{stats.abiertos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Urgentes</p>
                <p className="text-2xl font-bold text-red-500">{stats.urgentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Wrench className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">En progreso</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.enProgreso}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Resueltos</p>
                <p className="text-2xl font-bold text-green-600">{stats.resueltosEsteMes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {stats.urgentes > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-4">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-red-800">
                {stats.urgentes} issue{stats.urgentes > 1 ? 's urgentes' : ' urgente'} sin resolver
              </p>
              <p className="text-sm text-red-700">Requieren atención inmediata</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-red-300 text-red-800 hover:bg-red-100"
              onClick={() => setFilterPrioridad('URGENTE')}
            >
              Ver urgentes
            </Button>
          </CardContent>
        </Card>
      )}

      {stats.sinAsignar > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4 flex items-center gap-4">
            <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
            <p className="text-orange-800">
              <span className="font-medium">{stats.sinAsignar} issue{stats.sinAsignar > 1 ? 's' : ''}</span> sin empleado asignado
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por título, departamento o empleado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[170px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="activos">Activos</SelectItem>
            <SelectItem value="todos">Todos</SelectItem>
            {Object.entries(statusConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPrioridad} onValueChange={setFilterPrioridad}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Toda prioridad</SelectItem>
            {Object.entries(prioridadConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategoria} onValueChange={setFilterCategoria}>
          <SelectTrigger className="w-full sm:w-[170px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas las categorías</SelectItem>
            {Object.entries(categoriaConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Issues list */}
      <div className="space-y-3">
        {filteredTareas.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay issues que coincidan</p>
            </CardContent>
          </Card>
        ) : (
          filteredTareas.map((tarea) => {
            const StatusIcon = statusConfig[tarea.status].icon
            const CatIcon = categoriaConfig[tarea.categoria].icon
            const diasAbierto = getDaysOpen(tarea.fechaCreacion, tarea.fechaResolucion)

            return (
              <Card
                key={tarea.id}
                className={cn(
                  'cursor-pointer hover:shadow-md transition-shadow',
                  tarea.prioridad === 'URGENTE' && tarea.status !== 'RESUELTO' && 'border-red-300',
                  tarea.status === 'RESUELTO' && 'opacity-75'
                )}
                onClick={() => setDetailTarea(tarea)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Priority dot */}
                      <div className={cn('w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0', prioridadConfig[tarea.prioridad].dotColor)} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{tarea.titulo}</h3>
                          {tarea.prioridad === 'URGENTE' && (
                            <Badge className={prioridadConfig[tarea.prioridad].color} variant="secondary">
                              Urgente
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {tarea.departamento}
                          </span>
                          <span className="text-sm text-gray-400 flex items-center gap-1">
                            <CatIcon className="h-3 w-3" />
                            {categoriaConfig[tarea.categoria].label}
                          </span>
                          <span className="text-xs text-gray-400">
                            {diasAbierto === 0 ? 'Hoy' : `hace ${diasAbierto} día${diasAbierto > 1 ? 's' : ''}`}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500 mt-1.5 line-clamp-1">{tarea.descripcion}</p>

                        {tarea.notas && (
                          <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded mt-1.5 inline-block">
                            {tarea.notas}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Empleado */}
                      {tarea.empleadoNombre ? (
                        <div className="flex items-center gap-2 text-sm hidden sm:flex">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(tarea.empleadoNombre)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-gray-600 hidden md:block">{tarea.empleadoNombre.split(' ')[0]}</span>
                        </div>
                      ) : tarea.status !== 'RESUELTO' ? (
                        <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs hidden sm:flex">
                          Sin asignar
                        </Badge>
                      ) : null}

                      {/* Costo estimado */}
                      {tarea.costoEstimado && tarea.status !== 'RESUELTO' && (
                        <div className="text-right hidden md:block">
                          <p className="text-xs text-gray-400">Est.</p>
                          <p className="text-sm font-medium">{formatCurrency(tarea.costoEstimado)}</p>
                        </div>
                      )}
                      {tarea.costoReal && tarea.status === 'RESUELTO' && (
                        <div className="text-right hidden md:block">
                          <p className="text-xs text-gray-400">Costo real</p>
                          <p className="text-sm font-medium text-green-700">{formatCurrency(tarea.costoReal)}</p>
                        </div>
                      )}

                      {/* Status badge */}
                      <Badge className={statusConfig[tarea.status].color} variant="secondary">
                        <StatusIcon className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">{statusConfig[tarea.status].label}</span>
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
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDetailTarea(tarea) }}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          {tarea.status !== 'RESUELTO' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Wrench className="h-4 w-4 mr-2 text-yellow-600" />
                                Marcar en progreso
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                                Marcar resuelto
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <X className="h-4 w-4 mr-2" />
                                Cancelar issue
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* New Issue Dialog */}
      <Dialog open={newTareaOpen} onOpenChange={setNewTareaOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuevo Issue de Mantenimiento</DialogTitle>
            <DialogDescription>
              Registrá un problema o tarea de mantenimiento para un departamento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                placeholder="Ej: Pérdida de agua en baño principal"
                value={formTitulo}
                onChange={(e) => setFormTitulo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                placeholder="Describí el problema con detalle..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Departamento</Label>
                <Select value={formDepto} onValueChange={setFormDepto}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
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
                <Label>Categoría</Label>
                <Select value={formCategoria} onValueChange={(v) => setFormCategoria(v as CategoriaMantenimiento)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoriaConfig).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Prioridad</Label>
                <Select value={formPrioridad} onValueChange={(v) => setFormPrioridad(v as PrioridadMantenimiento)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(prioridadConfig).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Costo estimado ($)</Label>
                <Input
                  type="number"
                  placeholder="Opcional"
                  value={formCostoEst}
                  onChange={(e) => setFormCostoEst(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Asignar empleado (opcional)</Label>
              <Select value={formEmpleado} onValueChange={setFormEmpleado}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin_asignar">Sin asignar</SelectItem>
                  {mockEmpleadosMantenimiento.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTareaOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateTarea} disabled={!formTitulo || !formDepto}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      {detailTarea && (
        <Dialog open={!!detailTarea} onOpenChange={() => setDetailTarea(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className={cn('w-3 h-3 rounded-full flex-shrink-0', prioridadConfig[detailTarea.prioridad].dotColor)} />
                {detailTarea.titulo}
              </DialogTitle>
              <DialogDescription>{detailTarea.departamento}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-0.5">Estado</p>
                  <Badge className={statusConfig[detailTarea.status].color} variant="secondary">
                    {statusConfig[detailTarea.status].label}
                  </Badge>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-0.5">Prioridad</p>
                  <Badge className={prioridadConfig[detailTarea.prioridad].color} variant="secondary">
                    {prioridadConfig[detailTarea.prioridad].label}
                  </Badge>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-0.5">Categoría</p>
                  <p className="font-medium">{categoriaConfig[detailTarea.categoria].label}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-0.5">
                    {detailTarea.status === 'RESUELTO' ? 'Resuelto en' : 'Abierto hace'}
                  </p>
                  <p className="font-medium">
                    {getDaysOpen(detailTarea.fechaCreacion, detailTarea.fechaResolucion)} día{getDaysOpen(detailTarea.fechaCreacion, detailTarea.fechaResolucion) !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">Descripción</p>
                <p className="text-sm text-gray-600">{detailTarea.descripcion}</p>
              </div>

              {detailTarea.notas && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm font-medium text-amber-800 mb-1">Notas</p>
                  <p className="text-sm text-amber-700">{detailTarea.notas}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-0.5">Reportado por</p>
                  <p className="font-medium">{detailTarea.reportadoPor}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-0.5">Asignado a</p>
                  {detailTarea.empleadoNombre ? (
                    <p className="font-medium">{detailTarea.empleadoNombre}</p>
                  ) : (
                    <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">Sin asignar</Badge>
                  )}
                </div>
              </div>

              {(detailTarea.costoEstimado || detailTarea.costoReal) && (
                <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                  <p className="font-medium text-gray-700">Costos</p>
                  {detailTarea.costoEstimado && (
                    <div className="flex justify-between text-gray-600">
                      <span>Estimado</span>
                      <span>{formatCurrency(detailTarea.costoEstimado)}</span>
                    </div>
                  )}
                  {detailTarea.costoReal && (
                    <div className="flex justify-between font-semibold">
                      <span>Real</span>
                      <span className={cn(
                        detailTarea.costoEstimado && detailTarea.costoReal > detailTarea.costoEstimado
                          ? 'text-red-600'
                          : 'text-green-600'
                      )}>
                        {formatCurrency(detailTarea.costoReal)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 text-xs text-gray-400">
                <span>Creado: {formatDate(detailTarea.fechaCreacion)}</span>
                <span>·</span>
                <span>Actualizado: {formatDate(detailTarea.fechaActualizacion)}</span>
                {detailTarea.fechaResolucion && (
                  <>
                    <span>·</span>
                    <span>Resuelto: {formatDate(detailTarea.fechaResolucion)}</span>
                  </>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDetailTarea(null)}>
                Cerrar
              </Button>
              {detailTarea.status !== 'RESUELTO' && detailTarea.status !== 'CANCELADO' && (
                <>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Marcar Resuelto
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}