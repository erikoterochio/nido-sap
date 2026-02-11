'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  User,
  Building2,
  DollarSign,
  ArrowRight,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { cn } from '@/lib/utils'

interface Reserva {
  id: string
  departamento: string
  departamentoId: string
  huesped: string
  email: string
  telefono: string
  fechaCheckin: string
  fechaCheckout: string
  noches: number
  huespedes: number
  precioNoche: number
  total: number
  estado: 'pendiente' | 'confirmada' | 'checkin' | 'checkout' | 'cancelada'
  origen: 'airbnb' | 'booking' | 'directo' | 'referido'
  origenId?: string
  createdAt: string
}

// Mock data
const mockReservas: Reserva[] = [
  {
    id: '1',
    departamento: 'Depto A1 - Palermo',
    departamentoId: '1',
    huesped: 'John Smith',
    email: 'john@email.com',
    telefono: '+1 555 1234',
    fechaCheckin: '2026-02-12',
    fechaCheckout: '2026-02-17',
    noches: 5,
    huespedes: 2,
    precioNoche: 95,
    total: 475,
    estado: 'confirmada',
    origen: 'airbnb',
    origenId: 'HMKWX8C7JN',
    createdAt: '2026-01-28',
  },
  {
    id: '2',
    departamento: 'Depto B2 - Recoleta',
    departamentoId: '2',
    huesped: 'María García',
    email: 'maria@email.com',
    telefono: '+54 11 5555 1234',
    fechaCheckin: '2026-02-10',
    fechaCheckout: '2026-02-14',
    noches: 4,
    huespedes: 1,
    precioNoche: 85,
    total: 340,
    estado: 'checkin',
    origen: 'airbnb',
    origenId: 'HMKWX8C7JM',
    createdAt: '2026-01-25',
  },
  {
    id: '3',
    departamento: 'Depto C3 - Belgrano',
    departamentoId: '3',
    huesped: 'Carlos Ruiz',
    email: 'carlos@email.com',
    telefono: '+54 11 5555 5678',
    fechaCheckin: '2026-02-15',
    fechaCheckout: '2026-02-21',
    noches: 6,
    huespedes: 3,
    precioNoche: 110,
    total: 660,
    estado: 'pendiente',
    origen: 'booking',
    origenId: '3847592831',
    createdAt: '2026-02-01',
  },
  {
    id: '4',
    departamento: 'Depto D4 - San Telmo',
    departamentoId: '4',
    huesped: 'Ana López',
    email: 'ana@email.com',
    telefono: '+54 11 5555 9012',
    fechaCheckin: '2026-02-10',
    fechaCheckout: '2026-02-13',
    noches: 3,
    huespedes: 2,
    precioNoche: 120,
    total: 360,
    estado: 'checkin',
    origen: 'directo',
    createdAt: '2026-02-05',
  },
  {
    id: '5',
    departamento: 'Depto E5 - Puerto Madero',
    departamentoId: '5',
    huesped: 'Peter Wilson',
    email: 'peter@email.com',
    telefono: '+44 20 7946 0958',
    fechaCheckin: '2026-02-08',
    fechaCheckout: '2026-02-16',
    noches: 8,
    huespedes: 2,
    precioNoche: 150,
    total: 1200,
    estado: 'checkin',
    origen: 'airbnb',
    origenId: 'HMKWX8C7JP',
    createdAt: '2026-01-20',
  },
  {
    id: '6',
    departamento: 'Depto A1 - Palermo',
    departamentoId: '1',
    huesped: 'Laura Fernández',
    email: 'laura@email.com',
    telefono: '+54 11 5555 3456',
    fechaCheckin: '2026-02-05',
    fechaCheckout: '2026-02-09',
    noches: 4,
    huespedes: 1,
    precioNoche: 95,
    total: 380,
    estado: 'checkout',
    origen: 'booking',
    origenId: '3847592832',
    createdAt: '2026-01-15',
  },
  {
    id: '7',
    departamento: 'Depto B2 - Recoleta',
    departamentoId: '2',
    huesped: 'Roberto Sánchez',
    email: 'roberto@email.com',
    telefono: '+54 11 5555 7890',
    fechaCheckin: '2026-02-20',
    fechaCheckout: '2026-02-25',
    noches: 5,
    huespedes: 4,
    precioNoche: 85,
    total: 425,
    estado: 'confirmada',
    origen: 'referido',
    createdAt: '2026-02-08',
  },
]

