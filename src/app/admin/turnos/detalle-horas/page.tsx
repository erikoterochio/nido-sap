'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  AlertTriangle, Check, Edit2, Clock,
  Download, ChevronDown, ChevronUp, RotateCcw, X, Camera, Image
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// ============================================================================
// TIPOS
// ============================================================================

interface Turno {
  id: string
  fecha: string
  horaEntrada: string
  horaSalida: string
  duracionHoras: number
  esFeriadoFinde: boolean
  viaticos: number
  precioHora: number
  montoTotal: number
  estado: 'PENDIENTE_REVISION' | 'APROBADO' | 'PAGADO'
  tipo: 'LIMPIEZA' | 'MANTENIMIENTO'
  alertas: string[]
  comentarios?: string
  // Motivos por los que se extendió el turno (cargados desde el formulario)
  motivosExceso?: string[]
  // URLs de fotos subidas a Supabase Storage
  fotosUrls?: string[]
  empleado: { id: string; nombre: string; apellido: string }
  departamento: { id: string; nombre: string }
  historial?: HistorialItem[]
}

interface HistorialItem {
  id: string
  campoModificado: string
  valorAnterior: string
  valorNuevo: string
  motivo: string
  comentario?: string
  createdAt: string
}

interface Empleado { id: string; nombre: string; apellido: string }
interface Departamento { id: string; nombre: string }

// ============================================================================
// HELPERS
// ============================================================================

const estadoBadge: Record<string, { label: string; className: string; icon: any }> = {
  PENDIENTE_REVISION: { label: 'Revisar',  className: 'bg-amber-100 text-amber-700',   icon: AlertTriangle },
  APROBADO:           { label: 'Aprobado', className: 'bg-emerald-100 text-emerald-700', icon: Check },
  PAGADO:             { label: 'Pagado',   className: 'bg-blue-100 text-blue-700',      icon: Check },
}

function formatFecha(fechaStr: string) {
  const fecha = new Date(fechaStr)
  return {
    fecha: fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    dia: fecha.toLocaleDateString('es-AR', { weekday: 'short' }),
  }
}

