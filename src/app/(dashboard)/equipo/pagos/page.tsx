'use client'

import { Suspense } from 'react'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  DollarSign,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  ChevronDown,
  ChevronRight,
  Download,
  Plus,
  AlertCircle,
  CreditCard,
  ArrowUpDown,
  Eye,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface TurnoPendiente {
  id: string
  fecha: string
  departamento: string
  horas: number
  monto: number
  viaticos: number
  esFindeFeriado: boolean
}

interface EmpleadoConPagos {
  id: string
  nombre: string
  apellido: string
  puesto: string
  cvuAlias: string | null
  turnosPendientes: TurnoPendiente[]
  totalPendiente: number
  horasPendientes: number
}

// Mock data
const mockEmpleadosConPagos: EmpleadoConPagos[] = [
  {
    id: 'emp1',
    nombre: 'Carolina',
    apellido: 'Gómez',
    puesto: 'STAFF_LIMPIEZA',
    cvuAlias: 'carolina.gomez.mp',
    turnosPendientes: [
      { id: 't1', fecha: '2026-02-10', departamento: 'Depto A1 - Palermo', horas: 4, monto: 24000, viaticos: 2000, esFindeFeriado: false },
      { id: 't2', fecha: '2026-02-08', departamento: 'Depto B2 - Recoleta', horas: 3.5, monto: 21000, viaticos: 1500, esFindeFeriado: false },
      { id: 't3', fecha: '2026-02-09', departamento: 'Depto C3 - Belgrano', horas: 5, monto: 35000, viaticos: 2500, esFindeFeriado: true },
    ],
    totalPendiente: 86000,
    horasPendientes: 12.5,
  },
  {
    id: 'emp2',
    nombre: 'Miguel',
    apellido: 'Fernández',
    puesto: 'STAFF_LIMPIEZA',
    cvuAlias: 'miguel.fernandez',
    turnosPendientes: [
      { id: 't4', fecha: '2026-02-11', departamento: 'Depto D4 - San Telmo', horas: 4, monto: 24000, viaticos: 2000, esFindeFeriado: false },
    ],
    totalPendiente: 26000,
    horasPendientes: 4,
  },
  {
    id: 'emp4',
    nombre: 'Pedro',
    apellido: 'Sánchez',
    puesto: 'MANTENIMIENTO',
    cvuAlias: 'pedro.sanchez.cvu',
    turnosPendientes: [
      { id: 't5', fecha: '2026-02-07', departamento: 'Depto A1 - Palermo', horas: 3, monto: 24000, viaticos: 0, esFindeFeriado: false },
      { id: 't6', fecha: '2026-02-05', departamento: 'Depto B2 - Recoleta', horas: 2, monto: 16000, viaticos: 0, esFindeFeriado: false },
    ],
    totalPendiente: 40000,
    horasPendientes: 5,
  },
]

const mockHistorialPagos = [
  { id: 'p1', fecha: '2026-02-05', empleado: 'Carolina Gómez', concepto: 'Turnos semana 5', monto: 78000, metodo: 'Transferencia' },
  { id: 'p2', fecha: '2026-02-05', empleado: 'Miguel Fernández', concepto: 'Turnos semana 5', monto: 54000, metodo: 'Transferencia' },
  { id: 'p3', fecha: '2026-01-29', empleado: 'Carolina Gómez', concepto: 'Turnos semana 4', monto: 66000, metodo: 'Transferencia' },
  { id: 'p4', fecha: '2026-01-29', empleado: 'Pedro Sánchez', concepto: 'Mantenimiento enero', monto: 45000, metodo: 'Transferencia' },
]

const puestoLabels: Record<string, string> = {
  STAFF_LIMPIEZA: 'Limpieza',
  MANTENIMIENTO: 'Mantenimiento',
  HOST: 'Host',
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
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
}

function getInitials(nombre: string, apellido: string) {
  return `${nombre[0]}${apellido[0]}`.toUpperCase()
}

