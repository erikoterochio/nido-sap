'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  DollarSign,
  Building2,
  Calendar,
  Download,
  Send,
  Eye,
  Check,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Liquidacion {
  id: string
  departamento: string
  departamentoId: string
  dueno: string
  periodo: string // "Enero 2026"
  mes: number
  anio: number
  ingresosBrutos: number
  comisionPorcentaje: number
  comisionMonto: number
  gastos: {
    servicios: number
    limpieza: number
    mantenimiento: number
    otros: number
  }
  totalGastos: number
  saldoFinal: number
  tipoCambio?: number
  estado: 'borrador' | 'enviada' | 'aprobada' | 'pagada'
  fechaEnvio?: string
  fechaPago?: string
}

// Mock data
const mockLiquidaciones: Liquidacion[] = [
  {
    id: '1',
    departamento: 'Depto A1 - Palermo',
    departamentoId: '1',
    dueno: 'Juan Pérez',
    periodo: 'Enero 2026',
    mes: 1,
    anio: 2026,
    ingresosBrutos: 1250,
    comisionPorcentaje: 20,
    comisionMonto: 250,
    gastos: { servicios: 45, limpieza: 120, mantenimiento: 0, otros: 15 },
    totalGastos: 180,
    saldoFinal: 820,
    estado: 'pagada',
    fechaEnvio: '2026-02-01',
    fechaPago: '2026-02-05',
  },
  {
    id: '2',
    departamento: 'Depto B2 - Recoleta',
    departamentoId: '2',
    dueno: 'María García',
    periodo: 'Enero 2026',
    mes: 1,
    anio: 2026,
    ingresosBrutos: 980,
    comisionPorcentaje: 18,
    comisionMonto: 176.4,
    gastos: { servicios: 52, limpieza: 90, mantenimiento: 35, otros: 0 },
    totalGastos: 177,
    saldoFinal: 626.6,
    estado: 'aprobada',
    fechaEnvio: '2026-02-01',
  },
  {
    id: '3',
    departamento: 'Depto D4 - San Telmo',
    departamentoId: '4',
    dueno: 'Ana López',
    periodo: 'Enero 2026',
    mes: 1,
    anio: 2026,
    ingresosBrutos: 1480,
    comisionPorcentaje: 22,
    comisionMonto: 325.6,
    gastos: { servicios: 38, limpieza: 150, mantenimiento: 0, otros: 25 },
    totalGastos: 213,
    saldoFinal: 941.4,
    estado: 'enviada',
    fechaEnvio: '2026-02-03',
  },
  {
    id: '4',
    departamento: 'Depto E5 - Puerto Madero',
    departamentoId: '5',
    dueno: 'Roberto Sánchez',
    periodo: 'Enero 2026',
    mes: 1,
    anio: 2026,
    ingresosBrutos: 2100,
    comisionPorcentaje: 15,
    comisionMonto: 315,
    gastos: { servicios: 85, limpieza: 180, mantenimiento: 120, otros: 45 },
    totalGastos: 430,
    saldoFinal: 1355,
    estado: 'borrador',
  },
  {
    id: '5',
    departamento: 'Depto C3 - Belgrano',
    departamentoId: '3',
    dueno: 'Carlos Ruiz',
    periodo: 'Enero 2026',
    mes: 1,
    anio: 2026,
    ingresosBrutos: 650,
    comisionPorcentaje: 20,
    comisionMonto: 130,
    gastos: { servicios: 42, limpieza: 60, mantenimiento: 250, otros: 0 },
    totalGastos: 352,
    saldoFinal: 168,
    estado: 'borrador',
  },
]

function getEstadoBadge(estado: Liquidacion['estado']) {
  const config: Record<Liquidacion['estado'], { className: string; label: string; icon: typeof Clock }> = {
    borrador: { className: 'bg-gray-100 text-gray-800', label: 'Borrador', icon: FileText },
    enviada: { className: 'bg-blue-100 text-blue-800', label: 'Enviada', icon: Send },
    aprobada: { className: 'bg-yellow-100 text-yellow-800', label: 'Aprobada', icon: Check },
    pagada: { className: 'bg-green-100 text-green-800', label: 'Pagada', icon: DollarSign },
  }
  const { className, label, icon: Icon } = config[estado]
  return (
    <Badge className={className} variant="secondary">
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  )
}