// Etiquetas legibles para los motivos de exceso
const ETIQUETAS_MOTIVO: Record<string, string> = {
  lavado_sabanas_toallas: 'Lavado sábanas / toallas',
  estadia_larga:          'Estadía de huésped larga',
  otros:                  'Otros',
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function DetalleHorasPage() {
  // --- Estado de datos ---
  const [turnos, setTurnos]               = useState<Turno[]>([])
  const [empleados, setEmpleados]         = useState<Empleado[]>([])
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [cargando, setCargando]           = useState(true)
  const [error, setError]                 = useState<string | null>(null)

  // --- Filtros ---
  const [filtroEmpleado,    setFiltroEmpleado]    = useState('')
  const [filtroDepto,       setFiltroDepto]       = useState('')
  const [filtroEstado,      setFiltroEstado]      = useState('')
  const [filtroFechaDesde,  setFiltroFechaDesde]  = useState('')
  const [filtroFechaHasta,  setFiltroFechaHasta]  = useState('')

  // --- Ordenamiento ---
  const [sortBy,    setSortBy]    = useState<'fecha' | 'empleado' | 'departamento'>('fecha')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // --- Modal ---
  const [showModal,     setShowModal]     = useState(false)
  const [turnoSelecto,  setTurnoSelecto]  = useState<Turno | null>(null)
  const [guardando,     setGuardando]     = useState(false)

  // --- Lightbox de fotos ---
  const [fotoAmpliada, setFotoAmpliada]   = useState<string | null>(null)

  // --- Campos del formulario de edición ---
  const [formEntrada,    setFormEntrada]    = useState('')
  const [formSalida,     setFormSalida]     = useState('')
  const [formViaticos,   setFormViaticos]   = useState(0)
  const [formEsFinde,    setFormEsFinde]    = useState(false)
  const [formTipo,       setFormTipo]       = useState<'LIMPIEZA' | 'MANTENIMIENTO'>('LIMPIEZA')
  const [formMotivo,     setFormMotivo]     = useState('')
  const [formComentario, setFormComentario] = useState('')

  // ============================================================================
  // CARGA DE DATOS
  // ============================================================================

  const cargarTurnos = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filtroEmpleado)   params.set('empleadoId',    filtroEmpleado)
      if (filtroDepto)      params.set('departamentoId', filtroDepto)
      if (filtroEstado)     params.set('estado',         filtroEstado)
      if (filtroFechaDesde && filtroFechaHasta) {
        params.set('fechaDesde', filtroFechaDesde)
        params.set('fechaHasta', filtroFechaHasta)
      }

      const res = await fetch(`/api/turnos?${params.toString()}`)
      if (!res.ok) throw new Error('Error al cargar turnos')
      setTurnos(await res.json())
    } catch (e) {
      setError('No se pudieron cargar los turnos. Intentá de nuevo.')
    } finally {
      setCargando(false)
    }
  }, [filtroEmpleado, filtroDepto, filtroEstado, filtroFechaDesde, filtroFechaHasta])

  // Carga empleados y deptos para los selects (una sola vez)
  useEffect(() => {
    async function cargarFiltros() {
      try {
        const [empRes, depRes] = await Promise.all([
          fetch('/api/empleados'),
          fetch('/api/departamentos'),
        ])
        if (empRes.ok) setEmpleados(await empRes.json())
        if (depRes.ok) setDepartamentos(await depRes.json())
      } catch {}
    }
    cargarFiltros()
  }, [])

  useEffect(() => { cargarTurnos() }, [cargarTurnos])

  // ============================================================================
  // ABRIR MODAL
  // ============================================================================

  async function abrirModal(turno: Turno) {
    try {
      const res = await fetch(`/api/turnos/${turno.id}`)
      const detalle: Turno = res.ok ? await res.json() : turno
      setTurnoSelecto(detalle)
      setFormEntrada(detalle.horaEntrada)
      setFormSalida(detalle.horaSalida)
      setFormViaticos(Number(detalle.viaticos))
      setFormEsFinde(detalle.esFeriadoFinde)
      setFormTipo(detalle.tipo)
      setFormMotivo('')
      setFormComentario('')
      setShowModal(true)
    } catch {
      setTurnoSelecto(turno)
      setShowModal(true)
    }
  }

  // ============================================================================
  // GUARDAR EDICIÓN
  // ============================================================================

  async function guardarCambios() {
    if (!turnoSelecto || !formMotivo) return
    setGuardando(true)
    try {
      const [hE, mE] = formEntrada.split(':').map(Number)
      const [hS, mS] = formSalida.split(':').map(Number)
      const duracionHoras = ((hS * 60 + mS) - (hE * 60 + mE)) / 60

      const res = await fetch(`/api/turnos/${turnoSelecto.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          horaEntrada:    formEntrada,
          horaSalida:     formSalida,
          duracionHoras,
          viaticos:       formViaticos,
          esFeriadoFinde: formEsFinde,
          tipo:           formTipo,
          estado:         'APROBADO',
          motivo:         formMotivo,
          comentario:     formComentario,
          usuarioId:      'admin-temp',
        }),
      })

      if (!res.ok) throw new Error('Error al guardar')

      setShowModal(false)
      cargarTurnos()
    } catch {
      alert('Error al guardar los cambios. Intentá de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  // ============================================================================
  // APROBAR DIRECTAMENTE
  // ============================================================================

  async function aprobarTurno(turno: Turno) {
    try {
      await fetch(`/api/turnos/${turno.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado:    'APROBADO',
          motivo:    'Aprobación directa',
          usuarioId: 'admin-temp',
        }),
      })
      cargarTurnos()
    } catch {
      alert('Error al aprobar el turno.')
    }
  }

  // ============================================================================
  // FILTROS Y ORDENAMIENTO
  // ============================================================================

  const limpiarFiltros = () => {
    setFiltroEmpleado('')
    setFiltroDepto('')
    setFiltroEstado('')
    setFiltroFechaDesde('')
    setFiltroFechaHasta('')
  }

  const turnosOrdenados = [...turnos].sort((a, b) => {
    let cmp = 0
    if (sortBy === 'fecha')        cmp = a.fecha.localeCompare(b.fecha)
    if (sortBy === 'empleado')     cmp = a.empleado.apellido.localeCompare(b.empleado.apellido)
    if (sortBy === 'departamento') cmp = a.departamento.nombre.localeCompare(b.departamento.nombre)
    return sortOrder === 'asc' ? cmp : -cmp
  })

  const toggleSort = (campo: typeof sortBy) => {
    if (sortBy === campo) setSortOrder(o => o === 'asc' ? 'desc' : 'asc')
    else { setSortBy(campo); setSortOrder('desc') }
  }

  // ============================================================================
  // RESUMEN
  // ============================================================================

  const pendientesCount = turnos.filter(t => t.estado === 'PENDIENTE_REVISION').length
  const totalHoras      = turnosOrdenados.reduce((a, t) => a + Number(t.duracionHoras), 0)
  const totalMonto      = turnosOrdenados.reduce((a, t) => a + Number(t.montoTotal), 0)
  const totalViaticos   = turnosOrdenados.reduce((a, t) => a + Number(t.viaticos), 0)

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-4">

      {/* FILTROS */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[160px]">
              <label className="block text-sm text-slate-500 mb-1">Empleado</label>
              <select value={filtroEmpleado} onChange={e => setFiltroEmpleado(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                <option value="">Todos</option>
                {empleados.map(e => (
                  <option key={e.id} value={e.id}>{e.nombre} {e.apellido}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="block text-sm text-slate-500 mb-1">Departamento</label>
              <select value={filtroDepto} onChange={e => setFiltroDepto(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                <option value="">Todos</option>
                {departamentos.map(d => (
                  <option key={d.id} value={d.id}>{d.nombre}</option>
                ))}
              </select>
            </div>
            <div className="w-[130px]">
              <label className="block text-sm text-slate-500 mb-1">Desde</label>
              <input type="date" value={filtroFechaDesde} onChange={e => setFiltroFechaDesde(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="w-[130px]">
              <label className="block text-sm text-slate-500 mb-1">Hasta</label>
              <input type="date" value={filtroFechaHasta} onChange={e => setFiltroFechaHasta(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <Button variant="outline" size="sm" onClick={limpiarFiltros}>
              <RotateCcw className="w-4 h-4 mr-1" /> Limpiar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" /> Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* FILTROS RÁPIDOS POR ESTADO */}
      <div className="flex gap-2 flex-wrap">
        {[
          { valor: '',                   label: `Todos (${turnos.length})` },
          { valor: 'PENDIENTE_REVISION', label: `Por revisar (${pendientesCount})`, alerta: pendientesCount > 0 },
          { valor: 'APROBADO',           label: 'Aprobados' },
          { valor: 'PAGADO',             label: 'Pagados' },
        ].map(({ valor, label, alerta }) => (
          <Button
            key={valor}
            variant={filtroEstado === valor ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFiltroEstado(valor)}
            className={alerta && filtroEstado !== valor ? 'border-amber-300 bg-amber-50 text-amber-700' : ''}
          >
            {valor === 'PENDIENTE_REVISION' && <AlertTriangle className="w-4 h-4 mr-1" />}
            {label}
          </Button>
        ))}
      </div>

      {/* RESUMEN */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Turnos',      valor: turnosOrdenados.length,                        sufijo: '' },
          { label: 'Total Horas', valor: totalHoras.toFixed(1),                         sufijo: 'hs' },
          { label: 'Viáticos',    valor: `$${totalViaticos.toLocaleString('es-AR')}`,   sufijo: '' },
          { label: 'Total',       valor: `$${totalMonto.toLocaleString('es-AR')}`,      sufijo: '' },
        ].map(({ label, valor, sufijo }) => (
          <Card key={label}>
            <CardContent className="p-3">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="text-xl font-bold text-slate-900">{valor}{sufijo}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* TABLA */}
      <Card>
        {cargando ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : turnosOrdenados.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No hay turnos para los filtros seleccionados</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b bg-slate-50">
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">
                    <button className="flex items-center gap-1 hover:text-slate-900" onClick={() => toggleSort('fecha')}>
                      Fecha {sortBy === 'fecha' && (sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <button className="flex items-center gap-1 hover:text-slate-900" onClick={() => toggleSort('empleado')}>
                      Empleado {sortBy === 'empleado' && (sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <button className="flex items-center gap-1 hover:text-slate-900" onClick={() => toggleSort('departamento')}>
                      Departamento {sortBy === 'departamento' && (sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium">Horario</th>
                  <th className="px-4 py-3 font-medium text-center">Horas</th>
                  <th className="px-4 py-3 font-medium text-center">Tipo</th>
                  <th className="px-4 py-3 font-medium text-right">Viáticos</th>
                  <th className="px-4 py-3 font-medium text-right">Monto</th>
                  <th className="px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {turnosOrdenados.map(turno => {
                  const badge = estadoBadge[turno.estado]
                  const Icon = badge.icon
                  const { fecha, dia } = formatFecha(turno.fecha)
                  const tieneAlerta = turno.alertas?.length > 0
                  const tieneMotivos = (turno.motivosExceso?.length ?? 0) > 0
                  const tieneFotos   = (turno.fotosUrls?.length ?? 0) > 0

                  return (
                    <tr key={turno.id} className={`border-b last:border-0 ${
                      turno.estado === 'PENDIENTE_REVISION' ? 'bg-amber-50' : 'hover:bg-slate-50'
                    }`}>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${badge.className}`}>
                          <Icon className="w-3 h-3" /> {badge.label}
                        </span>
                        {tieneAlerta && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                            <AlertTriangle className="w-3 h-3" />
                            {turno.alertas[0] === 'DURACION_EXCEDE_LIMITE' ? 'Duración excesiva' : 'Horario inusual'}
                          </div>
                        )}
                        {/* Indicador de fotos en la tabla */}
                        {tieneFotos && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-blue-500">
                            <Camera className="w-3 h-3" />
                            {turno.fotosUrls!.length} foto{turno.fotosUrls!.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{fecha}</p>
                        <p className="text-xs text-slate-400">{dia}</p>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {turno.empleado.nombre} {turno.empleado.apellido}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{turno.departamento.nombre}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {turno.horaEntrada} - {turno.horaSalida}
                      </td>
                      <td className="px-4 py-3 text-center font-medium">
                        {Number(turno.duracionHoras).toFixed(1)}hs
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          turno.tipo === 'MANTENIMIENTO'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {turno.tipo === 'MANTENIMIENTO' ? 'Mant.' : 'Limp.'}
                        </span>
                        {turno.esFeriadoFinde && (
                          <span className="block text-xs text-amber-600 mt-0.5">Finde/Fer</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {Number(turno.viaticos) > 0
                          ? <span className="text-blue-600">${Number(turno.viaticos).toLocaleString('es-AR')}</span>
                          : <span className="text-slate-400">-</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        ${Number(turno.montoTotal).toLocaleString('es-AR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {turno.estado === 'PENDIENTE_REVISION' && (
                            <Button variant="ghost" size="sm"
                              className="text-emerald-600 hover:bg-emerald-50"
                              onClick={() => aprobarTurno(turno)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm"
                            disabled={turno.estado === 'PAGADO'}
                            className={turno.estado === 'PENDIENTE_REVISION'
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-slate-500 hover:text-slate-700'
                            }
                            onClick={() => abrirModal(turno)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ================================================================
          MODAL DE DETALLE / EDICIÓN
          ================================================================ */}
      {showModal && turnoSelecto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[560px] max-h-[90vh] overflow-auto">

            {/* Header */}
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Detalle del Turno</h2>
                <p className="text-sm text-slate-500">{turnoSelecto.departamento.nombre}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">

              {/* Alerta si hay */}
              {turnoSelecto.alertas?.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-amber-700 font-medium mb-1">
                    <AlertTriangle className="w-4 h-4" /> Motivo de revisión
                  </div>
                  <ul className="text-sm text-amber-600 list-disc list-inside">
                    {turnoSelecto.alertas.map(a => (
                      <li key={a}>
                        {a === 'DURACION_EXCEDE_LIMITE'
                          ? 'Duración excede el límite del departamento'
                          : 'Horario inusual (antes de 7am o después de 11pm)'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Info fija */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Empleado</label>
                  <input disabled value={`${turnoSelecto.empleado.nombre} ${turnoSelecto.empleado.apellido}`}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Departamento</label>
                  <input disabled value={turnoSelecto.departamento.nombre}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 text-sm" />
                </div>
              </div>

              {/* Motivos de exceso — solo se muestra si vienen cargados */}
              {(turnoSelecto.motivosExceso?.length ?? 0) > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <p className="text-sm font-medium text-amber-800 mb-2">
                    Motivos declarados para la extensión del turno
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {turnoSelecto.motivosExceso!.map((m) => (
                      <span
                        key={m}
                        className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full font-medium"
                      >
                        {ETIQUETAS_MOTIVO[m] ?? m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Fotos del turno ─────────────────────────────────────────────
                  Se muestran en grilla. Click en una foto la amplía en lightbox. */}
              {(turnoSelecto.fotosUrls?.length ?? 0) > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Camera className="w-4 h-4" />
                    Fotos del turno ({turnoSelecto.fotosUrls!.length})
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {turnoSelecto.fotosUrls!.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFotoAmpliada(url)}
                        className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 hover:ring-2 hover:ring-blue-400 transition-all"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Foto ${i + 1} del turno`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                          <Image className="w-5 h-5 text-white opacity-0 hover:opacity-100 drop-shadow" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Horarios */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Hora entrada</label>
                  <input type="time" value={formEntrada} onChange={e => setFormEntrada(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Hora salida</label>
                  <input type="time" value={formSalida} onChange={e => setFormSalida(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                </div>
              </div>

              {/* Viáticos, tipo, finde */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Viáticos ($)</label>
                  <input type="number" value={formViaticos} onChange={e => setFormViaticos(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Tipo</label>
                  <select value={formTipo} onChange={e => setFormTipo(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm">
                    <option value="LIMPIEZA">Limpieza</option>
                    <option value="MANTENIMIENTO">Mantenimiento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Día</label>
                  <select value={formEsFinde ? 'finde' : 'normal'} onChange={e => setFormEsFinde(e.target.value === 'finde')}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm">
                    <option value="normal">Normal</option>
                    <option value="finde">Finde / Feriado</option>
                  </select>
                </div>
              </div>

              {/* Motivo del cambio (obligatorio) */}
              <div>
                <label className="block text-sm text-slate-500 mb-1">Motivo del cambio *</label>
                <select value={formMotivo} onChange={e => setFormMotivo(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm">
                  <option value="">Seleccionar...</option>
                  <option value="Error de tipeo">Error de tipeo</option>
                  <option value="Información incorrecta del empleado">Información incorrecta del empleado</option>
                  <option value="Cambio de departamento">Cambio de departamento</option>
                  <option value="Aprobación con corrección">Aprobación con corrección</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              {/* Comentario opcional */}
              <div>
                <label className="block text-sm text-slate-500 mb-1">Comentario adicional</label>
                <textarea value={formComentario} onChange={e => setFormComentario(e.target.value)}
                  placeholder="Detalle adicional del cambio..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm h-20 resize-none" />
              </div>

              {/* Historial de cambios */}
              {turnoSelecto.historial && turnoSelecto.historial.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Clock className="w-4 h-4" /> Historial de cambios
                  </div>
                  <div className="space-y-2 max-h-32 overflow-auto">
                    {turnoSelecto.historial.map(h => (
                      <div key={h.id} className="text-xs bg-slate-50 rounded-lg p-3">
                        <div className="flex justify-between text-slate-500 mb-1">
                          <span className="font-medium">{h.campoModificado}</span>
                          <span>{new Date(h.createdAt).toLocaleDateString('es-AR')}</span>
                        </div>
                        <p className="text-slate-700">
                          <span className="line-through text-slate-400">{h.valorAnterior}</span>
                          {' → '}{h.valorNuevo}
                        </p>
                        <p className="text-slate-500 mt-1">Motivo: {h.motivo}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-slate-50 rounded-b-2xl flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={guardarCambios}
                disabled={guardando || !formMotivo}>
                {guardando ? 'Guardando...' : 'Guardar y Aprobar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          LIGHTBOX — amplía la foto al hacer click
          ================================================================ */}
      {fotoAmpliada && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
          onClick={() => setFotoAmpliada(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-slate-300"
            onClick={() => setFotoAmpliada(null)}
          >
            <X className="w-8 h-8" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fotoAmpliada}
            alt="Foto ampliada"
            className="max-w-full max-h-full rounded-xl shadow-2xl object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

    </div>
  )
}