'use client'

import { useState } from 'react'
import {
  Search,
  Filter,
  AlertTriangle,
  Check,
  Edit2,
  X,
  Clock,
  Calendar,
  Download,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Datos de ejemplo - Detalle completo de turnos registrados
const turnosData = [
  { id: '1', fecha: '17/01/2025', diaSemana: 'Vie', empleado: 'Sandra Lastra', departamento: 'Defensa I', entrada: '09:00', salida: '13:00', horas: 4, esFinde: true, viaticos: 2000, precioHora: 7000, monto: 30000, estado: 'VERIFICADO', semana: 3 },
  { id: '2', fecha: '17/01/2025', diaSemana: 'Vie', empleado: 'Juliana García', departamento: 'Eslovenia I', entrada: '10:00', salida: '14:00', horas: 4, esFinde: true, viaticos: 0, precioHora: 7000, monto: 28000, estado: 'VERIFICADO', semana: 3 },
  { id: '3', fecha: '16/01/2025', diaSemana: 'Jue', empleado: 'Sandra Lastra', departamento: 'Petit', entrada: '11:00', salida: '15:00', horas: 4, esFinde: false, viaticos: 0, precioHora: 6000, monto: 24000, estado: 'VERIFICADO', semana: 2 },
  { id: '4', fecha: '16/01/2025', diaSemana: 'Jue', empleado: 'Luciana Falero', departamento: 'Araoz', entrada: '09:30', salida: '13:30', horas: 4, esFinde: false, viaticos: 0, precioHora: 6000, monto: 24000, estado: 'PENDIENTE_REVISION', alerta: 'Horario inusual', semana: 2 },
  { id: '5', fecha: '15/01/2025', diaSemana: 'Mié', empleado: 'Sandra Lastra', departamento: 'Moreno', entrada: '10:00', salida: '22:00', horas: 12, esFinde: false, viaticos: 3000, precioHora: 6000, monto: 75000, estado: 'PENDIENTE_REVISION', alerta: 'Duración excesiva (12hs)', semana: 2 },
  { id: '6', fecha: '14/01/2025', diaSemana: 'Mar', empleado: 'Juliana García', departamento: 'Azopardo', entrada: '11:00', salida: '14:00', horas: 3, esFinde: false, viaticos: 2500, precioHora: 6000, monto: 20500, estado: 'EDITADO', editadoPor: 'Juana López', editadoFecha: '15/01/2025', editadoDe: { horas: 8, monto: 50500, motivo: 'Error de tipeo en hora salida' }, semana: 2 },
  { id: '7', fecha: '13/01/2025', diaSemana: 'Lun', empleado: 'Sandra Lastra', departamento: 'Defensa II', entrada: '10:00', salida: '14:00', horas: 4, esFinde: false, viaticos: 0, precioHora: 6000, monto: 24000, estado: 'VERIFICADO', semana: 2 },
  { id: '8', fecha: '12/01/2025', diaSemana: 'Dom', empleado: 'Sandra Lastra', departamento: 'Eslovenia II', entrada: '11:00', salida: '15:00', horas: 4, esFinde: true, viaticos: 0, precioHora: 7000, monto: 28000, estado: 'VERIFICADO', semana: 2 },
  { id: '9', fecha: '11/01/2025', diaSemana: 'Sáb', empleado: 'Luciana Falero', departamento: 'Defensa I', entrada: '09:00', salida: '13:00', horas: 4, esFinde: true, viaticos: 1500, precioHora: 7000, monto: 29500, estado: 'VERIFICADO', semana: 2 },
  { id: '10', fecha: '10/01/2025', diaSemana: 'Vie', empleado: 'Juliana García', departamento: 'Petit', entrada: '10:00', salida: '14:00', horas: 4, esFinde: true, viaticos: 0, precioHora: 7000, monto: 28000, estado: 'VERIFICADO', semana: 2 },
]

const empleados = ['Sandra Lastra', 'Juliana García', 'Luciana Falero', 'Jesica Vilaseco']
const departamentos = ['Defensa I', 'Defensa II', 'Eslovenia I', 'Eslovenia II', 'Araoz', 'Petit', 'Moreno', 'Azopardo', 'Arenales', 'Paraguay', 'Humboldt', 'Fitz Roy']

const estadoBadge: Record<string, { label: string; className: string; icon?: any }> = {
  PENDIENTE_REVISION: { label: 'Revisar', className: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  VERIFICADO: { label: 'OK', className: 'bg-emerald-100 text-emerald-700', icon: Check },
  EDITADO: { label: 'Editado', className: 'bg-blue-100 text-blue-700', icon: Edit2 },
}

export default function DetalleHorasPage() {
  // Filtros
  const [filtroEmpleado, setFiltroEmpleado] = useState('')
  const [filtroDepartamento, setFiltroDepartamento] = useState('')
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string>('')
  
  // Modal
  const [showModal, setShowModal] = useState(false)
  const [selectedTurno, setSelectedTurno] = useState<typeof turnosData[0] | null>(null)
  const [showHistorial, setShowHistorial] = useState(false)
  
  // Ordenamiento
  const [sortBy, setSortBy] = useState<'fecha' | 'empleado' | 'departamento'>('fecha')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Filtrar turnos
  const turnosFiltrados = turnosData.filter(turno => {
    if (filtroEmpleado && turno.empleado !== filtroEmpleado) return false
    if (filtroDepartamento && turno.departamento !== filtroDepartamento) return false
    if (filtroEstado && turno.estado !== filtroEstado) return false
    return true
  })

  const pendientesCount = turnosData.filter(t => t.estado === 'PENDIENTE_REVISION').length
  const totalHoras = turnosFiltrados.reduce((acc, t) => acc + t.horas, 0)
  const totalMonto = turnosFiltrados.reduce((acc, t) => acc + t.monto, 0)
  const totalViaticos = turnosFiltrados.reduce((acc, t) => acc + t.viaticos, 0)

  const limpiarFiltros = () => {
    setFiltroEmpleado('')
    setFiltroDepartamento('')
    setFiltroFechaDesde('')
    setFiltroFechaHasta('')
    setFiltroEstado('')
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm text-slate-500 mb-1">Empleado</label>
              <select
                value={filtroEmpleado}
                onChange={(e) => setFiltroEmpleado(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                {empleados.map(emp => (
                  <option key={emp} value={emp}>{emp}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm text-slate-500 mb-1">Departamento</label>
              <select
                value={filtroDepartamento}
                onChange={(e) => setFiltroDepartamento(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                {departamentos.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="w-[140px]">
              <label className="block text-sm text-slate-500 mb-1">Desde</label>
              <input
                type="date"
                value={filtroFechaDesde}
                onChange={(e) => setFiltroFechaDesde(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="w-[140px]">
              <label className="block text-sm text-slate-500 mb-1">Hasta</label>
              <input
                type="date"
                value={filtroFechaHasta}
                onChange={(e) => setFiltroFechaHasta(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <Button variant="outline" size="sm" onClick={limpiarFiltros}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Limpiar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filtros rápidos por estado */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filtroEstado === '' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltroEstado('')}
        >
          Todos ({turnosData.length})
        </Button>
        <Button
          variant={filtroEstado === 'PENDIENTE_REVISION' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltroEstado('PENDIENTE_REVISION')}
          className={filtroEstado !== 'PENDIENTE_REVISION' && pendientesCount > 0 ? 'border-amber-300 bg-amber-50 text-amber-700' : ''}
        >
          <AlertTriangle className="w-4 h-4 mr-1" />
          Por revisar ({pendientesCount})
        </Button>
        <Button
          variant={filtroEstado === 'VERIFICADO' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltroEstado('VERIFICADO')}
        >
          <Check className="w-4 h-4 mr-1" />
          Verificados
        </Button>
        <Button
          variant={filtroEstado === 'EDITADO' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltroEstado('EDITADO')}
        >
          <Edit2 className="w-4 h-4 mr-1" />
          Editados
        </Button>
      </div>

      {/* Resumen filtrado */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-slate-500">Turnos</p>
            <p className="text-xl font-bold text-slate-900">{turnosFiltrados.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-slate-500">Total Horas</p>
            <p className="text-xl font-bold text-slate-900">{totalHoras}hs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-slate-500">Viáticos</p>
            <p className="text-xl font-bold text-blue-600">${totalViaticos.toLocaleString('es-AR')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-slate-500">Total</p>
            <p className="text-xl font-bold text-primary">${totalMonto.toLocaleString('es-AR')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de turnos */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b bg-slate-50">
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">
                  <button 
                    className="flex items-center gap-1 hover:text-slate-900"
                    onClick={() => {
                      if (sortBy === 'fecha') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      else { setSortBy('fecha'); setSortOrder('desc') }
                    }}
                  >
                    Fecha
                    {sortBy === 'fecha' && (sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium">Empleado</th>
                <th className="px-4 py-3 font-medium">Departamento</th>
                <th className="px-4 py-3 font-medium">Horario</th>
                <th className="px-4 py-3 font-medium text-center">Horas</th>
                <th className="px-4 py-3 font-medium text-center">Tipo</th>
                <th className="px-4 py-3 font-medium text-right">Viáticos</th>
                <th className="px-4 py-3 font-medium text-right">Monto</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {turnosFiltrados.map((turno) => {
                const badge = estadoBadge[turno.estado]
                const Icon = badge.icon
                
                return (
                  <tr
                    key={turno.id}
                    className={`border-b last:border-0 ${
                      turno.estado === 'PENDIENTE_REVISION'
                        ? 'bg-amber-50'
                        : turno.estado === 'EDITADO'
                        ? 'bg-blue-50'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${badge.className}`}>
                        {Icon && <Icon className="w-3 h-3" />}
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{turno.fecha}</p>
                      <p className="text-xs text-slate-400">{turno.diaSemana}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{turno.empleado}</td>
                    <td className="px-4 py-3 text-slate-600">{turno.departamento}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {turno.entrada} - {turno.salida}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {turno.editadoDe && (
                        <span className="block text-slate-400 line-through text-xs">
                          {turno.editadoDe.horas}hs
                        </span>
                      )}
                      <span className={turno.alerta ? 'text-amber-600 font-bold' : 'text-slate-600'}>
                        {turno.horas}hs
                      </span>
                      {turno.alerta && (
                        <span className="block text-amber-500 text-xs">{turno.alerta}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {turno.esFinde ? (
                        <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded">
                          Finde/Fer
                        </span>
                      ) : (
                        <span className="text-slate-400">Normal</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {turno.viaticos > 0 ? (
                        <span className="text-blue-600 font-medium">
                          ${turno.viaticos.toLocaleString('es-AR')}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {turno.editadoDe && (
                        <span className="block text-slate-400 line-through text-xs">
                          ${turno.editadoDe.monto.toLocaleString('es-AR')}
                        </span>
                      )}
                      <span className="font-semibold text-slate-900">
                        ${turno.monto.toLocaleString('es-AR')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTurno(turno)
                          setShowModal(true)
                        }}
                        className={
                          turno.estado === 'PENDIENTE_REVISION'
                            ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-100'
                            : 'text-slate-500 hover:text-slate-700'
                        }
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        {turno.estado === 'EDITADO' ? 'Ver' : 'Editar'}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Edición */}
      {showModal && selectedTurno && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[550px] max-h-[90vh] overflow-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">
                {selectedTurno.estado === 'EDITADO' ? 'Historial de Cambios' : 'Editar Turno'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Alerta si hay */}
              {selectedTurno.alerta && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-amber-700 font-medium mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    Motivo de revisión
                  </div>
                  <p className="text-sm text-amber-600">{selectedTurno.alerta}</p>
                </div>
              )}

              {/* Historial si fue editado */}
              {selectedTurno.estado === 'EDITADO' && selectedTurno.editadoDe && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                    <Clock className="w-4 h-4" />
                    Historial de cambios
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="text-blue-600">
                      Editado por <strong>{selectedTurno.editadoPor}</strong> el {selectedTurno.editadoFecha}
                    </p>
                    <p className="text-slate-600">Motivo: {selectedTurno.editadoDe.motivo}</p>
                    <div className="mt-2 pt-2 border-t border-blue-200 flex gap-4">
                      <div>
                        <span className="text-slate-500">Horas antes:</span>{' '}
                        <span className="line-through">{selectedTurno.editadoDe.horas}hs</span>
                        {' → '}<strong>{selectedTurno.horas}hs</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Monto antes:</span>{' '}
                        <span className="line-through">${selectedTurno.editadoDe.monto.toLocaleString('es-AR')}</span>
                        {' → '}<strong>${selectedTurno.monto.toLocaleString('es-AR')}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Datos del turno */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Empleado</label>
                  <input 
                    type="text" 
                    value={selectedTurno.empleado} 
                    disabled 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Departamento</label>
                  <input 
                    type="text" 
                    value={selectedTurno.departamento} 
                    disabled 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-slate-500 mb-1">Fecha</label>
                <input 
                  type="text" 
                  value={`${selectedTurno.fecha} (${selectedTurno.diaSemana})`}
                  disabled={selectedTurno.estado === 'EDITADO'}
                  className={`w-full border border-slate-200 rounded-xl px-4 py-2.5 ${selectedTurno.estado === 'EDITADO' ? 'bg-slate-50' : ''}`}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Hora entrada (00:00-23:59)</label>
                  <input 
                    type="time" 
                    defaultValue={selectedTurno.entrada} 
                    disabled={selectedTurno.estado === 'EDITADO'}
                    className={`w-full border border-slate-200 rounded-xl px-4 py-2.5 ${selectedTurno.estado === 'EDITADO' ? 'bg-slate-50' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Hora salida (00:00-23:59)</label>
                  <input 
                    type="time" 
                    defaultValue={selectedTurno.salida}
                    disabled={selectedTurno.estado === 'EDITADO'}
                    className={`w-full border rounded-xl px-4 py-2.5 ${
                      selectedTurno.estado === 'EDITADO' 
                        ? 'bg-slate-50 border-slate-200' 
                        : selectedTurno.alerta 
                        ? 'border-amber-300 bg-amber-50' 
                        : 'border-slate-200'
                    }`}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Viáticos</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input 
                      type="number" 
                      defaultValue={selectedTurno.viaticos}
                      disabled={selectedTurno.estado === 'EDITADO'}
                      className={`w-full border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 ${selectedTurno.estado === 'EDITADO' ? 'bg-slate-50' : ''}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Tipo de día</label>
                  <select 
                    defaultValue={selectedTurno.esFinde ? 'finde' : 'normal'}
                    disabled={selectedTurno.estado === 'EDITADO'}
                    className={`w-full border border-slate-200 rounded-xl px-4 py-2.5 ${selectedTurno.estado === 'EDITADO' ? 'bg-slate-50' : ''}`}
                  >
                    <option value="normal">Día normal ($6.000/hr)</option>
                    <option value="finde">Finde/Feriado ($7.000/hr)</option>
                  </select>
                </div>
              </div>

              {selectedTurno.estado !== 'EDITADO' && (
                <>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">Motivo del cambio *</label>
                    <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5">
                      <option value="">Seleccionar motivo...</option>
                      <option value="error_tipeo">Error de tipeo</option>
                      <option value="info_incorrecta">Información incorrecta del empleado</option>
                      <option value="turno_doble">Turno doble (separar)</option>
                      <option value="cambio_depto">Cambio de departamento</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">Comentario adicional</label>
                    <textarea 
                      placeholder="Explicación del cambio..." 
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 h-20 resize-none"
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="p-6 border-t bg-slate-50 rounded-b-2xl flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                {selectedTurno.estado === 'EDITADO' ? 'Cerrar' : 'Cancelar'}
              </Button>
              {selectedTurno.estado !== 'EDITADO' && (
                <Button className="flex-1" onClick={() => setShowModal(false)}>
                  <Check className="w-4 h-4 mr-1" />
                  Guardar Cambio
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
