'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Filter,
  Building2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  departamentoId: string
  huesped: string
  fechaInicio: Date
  fechaFin: Date
  estado: 'confirmada' | 'pendiente' | 'checkout' | 'cancelada'
  origen: 'airbnb' | 'booking' | 'directo'
  noches: number
  total: number
}

interface Departamento {
  id: string
  nombre: string
  color: string
}

// Mock data
const mockDepartamentos: Departamento[] = [
  { id: '1', nombre: 'Depto A1 - Palermo', color: 'bg-blue-500' },
  { id: '2', nombre: 'Depto B2 - Recoleta', color: 'bg-green-500' },
  { id: '3', nombre: 'Depto C3 - Belgrano', color: 'bg-purple-500' },
  { id: '4', nombre: 'Depto D4 - San Telmo', color: 'bg-orange-500' },
  { id: '5', nombre: 'Depto E5 - Puerto Madero', color: 'bg-pink-500' },
]

const generateMockReservas = (): Reserva[] => {
  const today = new Date()
  const reservas: Reserva[] = []
  
  // Generate some reservations around current date
  const addReserva = (deptoId: string, daysFromNow: number, nights: number, estado: Reserva['estado'], origen: Reserva['origen']) => {
    const start = new Date(today)
    start.setDate(start.getDate() + daysFromNow)
    const end = new Date(start)
    end.setDate(end.getDate() + nights)
    
    reservas.push({
      id: `${deptoId}-${daysFromNow}`,
      departamentoId: deptoId,
      huesped: ['John Smith', 'María García', 'Carlos Ruiz', 'Ana López', 'Peter Wilson'][Math.floor(Math.random() * 5)],
      fechaInicio: start,
      fechaFin: end,
      estado,
      origen,
      noches: nights,
      total: nights * (80 + Math.floor(Math.random() * 50)),
    })
  }

  // Add reservations for each department
  addReserva('1', -3, 5, 'confirmada', 'airbnb')
  addReserva('1', 5, 3, 'confirmada', 'booking')
  addReserva('1', 12, 7, 'pendiente', 'directo')
  
  addReserva('2', -1, 4, 'confirmada', 'airbnb')
  addReserva('2', 8, 5, 'confirmada', 'airbnb')
  
  addReserva('3', 2, 6, 'confirmada', 'booking')
  addReserva('3', 15, 4, 'pendiente', 'directo')
  
  addReserva('4', 0, 3, 'confirmada', 'airbnb')
  addReserva('4', 6, 5, 'confirmada', 'booking')
  addReserva('4', 18, 7, 'confirmada', 'airbnb')
  
  addReserva('5', -2, 8, 'confirmada', 'airbnb')
  addReserva('5', 10, 4, 'confirmada', 'booking')

  return reservas
}

const mockReservas = generateMockReservas()

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function getOrigenColor(origen: Reserva['origen']) {
  const colors = {
    airbnb: 'bg-red-100 text-red-700 border-red-200',
    booking: 'bg-blue-100 text-blue-700 border-blue-200',
    directo: 'bg-green-100 text-green-700 border-green-200',
  }
  return colors[origen]
}

function getEstadoBadge(estado: Reserva['estado']) {
  const colors = {
    confirmada: 'bg-green-100 text-green-700',
    pendiente: 'bg-yellow-100 text-yellow-700',
    checkout: 'bg-gray-100 text-gray-700',
    cancelada: 'bg-red-100 text-red-700',
  }
  return colors[estado]
}

