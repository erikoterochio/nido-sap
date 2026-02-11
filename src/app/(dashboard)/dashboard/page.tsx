'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  DollarSign,
  Home,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  User,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Tipos
interface KPI {
  label: string
  value: string
  change: number
  changeLabel: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface Reserva {
  id: string
  departamento: string
  huesped: string
  fecha: string
  tipo: 'checkin' | 'checkout'
  noches?: number
}

interface TareaPendiente {
  id: string
  tipo: 'limpieza' | 'pago' | 'mantenimiento' | 'liquidacion'
  titulo: string
  descripcion: string
  urgente: boolean
}

// Mock data - en producción vendría de la API
const mockKPIs: KPI[] = [
  {
    label: 'Ingresos del Mes',
    value: 'US$ 12,450',
    change: 12.5,
    changeLabel: 'vs mes anterior',
    icon: DollarSign,
    color: 'bg-green-500',
  },
  {
    label: 'Ocupación Promedio',
    value: '78%',
    change: 5.2,
    changeLabel: 'vs mes anterior',
    icon: Home,
    color: 'bg-blue-500',
  },
  {
    label: 'Departamentos Activos',
    value: '12',
    change: 0,
    changeLabel: 'sin cambios',
    icon: Calendar,
    color: 'bg-purple-500',
  },
  {
    label: 'Turnos Pendientes',
    value: '$45,200',
    change: -8.3,
    changeLabel: 'por pagar',
    icon: Clock,
    color: 'bg-orange-500',
  },
]

const mockReservasProximas: Reserva[] = [
  { id: '1', departamento: 'Departamento A1', huesped: 'John Smith', fecha: 'Hoy 15:00', tipo: 'checkin', noches: 5 },
  { id: '2', departamento: 'Departamento B2', huesped: 'María García', fecha: 'Hoy 11:00', tipo: 'checkout' },
  { id: '3', departamento: 'Departamento C3', huesped: 'Carlos Ruiz', fecha: 'Mañana 14:00', tipo: 'checkin', noches: 3 },
  { id: '4', departamento: 'Departamento A1', huesped: 'Ana López', fecha: 'Mañana 10:00', tipo: 'checkout' },
  { id: '5', departamento: 'Departamento D4', huesped: 'Peter Wilson', fecha: 'Vie 16:00', tipo: 'checkin', noches: 7 },
]

const mockTareas: TareaPendiente[] = [
  { id: '1', tipo: 'pago', titulo: '3 turnos de limpieza pendientes de pago', descripcion: 'Semana del 3-9 Feb', urgente: true },
  { id: '2', tipo: 'liquidacion', titulo: 'Liquidación pendiente - Depto A1', descripcion: 'Enero 2026', urgente: true },
  { id: '3', tipo: 'mantenimiento', titulo: 'Calefón Depto B2', descripcion: 'Reportado hace 2 días', urgente: false },
  { id: '4', tipo: 'limpieza', titulo: 'Asignar turno - Depto C3', descripcion: 'Check-out mañana 10:00', urgente: false },
]

function KPICard({ kpi }: { kpi: KPI }) {
  const Icon = kpi.icon
  const isPositive = kpi.change > 0
  const isNeutral = kpi.change === 0

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
            <p className="text-2xl font-bold mt-1">{kpi.value}</p>
            <div className="flex items-center gap-1 mt-2">
              {!isNeutral && (
                isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )
              )}
              <span className={`text-sm ${isPositive ? 'text-green-600' : isNeutral ? 'text-gray-500' : 'text-red-600'}`}>
                {isNeutral ? '' : `${isPositive ? '+' : ''}${kpi.change}%`} {kpi.changeLabel}
              </span>
            </div>
          </div>
          <div className={`${kpi.color} p-3 rounded-xl`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ReservaItem({ reserva }: { reserva: Reserva }) {
  const isCheckin = reserva.tipo === 'checkin'

  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        isCheckin ? 'bg-green-100' : 'bg-orange-100'
      }`}>
        {isCheckin ? (
          <ArrowRight className="h-5 w-5 text-green-600" />
        ) : (
          <ArrowRight className="h-5 w-5 text-orange-600 rotate-180" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{reserva.departamento}</p>
        <p className="text-sm text-gray-500 truncate">
          {reserva.huesped}
          {reserva.noches && ` • ${reserva.noches} noches`}
        </p>
      </div>
      <div className="text-right">
        <Badge variant={isCheckin ? 'default' : 'secondary'}>
          {isCheckin ? 'Check-in' : 'Check-out'}
        </Badge>
        <p className="text-xs text-gray-500 mt-1">{reserva.fecha}</p>
      </div>
    </div>
  )
}

function TareaItem({ tarea }: { tarea: TareaPendiente }) {
  const iconMap = {
    limpieza: Sparkles,
    pago: DollarSign,
    mantenimiento: AlertTriangle,
    liquidacion: DollarSign,
  }
  const Icon = iconMap[tarea.tipo]

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        tarea.urgente ? 'bg-red-100' : 'bg-gray-100'
      }`}>
        <Icon className={`h-4 w-4 ${tarea.urgente ? 'text-red-600' : 'text-gray-600'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900 text-sm">{tarea.titulo}</p>
          {tarea.urgente && (
            <Badge variant="destructive" className="text-xs">Urgente</Badge>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{tarea.descripcion}</p>
      </div>
      <Button variant="ghost" size="sm" className="flex-shrink-0">
        Ver
      </Button>
    </div>
  )
}

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }))
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 capitalize">{currentDate}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockKPIs.map((kpi, index) => (
          <KPICard key={index} kpi={kpi} />
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas reservas */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Próximos Check-ins / Check-outs</CardTitle>
              <CardDescription>Movimientos de los próximos 7 días</CardDescription>
            </div>
            <Link href="/calendario">
              <Button variant="ghost" size="sm">
                Ver calendario
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {mockReservasProximas.map((reserva) => (
                <ReservaItem key={reserva.id} reserva={reserva} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tareas pendientes */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Tareas Pendientes</CardTitle>
              <Badge variant="secondary">{mockTareas.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {mockTareas.map((tarea) => (
                <TareaItem key={tarea.id} tarea={tarea} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/reservas/nueva">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Calendar className="h-5 w-5" />
                <span className="text-sm">Nueva Reserva</span>
              </Button>
            </Link>
            <Link href="/operaciones/turnos/nuevo">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm">Registrar Turno</span>
              </Button>
            </Link>
            <Link href="/finanzas/gastos/nuevo">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <DollarSign className="h-5 w-5" />
                <span className="text-sm">Registrar Gasto</span>
              </Button>
            </Link>
            <Link href="/departamentos/nuevo">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Home className="h-5 w-5" />
                <span className="text-sm">Nuevo Depto</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
