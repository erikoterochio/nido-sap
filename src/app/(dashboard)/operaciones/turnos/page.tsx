'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Search, CheckCircle2, Clock, AlertTriangle,
  Eye, Edit, Check, X, Calendar, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

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

function formatFecha(fechaStr: string) {
  const fecha = new Date(fechaStr + 'T00:00:00')
  return fecha.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' })
}

function getInitials(nombre: string, apellido: string) {
  return `${nombre[0]}${apellido[0]}`.toUpperCase()
}

function getSemanaLabel(fecha: Date) {
  const lunes = new Date(fecha)
  const dia = lunes.getDay()
  const diff = dia === 0 ? -6 : 1 - dia
  lunes.setDate(lunes.getDate() + diff)
  const domingo = new Date(lunes)
  domingo.setDate(lunes.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
  return `${fmt(lunes)} – ${fmt(domingo)}`
}

function getMesLabel(fecha: Date) {
  return fecha.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function TurnosPage() {
  // Datos
  const [turnos,        setTurnos]        = useState<Turno[]>([])
  const [empleados,     setEmpleados]     = useState<Empleado[]>([])
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [cargando,      setCargando]      = useState(true)

  // Filtros
  const [searchTerm,        setSearchTerm]        = useState('')
  const [filtroEmpleados,   setFiltroEmpleados]   = useState<string[]>([])
  const [filtroDeptos,      setFiltroDeptos]      = useState<string[]>([])
  const [modoFecha,         setModoFecha]         = useState<'semana' | 'mes'>('semana')
  const [fechaRef,          setFechaRef]          = useState(new Date())
  const [viewTab,           setViewTab]           = useState<'revisar' | 'aprobados' | 'todos'>('revisar')
  const [showDatePicker,    setShowDatePicker]    = useState(false)
  const [pickerAnio,        setPickerAnio]        = useState(new Date().getFullYear())
  const [showEmpleadoFilter, setShowEmpleadoFilter] = useState(false)
  const [showDeptoFilter,   setShowDeptoFilter]   = useState(false)
  const [searchEmpleado,    setSearchEmpleado]    = useState('')
  const [searchDepto,       setSearchDepto]       = useState('')
  const [tempEmpleados,     setTempEmpleados]     = useState<string[]>([])
  const [tempDeptos,        setTempDeptos]        = useState<string[]>([])

  // Modales
  const [detailTurno,  setDetailTurno]  = useState<Turno | null>(null)
  const [editTurno,    setEditTurno]    = useState<Turno | null>(null)
  const [newTurnoOpen, setNewTurnoOpen] = useState(false)
  const [guardando,    setGuardando]    = useState(false)

  // Form nuevo turno
  const [formFecha,    setFormFecha]    = useState('')
  const [formEntrada,  setFormEntrada]  = useState('10:00')
  const [formSalida,   setFormSalida]   = useState('14:00')
  const [formDepto,    setFormDepto]    = useState('')
  const [formEmpleado, setFormEmpleado] = useState('')
  const [formViaticos, setFormViaticos] = useState('0')
  const [formTipo,     setFormTipo]     = useState<'LIMPIEZA' | 'MANTENIMIENTO'>('LIMPIEZA')
  const [formEsFinde,  setFormEsFinde]  = useState(false)
  const [formNotas,    setFormNotas]    = useState('')

  // Form edición
  const [editEntrada,    setEditEntrada]    = useState('')
  const [editSalida,     setEditSalida]     = useState('')
  const [editViaticos,   setEditViaticos]   = useState(0)
  const [editEsFinde,    setEditEsFinde]    = useState(false)
  const [editTipo,       setEditTipo]       = useState<'LIMPIEZA' | 'MANTENIMIENTO'>('LIMPIEZA')
  const [editMotivo,     setEditMotivo]     = useState('')
  const [editComentario, setEditComentario] = useState('')

  // ============================================================================
  // NAVEGACIÓN DE FECHA
  // ============================================================================

  function navAnterior() {
    const nueva = new Date(fechaRef)
    if (modoFecha === 'semana') nueva.setDate(nueva.getDate() - 7)
    else nueva.setMonth(nueva.getMonth() - 1)
    setFechaRef(nueva)
  }

  function navSiguiente() {
    const nueva = new Date(fechaRef)
    if (modoFecha === 'semana') nueva.setDate(nueva.getDate() + 7)
    else nueva.setMonth(nueva.getMonth() + 1)
    setFechaRef(nueva)
  }

  function getRangoFechas(): { desde: string; hasta: string } {
    if (modoFecha === 'semana') {
      const lunes = new Date(fechaRef)
      const dia = lunes.getDay()
      const diff = dia === 0 ? -6 : 1 - dia
      lunes.setDate(lunes.getDate() + diff)
      const domingo = new Date(lunes)
      domingo.setDate(lunes.getDate() + 6)
      return {
        desde: lunes.toISOString().split('T')[0],
        hasta: domingo.toISOString().split('T')[0],
      }
    } else {
      const desde = new Date(fechaRef.getFullYear(), fechaRef.getMonth(), 1)
      const hasta = new Date(fechaRef.getFullYear(), fechaRef.getMonth() + 1, 0)
      return {
        desde: desde.toISOString().split('T')[0],
        hasta: hasta.toISOString().split('T')[0],
      }
    }
  }

  // ============================================================================
  // CARGA DE DATOS
  // ============================================================================

  const cargarTurnos = useCallback(async () => {
    setCargando(true)
    try {
      const { desde, hasta } = getRangoFechas()
      const params = new URLSearchParams()
      params.set('fechaDesde', desde)
      params.set('fechaHasta', hasta)
      if (filtroEmpleados.length === 1) params.set('empleadoId', filtroEmpleados[0])
      if (filtroDeptos.length === 1)    params.set('departamentoId', filtroDeptos[0])

      const res = await fetch(`/api/turnos?${params.toString()}`)
      if (res.ok) setTurnos(await res.json())
    } catch {}
    finally { setCargando(false) }
  }, [fechaRef, modoFecha, filtroEmpleados, filtroDeptos])

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

    const matchEmpleado = filtroEmpleados.length === 0 || filtroEmpleados.includes(t.empleadoId)
    const matchDepto    = filtroDeptos.length === 0    || filtroDeptos.includes(t.departamentoId)

    if (!matchSearch || !matchEmpleado || !matchDepto) return false

    if (viewTab === 'revisar')   return t.estado === 'PENDIENTE_REVISION' || t.alertas?.length > 0
    if (viewTab === 'aprobados') return t.estado === 'APROBADO' || t.estado === 'PAGADO'
    return true
  })

  const countRevisar   = turnos.filter(t => t.estado === 'PENDIENTE_REVISION' || t.alertas?.length > 0).length
  const countAprobados = turnos.filter(t => t.estado === 'APROBADO' || t.estado === 'PAGADO').length

  // ============================================================================
  // ACCIONES
  // ============================================================================

  async function aprobarTurno(turno: Turno, e?: React.MouseEvent) {
    e?.stopPropagation()
    try {
      await fetch(`/api/turnos/${turno.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'APROBADO', motivo: 'Aprobación directa', usuarioId: 'admin-temp' }),
      })
      cargarTurnos()
    } catch { alert('Error al aprobar.') }
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
          horaEntrada: editEntrada, horaSalida: editSalida, duracionHoras,
          viaticos: editViaticos, esFeriadoFinde: editEsFinde, tipo: editTipo,
          estado: 'APROBADO', motivo: editMotivo, comentario: editComentario,
          usuarioId: 'admin-temp',
        }),
      })
      setEditTurno(null)
      cargarTurnos()
    } catch { alert('Error al guardar.') }
    finally { setGuardando(false) }
  }

  async function crearTurno() {
    if (!formFecha || !formDepto || !formEmpleado) return
    setGuardando(true)
    try {
      await fetch('/api/turnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departamentoId: formDepto, empleadoId: formEmpleado,
          fecha: formFecha, horaEntrada: formEntrada, horaSalida: formSalida,
          viaticos: Number(formViaticos), esFeriadoFinde: formEsFinde,
          tipo: formTipo, comentarios: formNotas,
        }),
      })
      setNewTurnoOpen(false)
      setFormFecha(''); setFormNotas(''); setFormDepto(''); setFormEmpleado('')
      cargarTurnos()
    } catch { alert('Error al crear.') }
    finally { setGuardando(false) }
  }

  function abrirEdicion(turno: Turno, e?: React.MouseEvent) {
    e?.stopPropagation()
    setEditTurno(turno)
    setEditEntrada(turno.horaEntrada)
    setEditSalida(turno.horaSalida)
    setEditViaticos(Number(turno.viaticos))
    setEditEsFinde(turno.esFeriadoFinde)
    setEditTipo(turno.tipo)
    setEditMotivo('')
    setEditComentario('')
  }

  function toggleEmpleado(id: string) {
    setFiltroEmpleados(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id])
  }

  function toggleDepto(id: string) {
    setFiltroDeptos(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id])
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  const tabs = [
    { key: 'revisar'   as const, label: 'Por revisar',  count: countRevisar,   icon: Clock },
    { key: 'aprobados' as const, label: 'Aprobados',    count: countAprobados, icon: CheckCircle2 },
    { key: 'todos'     as const, label: 'Todos',        count: turnos.length,  icon: null },
  ]

  return (
    <div className="space-y-4">

      {/* ------------------------------------------------------------------ */}
      {/* HEADER                                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Turnos de Limpieza</h1>
          <p className="text-gray-500 text-sm">Coordiná y seguí los turnos del equipo</p>
        </div>
        <Button onClick={() => setNewTurnoOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Cargar turno manual
        </Button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* FILTROS                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Buscador */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Buscar por depto o empleado..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
        </div>

        {/* Filtro fecha: modo + navegación */}
        <div className="flex items-center gap-1 border border-gray-200 rounded-lg bg-white px-1 py-1">
          <Popover>
            <PopoverTrigger asChild>
              <button className={cn('px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1',
                modoFecha === 'semana' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100')}
                onClick={() => setModoFecha('semana')}>
                Semana
              </button>
            </PopoverTrigger>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <button className={cn('px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                modoFecha === 'mes' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100')}
                onClick={() => setModoFecha('mes')}>
                Mes
              </button>
            </PopoverTrigger>
          </Popover>
        </div>

        <div className="flex items-center gap-1 border border-gray-200 rounded-lg bg-white px-1 py-1">
          <button onClick={navAnterior} className="p-1.5 hover:bg-gray-100 rounded">
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
            <PopoverTrigger asChild>
              <button className="text-sm font-medium text-gray-700 min-w-[160px] text-center hover:bg-gray-50 px-2 py-1 rounded">
                {modoFecha === 'semana' ? getSemanaLabel(fechaRef) : getMesLabel(fechaRef)}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="center">
              {modoFecha === 'mes' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <button onClick={() => setPickerAnio(a => a - 1)} className="p-1 hover:bg-gray-100 rounded">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="font-semibold text-sm">{pickerAnio}</span>
                    <button onClick={() => setPickerAnio(a => a + 1)} className="p-1 hover:bg-gray-100 rounded">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'].map((mes, i) => (
                      <button key={mes} onClick={() => {
                        const nueva = new Date(pickerAnio, i, 1)
                        setFechaRef(nueva)
                        setShowDatePicker(false)
                      }}
                        className={cn('px-2 py-1.5 rounded text-sm hover:bg-gray-100',
                          fechaRef.getMonth() === i && fechaRef.getFullYear() === pickerAnio
                            ? 'bg-primary text-white hover:bg-primary/90' : '')}>
                        {mes}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <button onClick={() => setPickerAnio(a => a - 1)} className="p-1 hover:bg-gray-100 rounded">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="font-semibold text-sm">{pickerAnio}</span>
                    <button onClick={() => setPickerAnio(a => a + 1)} className="p-1 hover:bg-gray-100 rounded">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {Array.from({ length: 52 }, (_, i) => {
                      const d = new Date(pickerAnio, 0, 1 + i * 7)
                      const lunes = new Date(d)
                      const dia = lunes.getDay()
                      const diff = dia === 0 ? -6 : 1 - dia
                      lunes.setDate(lunes.getDate() + diff)
                      if (lunes.getFullYear() !== pickerAnio) return null
                      const domingo = new Date(lunes); domingo.setDate(lunes.getDate() + 6)
                      const fmt = (d: Date) => `${d.getDate()}/${d.getMonth()+1}`
                      const isSelected = getSemanaLabel(fechaRef) === getSemanaLabel(lunes)
                      return (
                        <button key={i} onClick={() => { setFechaRef(new Date(lunes)); setShowDatePicker(false) }}
                          className={cn('px-2 py-1 rounded text-xs hover:bg-gray-100 text-left',
                            isSelected ? 'bg-primary text-white hover:bg-primary/90' : '')}>
                          {fmt(lunes)}–{fmt(domingo)}
                        </button>
                      )
                    }).filter(Boolean)}
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
          <button onClick={navSiguiente} className="p-1.5 hover:bg-gray-100 rounded">
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Filtro empleados */}
        <Popover open={showEmpleadoFilter} onOpenChange={setShowEmpleadoFilter}>
          <PopoverTrigger asChild>
            <button className={cn(
              'flex items-center gap-2 px-3 py-2 border rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors',
              filtroEmpleados.length > 0 ? 'border-primary text-primary' : 'border-gray-200 text-gray-600'
            )}>
              {filtroEmpleados.length === 0 ? 'Todos los empleados' : `${filtroEmpleados.length} empleado${filtroEmpleados.length > 1 ? 's' : ''}`}
              <ChevronRight className={cn('h-4 w-4 transition-transform', showEmpleadoFilter && 'rotate-90')} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="start">
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  placeholder="Buscar empleado..."
                  value={searchEmpleado}
                  onChange={e => setSearchEmpleado(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="p-2 border-b flex gap-2">
              <button onClick={() => setTempEmpleados(empleados.map(e => e.id))}
                className="text-xs text-primary hover:underline">Todos</button>
              <span className="text-gray-300">|</span>
              <button onClick={() => setTempEmpleados([])}
                className="text-xs text-gray-500 hover:underline">Ninguno</button>
            </div>
            <div className="max-h-48 overflow-auto p-1">
              {empleados
                .filter(e => `${e.nombre} ${e.apellido}`.toLowerCase().includes(searchEmpleado.toLowerCase()))
                .map(e => (
                  <label key={e.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer text-sm">
                    <input type="checkbox"
                      checked={tempEmpleados.includes(e.id)}
                      onChange={() => setTempEmpleados(prev =>
                        prev.includes(e.id) ? prev.filter(x => x !== e.id) : [...prev, e.id]
                      )}
                      className="rounded border-gray-300 text-primary"
                    />
                    {e.nombre} {e.apellido}
                  </label>
                ))}
            </div>
            <div className="p-2 border-t flex gap-2">
              <Button size="sm" className="flex-1" onClick={() => {
                setFiltroEmpleados(tempEmpleados)
                setShowEmpleadoFilter(false)
              }}>
                Aplicar
              </Button>
              <Button size="sm" variant="outline" onClick={() => {
                setTempEmpleados(filtroEmpleados)
                setShowEmpleadoFilter(false)
              }}>
                Cancelar
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Filtro deptos */}
        <Popover open={showDeptoFilter} onOpenChange={setShowDeptoFilter}>
          <PopoverTrigger asChild>
            <button className={cn(
              'flex items-center gap-2 px-3 py-2 border rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors',
              filtroDeptos.length > 0 ? 'border-primary text-primary' : 'border-gray-200 text-gray-600'
            )}>
              {filtroDeptos.length === 0 ? 'Todos los deptos' : `${filtroDeptos.length} depto${filtroDeptos.length > 1 ? 's' : ''}`}
              <ChevronRight className={cn('h-4 w-4 transition-transform', showDeptoFilter && 'rotate-90')} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="start">
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  placeholder="Buscar departamento..."
                  value={searchDepto}
                  onChange={e => setSearchDepto(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="p-2 border-b flex gap-2">
              <button onClick={() => setTempDeptos(departamentos.map(d => d.id))}
                className="text-xs text-primary hover:underline">Todos</button>
              <span className="text-gray-300">|</span>
              <button onClick={() => setTempDeptos([])}
                className="text-xs text-gray-500 hover:underline">Ninguno</button>
            </div>
            <div className="max-h-48 overflow-auto p-1">
              {departamentos
                .filter(d => d.nombre.toLowerCase().includes(searchDepto.toLowerCase()))
                .map(d => (
                  <label key={d.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer text-sm">
                    <input type="checkbox"
                      checked={tempDeptos.includes(d.id)}
                      onChange={() => setTempDeptos(prev =>
                        prev.includes(d.id) ? prev.filter(x => x !== d.id) : [...prev, d.id]
                      )}
                      className="rounded border-gray-300 text-primary"
                    />
                    {d.nombre}
                  </label>
                ))}
            </div>
            <div className="p-2 border-t flex gap-2">
              <Button size="sm" className="flex-1" onClick={() => {
                setFiltroDeptos(tempDeptos)
                setShowDeptoFilter(false)
              }}>
                Aplicar
              </Button>
              <Button size="sm" variant="outline" onClick={() => {
                setTempDeptos(filtroDeptos)
                setShowDeptoFilter(false)
              }}>
                Cancelar
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* TABS                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map(({ key, label, count, icon: Icon }) => (
          <button key={key} onClick={() => setViewTab(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              viewTab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}>
            {Icon && <Icon className="h-4 w-4" />}
            {label}
            <span className={cn(
              'px-1.5 py-0.5 rounded-full text-xs font-semibold',
              viewTab === key ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'
            )}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* TABLA                                                                */}
      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardContent className="p-0">
          {cargando ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Empleado</TableHead>
                  <TableHead className="text-center">Horas</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center w-[120px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {turnosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-400">
                      No hay turnos para el período seleccionado
                    </TableCell>
                  </TableRow>
                ) : turnosFiltrados.map(turno => {
                  const cfg = estadoConfig[turno.estado]
                  const StatusIcon = cfg.icon
                  const tieneAlerta = turno.alertas?.length > 0

                  return (
                    <TableRow key={turno.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setDetailTurno(turno)}>
                      <TableCell>
                        <p className="font-medium text-gray-900">{formatFecha(turno.fecha.split('T')[0])}</p>
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
                        <div className="flex flex-col gap-1">
                          <Badge variant="secondary" className={turno.tipo === 'MANTENIMIENTO'
                            ? 'bg-blue-100 text-blue-800 w-fit' : 'bg-slate-100 text-slate-700 w-fit'}>
                            {turno.tipo === 'MANTENIMIENTO' ? 'Mantenimiento' : 'Limpieza'}
                          </Badge>
                          {tieneAlerta && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800 w-fit text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {turno.alertas[0] === 'DURACION_EXCEDE_LIMITE' ? 'Duración excesiva' : 'Horario inusual'}
                            </Badge>
                          )}
                        </div>
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
                        <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                          {/* Ver detalle */}
                          <button onClick={() => setDetailTurno(turno)}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                            title="Ver detalle">
                            <Eye className="h-4 w-4" />
                          </button>
                          {/* Editar */}
                          {turno.estado !== 'PAGADO' && (
                            <button onClick={e => abrirEdicion(turno, e)}
                              className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                              title="Editar">
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          {/* Aprobar */}
                          {turno.estado === 'PENDIENTE_REVISION' && (
                            <button onClick={e => aprobarTurno(turno, e)}
                              className="p-1.5 rounded hover:bg-green-50 text-gray-500 hover:text-green-600"
                              title="Aprobar">
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ================================================================== */}
      {/* MODAL: NUEVO TURNO                                                  */}
      {/* ================================================================== */}
      <Dialog open={newTurnoOpen} onOpenChange={setNewTurnoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cargar turno manual</DialogTitle>
            <DialogDescription>Registrá un turno de limpieza o mantenimiento</DialogDescription>
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
              <Label>Empleado *</Label>
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
              <Label>Notas</Label>
              <Textarea value={formNotas} onChange={e => setFormNotas(e.target.value)}
                placeholder="Instrucciones especiales..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTurnoOpen(false)}>Cancelar</Button>
            <Button onClick={crearTurno} disabled={!formFecha || !formDepto || !formEmpleado || guardando}>
              {guardando ? 'Guardando...' : 'Cargar turno'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================== */}
      {/* MODAL: EDITAR                                                        */}
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
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                  <div className="flex items-center gap-2 text-amber-700 font-medium mb-1">
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
              {guardando ? 'Guardando...' : 'Guardar y aprobar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================== */}
      {/* MODAL: DETALLE                                                       */}
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
                  <p className="font-semibold">{formatFecha(detailTurno.fecha.split('T')[0])}</p>
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
              {detailTurno.alertas?.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                  <p className="font-medium text-amber-800 mb-1 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" /> Alertas
                  </p>
                  {detailTurno.alertas.map(a => (
                    <p key={a} className="text-amber-700 text-xs">
                      {a === 'DURACION_EXCEDE_LIMITE' ? 'Duración excede el límite del departamento' : 'Horario inusual'}
                    </p>
                  ))}
                </div>
              )}
              {detailTurno.comentarios && (
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="font-medium text-gray-700 mb-0.5">Notas</p>
                  <p className="text-gray-600">{detailTurno.comentarios}</p>
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