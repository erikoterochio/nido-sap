'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Receipt,
  Building2,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Upload,
  Download,
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Gasto {
  id: string
  fecha: string
  departamento: string
  departamentoId: string
  categoria: 'servicios' | 'limpieza' | 'mantenimiento' | 'reposicion' | 'traslados' | 'otros'
  subcategoria: string
  monto: number
  moneda: 'ARS' | 'USD'
  quienPago: 'tarjeta' | 'efectivo' | 'transferencia'
  registradoPor: string
  comprobante?: boolean
  comentarios?: string
}

// Mock data
const mockGastos: Gasto[] = [
  {
    id: '1',
    fecha: '2026-02-09',
    departamento: 'Depto A1 - Palermo',
    departamentoId: '1',
    categoria: 'servicios',
    subcategoria: 'Edenor',
    monto: 45000,
    moneda: 'ARS',
    quienPago: 'transferencia',
    registradoPor: 'Ana Rodriguez',
    comprobante: true,
  },
  {
    id: '2',
    fecha: '2026-02-08',
    departamento: 'Depto B2 - Recoleta',
    departamentoId: '2',
    categoria: 'limpieza',
    subcategoria: 'Productos de limpieza',
    monto: 15000,
    moneda: 'ARS',
    quienPago: 'tarjeta',
    registradoPor: 'Carolina Gómez',
    comprobante: true,
  },
  {
    id: '3',
    fecha: '2026-02-07',
    departamento: 'Depto C3 - Belgrano',
    departamentoId: '3',
    categoria: 'mantenimiento',
    subcategoria: 'Reparación calefón',
    monto: 85000,
    moneda: 'ARS',
    quienPago: 'efectivo',
    registradoPor: 'Pedro Sánchez',
    comprobante: false,
    comentarios: 'Cambio de termocupla',
  },
  {
    id: '4',
    fecha: '2026-02-06',
    departamento: 'Depto D4 - San Telmo',
    departamentoId: '4',
    categoria: 'reposicion',
    subcategoria: 'Sábanas y toallas',
    monto: 120,
    moneda: 'USD',
    quienPago: 'tarjeta',
    registradoPor: 'Ana Rodriguez',
    comprobante: true,
  },
  {
    id: '5',
    fecha: '2026-02-05',
    departamento: 'Depto E5 - Puerto Madero',
    departamentoId: '5',
    categoria: 'servicios',
    subcategoria: 'ABL + Expensas',
    monto: 95000,
    moneda: 'ARS',
    quienPago: 'transferencia',
    registradoPor: 'Ana Rodriguez',
    comprobante: true,
  },
  {
    id: '6',
    fecha: '2026-02-04',
    departamento: 'Depto A1 - Palermo',
    departamentoId: '1',
    categoria: 'traslados',
    subcategoria: 'Uber para check-in',
    monto: 5500,
    moneda: 'ARS',
    quienPago: 'efectivo',
    registradoPor: 'Laura Martínez',
    comprobante: false,
  },
]

function getCategoriaBadge(categoria: Gasto['categoria']) {
  const config: Record<Gasto['categoria'], { className: string; label: string }> = {
    servicios: { className: 'bg-blue-100 text-blue-800', label: 'Servicios' },
    limpieza: { className: 'bg-purple-100 text-purple-800', label: 'Limpieza' },
    mantenimiento: { className: 'bg-orange-100 text-orange-800', label: 'Mantenimiento' },
    reposicion: { className: 'bg-green-100 text-green-800', label: 'Reposición' },
    traslados: { className: 'bg-yellow-100 text-yellow-800', label: 'Traslados' },
    otros: { className: 'bg-gray-100 text-gray-800', label: 'Otros' },
  }
  const { className, label } = config[categoria]
  return <Badge className={className} variant="secondary">{label}</Badge>
}

export default function GastosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategoria, setFilterCategoria] = useState<string>('todos')
  const [filterDepto, setFilterDepto] = useState<string>('todos')

  const filteredGastos = mockGastos.filter(gasto => {
    const matchesSearch = 
      gasto.subcategoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gasto.departamento.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategoria = filterCategoria === 'todos' || gasto.categoria === filterCategoria
    const matchesDepto = filterDepto === 'todos' || gasto.departamentoId === filterDepto
    return matchesSearch && matchesCategoria && matchesDepto
  })

  const stats = {
    total: mockGastos.length,
    mesARS: mockGastos.filter(g => g.moneda === 'ARS').reduce((sum, g) => sum + g.monto, 0),
    mesUSD: mockGastos.filter(g => g.moneda === 'USD').reduce((sum, g) => sum + g.monto, 0),
    sinComprobante: mockGastos.filter(g => !g.comprobante).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gastos</h1>
          <p className="text-gray-500">Registro de gastos por departamento</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Registrar Gasto
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Gastos</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total ARS (mes)</p>
            <p className="text-2xl font-bold">$ {stats.mesARS.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total USD (mes)</p>
            <p className="text-2xl font-bold">US$ {stats.mesUSD}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Sin Comprobante</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.sinComprobante}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por concepto o departamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategoria} onValueChange={setFilterCategoria}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            <SelectItem value="servicios">Servicios</SelectItem>
            <SelectItem value="limpieza">Limpieza</SelectItem>
            <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
            <SelectItem value="reposicion">Reposición</SelectItem>
            <SelectItem value="traslados">Traslados</SelectItem>
            <SelectItem value="otros">Otros</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterDepto} onValueChange={setFilterDepto}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Building2 className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="1">Depto A1 - Palermo</SelectItem>
            <SelectItem value="2">Depto B2 - Recoleta</SelectItem>
            <SelectItem value="3">Depto C3 - Belgrano</SelectItem>
            <SelectItem value="4">Depto D4 - San Telmo</SelectItem>
            <SelectItem value="5">Depto E5 - Puerto Madero</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead className="text-center">Comp.</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGastos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No se encontraron gastos
                  </TableCell>
                </TableRow>
              ) : (
                filteredGastos.map((gasto) => (
                  <TableRow key={gasto.id}>
                    <TableCell className="text-gray-500">
                      {new Date(gasto.fecha).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'short'
                      })}
                    </TableCell>
                    <TableCell>
                      <Link 
                        href={`/departamentos/${gasto.departamentoId}`}
                        className="text-primary hover:underline text-sm"
                      >
                        {gasto.departamento}
                      </Link>
                    </TableCell>
                    <TableCell>{getCategoriaBadge(gasto.categoria)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{gasto.subcategoria}</p>
                        {gasto.comentarios && (
                          <p className="text-xs text-gray-400">{gasto.comentarios}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {gasto.moneda === 'USD' ? 'US$ ' : '$ '}
                      {gasto.monto.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 capitalize">
                      {gasto.quienPago}
                    </TableCell>
                    <TableCell className="text-center">
                      {gasto.comprobante ? (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          <Receipt className="h-3 w-3" />
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                          <Upload className="h-3 w-3" />
                        </Badge>
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
                            Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Upload className="h-4 w-4 mr-2" />
                            Subir comprobante
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
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