function PagosContent() {
  const searchParams = useSearchParams()
  const empleadoFilter = searchParams.get('empleado')
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTurnos, setSelectedTurnos] = useState<Set<string>>(new Set())
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedEmpleado, setSelectedEmpleado] = useState<EmpleadoConPagos | null>(null)
  const [expandedEmpleados, setExpandedEmpleados] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'pendientes' | 'historial'>('pendientes')
  
  const [paymentMethod, setPaymentMethod] = useState('transferencia')
  const [paymentNote, setPaymentNote] = useState('')

  const filteredEmpleados = mockEmpleadosConPagos.filter(emp => {
    if (empleadoFilter && emp.id !== empleadoFilter) return false
    const matchesSearch = `${emp.nombre} ${emp.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const stats = useMemo(() => ({
    totalPendiente: mockEmpleadosConPagos.reduce((sum, e) => sum + e.totalPendiente, 0),
    empleadosConPendiente: mockEmpleadosConPagos.filter(e => e.totalPendiente > 0).length,
    turnosTotales: mockEmpleadosConPagos.reduce((sum, e) => sum + e.turnosPendientes.length, 0),
    pagadoEsteMes: mockHistorialPagos.reduce((sum, p) => sum + p.monto, 0),
  }), [])

  const toggleEmpleadoExpanded = (empleadoId: string) => {
    setExpandedEmpleados(prev => {
      const next = new Set(prev)
      if (next.has(empleadoId)) {
        next.delete(empleadoId)
      } else {
        next.add(empleadoId)
      }
      return next
    })
  }

  const toggleTurnoSelection = (turnoId: string) => {
    setSelectedTurnos(prev => {
      const next = new Set(prev)
      if (next.has(turnoId)) {
        next.delete(turnoId)
      } else {
        next.add(turnoId)
      }
      return next
    })
  }

  const selectAllTurnosEmpleado = (empleado: EmpleadoConPagos, select: boolean) => {
    setSelectedTurnos(prev => {
      const next = new Set(prev)
      empleado.turnosPendientes.forEach(t => {
        if (select) {
          next.add(t.id)
        } else {
          next.delete(t.id)
        }
      })
      return next
    })
  }

  const getSelectedTurnosForEmpleado = (empleado: EmpleadoConPagos) => {
    return empleado.turnosPendientes.filter(t => selectedTurnos.has(t.id))
  }

  const getSelectedTotal = (empleado: EmpleadoConPagos) => {
    return getSelectedTurnosForEmpleado(empleado).reduce((sum, t) => sum + t.monto + t.viaticos, 0)
  }

  const openPaymentDialog = (empleado: EmpleadoConPagos) => {
    if (getSelectedTurnosForEmpleado(empleado).length === 0) {
      selectAllTurnosEmpleado(empleado, true)
    }
    setSelectedEmpleado(empleado)
    setPaymentDialogOpen(true)
  }

  const handlePayment = () => {
    if (!selectedEmpleado) return
    
    const turnosPagar = getSelectedTurnosForEmpleado(selectedEmpleado)
    const total = turnosPagar.reduce((sum, t) => sum + t.monto + t.viaticos, 0)
    
    console.log('Procesando pago:', {
      empleado: selectedEmpleado.id,
      turnos: turnosPagar.map(t => t.id),
      total,
      metodo: paymentMethod,
      nota: paymentNote,
    })
    
    turnosPagar.forEach(t => selectedTurnos.delete(t.id))
    setSelectedTurnos(new Set(selectedTurnos))
    
    setPaymentDialogOpen(false)
    setSelectedEmpleado(null)
    setPaymentNote('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pagos al Equipo</h1>
          <p className="text-gray-500">Gestiona los pagos pendientes y el historial</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Pendiente</p>
                <p className="text-xl font-bold text-orange-600">{formatCurrency(stats.totalPendiente)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Empleados</p>
                <p className="text-xl font-bold">{stats.empleadosConPendiente}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Turnos a Pagar</p>
                <p className="text-xl font-bold">{stats.turnosTotales}</p>
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
                <p className="text-sm text-gray-500">Pagado este mes</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(stats.pagadoEsteMes)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setViewMode('pendientes')}
          className={cn(
            "px-4 py-2 font-medium border-b-2 transition-colors",
            viewMode === 'pendientes'
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          Pendientes
        </button>
        <button
          onClick={() => setViewMode('historial')}
          className={cn(
            "px-4 py-2 font-medium border-b-2 transition-colors",
            viewMode === 'historial'
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          Historial
        </button>
      </div>

      {viewMode === 'pendientes' ? (
        <>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar empleado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="space-y-4">
            {filteredEmpleados.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay pagos pendientes</p>
                </CardContent>
              </Card>
            ) : (
              filteredEmpleados.map((empleado) => {
                const isExpanded = expandedEmpleados.has(empleado.id)
                const selectedCount = getSelectedTurnosForEmpleado(empleado).length
                const allSelected = selectedCount === empleado.turnosPendientes.length
                
                return (
                  <Card key={empleado.id}>
                    <Collapsible open={isExpanded} onOpenChange={() => toggleEmpleadoExpanded(empleado.id)}>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                  {getInitials(empleado.nombre, empleado.apellido)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">{empleado.nombre} {empleado.apellido}</h3>
                                  <Badge variant="secondary" className="text-xs">
                                    {puestoLabels[empleado.puesto] || empleado.puesto}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                  <span>{empleado.turnosPendientes.length} turnos</span>
                                  <span>•</span>
                                  <span>{empleado.horasPendientes}hs</span>
                                  {empleado.cvuAlias && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <CreditCard className="h-3 w-3" />
                                        {empleado.cvuAlias}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Total pendiente</p>
                                <p className="text-xl font-bold text-orange-600">
                                  {formatCurrency(empleado.totalPendiente)}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openPaymentDialog(empleado)
                                }}
                              >
                                <DollarSign className="h-4 w-4 mr-1" />
                                Pagar
                              </Button>
                              <ChevronDown className={cn(
                                "h-5 w-5 text-gray-400 transition-transform",
                                isExpanded && "transform rotate-180"
                              )} />
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          <div className="border rounded-lg overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-gray-50">
                                  <TableHead className="w-10">
                                    <Checkbox
                                      checked={allSelected}
                                      onCheckedChange={(checked) => selectAllTurnosEmpleado(empleado, checked as boolean)}
                                    />
                                  </TableHead>
                                  <TableHead>Fecha</TableHead>
                                  <TableHead>Departamento</TableHead>
                                  <TableHead className="text-center">Horas</TableHead>
                                  <TableHead className="text-right">Monto</TableHead>
                                  <TableHead className="text-right">Viáticos</TableHead>
                                  <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {empleado.turnosPendientes.map((turno) => (
                                  <TableRow 
                                    key={turno.id}
                                    className={cn(selectedTurnos.has(turno.id) && "bg-primary/5")}
                                  >
                                    <TableCell>
                                      <Checkbox
                                        checked={selectedTurnos.has(turno.id)}
                                        onCheckedChange={() => toggleTurnoSelection(turno.id)}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        {formatDate(turno.fecha)}
                                        {turno.esFindeFeriado && (
                                          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                                            Finde
                                          </Badge>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{turno.departamento}</TableCell>
                                    <TableCell className="text-center">{turno.horas}hs</TableCell>
                                    <TableCell className="text-right">{formatCurrency(turno.monto)}</TableCell>
                                    <TableCell className="text-right text-gray-500">
                                      {turno.viaticos > 0 ? formatCurrency(turno.viaticos) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                      {formatCurrency(turno.monto + turno.viaticos)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                          
                          {selectedCount > 0 && (
                            <div className="mt-4 p-3 bg-primary/5 rounded-lg flex items-center justify-between">
                              <span className="text-sm">
                                {selectedCount} turno{selectedCount > 1 ? 's' : ''} seleccionado{selectedCount > 1 ? 's' : ''}
                              </span>
                              <div className="flex items-center gap-4">
                                <span className="font-semibold">
                                  Total: {formatCurrency(getSelectedTotal(empleado))}
                                </span>
                                <Button size="sm" onClick={() => openPaymentDialog(empleado)}>
                                  Pagar seleccionados
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                )
              })
            )}
          </div>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Historial de Pagos</CardTitle>
            <CardDescription>Últimos pagos realizados</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockHistorialPagos.map((pago) => (
                  <TableRow key={pago.id}>
                    <TableCell className="text-gray-500">
                      {new Date(pago.fecha).toLocaleDateString('es-AR')}
                    </TableCell>
                    <TableCell className="font-medium">{pago.empleado}</TableCell>
                    <TableCell>{pago.concepto}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{pago.metodo}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(pago.monto)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            <DialogDescription>
              {selectedEmpleado && (
                <>Pago a {selectedEmpleado.nombre} {selectedEmpleado.apellido}</>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedEmpleado && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Turnos seleccionados</span>
                  <span>{getSelectedTurnosForEmpleado(selectedEmpleado).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Horas totales</span>
                  <span>
                    {getSelectedTurnosForEmpleado(selectedEmpleado).reduce((sum, t) => sum + t.horas, 0)}hs
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total a pagar</span>
                  <span className="text-green-600">{formatCurrency(getSelectedTotal(selectedEmpleado))}</span>
                </div>
              </div>

              {selectedEmpleado.cvuAlias && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-sm font-medium">CVU/Alias:</span>
                    <code className="bg-blue-100 px-2 py-0.5 rounded text-sm">
                      {selectedEmpleado.cvuAlias}
                    </code>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Método de Pago</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="mercadopago">MercadoPago</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nota (opcional)</Label>
                <Textarea
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Ej: Pago correspondiente a la semana del 5 al 11 de febrero"
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePayment}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirmar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function PagosPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Cargando...</div>}>
      <PagosContent />
    </Suspense>
  )
}