function LiquidacionDetailDialog({ liquidacion }: { liquidacion: Liquidacion }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4 mr-1" />
          Ver
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Liquidación - {liquidacion.periodo}</DialogTitle>
          <DialogDescription>
            {liquidacion.departamento} • {liquidacion.dueno}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Ingresos */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">Ingresos</h4>
            <div className="flex justify-between items-center">
              <span className="text-green-700">Ingresos Brutos (Reservas)</span>
              <span className="text-xl font-bold text-green-800">US$ {liquidacion.ingresosBrutos.toLocaleString()}</span>
            </div>
          </div>

          {/* Comisión */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Comisión Benveo</h4>
            <div className="flex justify-between items-center">
              <span className="text-blue-700">{liquidacion.comisionPorcentaje}% de ingresos</span>
              <span className="text-xl font-bold text-blue-800">- US$ {liquidacion.comisionMonto.toLocaleString()}</span>
            </div>
          </div>

          {/* Gastos */}
          <div className="bg-orange-50 rounded-lg p-4">
            <h4 className="font-medium text-orange-800 mb-3">Gastos del Período</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-orange-700">Servicios (luz, gas, agua, etc.)</span>
                <span className="font-medium">US$ {liquidacion.gastos.servicios}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-700">Limpieza</span>
                <span className="font-medium">US$ {liquidacion.gastos.limpieza}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-700">Mantenimiento / Reparaciones</span>
                <span className="font-medium">US$ {liquidacion.gastos.mantenimiento}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-700">Otros</span>
                <span className="font-medium">US$ {liquidacion.gastos.otros}</span>
              </div>
              <div className="border-t border-orange-200 pt-2 flex justify-between font-medium">
                <span className="text-orange-800">Total Gastos</span>
                <span className="text-orange-800">- US$ {liquidacion.totalGastos}</span>
              </div>
            </div>
          </div>

          {/* Saldo Final */}
          <div className="bg-gray-900 text-white rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium mb-1">Saldo a Pagar al Propietario</h4>
                <p className="text-sm text-gray-400">
                  {liquidacion.ingresosBrutos} - {liquidacion.comisionMonto} - {liquidacion.totalGastos}
                </p>
              </div>
              <span className="text-3xl font-bold">US$ {liquidacion.saldoFinal.toLocaleString()}</span>
            </div>
          </div>

          {/* Estado y fechas */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              {getEstadoBadge(liquidacion.estado)}
              {liquidacion.fechaEnvio && (
                <span>Enviada: {new Date(liquidacion.fechaEnvio).toLocaleDateString('es-AR')}</span>
              )}
              {liquidacion.fechaPago && (
                <span>Pagada: {new Date(liquidacion.fechaPago).toLocaleDateString('es-AR')}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          {liquidacion.estado === 'borrador' && (
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Enviar al Propietario
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function LiquidacionesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState<string>('todos')
  const [filterPeriodo, setFilterPeriodo] = useState<string>('2026-01')

  const filteredLiquidaciones = mockLiquidaciones.filter(liq => {
    const matchesSearch = 
      liq.departamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      liq.dueno.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = filterEstado === 'todos' || liq.estado === filterEstado
    const matchesPeriodo = filterPeriodo === 'todos' || 
      `${liq.anio}-${String(liq.mes).padStart(2, '0')}` === filterPeriodo
    return matchesSearch && matchesEstado && matchesPeriodo
  })

  const stats = {
    total: filteredLiquidaciones.length,
    borradores: filteredLiquidaciones.filter(l => l.estado === 'borrador').length,
    pendientesPago: filteredLiquidaciones.filter(l => l.estado === 'aprobada').length,
    totalAPagar: filteredLiquidaciones
      .filter(l => l.estado !== 'pagada')
      .reduce((sum, l) => sum + l.saldoFinal, 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Liquidaciones</h1>
          <p className="text-gray-500">Gestiona los pagos a propietarios</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Generar Liquidaciones
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Liquidaciones</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Borradores</p>
            <p className="text-2xl font-bold text-gray-600">{stats.borradores}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Pendientes de Pago</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendientesPago}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total a Pagar</p>
            <p className="text-2xl font-bold text-green-600">US$ {stats.totalAPagar.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por departamento o propietario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterPeriodo} onValueChange={setFilterPeriodo}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="2026-02">Febrero 2026</SelectItem>
            <SelectItem value="2026-01">Enero 2026</SelectItem>
            <SelectItem value="2025-12">Diciembre 2025</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterEstado} onValueChange={setFilterEstado}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="borrador">Borrador</SelectItem>
            <SelectItem value="enviada">Enviada</SelectItem>
            <SelectItem value="aprobada">Aprobada</SelectItem>
            <SelectItem value="pagada">Pagada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Departamento</TableHead>
                <TableHead>Propietario</TableHead>
                <TableHead>Período</TableHead>
                <TableHead className="text-right">Ingresos</TableHead>
                <TableHead className="text-right">Comisión</TableHead>
                <TableHead className="text-right">Gastos</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLiquidaciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No se encontraron liquidaciones
                  </TableCell>
                </TableRow>
              ) : (
                filteredLiquidaciones.map((liq) => (
                  <TableRow key={liq.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <Link 
                          href={`/departamentos/${liq.departamentoId}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {liq.departamento}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>{liq.dueno}</TableCell>
                    <TableCell>{liq.periodo}</TableCell>
                    <TableCell className="text-right text-green-600">
                      US$ {liq.ingresosBrutos.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-blue-600">
                      - US$ {liq.comisionMonto.toLocaleString()}
                      <span className="text-xs text-gray-400 ml-1">({liq.comisionPorcentaje}%)</span>
                    </TableCell>
                    <TableCell className="text-right text-orange-600">
                      - US$ {liq.totalGastos}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      US$ {liq.saldoFinal.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {getEstadoBadge(liq.estado)}
                    </TableCell>
                    <TableCell>
                      <LiquidacionDetailDialog liquidacion={liq} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Alert for pending actions */}
      {stats.borradores > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 flex items-center gap-4">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800">
                Tienes {stats.borradores} liquidaciones en borrador
              </p>
              <p className="text-sm text-yellow-700">
                Revísalas y envíalas a los propietarios para su aprobación.
              </p>
            </div>
            <Button variant="outline" className="border-yellow-300 text-yellow-800 hover:bg-yellow-100">
              Revisar Borradores
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