function getEstadoBadge(estado: Reserva['estado']) {
  const variants: Record<Reserva['estado'], string> = {
    pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmada: 'bg-blue-100 text-blue-800 border-blue-200',
    checkin: 'bg-green-100 text-green-800 border-green-200',
    checkout: 'bg-gray-100 text-gray-800 border-gray-200',
    cancelada: 'bg-red-100 text-red-800 border-red-200',
  }
  const labels: Record<Reserva['estado'], string> = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    checkin: 'Check-in',
    checkout: 'Check-out',
    cancelada: 'Cancelada',
  }
  return (
    <Badge className={variants[estado]} variant="outline">
      {labels[estado]}
    </Badge>
  )
}

function getOrigenBadge(origen: Reserva['origen']) {
  const variants: Record<Reserva['origen'], string> = {
    airbnb: 'bg-red-50 text-red-700',
    booking: 'bg-blue-50 text-blue-700',
    directo: 'bg-green-50 text-green-700',
    referido: 'bg-purple-50 text-purple-700',
  }
  const labels: Record<Reserva['origen'], string> = {
    airbnb: 'Airbnb',
    booking: 'Booking',
    directo: 'Directo',
    referido: 'Referido',
  }
  return (
    <Badge className={variants[origen]} variant="secondary">
      {labels[origen]}
    </Badge>
  )
}

export default function ReservasPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState<string>('todos')
  const [filterOrigen, setFilterOrigen] = useState<string>('todos')

  const filteredReservas = mockReservas.filter(reserva => {
    const matchesSearch = 
      reserva.huesped.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reserva.departamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reserva.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = filterEstado === 'todos' || reserva.estado === filterEstado
    const matchesOrigen = filterOrigen === 'todos' || reserva.origen === filterOrigen
    return matchesSearch && matchesEstado && matchesOrigen
  })

  const stats = {
    total: mockReservas.length,
    activas: mockReservas.filter(r => r.estado === 'checkin').length,
    proximas: mockReservas.filter(r => r.estado === 'confirmada' || r.estado === 'pendiente').length,
    ingresos: mockReservas.filter(r => r.estado !== 'cancelada').reduce((sum, r) => sum + r.total, 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
          <p className="text-gray-500">Gestiona las reservaciones de tus propiedades</p>
        </div>
        <Link href="/reservas/nueva">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Reserva
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Reservas</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Huéspedes Actuales</p>
            <p className="text-2xl font-bold text-green-600">{stats.activas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Próximas</p>
            <p className="text-2xl font-bold text-blue-600">{stats.proximas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Ingresos Totales</p>
            <p className="text-2xl font-bold">US$ {stats.ingresos.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por huésped, email o departamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterEstado} onValueChange={setFilterEstado}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="confirmada">Confirmada</SelectItem>
            <SelectItem value="checkin">Check-in</SelectItem>
            <SelectItem value="checkout">Check-out</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterOrigen} onValueChange={setFilterOrigen}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Origen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="airbnb">Airbnb</SelectItem>
            <SelectItem value="booking">Booking</SelectItem>
            <SelectItem value="directo">Directo</SelectItem>
            <SelectItem value="referido">Referido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Huésped</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Fechas</TableHead>
                <TableHead className="text-center">Noches</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No se encontraron reservas
                  </TableCell>
                </TableRow>
              ) : (
                filteredReservas.map((reserva) => (
                  <TableRow key={reserva.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{reserva.huesped}</p>
                        <p className="text-sm text-gray-500">{reserva.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link 
                        href={`/departamentos/${reserva.departamentoId}`}
                        className="text-primary hover:underline"
                      >
                        {reserva.departamento}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <span>{new Date(reserva.fechaCheckin).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</span>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <span>{new Date(reserva.fechaCheckout).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {reserva.noches}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      US$ {reserva.total}
                    </TableCell>
                    <TableCell>
                      {getEstadoBadge(reserva.estado)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getOrigenBadge(reserva.origen)}
                        {reserva.origenId && (
                          <span className="text-xs text-gray-400">{reserva.origenId}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/reservas/${reserva.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver detalle
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/reservas/${reserva.id}/editar`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          {reserva.origenId && (
                            <DropdownMenuItem>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Ver en {reserva.origen}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Cancelar
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
