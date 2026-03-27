'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DollarSign, Users, Check, X, Copy, CreditCard,
  ChevronDown, ChevronUp, AlertCircle, Clock, Loader2,
  ChevronLeft, ChevronRight, Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Turno {
  id: string
  fecha: string
  departamento: string
  duracionHoras: number
  esFeriadoFinde: boolean
  viaticos: number
  montoTotal: number
}

interface Anticipo {
  id: string
  fecha: string
  monto: number
  motivo: string | null
}

interface EmpleadoPago {
  id: string
  nombre: string
  apellido: string
  cvuAlias: string | null
  precioHoraNormal: number
  precioHoraFinde: number
  saldoAnterior: number
  horasNormales: number
  horasFinde: number
  viaticosTotal: number
  subtotalTurnos: number
  totalAnticipos: number
  totalAPagar: number
  turnos: Turno[]
  anticipos: Anticipo[]
}

interface DatosSemana {
  semana: { inicio: string; fin: string; diaPago: string }
  empleados: EmpleadoPago[]
}

type ModoVista = 'semana' | 'mes'
type TabActivo = 'pendientes' | 'pagados' | 'todos'

// ─── Helpers de fecha ─────────────────────────────────────────────────────────

// El +T12:00:00 evita desfase de timezone al parsear strings ISO
function parseISO(fechaISO: string) {
  return new Date(fechaISO + 'T12:00:00')
}

function formatFecha(fechaISO: string) {
  return parseISO(fechaISO).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
}

