'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Search, Sparkles, CheckCircle2, Clock, Calendar,
  MoreHorizontal, Eye, Edit, AlertCircle, X, AlertTriangle, Check,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

// ============================================================================
// TIPOS
// ============================================================================

interface Turno {
  id: string
  fecha: string
  horaEntrada: string
  horaSalida: string
  duracionHoras: number
  departamentoId: string
  empleadoId: string
  precioHora: number
  viaticos: number
  esFeriadoFinde: boolean
  montoTotal: number
  estado: 'PENDIENTE_REVISION' | 'APROBADO' | 'PAGADO'
  tipo: 'LIMPIEZA' | 'MANTENIMIENTO'
  alertas: string[]
  comentarios?: string
  departamento: { id: string; nombre: string }
  empleado: { id: string; nombre: string; apellido: string }
}

interface Empleado { id: string; nombre: string; apellido: string }
interface Departamento { id: string; nombre: string }

// ============================================================================
// HELPERS
// ============================================================================

const estadoConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDIENTE_REVISION: { label: 'Por revisar', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  APROBADO:           { label: 'Aprobado',    color: 'bg-green-100 text-green-800',   icon: CheckCircle2 },
  PAGADO:             { label: 'Pagado',       color: 'bg-blue-100 text-blue-800',     icon: CheckCircle2 },
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date(); today.setHours(0,0,0,0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  if (date.getTime() === today.getTime())     return 'Hoy'
  if (date.getTime() === tomorrow.getTime())  return 'Mañana'
  if (date.getTime() === yesterday.getTime()) return 'Ayer'
  return date.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' })
}

function getInitials(nombre: string, apellido: string) {
  return `${nombre[0]}${apellido[0]}`.toUpperCase()
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function TurnosPage() {
  // --- Datos ---
  const [turnos,       setTurnos]       = useState<Turno[]>([])
  const [empleados,    setEmpleados]    = useState<Empleado[]>([])
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [cargando,     setCargando]     = useState(true)

  // --- Filtros ---
  const [searchTerm,      setSearchTerm]      = useState('')
  const [filtroEmpleado,  setFiltroEmpleado]  = useState('todos')
  const [filtroDepto,     setFiltroDepto]     = useState('todos')
  const [viewTab,         setViewTab]         = useState<'proximos' | 'completados' | 'todos'>('proximos')

  // --- Modales ---
  const [detailTurno,   setDetailTurno]   = useState<Turno | null>(null)
  const [editTurno,     setEditTurno]     = useState<Turno | null>(null)
  const [newTurnoOpen,  setNewTurnoOpen]  = useState(false)
  const [guardando,     setGuardando]     = useState(false)

  // --- Form nuevo turno ---
  const [formFecha,     setFormFecha]     = useState('')
  const [formEntrada,   setFormEntrada]   = useState('10:00')
  const [formSalida,    setFormSalida]    = useState('14:00')
  const [formDepto,     setFormDepto]     = useState('')
  const [formEmpleado,  setFormEmpleado]  = useState('')
  const [formViaticos,  setFormViaticos]  = useState('0')
  const [formTipo,      setFormTipo]      = useState<'LIMPIEZA' | 'MANTENIMIENTO'>('LIMPIEZA')
  const [formEsFinde,   setFormEsFinde]   = useState(false)
  const [formNotas,     setFormNotas]     = useState('')

  // --- Form edición ---
  const [editEntrada,   setEditEntrada]   = useState('')
  const [editSalida,    setEditSalida]    = useState('')
  const [editViaticos,  setEditViaticos]  = useState(0)
  const [editEsFinde,   setEditEsFinde]   = useState(false)
  const [editTipo,      setEditTipo]      = useState<'LIMPIEZA' | 'MANTENIMIENTO'>('LIMPIEZA')
  const [editMotivo,    setEditMotivo]    = useState('')
  const [editComentario, setEditComentario] = useState('')

  const today = new Date().toISOString().split('T')[0]

  // ============================================================================
  // CARGA DE DATOS
  // ============================================================================

  const cargarTurnos = useCallback(async () => {
    setCargando(true)
    try {
      const params = new URLSearchParams()
      if (filtroEmpleado !== 'todos') params.set('empleadoId', filtroEmpleado)
      if (filtroDepto !== 'todos')    params.set('departamentoId', filtroDepto)

      const res = await fetch(`/api/turnos?${params.toString()}`)
      if (res.ok) setTurnos(await res.json())
    } catch {}
    finally { setCargando(false) }
  }, [filtroEmpleado, filtroDepto])

  useEffect(() => {
    async function cargarFiltros() {
      try {
        const [eRes, dRes] = await Promise.all([fetch('/api/empleados'), fetch('/api/departamentos')])
        if (eRes.ok) setEmpleados(await eRes.json())
        if (dRes.ok) setDepartamentos(await dRes.json())
      } catch {}
    }
    cargarFiltros()
  }, [])

  useEffect(() => { cargarTurnos() }, [cargarTurnos])

  // ============================================================================
  // FILTRADO
  // ============================================================================

  const turnosFiltrados = turnos.filter(t => {
    const matchSearch =
      t.departamento.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${t.empleado.nombre} ${t.empleado.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())

    if (viewTab === 'proximos')    return matchSearch && t.estado === 'PENDIENTE_REVISION'
    if (viewTab === 'completados') return matchSearch && (t.estado === 'APROBADO' || t.estado === 'PAGADO')
    return matchSearch
  })

  // Agrupar por fecha para la vista Próximos
  const grouped = turnosFiltrados.reduce<Record<string, Turno[]>>((acc, t) => {
    const key = t.fecha.split('T')[0]
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {})
  const sortedDates = Object.keys(grouped).sort()

  // Stats
  const stats = {
    pendientes:  turnos.filter(t => t.estado === 'PENDIENTE_REVISION').length,
    aprobados:   turnos.filter(t => t.estado === 'APROBADO').length,
    conAlertas:  turnos.filter(t => t.alertas?.length > 0).length,
    total:       turnos.length,
  }

  // ============================================================================
  // ACCIONES
  // ============================================================================

  async function aprobarTurno(turno: Turno) {
    try {
      await fetch(`/api/turnos/${turno.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'APROBADO', motivo: 'Aprobación directa', usuarioId: 'admin-temp' }),
      })
      cargarTurnos()
    } catch { alert('Error al aprobar el turno.') }
  }

  async function guardarEdicion() {
    if (!editTurno || !editMotivo) return
    setGuardando(true)
    try {
      const [hE, mE] = editEntrada.split(':').map(Number)
      const [hS, mS] = editSalida.split(':').map(Number)
      const duracionHoras = ((hS * 60 + mS) - (hE * 60 + mE)) / 60

      await fetch(`/api/turnos/${editTurno.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          horaEntrada: editEntrada,
          horaSalida:  editSalida,
          duracionHoras,
          viaticos:       editViaticos,
          esFeriadoFinde: editEsFinde,
          tipo:           editTipo,
          estado:         'APROBADO',
          motivo:         editMotivo,
          comentario:     editComentario,
          usuarioId:      'admin-temp',
        }),
      })
      setEditTurno(null)
      cargarTurnos()
    } catch { alert('Error al guardar.') }
    finally { setGuardando(false) }
  }

  async function crearTurno() {
    if (!formFecha || !formDepto) return
    setGuardando(true)
    try {
      const res = await fetch('/api/turnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departamentoId: formDepto,
          empleadoId:     formEmpleado || undefined,
          fecha:          formFecha,
          horaEntrada:    formEntrada,
          horaSalida:     formSalida,
          viaticos:       Number(formViaticos),
          esFeriadoFinde: formEsFinde,
          tipo:           formTipo,
          comentarios:    formNotas,
        }),
      })
      if (!res.ok) throw new Error()
      setNewTurnoOpen(false)
      setFormFecha(''); setFormNotas(''); setFormDepto(''); setFormEmpleado('')
      cargarTurnos()
    } catch { alert('Error al crear el turno.') }
    finally { setGuardando(false) }
  }

  function abrirEdicion(turno: Turno) {
    setEditTurno(turno)
    setEditEntrada(turno.horaEntrada)
    setEditSalida(turno.horaSalida)
    setEditViaticos(Number(turno.viaticos))
    setEditEsFinde(turno.esFeriadoFinde)
    setEditTipo(turno.tipo)
    setEditMotivo('')
    setEditComentario('')
  }

  // ============================================================================
  // RENDER — FILA DE TURNO (compartida entre vistas)
  // ============================================================================

  function TurnoCard({ turno }: { turno: Turno }) {
    const cfg = estadoConfig[turno.estado]
    const StatusIcon = cfg.icon
    const tieneAlerta = turno.alertas?.length > 0

    return (
      <Card
        className={cn(
          'cursor-pointer hover:shadow-md transition-shadow',
          turno.estado === 'PENDIENTE_REVISION' && tieneAlerta && 'border-amber-300',
        )}
        onClick={() => setDetailTurno(turno)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Horario */}
              <div className="text-center min-w-[60px]">
                <p className="text-base font-bold text-gray-900">{turno.horaEntrada}</p>
                <p className="text-xs text-gray-400">{turno.horaSalida}</p>
                <p className="text-xs font-medium text-primary">{Number(turno.duracionHoras).toFixed(1)}hs</p>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900">{turno.departamento.nombre}</p>
                  <Badge variant="secondary" className={cn(
                    'text-xs',
                    turno.tipo === 'MANTENIMIENTO' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                  )}>
                    {turno.tipo === 'MANTENIMIENTO' ? 'Mantenimiento' : 'Limpieza'}
                  </Badge>
                  {turno.esFeriadoFinde && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">Finde/Feriado</Badge>
                  )}
                  {tieneAlerta && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {turno.alertas[0] === 'DURACION_EXCEDE_LIMITE' ? 'Duración excesiva' : 'Horario inusual'}
                    </Badge>
                  )}
                </div>
                {turno.comentarios && (
                  <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded mt-1.5 inline-block">
                    {turno.comentarios}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Empleado */}
              <div className="flex items-center gap-2 text-sm">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(turno.empleado.nombre, turno.empleado.apellido)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-gray-700 hidden sm:block">{turno.empleado.nombre}</span>
              </div>

              {/* Monto */}
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(Number(turno.montoTotal))}</p>
                {Number(turno.viaticos) > 0 && (
                  <p className="text-xs text-gray-400">+{formatCurrency(Number(turno.viaticos))} viát.</p>
                )}
              </div>

              {/* Estado */}
              <Badge className={cfg.color} variant="secondary">
                <StatusIcon className="h-3 w-3 mr-1" />
                {cfg.label}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => e.stopPropagation()}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={e => { e.stopPropagation(); setDetailTurno(turno) }}>
                    <Eye className="h-4 w-4 mr-2" /> Ver detalle
                  </DropdownMenuItem>
                  {turno.estado !== 'PAGADO' && (
                    <DropdownMenuItem onClick={e => { e.stopPropagation(); abrirEdicion(turno) }}>
                      <Edit className="h-4 w-4 mr-2" /> Editar
                    </DropdownMenuItem>
                  )}
                  {turno.estado === 'PENDIENTE_REVISION' && (
                    <DropdownMenuItem onClick={e => { e.stopPropagation(); aprobarTurno(turno) }}
                      className="text-green-600">
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Aprobar
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Turnos de Limpieza</h1>
          <p className="text-gray-500">Coordiná y seguí los turnos de limpieza por departamento</p>
        </div>
        <Button onClick={() => setNewTurnoOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nuevo Turno
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total turnos',  valor: stats.total,      color: 'bg-blue-100',   icon: Calendar,      iconColor: 'text-blue-600' },
          { label: 'Por revisar',   valor: stats.pendientes, color: 'bg-yellow-100', icon: Clock,         iconColor: 'text-yellow-600' },
          { label: 'Aprobados',     valor: stats.aprobados,  color: 'bg-green-100',  icon: CheckCircle2,  iconColor: 'text-green-600' },
          { label: 'Con alertas',   valor: stats.conAlertas, color: 'bg-red-100',    icon: AlertCircle,   iconColor: 'text-red-500' },
        ].map(({ label, valor, color, icon: Icon, iconColor }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 ${color} rounded-lg`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className={`text-2xl font-bold ${valor > 0 && label === 'Con alertas' ? 'text-red-500' : ''}`}>{valor}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerta turnos con problemas */}
      {stats.conAlertas > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-amber-800">
                {stats.conAlertas} turno{stats.conAlertas > 1 ? 's' : ''} con alertas que requieren revisión
              </p>
              <p className="text-sm text-amber-700">Revisá los turnos con duración excesiva u horario inusual</p>
            </div>
            <Button size="sm" variant="outline" className="border-amber-300 text-amber-700"
              onClick={() => setViewTab('proximos')}>
              Ver turnos
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {([
          { key: 'proximos',    label: `Por revisar (${stats.pendientes})` },
          { key: 'completados', label: 'Completados' },
          { key: 'todos',       label: 'Todos' },
        ] as const).map(({ key, label }) => (
          <button key={key} onClick={() => setViewTab(key)}
            className={cn(
              'px-4 py-2 font-medium border-b-2 transition-colors',
              viewTab === key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            )}>
            {label}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Buscar por depto o empleado..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
        <Select value={filtroEmpleado} onValueChange={setFiltroEmpleado}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Empleado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los empleados</SelectItem>
            {empleados.map(e => (
              <SelectItem key={e.id} value={e.id}>{e.nombre} {e.apellido}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtroDepto} onValueChange={setFiltroDepto}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los deptos</SelectItem>
            {departamentos.map(d => (
              <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Contenido */}
      {cargando ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : viewTab === 'proximos' ? (
        // Vista agrupada por fecha
        <div className="space-y-6">
          {sortedDates.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay turnos pendientes de revisión</p>
              </CardContent>
            </Card>
          ) : sortedDates.map(fecha => (
            <div key={fecha}>
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <h2 className="font-semibold text-gray-700">{formatDate(fecha)}</h2>
                <span className="text-gray-400 text-sm">
                  {new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'long' })}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {grouped[fecha].length} turno{grouped[fecha].length > 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="space-y-3">
                {grouped[fecha].map(turno => <TurnoCard key={turno.id} turno={turno} />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Vista tabla para Completados y Todos
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Empleado</TableHead>
                  <TableHead className="text-center">Horas</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {turnosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                      <Sparkles className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                      No hay turnos que coincidan con los filtros
                    </TableCell>
                  </TableRow>
                ) : turnosFiltrados.map(turno => {
                  const cfg = estadoConfig[turno.estado]
                  const StatusIcon = cfg.icon
                  return (
                    <TableRow key={turno.id} className="group cursor-pointer" onClick={() => setDetailTurno(turno)}>
                      <TableCell>
                        <p className="font-medium">{formatDate(turno.fecha.split('T')[0])}</p>
                        <p className="text-xs text-gray-400">{turno.horaEntrada} - {turno.horaSalida}</p>
                      </TableCell>
                      <TableCell className="font-medium">{turno.departamento.nombre}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(turno.empleado.nombre, turno.empleado.apellido)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{turno.empleado.nombre} {turno.empleado.apellido}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{Number(turno.duracionHoras).toFixed(1)}hs</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={turno.tipo === 'MANTENIMIENTO' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'}>
                          {turno.tipo === 'MANTENIMIENTO' ? 'Mantenimiento' : 'Limpieza'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cfg.color} variant="secondary">
                          <StatusIcon className="h-3 w-3 mr-1" />{cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(Number(turno.montoTotal))}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={e => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={e => { e.stopPropagation(); setDetailTurno(turno) }}>
                              <Eye className="h-4 w-4 mr-2" /> Ver detalle
                            </DropdownMenuItem>
                            {turno.estado !== 'PAGADO' && (
                              <DropdownMenuItem onClick={e => { e.stopPropagation(); abrirEdicion(turno) }}>
                                <Edit className="h-4 w-4 mr-2" /> Editar
                              </DropdownMenuItem>
                            )}
                            {turno.estado === 'PENDIENTE_REVISION' && (
                              <DropdownMenuItem onClick={e => { e.stopPropagation(); aprobarTurno(turno) }}
                                className="text-green-600">
                                <CheckCircle2 className="h-4 w-4 mr-2" /> Aprobar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ================================================================== */}
      {/* MODAL: NUEVO TURNO                                                  */}
      {/* ================================================================== */}
      <Dialog open={newTurnoOpen} onOpenChange={setNewTurnoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Turno</DialogTitle>
            <DialogDescription>Registrá un nuevo turno de limpieza o mantenimiento</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Fecha *</Label>
                <Input type="date" value={formFecha} onChange={e => setFormFecha(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={formTipo} onValueChange={v => setFormTipo(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LIMPIEZA">Limpieza</SelectItem>
                    <SelectItem value="MANTENIMIENTO">Mantenimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Hora entrada</Label>
                <Input type="time" value={formEntrada} onChange={e => setFormEntrada(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Hora salida</Label>
                <Input type="time" value={formSalida} onChange={e => setFormSalida(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Departamento *</Label>
              <Select value={formDepto} onValueChange={setFormDepto}>
                <SelectTrigger><SelectValue placeholder="Seleccionar departamento" /></SelectTrigger>
                <SelectContent>
                  {departamentos.map(d => <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Empleado</Label>
              <Select value={formEmpleado} onValueChange={setFormEmpleado}>
                <SelectTrigger><SelectValue placeholder="Seleccionar empleado" /></SelectTrigger>
                <SelectContent>
                  {empleados.map(e => <SelectItem key={e.id} value={e.id}>{e.nombre} {e.apellido}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Viáticos ($)</Label>
                <Input type="number" min="0" step="500" value={formViaticos} onChange={e => setFormViaticos(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Día</Label>
                <Select value={formEsFinde ? 'finde' : 'normal'} onValueChange={v => setFormEsFinde(v === 'finde')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="finde">Finde / Feriado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Textarea value={formNotas} onChange={e => setFormNotas(e.target.value)}
                placeholder="Instrucciones especiales..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTurnoOpen(false)}>Cancelar</Button>
            <Button onClick={crearTurno} disabled={!formFecha || !formDepto || guardando}>
              <Plus className="h-4 w-4 mr-2" />
              {guardando ? 'Creando...' : 'Crear Turno'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================== */}
      {/* MODAL: EDITAR TURNO                                                 */}
      {/* ================================================================== */}
      <Dialog open={!!editTurno} onOpenChange={v => !v && setEditTurno(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Turno</DialogTitle>
            <DialogDescription>{editTurno?.departamento.nombre}</DialogDescription>
          </DialogHeader>
          {editTurno && (
            <div className="space-y-4">
              {editTurno.alertas?.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-amber-700 font-medium text-sm mb-1">
                    <AlertTriangle className="h-4 w-4" /> Alerta detectada
                  </div>
                  <ul className="text-xs text-amber-600 list-disc list-inside">
                    {editTurno.alertas.map(a => (
                      <li key={a}>{a === 'DURACION_EXCEDE_LIMITE' ? 'Duración excede el límite del departamento' : 'Horario inusual'}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Hora entrada</Label>
                  <Input type="time" value={editEntrada} onChange={e => setEditEntrada(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Hora salida</Label>
                  <Input type="time" value={editSalida} onChange={e => setEditSalida(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Viáticos ($)</Label>
                  <Input type="number" min="0" value={editViaticos} onChange={e => setEditViaticos(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={editTipo} onValueChange={v => setEditTipo(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LIMPIEZA">Limpieza</SelectItem>
                      <SelectItem value="MANTENIMIENTO">Mantenimiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Día</Label>
                  <Select value={editEsFinde ? 'finde' : 'normal'} onValueChange={v => setEditEsFinde(v === 'finde')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="finde">Finde / Feriado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Motivo del cambio *</Label>
                <Select value={editMotivo} onValueChange={setEditMotivo}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Error de tipeo">Error de tipeo</SelectItem>
                    <SelectItem value="Información incorrecta del empleado">Información incorrecta</SelectItem>
                    <SelectItem value="Aprobación con corrección">Aprobación con corrección</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Comentario (opcional)</Label>
                <Textarea value={editComentario} onChange={e => setEditComentario(e.target.value)}
                  placeholder="Detalle adicional..." rows={2} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTurno(null)}>Cancelar</Button>
            <Button onClick={guardarEdicion} disabled={!editMotivo || guardando}>
              {guardando ? 'Guardando...' : 'Guardar y Aprobar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================== */}
      {/* MODAL: DETALLE                                                      */}
      {/* ================================================================== */}
      {detailTurno && (
        <Dialog open={!!detailTurno} onOpenChange={() => setDetailTurno(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Detalle del Turno</DialogTitle>
              <DialogDescription>{detailTurno.departamento.nombre}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-0.5">Fecha</p>
                  <p className="font-semibold">{formatDate(detailTurno.fecha.split('T')[0])}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-0.5">Horario</p>
                  <p className="font-semibold">{detailTurno.horaEntrada} - {detailTurno.horaSalida}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-0.5">Empleado</p>
                  <p className="font-semibold">{detailTurno.empleado.nombre} {detailTurno.empleado.apellido}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-0.5">Estado</p>
                  <Badge className={estadoConfig[detailTurno.estado].color} variant="secondary">
                    {estadoConfig[detailTurno.estado].label}
                  </Badge>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-2">
                <p className="font-medium text-gray-700">Liquidación</p>
                <div className="flex justify-between">
                  <span className="text-gray-500">{Number(detailTurno.duracionHoras).toFixed(1)}hs × {formatCurrency(Number(detailTurno.precioHora))}/h</span>
                  <span>{formatCurrency(Number(detailTurno.duracionHoras) * Number(detailTurno.precioHora))}</span>
                </div>
                {Number(detailTurno.viaticos) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Viáticos</span>
                    <span>{formatCurrency(Number(detailTurno.viaticos))}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total</span>
                  <span className="text-green-600">{formatCurrency(Number(detailTurno.montoTotal))}</span>
                </div>
              </div>
              {detailTurno.comentarios && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                  <p className="font-medium text-amber-800 mb-0.5">Notas</p>
                  <p className="text-amber-700">{detailTurno.comentarios}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailTurno(null)}>Cerrar</Button>
              {detailTurno.estado === 'PENDIENTE_REVISION' && (
                <Button onClick={() => { aprobarTurno(detailTurno); setDetailTurno(null) }}>
                  <Check className="h-4 w-4 mr-2" /> Aprobar
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}