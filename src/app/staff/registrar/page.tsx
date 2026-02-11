'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, Plus, Receipt, Clock, DollarSign, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// Datos de ejemplo
const resumenMes = {
  horas: 23.5,
  monto: 156400,
  pendiente: 45000,
}

const ultimosTurnos = [
  { depto: 'Defensa I', fecha: 'Hoy', horario: '11:00 - 15:00', horas: 4 },
  { depto: 'Eslovenia II', fecha: 'Ayer', horario: '09:00 - 12:00', horas: 3 },
  { depto: 'Araoz', fecha: '12/01', horario: '10:00 - 14:30', horas: 4.5 },
]

export default function StaffHomePage() {
  const [showTurnoForm, setShowTurnoForm] = useState(false)
  const [showGastoForm, setShowGastoForm] = useState(false)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-primary text-white px-6 py-6 rounded-b-3xl">
        <p className="text-primary-foreground/70 text-sm">Hola,</p>
        <h1 className="text-xl font-semibold">Sandra Lastra</h1>
      </div>

      <div className="px-6 -mt-4 space-y-4">
        {/* Resumen del mes */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm text-slate-500 mb-3">Este mes</h3>
            <div className="flex justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900">{resumenMes.horas}</p>
                <p className="text-sm text-slate-500">horas</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-600">
                  ${resumenMes.monto.toLocaleString('es-AR')}
                </p>
                <p className="text-sm text-slate-500">a cobrar</p>
              </div>
            </div>
            {resumenMes.pendiente > 0 && (
              <div className="mt-3 pt-3 border-t flex justify-between items-center">
                <span className="text-sm text-amber-600">Pendiente de pago anterior</span>
                <span className="font-medium text-amber-600">
                  ${resumenMes.pendiente.toLocaleString('es-AR')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acciones principales */}
        <Button
          className="w-full py-6 text-lg"
          onClick={() => setShowTurnoForm(true)}
        >
          <Plus className="w-6 h-6 mr-2" />
          Registrar Turno
        </Button>

        <Button
          variant="outline"
          className="w-full py-6 text-lg border-2"
          onClick={() => setShowGastoForm(true)}
        >
          <Receipt className="w-6 h-6 mr-2" />
          Registrar Gasto / Insumo
        </Button>

        {/* Últimos turnos */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm text-slate-500 mb-3">Últimos turnos</h3>
            <div className="space-y-3">
              {ultimosTurnos.map((turno, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-slate-900">{turno.depto}</p>
                    <p className="text-sm text-slate-500">
                      {turno.fecha}, {turno.horario}
                    </p>
                  </div>
                  <span className="text-primary font-medium">{turno.horas}hs</span>
                </div>
              ))}
            </div>
            <Link
              href="/staff/historial"
              className="flex items-center justify-center text-primary font-medium text-sm mt-4 pt-3 border-t"
            >
              Ver historial completo
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Modal: Registrar Turno */}
      {showTurnoForm && (
        <TurnoFormModal onClose={() => setShowTurnoForm(false)} />
      )}

      {/* Modal: Registrar Gasto */}
      {showGastoForm && (
        <GastoFormModal onClose={() => setShowGastoForm(false)} />
      )}
    </div>
  )
}

// Modal de Turno
function TurnoFormModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    departamento: '',
    fecha: new Date().toISOString().split('T')[0],
    horaEntrada: '',
    horaSalida: '',
    viaticos: '',
    comentarios: '',
  })

  const duracion = formData.horaEntrada && formData.horaSalida
    ? calcularDuracion(formData.horaEntrada, formData.horaSalida)
    : 0

  const montoEstimado = duracion * 6000 + (Number(formData.viaticos) || 0)

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Registrar Turno</h2>
          <button onClick={onClose} className="text-slate-400 p-2">
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-4 space-y-5">
          {/* Departamento */}
          <div>
            <label className="block text-sm text-slate-600 mb-2">
              Departamento *
            </label>
            <select
              value={formData.departamento}
              onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-3"
            >
              <option value="">Seleccionar...</option>
              <option value="defensa1">Defensa I</option>
              <option value="defensa2">Defensa II</option>
              <option value="eslovenia1">Eslovenia I (502)</option>
              <option value="eslovenia2">Eslovenia II (904)</option>
              <option value="araoz">Araoz</option>
              <option value="moreno">Moreno</option>
              <option value="petit">Petit</option>
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm text-slate-600 mb-2">
              Fecha del turno
            </label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-3"
            />
          </div>

          {/* Horarios */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-2">
                Entrada *
              </label>
              <input
                type="time"
                value={formData.horaEntrada}
                onChange={(e) => setFormData({ ...formData, horaEntrada: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-3"
                step="60"
              />
              <p className="text-xs text-slate-400 mt-1">Formato 24hs (00:00 - 23:59)</p>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-2">
                Salida *
              </label>
              <input
                type="time"
                value={formData.horaSalida}
                onChange={(e) => setFormData({ ...formData, horaSalida: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-3"
                step="60"
              />
              <p className="text-xs text-slate-400 mt-1">Formato 24hs (00:00 - 23:59)</p>
            </div>
          </div>

          {/* Duración calculada */}
          {duracion > 0 && (
            <div className="bg-primary/10 rounded-xl p-4 text-center">
              <p className="text-sm text-primary">Duración</p>
              <p className="text-3xl font-bold text-primary">
                {duracion.toFixed(1)} horas
              </p>
            </div>
          )}

          {/* Viáticos */}
          <div>
            <label className="block text-sm text-slate-600 mb-2">
              Viáticos
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                $
              </span>
              <input
                type="number"
                value={formData.viaticos}
                onChange={(e) => setFormData({ ...formData, viaticos: e.target.value })}
                placeholder="0"
                className="w-full border border-slate-200 rounded-xl pl-8 pr-4 py-3"
              />
            </div>
          </div>

          {/* Comentarios */}
          <div>
            <label className="block text-sm text-slate-600 mb-2">
              Comentarios
            </label>
            <textarea
              value={formData.comentarios}
              onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
              placeholder="Notas adicionales..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 h-20 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 safe-area-pb">
          {montoEstimado > 0 && (
            <div className="flex justify-between mb-3">
              <span className="text-slate-600">Total estimado:</span>
              <span className="text-xl font-bold text-primary">
                ${montoEstimado.toLocaleString('es-AR')}
              </span>
            </div>
          )}
          <Button className="w-full py-3" onClick={onClose}>
            Guardar Turno
          </Button>
        </div>
      </div>
    </div>
  )
}

// Modal de Gasto
function GastoFormModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    departamento: '',
    tipoGasto: '',
    monto: '',
    quienPago: '',
    comentarios: '',
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Registrar Gasto</h2>
          <button onClick={onClose} className="text-slate-400 p-2">
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-4 space-y-5">
          {/* Departamento */}
          <div>
            <label className="block text-sm text-slate-600 mb-2">
              Departamento *
            </label>
            <select
              value={formData.departamento}
              onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-3"
            >
              <option value="">Seleccionar...</option>
              <option value="defensa1">Defensa I</option>
              <option value="defensa2">Defensa II</option>
              <option value="eslovenia1">Eslovenia I (502)</option>
              <option value="eslovenia2">Eslovenia II (904)</option>
            </select>
          </div>

          {/* Tipo de gasto */}
          <div>
            <label className="block text-sm text-slate-600 mb-2">
              Tipo de gasto *
            </label>
            <select
              value={formData.tipoGasto}
              onChange={(e) => setFormData({ ...formData, tipoGasto: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-3"
            >
              <option value="">Seleccionar...</option>
              <optgroup label="Limpieza">
                <option value="lavadero">Lavadero</option>
                <option value="insumos">Insumos de limpieza</option>
              </optgroup>
              <optgroup label="Traslados">
                <option value="uber">Uber/Taxi</option>
                <option value="subte">Subte/Colectivo</option>
              </optgroup>
              <optgroup label="Otros">
                <option value="reposicion">Reposición</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="otro">Otro</option>
              </optgroup>
            </select>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm text-slate-600 mb-2">
              Monto *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                $
              </span>
              <input
                type="number"
                value={formData.monto}
                onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                placeholder="0"
                className="w-full border border-slate-200 rounded-xl pl-8 pr-4 py-3"
              />
            </div>
          </div>

          {/* Quién pagó */}
          <div>
            <label className="block text-sm text-slate-600 mb-2">
              ¿Quién pagó? *
            </label>
            <select
              value={formData.quienPago}
              onChange={(e) => setFormData({ ...formData, quienPago: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-3"
            >
              <option value="">Seleccionar...</option>
              <option value="tarjeta">Tarjeta Benveo</option>
              <option value="efectivo">Efectivo (a reembolsar)</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>

          {/* Comentarios */}
          <div>
            <label className="block text-sm text-slate-600 mb-2">
              Comentarios
            </label>
            <textarea
              value={formData.comentarios}
              onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
              placeholder="Detalles adicionales..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 h-20 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 safe-area-pb">
          <Button className="w-full py-3" onClick={onClose}>
            Guardar Gasto
          </Button>
        </div>
      </div>
    </div>
  )
}

// Función auxiliar
function calcularDuracion(entrada: string, salida: string): number {
  const [hE, mE] = entrada.split(':').map(Number)
  const [hS, mS] = salida.split(':').map(Number)
  const minutosEntrada = hE * 60 + mE
  const minutosSalida = hS * 60 + mS
  return (minutosSalida - minutosEntrada) / 60
}