function formatFechaCorta(fechaISO: string) {
  return parseISO(fechaISO).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

function formatFechaLarga(fechaISO: string) {
  return parseISO(fechaISO).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatPesos(monto: number) {
  return `$ ${Math.round(monto).toLocaleString('es-AR')}`
}

// Muestra horas sin decimales innecesarios: 4.0 → "4hs", 3.5 → "3.5hs"
function formatHoras(h: number) {
  const r = Math.round(h * 100) / 100
  return `${r % 1 === 0 ? r.toFixed(0) : r}hs`
}

// Rango semana (lunes–domingo) desde una fecha
function semanaDesde(fecha: Date): { inicio: string; fin: string } {
  const dia = fecha.getDay()
  const diffLunes = dia === 0 ? 6 : dia - 1
  const lunes = new Date(fecha)
  lunes.setDate(fecha.getDate() - diffLunes)
  const domingo = new Date(lunes)
  domingo.setDate(lunes.getDate() + 6)
  return {
    inicio: lunes.toISOString().split('T')[0],
    fin: domingo.toISOString().split('T')[0],
  }
}

// Rango mes completo desde una fecha
function mesDesde(fecha: Date): { inicio: string; fin: string } {
  const y = fecha.getFullYear()
  const m = fecha.getMonth()
  return {
    inicio: new Date(y, m, 1).toISOString().split('T')[0],
    fin: new Date(y, m + 1, 0).toISOString().split('T')[0],
  }
}

// Navega al período anterior/siguiente según el modo
function navegar(inicioActual: string, modo: ModoVista, dir: -1 | 1) {
  const fecha = parseISO(inicioActual)
  if (modo === 'semana') {
    fecha.setDate(fecha.getDate() + dir * 7)
    return semanaDesde(fecha)
  }
  fecha.setMonth(fecha.getMonth() + dir)
  return mesDesde(fecha)
}

// Etiqueta del período para el header
function labelPeriodo(inicio: string, fin: string, modo: ModoVista) {
  if (modo === 'mes') {
    return parseISO(inicio).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  }
  return `${formatFechaCorta(inicio)} – ${formatFechaCorta(fin)}`
}

// ─── Modal de confirmación de pago ───────────────────────────────────────────

interface ModalPagoProps {
  empleado: EmpleadoPago
  semana: { inicio: string; fin: string }
  onConfirmar: (empleadoId: string, montoPagado: number) => Promise<void>
  onCerrar: () => void
  cargando: boolean
}

function ModalPago({ empleado, onConfirmar, onCerrar, cargando }: ModalPagoProps) {
  const [montoPagado, setMontoPagado] = useState(
    Math.round(empleado.totalAPagar / 100) * 100
  )
  const diferencia = empleado.totalAPagar - montoPagado

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-[480px] shadow-xl">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Confirmar Pago</h2>
            <p className="text-sm text-slate-500 mt-0.5">{empleado.nombre} {empleado.apellido}</p>
          </div>
          <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {empleado.cvuAlias && (
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-4 py-3">
              <span className="text-sm text-slate-500">Alias:</span>
              <span className="font-mono text-sm font-medium text-slate-800">{empleado.cvuAlias}</span>
              <button
                onClick={() => navigator.clipboard.writeText(empleado.cvuAlias!)}
                className="ml-auto text-slate-400 hover:text-primary transition-colors"
                title="Copiar alias"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal turnos ({formatHoras(empleado.horasNormales + empleado.horasFinde)})</span>
              <span>{formatPesos(empleado.subtotalTurnos)}</span>
            </div>
            {empleado.totalAnticipos > 0 && (
              <div className="flex justify-between text-red-600">
                <span>— Anticipos a descontar</span>
                <span>− {formatPesos(empleado.totalAnticipos)}</span>
              </div>
            )}
            {empleado.saldoAnterior !== 0 && (
              <div className={`flex justify-between ${empleado.saldoAnterior > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                <span>{empleado.saldoAnterior > 0 ? '+ Saldo anterior (te debíamos)' : '— Crédito anterior (nos debía)'}</span>
                <span>{empleado.saldoAnterior > 0 ? '+' : '−'} {formatPesos(Math.abs(empleado.saldoAnterior))}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-slate-900 border-t pt-2">
              <span>Total calculado</span>
              <span>{formatPesos(empleado.totalAPagar)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Monto a transferir
              <span className="text-slate-400 font-normal ml-1">(podés ajustar para redondear)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
              <input
                type="number"
                value={montoPagado}
                onChange={(e) => setMontoPagado(Number(e.target.value))}
                className="w-full pl-7 pr-4 py-3 border border-slate-300 rounded-lg text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                step={100}
              />
            </div>
          </div>

          {diferencia !== 0 && (
            <div className={`flex items-start gap-2 text-sm rounded-lg p-3 ${
              diferencia > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                {diferencia > 0
                  ? `Estás pagando ${formatPesos(diferencia)} menos. Quedará como saldo a favor para la próxima semana.`
                  : `Estás pagando ${formatPesos(Math.abs(diferencia))} más. Se descontará la próxima semana.`}
              </span>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-slate-50 rounded-b-2xl flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCerrar} disabled={cargando}>
            Cancelar
          </Button>
          <Button
            className="flex-1"
            onClick={() => onConfirmar(empleado.id, montoPagado)}
            disabled={cargando || montoPagado <= 0}
          >
            {cargando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
            Confirmar Pago
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function PagosSemanaPage() {
  const [datos, setDatos] = useState<DatosSemana | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandido, setExpandido] = useState<string | null>(null)
  const [modalEmpleado, setModalEmpleado] = useState<EmpleadoPago | null>(null)
  const [pagosConfirmados, setPagosConfirmados] = useState<string[]>([])
  const [confirmando, setConfirmando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)

  // Control de período
  const [modo, setModo] = useState<ModoVista>('semana')
  const [rango, setRango] = useState(() => semanaDesde(new Date()))
  const [busqueda, setBusqueda] = useState('')
  const [tabActivo, setTabActivo] = useState<TabActivo>('pendientes')

  const cargarDatos = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const params = new URLSearchParams({ inicio: rango.inicio, fin: rango.fin })
      const res = await fetch(`/api/pagos/semana?${params.toString()}`)
      if (!res.ok) throw new Error('Error al cargar datos')
      const json: DatosSemana = await res.json()
      setDatos(json)
      setPagosConfirmados([]) // limpiar al cambiar período
    } catch {
      setError('No se pudieron cargar los datos. Intentá de nuevo.')
    } finally {
      setCargando(false)
    }
  }, [rango])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  // Cambiar modo semana/mes manteniendo la fecha de referencia
  const cambiarModo = (nuevoModo: ModoVista) => {
    setModo(nuevoModo)
    const fecha = parseISO(rango.inicio)
    setRango(nuevoModo === 'semana' ? semanaDesde(fecha) : mesDesde(fecha))
  }

  const confirmarPago = async (empleadoId: string, montoPagado: number) => {
    if (!datos || !modalEmpleado) return
    setConfirmando(true)
    try {
      const res = await fetch('/api/pagos/confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empleadoId,
          montoPagado,
          totalCalculado: modalEmpleado.totalAPagar,
          anticiposIds: modalEmpleado.anticipos.map(a => a.id),
          periodo: `${datos.semana.inicio}/${datos.semana.fin}`,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al registrar pago')
      setPagosConfirmados(prev => [...prev, empleadoId])
      setMensajeExito(json.mensaje)
      setModalEmpleado(null)
      setTimeout(() => setMensajeExito(null), 5000)
      await cargarDatos()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al confirmar el pago')
    } finally {
      setConfirmando(false)
    }
  }

  // ─── Filtros aplicados ────────────────────────────────────────────────────

  const empleadosFiltrados = (datos?.empleados ?? []).filter(emp => {
    const nombre = `${emp.nombre} ${emp.apellido}`.toLowerCase()
    if (busqueda && !nombre.includes(busqueda.toLowerCase())) return false
    if (tabActivo === 'pendientes') return !pagosConfirmados.includes(emp.id)
    if (tabActivo === 'pagados') return pagosConfirmados.includes(emp.id)
    return true
  })

  const cantPendientes = (datos?.empleados ?? []).filter(e => !pagosConfirmados.includes(e.id)).length
  const cantPagados = pagosConfirmados.length
  const totalPendiente = (datos?.empleados ?? [])
    .filter(e => !pagosConfirmados.includes(e.id))
    .reduce((acc, e) => acc + e.totalAPagar, 0)
  const totalHoras = (datos?.empleados ?? [])
    .reduce((acc, e) => acc + e.horasNormales + e.horasFinde, 0)

  // ─── Error state ──────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-slate-600">{error}</p>
        <Button onClick={cargarDatos}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Toast de éxito */}
      {mensajeExito && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm">
          <Check className="w-4 h-4 shrink-0" />
          {mensajeExito}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pagos de Empleadas</h1>
          <p className="text-slate-500 text-sm mt-0.5">Liquidá y registrá pagos del equipo</p>
        </div>
      </div>

      {/* ── Barra de filtros (igual que Turnos) ── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Buscador */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar empleada..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Toggle Semana / Mes */}
        <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden">
          {(['semana', 'mes'] as ModoVista[]).map(m => (
            <button
              key={m}
              onClick={() => cambiarModo(m)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                modo === m ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {m === 'semana' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>

        {/* Navegación de período con flechas */}
        <div className="flex items-center gap-1 border border-slate-200 rounded-lg bg-white px-1">
          <button
            onClick={() => setRango(navegar(rango.inicio, modo, -1))}
            className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1.5 text-sm font-medium text-slate-700 min-w-[150px] text-center">
            {labelPeriodo(rango.inicio, rango.fin, modo)}
          </span>
          <button
            onClick={() => setRango(navegar(rango.inicio, modo, 1))}
            className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Día de pago alineado a la derecha */}
        {datos && !cargando && (
          <span className="text-sm text-slate-400 ml-auto">
            Día de pago: <span className="text-slate-600 font-medium">{formatFechaLarga(datos.semana.diaPago)}</span>
          </span>
        )}
      </div>

      {/* ── Tabs con total pendiente ── */}
      <div className="flex items-center border-b border-slate-200">
        {([
          { key: 'pendientes' as TabActivo, label: 'Pendientes', count: cantPendientes, icon: <Clock className="w-4 h-4" /> },
          { key: 'pagados'    as TabActivo, label: 'Pagados',    count: cantPagados,    icon: <Check className="w-4 h-4" /> },
          { key: 'todos'      as TabActivo, label: 'Todos',      count: datos?.empleados.length ?? 0, icon: null },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setTabActivo(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tabActivo === tab.key
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.icon}
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
              tabActivo === tab.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}

        {/* Total pendiente — alineado a la derecha en la misma fila de tabs */}
        {!cargando && totalPendiente > 0 && (
          <div className="ml-auto flex items-center gap-2 pb-1 pr-1">
            <span className="text-sm text-slate-400">Total pendiente:</span>
            <span className="text-lg font-bold text-amber-600">{formatPesos(totalPendiente)}</span>
          </div>
        )}
      </div>

      {/* ── Contenido ── */}
      {cargando ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          <span className="ml-3 text-slate-500 text-sm">Calculando pagos...</span>
        </div>
      ) : empleadosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400 bg-white border border-slate-200 rounded-xl">
          <Users className="w-8 h-8 mb-2" />
          <p className="text-sm">
            {tabActivo === 'pendientes' && cantPagados > 0
              ? 'Todas las empleadas están pagadas 🎉'
              : tabActivo === 'pagados'
              ? 'Todavía no hay pagos registrados en este período'
              : 'No hay turnos aprobados en este período'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {/* Encabezado de columnas */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr_auto] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <span>Empleada</span>
            <span className="text-center">Hs Normal</span>
            <span className="text-center">Hs Finde</span>
            <span className="text-right">Anticipos</span>
            <span className="text-right">Total</span>
            <span className="text-right pr-2">Acciones</span>
          </div>

          <div className="divide-y divide-slate-100">
            {empleadosFiltrados.map((emp) => {
              const pagado = pagosConfirmados.includes(emp.id)
              const isExpandido = expandido === emp.id

              return (
                <div key={emp.id}>
                  {/* ── Fila empleada ── */}
                  <div
                    className={`grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr_auto] gap-4 items-center px-6 py-4 cursor-pointer transition-colors ${
                      pagado ? 'bg-emerald-50/60' : 'hover:bg-slate-50'
                    }`}
                    onClick={() => setExpandido(isExpandido ? null : emp.id)}
                  >
                    {/* Empleada */}
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold ${
                        pagado ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {pagado
                          ? <Check className="w-4 h-4" />
                          : `${emp.nombre[0]}${emp.apellido[0]}`
                        }
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{emp.nombre} {emp.apellido}</p>
                        {emp.cvuAlias ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-400 font-mono">{emp.cvuAlias}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(emp.cvuAlias!) }}
                              className="text-slate-300 hover:text-slate-500 transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">Sin alias</span>
                        )}
                      </div>
                    </div>

                    {/* Hs Normal */}
                    <div className="text-center">
                      <span className="text-sm font-medium text-slate-700">{formatHoras(emp.horasNormales)}</span>
                    </div>

                    {/* Hs Finde */}
                    <div className="text-center">
                      {emp.horasFinde > 0
                        ? <span className="text-sm font-semibold text-amber-600">{formatHoras(emp.horasFinde)}</span>
                        : <span className="text-slate-300 text-sm">—</span>
                      }
                    </div>

                    {/* Anticipos */}
                    <div className="text-right">
                      {emp.totalAnticipos > 0
                        ? <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 text-xs">−{formatPesos(emp.totalAnticipos)}</Badge>
                        : <span className="text-slate-300 text-sm">—</span>
                      }
                    </div>

                    {/* Total */}
                    <div className="text-right">
                      <span className={`text-base font-bold ${pagado ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {formatPesos(emp.totalAPagar)}
                      </span>
                      {emp.saldoAnterior !== 0 && (
                        <p className={`text-xs mt-0.5 ${emp.saldoAnterior > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {emp.saldoAnterior > 0
                            ? `+ saldo ${formatPesos(emp.saldoAnterior)}`
                            : `crédito ${formatPesos(Math.abs(emp.saldoAnterior))}`}
                        </p>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 justify-end">
                      {pagado ? (
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                          ✓ Pagado
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          className="h-8 px-3 text-xs"
                          onClick={(e) => { e.stopPropagation(); setModalEmpleado(emp) }}
                        >
                          <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                          Pagar
                        </Button>
                      )}
                      <button className="text-slate-300 hover:text-slate-500 transition-colors p-1">
                        {isExpandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* ── Detalle expandido ── */}
                  {isExpandido && (
                    <div className="px-6 pb-5 pt-3 bg-slate-50/80 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                        Turnos del período
                      </p>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-slate-400 text-left text-xs">
                            <th className="pb-2 font-medium">Fecha</th>
                            <th className="pb-2 font-medium">Departamento</th>
                            <th className="pb-2 font-medium text-center">Horas</th>
                            <th className="pb-2 font-medium text-center">Tipo</th>
                            <th className="pb-2 font-medium text-right">Viáticos</th>
                            <th className="pb-2 font-medium text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {emp.turnos.map((turno) => (
                            <tr key={turno.id} className="text-slate-600">
                              <td className="py-2 text-sm">{formatFecha(turno.fecha)}</td>
                              <td className="py-2 text-sm">{turno.departamento}</td>
                              <td className="py-2 text-center text-sm">{formatHoras(turno.duracionHoras)}</td>
                              <td className="py-2 text-center">
                                {turno.esFeriadoFinde
                                  ? <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">Finde/Feriado</span>
                                  : <span className="text-slate-400 text-xs">Normal</span>
                                }
                              </td>
                              <td className="py-2 text-right text-sm">
                                {turno.viaticos > 0 ? formatPesos(turno.viaticos) : '—'}
                              </td>
                              <td className="py-2 text-right text-sm font-medium text-slate-800">
                                {formatPesos(turno.montoTotal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="text-sm">
                          <tr className="border-t-2 border-slate-300 font-semibold">
                            <td colSpan={5} className="pt-2 text-right text-slate-600">Subtotal turnos:</td>
                            <td className="pt-2 text-right">{formatPesos(emp.subtotalTurnos)}</td>
                          </tr>
                          {emp.totalAnticipos > 0 && (
                            <tr className="text-red-600">
                              <td colSpan={5} className="pt-1 text-right">Anticipos:</td>
                              <td className="pt-1 text-right">−{formatPesos(emp.totalAnticipos)}</td>
                            </tr>
                          )}
                          {emp.saldoAnterior !== 0 && (
                            <tr className={emp.saldoAnterior > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                              <td colSpan={5} className="pt-1 text-right">Saldo anterior:</td>
                              <td className="pt-1 text-right">
                                {emp.saldoAnterior > 0 ? '+' : ''}{formatPesos(emp.saldoAnterior)}
                              </td>
                            </tr>
                          )}
                          <tr className="font-bold text-base text-slate-900">
                            <td colSpan={5} className="pt-2 text-right">Total a pagar:</td>
                            <td className="pt-2 text-right">{formatPesos(emp.totalAPagar)}</td>
                          </tr>
                        </tfoot>
                      </table>

                      {emp.anticipos.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide pb-2">
                            Anticipos a descontar
                          </p>
                          <div className="space-y-1">
                            {emp.anticipos.map(a => (
                              <div key={a.id} className="flex justify-between text-sm bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                                <span className="text-red-700">{a.motivo || 'Sin motivo'} · {formatFecha(a.fecha)}</span>
                                <span className="font-medium text-red-700">−{formatPesos(a.monto)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Footer con resumen */}
          {datos && datos.empleados.length > 0 && (
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center gap-6 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {datos.empleados.length} empleadas
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {formatHoras(totalHoras)} totales
              </span>
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" />
                {formatPesos(datos.empleados.reduce((acc, e) => acc + e.totalAPagar, 0))} total período
              </span>
              {cantPagados > 0 && (
                <span className="flex items-center gap-1.5 text-emerald-600 ml-auto">
                  <Check className="w-4 h-4" />
                  {cantPagados} pagadas esta sesión
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modalEmpleado && datos && (
        <ModalPago
          empleado={modalEmpleado}
          semana={datos.semana}
          onConfirmar={confirmarPago}
          onCerrar={() => setModalEmpleado(null)}
          cargando={confirmando}
        />
      )}
    </div>
  )
}