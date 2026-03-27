'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Calendar, DollarSign, Users, Check, X, Copy,
  CreditCard, ChevronDown, ChevronUp, AlertCircle,
  ArrowRight, Clock, Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFecha(fechaISO: string) {
  return new Date(fechaISO + 'T12:00:00').toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
  })
}

function formatFechaLarga(fechaISO: string) {
  return new Date(fechaISO + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function formatPesos(monto: number) {
  return `$${monto.toLocaleString('es-AR')}`
}

// ─── Componente Modal Pago ────────────────────────────────────────────────────

interface ModalPagoProps {
  empleado: EmpleadoPago
  semana: { inicio: string; fin: string }
  onConfirmar: (empleadoId: string, montoPagado: number) => Promise<void>
  onCerrar: () => void
  cargando: boolean
}

function ModalPago({ empleado, semana, onConfirmar, onCerrar, cargando }: ModalPagoProps) {
  const [montoPagado, setMontoPagado] = useState(
    Math.round(empleado.totalAPagar / 100) * 100 // redondear a centena por defecto
  )
  const diferencia = empleado.totalAPagar - montoPagado

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-[480px] shadow-xl">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Confirmar Pago</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {empleado.nombre} {empleado.apellido}
            </p>
          </div>
          <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* CVU/Alias */}
          {empleado.cvuAlias && (
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-4 py-3">
              <span className="text-sm text-slate-500">Alias:</span>
              <span className="font-mono text-sm font-medium text-slate-800">
                {empleado.cvuAlias}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(empleado.cvuAlias!)}
                className="ml-auto text-slate-400 hover:text-primary transition-colors"
                title="Copiar alias"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Desglose */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal turnos ({empleado.horasNormales + empleado.horasFinde}hs)</span>
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

          {/* Monto a pagar (editable para redondeo) */}
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

          {/* Aviso de diferencia */}
          {diferencia !== 0 && (
            <div className={`flex items-start gap-2 text-sm rounded-lg p-3 ${
              diferencia > 0
                ? 'bg-amber-50 text-amber-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}>
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                {diferencia > 0
                  ? `Estás pagando ${formatPesos(diferencia)} menos de lo calculado. Quedará como saldo a favor del empleado para la próxima semana.`
                  : `Estás pagando ${formatPesos(Math.abs(diferencia))} más de lo calculado. Quedará como crédito a tu favor para descontar la próxima semana.`
                }
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-slate-50 rounded-b-2xl flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCerrar} disabled={cargando}>
            Cancelar
          </Button>
          <Button
            className="flex-1"
            onClick={() => onConfirmar(empleado.id, montoPagado)}
            disabled={cargando || montoPagado <= 0}
          >
            {cargando ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
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

  // Semana seleccionada (por defecto: actual)
  const [semanaInicio, setSemanaInicio] = useState('')
  const [semanaFin, setSemanaFin] = useState('')

  const cargarDatos = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (semanaInicio) params.set('inicio', semanaInicio)
      if (semanaFin) params.set('fin', semanaFin)

      const res = await fetch(`/api/pagos/semana?${params.toString()}`)
      if (!res.ok) throw new Error('Error al cargar datos')
      const json: DatosSemana = await res.json()
      setDatos(json)
    } catch (e) {
      setError('No se pudieron cargar los datos. Intentá de nuevo.')
    } finally {
      setCargando(false)
    }
  }, [semanaInicio, semanaFin])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

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

      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setMensajeExito(null), 5000)

      // Recargar para reflejar nuevos saldos
      await cargarDatos()
    } catch (e: any) {
      alert(e.message || 'Error al confirmar el pago')
    } finally {
      setConfirmando(false)
    }
  }

  // ─── Render estados ────────────────────────────────────────────────────────

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-slate-500">Calculando pagos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-slate-600">{error}</p>
        <Button onClick={cargarDatos}>Reintentar</Button>
      </div>
    )
  }

  if (!datos) return null

  // KPIs globales
  const empleadosPendientes = datos.empleados.filter(e => !pagosConfirmados.includes(e.id))
  const totalPendiente = empleadosPendientes.reduce((acc, e) => acc + e.totalAPagar, 0)
  const totalSemana = datos.empleados.reduce((acc, e) => acc + e.totalAPagar, 0)
  const totalHoras = datos.empleados.reduce((acc, e) => acc + e.horasNormales + e.horasFinde, 0)

  return (
    <div className="space-y-6">
      {/* Mensaje de éxito flotante */}
      {mensajeExito && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <Check className="w-4 h-4" />
          {mensajeExito}
        </div>
      )}

      {/* Header con info de la semana */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-lg text-slate-900">
                  Semana: {formatFecha(datos.semana.inicio)} al {formatFecha(datos.semana.fin)}
                </p>
                <p className="text-slate-500 text-sm">
                  Día de pago: {formatFechaLarga(datos.semana.diaPago)}
                </p>
              </div>
            </div>

            {/* Selector de semana */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={semanaInicio}
                onChange={e => setSemanaInicio(e.target.value)}
                className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 text-slate-700"
                title="Inicio de semana"
              />
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={semanaFin}
                onChange={e => setSemanaFin(e.target.value)}
                className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 text-slate-700"
                title="Fin de semana"
              />
            </div>

            <div className="text-right">
              <p className="text-sm text-slate-500">Total pendiente</p>
              <p className="text-3xl font-bold text-primary">{formatPesos(totalPendiente)}</p>
              <p className="text-sm text-slate-400">
                {totalHoras}hs · {datos.empleados.length} empleadas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Users className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{datos.empleados.length}</p>
                <p className="text-sm text-slate-500">Empleadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Check className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">{pagosConfirmados.length}</p>
                <p className="text-sm text-slate-500">Pagos hechos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalHoras}hs</p>
                <p className="text-sm text-slate-500">Horas totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{formatPesos(totalPendiente)}</p>
                <p className="text-sm text-slate-500">Pendiente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de empleadas */}
      {datos.empleados.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-slate-500">
            No hay turnos aprobados en esta semana.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Detalle por Empleada
            </CardTitle>
          </CardHeader>
          <div className="divide-y">
            {datos.empleados.map((emp) => {
              const pagado = pagosConfirmados.includes(emp.id)
              const isExpandido = expandido === emp.id

              return (
                <div key={emp.id}>
                  {/* Fila principal */}
                  <div
                    className={`p-4 flex items-center gap-4 cursor-pointer transition-colors ${
                      pagado ? 'bg-emerald-50' : 'hover:bg-slate-50'
                    }`}
                    onClick={() => setExpandido(isExpandido ? null : emp.id)}
                  >
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      pagado ? 'bg-emerald-100' : 'bg-slate-100'
                    }`}>
                      {pagado
                        ? <Check className="w-5 h-5 text-emerald-600" />
                        : <span className="text-slate-600 font-semibold text-sm">
                            {emp.nombre[0]}{emp.apellido[0]}
                          </span>
                      }
                    </div>

                    {/* Nombre y alias */}
                    <div className="min-w-[180px]">
                      <p className="font-medium text-slate-900">{emp.nombre} {emp.apellido}</p>
                      {emp.cvuAlias && (
                        <div className="flex items-center gap-1">
                          <p className="text-xs text-slate-400 font-mono">{emp.cvuAlias}</p>
                          <button
                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(emp.cvuAlias!) }}
                            className="text-slate-300 hover:text-slate-500"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 flex-1 flex-wrap">
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Hs Normal</p>
                        <p className="font-medium text-sm">{emp.horasNormales}hs</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Hs Finde</p>
                        <p className={`font-medium text-sm ${emp.horasFinde > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                          {emp.horasFinde > 0 ? `${emp.horasFinde}hs` : '—'}
                        </p>
                      </div>
                      {emp.totalAnticipos > 0 && (
                        <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                          Anticipo: −{formatPesos(emp.totalAnticipos)}
                        </Badge>
                      )}
                      {emp.saldoAnterior !== 0 && (
                        <Badge variant="outline" className={
                          emp.saldoAnterior > 0
                            ? 'text-amber-600 border-amber-200 bg-amber-50'
                            : 'text-emerald-600 border-emerald-200 bg-emerald-50'
                        }>
                          Saldo anterior: {emp.saldoAnterior > 0 ? '+' : ''}{formatPesos(emp.saldoAnterior)}
                        </Badge>
                      )}
                    </div>

                    {/* Total y acción */}
                    <div className="flex items-center gap-4 ml-auto">
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Total a pagar</p>
                        <p className={`text-xl font-bold ${pagado ? 'text-emerald-600' : 'text-primary'}`}>
                          {formatPesos(emp.totalAPagar)}
                        </p>
                      </div>

                      {!pagado ? (
                        <Button
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setModalEmpleado(emp) }}
                        >
                          <CreditCard className="w-4 h-4 mr-1.5" />
                          Pagar
                        </Button>
                      ) : (
                        <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium whitespace-nowrap">
                          ✓ Pagado
                        </span>
                      )}

                      <div className="text-slate-400">
                        {isExpandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Detalle expandido: turnos */}
                  {isExpandido && (
                    <div className="px-6 pb-4 bg-slate-50 border-t">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide pt-3 pb-2">
                        Turnos del período
                      </p>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-slate-500 text-left">
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
                            <tr key={turno.id}>
                              <td className="py-2">{formatFecha(turno.fecha.toString())}</td>
                              <td className="py-2">{turno.departamento}</td>
                              <td className="py-2 text-center">{turno.duracionHoras}hs</td>
                              <td className="py-2 text-center">
                                {turno.esFeriadoFinde
                                  ? <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs">Finde/Feriado</span>
                                  : <span className="text-slate-400 text-xs">Normal</span>
                                }
                              </td>
                              <td className="py-2 text-right">
                                {turno.viaticos > 0 ? formatPesos(turno.viaticos) : '—'}
                              </td>
                              <td className="py-2 text-right font-medium">
                                {formatPesos(turno.montoTotal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
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
                          <tr className="text-primary font-bold text-base">
                            <td colSpan={5} className="pt-2 text-right">Total a pagar:</td>
                            <td className="pt-2 text-right">{formatPesos(emp.totalAPagar)}</td>
                          </tr>
                        </tfoot>
                      </table>

                      {/* Anticipos detalle */}
                      {emp.anticipos.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide pb-2">
                            Anticipos a descontar
                          </p>
                          <div className="space-y-1">
                            {emp.anticipos.map(a => (
                              <div key={a.id} className="flex justify-between text-sm bg-red-50 px-3 py-2 rounded-lg">
                                <span className="text-red-700">{a.motivo || 'Sin motivo'} · {formatFecha(a.fecha.toString())}</span>
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
        </Card>
      )}

      {/* Modal de confirmación */}
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