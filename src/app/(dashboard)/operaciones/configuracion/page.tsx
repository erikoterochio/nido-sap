'use client'

import { useState, useEffect } from 'react'
import {
  Settings, DollarSign, Calendar, Building2,
  Plus, Trash2, Check, AlertCircle, ChevronLeft,
  History, Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// ============================================================================
// TIPOS
// ============================================================================

interface Tarifa {
  id: string
  precioHoraNormal: number
  precioHoraFinde: number
  fechaVigencia: string
  nota?: string
  creadaEn: string
}

interface Feriado {
  id: string
  fecha: string
  tipo: string
  descripcion?: string
}

interface DeptoLimite {
  id: string
  nombre: string
  limiteHoras: number
}

// ============================================================================
// HELPERS
// ============================================================================

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

function formatFecha(fechaStr: string) {
  return new Date(fechaStr + 'T00:00:00').toLocaleDateString('es-AR', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
  })
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ConfiguracionPage() {
  const [tab, setTab] = useState<'tarifas' | 'feriados' | 'deptos'>('tarifas')

  // Tarifas
  const [tarifas,          setTarifas]          = useState<Tarifa[]>([])
  const [showNuevaTarifa,  setShowNuevaTarifa]  = useState(false)
  const [formPrecioNormal, setFormPrecioNormal] = useState('')
  const [formPrecioFinde,  setFormPrecioFinde]  = useState('')
  const [formFechaVig,     setFormFechaVig]     = useState('')
  const [formNota,         setFormNota]         = useState('')
  const [guardandoTarifa,  setGuardandoTarifa]  = useState(false)
  const [turnosActualizados, setTurnosActualizados] = useState<number | null>(null)

  // Feriados
  const [feriados,         setFeriados]         = useState<Feriado[]>([])
  const [showNuevoFeriado, setShowNuevoFeriado] = useState(false)
  const [formFechaFer,     setFormFechaFer]     = useState('')
  const [formTipoFer,      setFormTipoFer]      = useState('FERIADO')
  const [formDescFer,      setFormDescFer]      = useState('')
  const [anioFiltro,       setAnioFiltro]       = useState(new Date().getFullYear())

  // Deptos
  const [deptos,    setDeptos]    = useState<DeptoLimite[]>([])
  const [editando,  setEditando]  = useState<string | null>(null)
  const [limiteTmp, setLimiteTmp] = useState('')

  // ============================================================================
  // CARGA
  // ============================================================================

  useEffect(() => {
    fetch('/api/configuracion/tarifas').then(r => r.json()).then(setTarifas).catch(() => {})
    fetch('/api/configuracion/feriados').then(r => r.json()).then(setFeriados).catch(() => {})
    fetch('/api/configuracion/departamentos').then(r => r.json()).then(setDeptos).catch(() => {})
  }, [])

  // ============================================================================
  // ACCIONES TARIFAS
  // ============================================================================

  async function guardarTarifa() {
    if (!formPrecioNormal || !formPrecioFinde || !formFechaVig) return
    setGuardandoTarifa(true)
    setTurnosActualizados(null)
    try {
      const res = await fetch('/api/configuracion/tarifas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          precioHoraNormal: Number(formPrecioNormal),
          precioHoraFinde:  Number(formPrecioFinde),
          fechaVigencia:    formFechaVig,
          nota:             formNota,
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setTurnosActualizados(data.turnosActualizados)
      setTarifas(prev => [data.tarifa, ...prev])
      setShowNuevaTarifa(false)
      setFormPrecioNormal('')
      setFormPrecioFinde('')
      setFormFechaVig('')
      setFormNota('')
    } catch { alert('Error al guardar tarifa.') }
    finally { setGuardandoTarifa(false) }
  }

  // ============================================================================
  // ACCIONES FERIADOS
  // ============================================================================

  async function guardarFeriado() {
    if (!formFechaFer) return
    try {
      const res = await fetch('/api/configuracion/feriados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fecha: formFechaFer, tipo: formTipoFer, descripcion: formDescFer }),
      })
      if (!res.ok) throw new Error()
      const nuevo = await res.json()
      setFeriados(prev => [...prev, nuevo].sort((a, b) => a.fecha.localeCompare(b.fecha)))
      setShowNuevoFeriado(false)
      setFormFechaFer('')
      setFormDescFer('')
    } catch { alert('Error al guardar feriado.') }
  }

  async function eliminarFeriado(id: string) {
    if (!confirm('¿Eliminar este feriado?')) return
    try {
      await fetch('/api/configuracion/feriados', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setFeriados(prev => prev.filter(f => f.id !== id))
    } catch { alert('Error al eliminar feriado.') }
  }

  // ============================================================================
  // ACCIONES DEPTOS
  // ============================================================================

  async function guardarLimite(id: string) {
    if (!limiteTmp || isNaN(Number(limiteTmp))) return
    try {
      const res = await fetch('/api/configuracion/departamentos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, limiteHoras: Number(limiteTmp) }),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setDeptos(prev => prev.map(d => d.id === id ? updated : d))
      setEditando(null)
    } catch { alert('Error al guardar límite.') }
  }

  const feriadosFiltrados = feriados.filter(f => new Date(f.fecha + 'T00:00:00').getFullYear() === anioFiltro)

  // ============================================================================
  // RENDER
  // ============================================================================

  const tabs = [
    { key: 'tarifas'  as const, label: 'Tarifas',       icon: DollarSign },
    { key: 'feriados' as const, label: 'Feriados',      icon: Calendar },
    { key: 'deptos'   as const, label: 'Límites deptos', icon: Building2 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-6 w-6" /> Configuración de Turnos
          </h1>
          <p className="text-gray-500 text-sm">Tarifas, feriados y límites por departamento</p>
        </div>
        <Link href="/operaciones/turnos">
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" /> Volver a turnos
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              tab === key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            )}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {/* ================================================================ */}
      {/* TAB: TARIFAS                                                      */}
      {/* ================================================================ */}
      {tab === 'tarifas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              La tarifa vigente se aplica a todos los turnos nuevos y recalcula los no pagados.
            </p>
            <Button onClick={() => setShowNuevaTarifa(true)}>
              <Plus className="h-4 w-4 mr-2" /> Nueva tarifa
            </Button>
          </div>

          {/* Alerta de turnos actualizados */}
          {turnosActualizados !== null && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              <Check className="h-5 w-5 flex-shrink-0" />
              Tarifa guardada. Se recalcularon <strong>{turnosActualizados}</strong> turno{turnosActualizados !== 1 ? 's' : ''} no pagados.
            </div>
          )}

          {/* Formulario nueva tarifa */}
          {showNuevaTarifa && (
            <Card className="border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Nueva tarifa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Precio día hábil ($/hr) *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <Input type="number" min="0" step="500"
                        value={formPrecioNormal} onChange={e => setFormPrecioNormal(e.target.value)}
                        className="pl-7" placeholder="6000" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Precio finde / feriado ($/hr) *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <Input type="number" min="0" step="500"
                        value={formPrecioFinde} onChange={e => setFormPrecioFinde(e.target.value)}
                        className="pl-7" placeholder="7000" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha de vigencia *</Label>
                    <Input type="date" value={formFechaVig} onChange={e => setFormFechaVig(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nota (opcional)</Label>
                    <Input placeholder="Ej: Actualización por inflación"
                      value={formNota} onChange={e => setFormNota(e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  Al guardar, se recalcularán todos los turnos no pagados con los nuevos precios.
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" onClick={() => setShowNuevaTarifa(false)}>Cancelar</Button>
                  <Button onClick={guardarTarifa}
                    disabled={!formPrecioNormal || !formPrecioFinde || !formFechaVig || guardandoTarifa}>
                    {guardandoTarifa ? 'Guardando...' : 'Guardar tarifa'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Historial de tarifas */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4" /> Historial de tarifas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {tarifas.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No hay tarifas cargadas. Agregá la primera.
                </div>
              ) : (
                <div className="divide-y">
                  {tarifas.map((tarifa, idx) => (
                    <div key={tarifa.id} className={cn('p-4 flex items-center justify-between',
                      idx === 0 && 'bg-green-50')}>
                      <div className="flex items-center gap-4">
                        {idx === 0 && (
                          <Badge className="bg-green-100 text-green-700 text-xs">Vigente</Badge>
                        )}
                        <div>
                          <p className="font-medium text-sm text-gray-900">
                            Desde {formatFecha(tarifa.fechaVigencia)}
                          </p>
                          {tarifa.nota && (
                            <p className="text-xs text-gray-500">{tarifa.nota}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Día hábil</p>
                          <p className="font-semibold text-gray-900">{formatCurrency(tarifa.precioHoraNormal)}/hr</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Finde/Feriado</p>
                          <p className="font-semibold text-gray-900">{formatCurrency(tarifa.precioHoraFinde)}/hr</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(tarifa.creadaEn).toLocaleDateString('es-AR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB: FERIADOS                                                     */}
      {/* ================================================================ */}
      {tab === 'feriados' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Año:</span>
              {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(anio => (
                <button key={anio} onClick={() => setAnioFiltro(anio)}
                  className={cn('px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                    anioFiltro === anio ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                  {anio}
                </button>
              ))}
            </div>
            <Button onClick={() => setShowNuevoFeriado(true)}>
              <Plus className="h-4 w-4 mr-2" /> Agregar feriado
            </Button>
          </div>

          {/* Formulario nuevo feriado */}
          {showNuevoFeriado && (
            <Card className="border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Nuevo feriado / día no hábil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha *</Label>
                    <Input type="date" value={formFechaFer} onChange={e => setFormFechaFer(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo *</Label>
                    <select value={formTipoFer} onChange={e => setFormTipoFer(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                      <option value="FERIADO">Feriado nacional</option>
                      <option value="DIA_NO_LABORABLE">Día no laborable</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Input placeholder="Ej: Año Nuevo"
                      value={formDescFer} onChange={e => setFormDescFer(e.target.value)} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowNuevoFeriado(false)}>Cancelar</Button>
                  <Button onClick={guardarFeriado} disabled={!formFechaFer}>Guardar</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de feriados */}
          <Card>
            <CardContent className="p-0">
              {feriadosFiltrados.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No hay feriados para {anioFiltro}
                </div>
              ) : (
                <div className="divide-y">
                  {feriadosFiltrados
                    .sort((a, b) => a.fecha.localeCompare(b.fecha))
                    .map(feriado => (
                      <div key={feriado.id} className="flex items-center justify-between p-4 hover:bg-gray-50 group">
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[60px]">
                            <p className="font-semibold text-gray-900 text-sm">
                              {new Date(feriado.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(feriado.fecha + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'short' })}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{feriado.descripcion || '—'}</p>
                            <Badge variant="secondary" className={cn('text-xs',
                              feriado.tipo === 'FERIADO'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700')}>
                              {feriado.tipo === 'FERIADO' ? 'Feriado nacional' : 'Día no laborable'}
                            </Badge>
                          </div>
                        </div>
                        <button onClick={() => eliminarFeriado(feriado.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB: LÍMITES POR DEPTO                                            */}
      {/* ================================================================ */}
      {tab === 'deptos' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            El límite de horas define a partir de cuántas horas un turno genera una alerta automática.
          </p>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {deptos.map(depto => (
                  <div key={depto.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{depto.nombre}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {editando === depto.id ? (
                        <>
                          <div className="flex items-center gap-2">
                            <Input type="number" min="1" max="24" step="0.5"
                              value={limiteTmp} onChange={e => setLimiteTmp(e.target.value)}
                              className="w-20 text-center" />
                            <span className="text-sm text-gray-500">hs</span>
                          </div>
                          <Button size="sm" onClick={() => guardarLimite(depto.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditando(null)}>
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="text-sm font-semibold text-gray-900">
                            {Number(depto.limiteHoras)}hs máx.
                          </span>
                          <Button size="sm" variant="outline" onClick={() => {
                            setEditando(depto.id)
                            setLimiteTmp(String(Number(depto.limiteHoras)))
                          }}>
                            Editar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}