export default function CalendarioPage() {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDepto, setSelectedDepto] = useState<string>('todos')
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)

  const filteredReservas = useMemo(() => {
    return mockReservas.filter(r => 
      selectedDepto === 'todos' || r.departamentoId === selectedDepto
    )
  }, [selectedDepto])

  const getReservasForDay = (day: number) => {
    const date = new Date(year, month, day)
    return filteredReservas.filter(r => {
      const start = new Date(r.fechaInicio)
      const end = new Date(r.fechaFin)
      start.setHours(0, 0, 0, 0)
      end.setHours(0, 0, 0, 0)
      date.setHours(0, 0, 0, 0)
      return date >= start && date < end
    })
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))
  }

  const isToday = (day: number) => {
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear()
  }

  // Generate calendar grid
  const calendarDays = []
  
  // Empty cells for days before the first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario</h1>
          <p className="text-gray-500">Vista de reservas por propiedad</p>
        </div>
        <div className="flex gap-2">
          <Link href="/reservas/nueva">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Reserva
            </Button>
          </Link>
        </div>
      </div>

      {/* Calendar controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold min-w-[180px] text-center">
            {MONTHS[month]} {year}
          </h2>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoy
          </Button>
        </div>

        <Select value={selectedDepto} onValueChange={setSelectedDepto}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <Building2 className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por depto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los departamentos</SelectItem>
            {mockDepartamentos.map(depto => (
              <SelectItem key={depto.id} value={depto.id}>
                <div className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full", depto.color)} />
                  {depto.nombre}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Calendar grid */}
      <Card>
        <CardContent className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(day => (
              <div 
                key={day} 
                className="text-center text-sm font-medium text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="min-h-[100px] bg-gray-50 rounded-lg" />
              }

              const dayReservas = getReservasForDay(day)
              const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate())

              return (
                <div
                  key={day}
                  className={cn(
                    "min-h-[100px] border rounded-lg p-1.5 transition-colors",
                    isToday(day) && "border-primary border-2",
                    isPast && "bg-gray-50",
                    !isPast && "hover:border-gray-300"
                  )}
                >
                  <div className={cn(
                    "text-sm font-medium mb-1",
                    isToday(day) && "text-primary",
                    isPast && "text-gray-400"
                  )}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayReservas.slice(0, 3).map(reserva => {
                      const depto = mockDepartamentos.find(d => d.id === reserva.departamentoId)
                      const isStart = new Date(reserva.fechaInicio).getDate() === day && 
                                     new Date(reserva.fechaInicio).getMonth() === month

                      return (
                        <button
                          key={reserva.id}
                          onClick={() => setSelectedReserva(reserva)}
                          className={cn(
                            "w-full text-left text-xs px-1.5 py-0.5 rounded truncate",
                            depto?.color.replace('bg-', 'bg-').replace('-500', '-100'),
                            "hover:opacity-80 transition-opacity"
                          )}
                        >
                          {isStart && '→ '}
                          {reserva.huesped.split(' ')[0]}
                        </button>
                      )
                    })}
                    {dayReservas.length > 3 && (
                      <div className="text-xs text-gray-500 px-1">
                        +{dayReservas.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        <span className="text-sm text-gray-500">Departamentos:</span>
        {mockDepartamentos.map(depto => (
          <div key={depto.id} className="flex items-center gap-2 text-sm">
            <span className={cn("w-3 h-3 rounded-full", depto.color)} />
            {depto.nombre}
          </div>
        ))}
      </div>

      {/* Selected reservation detail */}
      {selectedReserva && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Detalle de Reserva</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedReserva(null)}>
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Huésped</p>
                <p className="font-medium">{selectedReserva.huesped}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Departamento</p>
                <p className="font-medium">
                  {mockDepartamentos.find(d => d.id === selectedReserva.departamentoId)?.nombre}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fechas</p>
                <p className="font-medium">
                  {selectedReserva.fechaInicio.toLocaleDateString('es-AR')} - {selectedReserva.fechaFin.toLocaleDateString('es-AR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Noches / Total</p>
                <p className="font-medium">{selectedReserva.noches} noches • US$ {selectedReserva.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Origen</p>
                <Badge className={getOrigenColor(selectedReserva.origen)}>
                  {selectedReserva.origen.charAt(0).toUpperCase() + selectedReserva.origen.slice(1)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <Badge className={getEstadoBadge(selectedReserva.estado)}>
                  {selectedReserva.estado.charAt(0).toUpperCase() + selectedReserva.estado.slice(1)}
                </Badge>
              </div>
              <div className="col-span-2 flex gap-2">
                <Link href={`/reservas/${selectedReserva.id}`}>
                  <Button size="sm">Ver Detalle</Button>
                </Link>
                <Link href={`/reservas/${selectedReserva.id}/editar`}>
                  <Button size="sm" variant="outline">Editar</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
