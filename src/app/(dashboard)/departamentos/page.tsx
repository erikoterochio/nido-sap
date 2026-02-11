'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Building2,
  MapPin,
  Users,
  DollarSign,
  ExternalLink,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

interface Departamento {
  id: string
  nombre: string
  direccion: string
  estado: 'activo' | 'inactivo' | 'mantenimiento'
  dueno: string
  comision: number
  ocupacionMes: number
  ingresosMes: number
  airbnbId?: string
  bookingId?: string
  ultimaLimpieza?: string
  proximoCheckin?: string
}

// Mock data
const mockDepartamentos: Departamento[] = [
  {
    id: '1',
    nombre: 'Departamento A1 - Palermo',
    direccion: 'Av. Santa Fe 3200, CABA',
    estado: 'activo',
    dueno: 'Juan Pérez',
    comision: 20,
    ocupacionMes: 85,
    ingresosMes: 1250,
    airbnbId: 'airbnb123',
    bookingId: 'booking456',
    ultimaLimpieza: 'Hace 2 días',
    proximoCheckin: 'Mañana 15:00',
  },
  {
    id: '2',
    nombre: 'Departamento B2 - Recoleta',
    direccion: 'Av. Callao 1500, CABA',
    estado: 'activo',
    dueno: 'María García',
    comision: 18,
    ocupacionMes: 72,
    ingresosMes: 980,
    airbnbId: 'airbnb789',
    ultimaLimpieza: 'Hoy',
    proximoCheckin: 'Vie 14:00',
  },
  {
    id: '3',
    nombre: 'Departamento C3 - Belgrano',
    direccion: 'Cabildo 2800, CABA',
    estado: 'mantenimiento',
    dueno: 'Carlos Ruiz',
    comision: 20,
    ocupacionMes: 45,
    ingresosMes: 650,
  },
  {
    id: '4',
    nombre: 'Departamento D4 - San Telmo',
    direccion: 'Defensa 800, CABA',
    estado: 'activo',
    dueno: 'Ana López',
    comision: 22,
    ocupacionMes: 90,
    ingresosMes: 1480,
    airbnbId: 'airbnb321',
    bookingId: 'booking654',
    ultimaLimpieza: 'Ayer',
    proximoCheckin: 'Hoy 16:00',
  },
  {
    id: '5',
    nombre: 'Departamento E5 - Puerto Madero',
    direccion: 'Olga Cossettini 500, CABA',
    estado: 'activo',
    dueno: 'Roberto Sánchez',
    comision: 15,
    ocupacionMes: 95,
    ingresosMes: 2100,
    airbnbId: 'airbnb555',
    ultimaLimpieza: 'Hace 3 días',
  },
  {
    id: '6',
    nombre: 'Departamento F6 - Nuñez',
    direccion: 'Av. del Libertador 7200, CABA',
    estado: 'inactivo',
    dueno: 'Laura Fernández',
    comision: 20,
    ocupacionMes: 0,
    ingresosMes: 0,
  },
]

function getEstadoBadge(estado: Departamento['estado']) {
  const variants = {
    activo: 'bg-green-100 text-green-800',
    inactivo: 'bg-gray-100 text-gray-800',
    mantenimiento: 'bg-yellow-100 text-yellow-800',
  }
  const labels = {
    activo: 'Activo',
    inactivo: 'Inactivo',
    mantenimiento: 'Mantenimiento',
  }
  return (
    <Badge className={variants[estado]} variant="secondary">
      {labels[estado]}
    </Badge>
  )
}

function DepartamentoCard({ depto }: { depto: Departamento }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Link 
                  href={`/departamentos/${depto.id}`}
                  className="font-semibold text-gray-900 hover:text-primary transition-colors"
                >
                  {depto.nombre}
                </Link>
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {depto.direccion}
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/departamentos/${depto.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver detalle
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/departamentos/${depto.id}/editar`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2 mt-3">
            {getEstadoBadge(depto.estado)}
            <span className="text-sm text-gray-500">
              <Users className="h-3.5 w-3.5 inline mr-1" />
              {depto.dueno}
            </span>
            <span className="text-sm text-gray-500">
              • {depto.comision}% comisión
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Ocupación mes</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-xl font-bold">{depto.ocupacionMes}%</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2 mb-1.5">
                <div 
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{ width: `${depto.ocupacionMes}%` }}
                />
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Ingresos mes</p>
            <p className="text-xl font-bold mt-1">
              US$ {depto.ingresosMes.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 pb-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            {depto.airbnbId && (
              <span className="text-gray-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-red-400 rounded-full" />
                Airbnb
              </span>
            )}
            {depto.bookingId && (
              <span className="text-gray-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full" />
                Booking
              </span>
            )}
          </div>
          {depto.proximoCheckin && (
            <span className="text-xs text-gray-500">
              Check-in: {depto.proximoCheckin}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DepartamentosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState<string>('todos')

  const filteredDepartamentos = mockDepartamentos.filter(depto => {
    const matchesSearch = depto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         depto.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         depto.dueno.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterEstado === 'todos' || depto.estado === filterEstado
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: mockDepartamentos.length,
    activos: mockDepartamentos.filter(d => d.estado === 'activo').length,
    ingresoTotal: mockDepartamentos.reduce((sum, d) => sum + d.ingresosMes, 0),
    ocupacionPromedio: Math.round(
      mockDepartamentos.filter(d => d.estado === 'activo').reduce((sum, d) => sum + d.ocupacionMes, 0) / 
      mockDepartamentos.filter(d => d.estado === 'activo').length
    ),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departamentos</h1>
          <p className="text-gray-500">Gestiona tus propiedades y su configuración</p>
        </div>
        <Link href="/departamentos/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Departamento
          </Button>
        </Link>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Deptos</p>
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
            <p className="text-sm text-gray-500">Ocupación Promedio</p>
            <p className="text-2xl font-bold">{stats.ocupacionPromedio}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Ingresos del Mes</p>
            <p className="text-2xl font-bold">US$ {stats.ingresoTotal.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre, dirección o dueño..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterEstado} onValueChange={setFilterEstado}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="inactivo">Inactivo</SelectItem>
            <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {filteredDepartamentos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron departamentos</h3>
            <p className="text-gray-500 mb-4">Ajusta los filtros o agrega un nuevo departamento</p>
            <Link href="/departamentos/nuevo">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Departamento
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDepartamentos.map((depto) => (
            <DepartamentoCard key={depto.id} depto={depto} />
          ))}
        </div>
      )}
    </div>
  )
}
