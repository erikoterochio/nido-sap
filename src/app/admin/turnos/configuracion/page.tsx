'use client'

import { useState } from 'react'
import {
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Save,
  Wrench,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Feriados de Argentina precargados
const feriadosArgentina2026 = [
// 2026
  { id: '1',  fecha: '2026-01-01', nombre: 'Año Nuevo', tipo: 'inamovible' },
  { id: '2',  fecha: '2026-02-16', nombre: 'Carnaval', tipo: 'inamovible' },
  { id: '3',  fecha: '2026-02-17', nombre: 'Carnaval', tipo: 'inamovible' },
  { id: '4',  fecha: '2026-03-23', nombre: 'Día no laborable con fines turísticos', tipo: 'turístico' },
  { id: '5',  fecha: '2026-03-24', nombre: 'Día Nacional de la Memoria por la Verdad y la Justicia', tipo: 'inamovible' },
  { id: '6',  fecha: '2026-04-02', nombre: 'Día del Veterano y de los Caídos en la Guerra de Malvinas', tipo: 'inamovible' },
  { id: '7',  fecha: '2026-04-02', nombre: 'Jueves Santo', tipo: 'no_laborable' },
  { id: '8',  fecha: '2026-04-03', nombre: 'Viernes Santo', tipo: 'inamovible' },
  { id: '9',  fecha: '2026-05-01', nombre: 'Día del Trabajador', tipo: 'inamovible' },
  { id: '10', fecha: '2026-05-25', nombre: 'Día de la Revolución de Mayo', tipo: 'inamovible' },
  { id: '11', fecha: '2026-06-15', nombre: 'Paso a la Inmortalidad del Gral. Don Martín Miguel de Güemes', tipo: 'movible' },
  { id: '12', fecha: '2026-06-20', nombre: 'Paso a la Inmortalidad del Gral. Manuel Belgrano', tipo: 'inamovible' },
  { id: '13', fecha: '2026-07-09', nombre: 'Día de la Independencia', tipo: 'inamovible' },
  { id: '14', fecha: '2026-07-10', nombre: 'Día no laborable con fines turísticos', tipo: 'turístico' },
  { id: '15', fecha: '2026-08-17', nombre: 'Paso a la Inmortalidad del Gral. José de San Martín', tipo: 'movible' },
  { id: '16', fecha: '2026-10-12', nombre: 'Día del Respeto a la Diversidad Cultural', tipo: 'movible' },
  { id: '17', fecha: '2026-11-23', nombre: 'Día de la Soberanía Nacional', tipo: 'movible' },
  { id: '18', fecha: '2026-12-07', nombre: 'Día no laborable con fines turísticos', tipo: 'turístico' },
  { id: '19', fecha: '2026-12-08', nombre: 'Día de la Inmaculada Concepción de María', tipo: 'inamovible' },
  { id: '20', fecha: '2026-12-25', nombre: 'Navidad', tipo: 'inamovible' },
]


// Tipos de servicio
const tiposServicioDefault = [
  { 
    id: 'limpieza', 
    nombre: 'Limpieza', 
    icono: 'sparkles',
    color: 'emerald',
    precioHoraNormal: 6000, 
    precioHoraFinde: 7000,
    activo: true,
    ultimaActualizacion: '2025-01-15T10:30:00',  // ← AGREGAR
  },
  { 
    id: 'mantenimiento', 
    nombre: 'Mantenimiento', 
    icono: 'wrench',
    color: 'blue',
    precioHoraNormal: 7000, 
    precioHoraFinde: 8500,
    activo: true,
    ultimaActualizacion: '2025-01-15T10:30:00',  // ← AGREGAR
  },
]

export default function ConfiguracionPage() {
  const [feriados, setFeriados] = useState(feriadosArgentina2026)
  const [tiposServicio, setTiposServicio] = useState(tiposServicioDefault)
  const [showAddFeriado, setShowAddFeriado] = useState(false)
  const [showAddTipo, setShowAddTipo] = useState(false)
  const [editingTarifa, setEditingTarifa] = useState<string | null>(null)
  const [nuevoFeriado, setNuevoFeriado] = useState({ fecha: '', nombre: '', tipo: 'inamovible' })
  const [nuevoTipo, setNuevoTipo] = useState({ nombre: '', precioHoraNormal: 0, precioHoraFinde: 0 })
  const [hasChanges, setHasChanges] = useState(false)
  const [anioFiltro, setAnioFiltro] = useState('2026')

  // Filtrar feriados por año
  const feriadosFiltrados = feriados.filter(f => f.fecha.startsWith(anioFiltro))

  // Agregar feriado
  const agregarFeriado = () => {
    if (nuevoFeriado.fecha && nuevoFeriado.nombre) {
      setFeriados([...feriados, { 
        id: Date.now().toString(), 
        ...nuevoFeriado 
      }])
      setNuevoFeriado({ fecha: '', nombre: '', tipo: 'inamovible' })
      setShowAddFeriado(false)
      setHasChanges(true)
    }
  }

  // Eliminar feriado
  const eliminarFeriado = (id: string) => {
    setFeriados(feriados.filter(f => f.id !== id))
    setHasChanges(true)
  }

  // Actualizar precio
  const actualizarPrecio = (tipoId: string, campo: 'precioHoraNormal' | 'precioHoraFinde', valor: number) => {
    setTiposServicio(tiposServicio.map(t => 
      t.id === tipoId 
        ? { ...t, [campo]: valor, ultimaActualizacion: new Date().toISOString() }  // ← AGREGAR
        : t
    ))
    setHasChanges(true)
  }

  // Agregar tipo de servicio
  const agregarTipoServicio = () => {
    if (nuevoTipo.nombre && nuevoTipo.precioHoraNormal > 0) {
      setTiposServicio([...tiposServicio, {
        id: nuevoTipo.nombre.toLowerCase().replace(/\s+/g, '-'),
        nombre: nuevoTipo.nombre,
        icono: 'wrench',
        color: 'slate',
        precioHoraNormal: nuevoTipo.precioHoraNormal,
        precioHoraFinde: nuevoTipo.precioHoraFinde || nuevoTipo.precioHoraNormal,
        activo: true,
        ultimaActualizacion: new Date().toISOString(),  // ← AGREGAR ESTA LÍNEA
      }])
      setNuevoTipo({ nombre: '', precioHoraNormal: 0, precioHoraFinde: 0 })
      setShowAddTipo(false)
      setHasChanges(true)
    }
  }

  // Toggle activo tipo servicio
  const toggleTipoActivo = (tipoId: string) => {
    setTiposServicio(tiposServicio.map(t =>
      t.id === tipoId ? { ...t, activo: !t.activo } : t
    ))
    setHasChanges(true)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString('es-AR', { 
      weekday: 'short', 
      day: '2-digit', 
      month: 'short' 
    })
  }

  return (
    <div className="space-y-6">
      {/* Header con botón guardar */}
      {hasChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Tenés cambios sin guardar</span>
          </div>
          <Button onClick={() => setHasChanges(false)}>
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* TARIFAS POR TIPO DE SERVICIO */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Tarifas por Hora
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => setShowAddTipo(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Agregar Tipo
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {tiposServicio.map((tipo) => {
                const IconComponent = tipo.icono === 'sparkles' ? Sparkles : Wrench
                const colorClasses = {
                  emerald: 'bg-emerald-100 text-emerald-600',
                  blue: 'bg-blue-100 text-blue-600',
                  slate: 'bg-slate-100 text-slate-600',
                }
                
                return (
                  <div 
                    key={tipo.id} 
                    className={`p-4 ${!tipo.activo ? 'opacity-50 bg-slate-50' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${colorClasses[tipo.color as keyof typeof colorClasses] || colorClasses.slate}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{tipo.nombre}</h3>
                          <p className="text-sm text-slate-500">
                            {tipo.activo ? 'Activo' : 'Inactivo'}
                            {tipo.ultimaActualizacion && (
                              <span className="ml-2 text-slate-400">
                                • Actualizado {new Date(tipo.ultimaActualizacion).toLocaleDateString('es-AR')}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={tipo.activo}
                          onChange={() => toggleTipoActivo(tipo.id)}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-slate-500 mb-1">
                          Día hábil
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                          <input
                            type="number"
                            value={tipo.precioHoraNormal}
                            onChange={(e) => actualizarPrecio(tipo.id, 'precioHoraNormal', Number(e.target.value))}
                            className="w-full border border-slate-200 rounded-lg pl-8 pr-12 py-2 text-right font-medium"
                            disabled={!tipo.activo}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">/hr</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-500 mb-1">
                          Finde / Feriado
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                          <input
                            type="number"
                            value={tipo.precioHoraFinde}
                            onChange={(e) => actualizarPrecio(tipo.id, 'precioHoraFinde', Number(e.target.value))}
                            className="w-full border border-slate-200 rounded-lg pl-8 pr-12 py-2 text-right font-medium"
                            disabled={!tipo.activo}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">/hr</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Modal agregar tipo */}
            {showAddTipo && (
              <div className="p-4 border-t bg-slate-50">
                <h4 className="font-medium text-slate-900 mb-3">Nuevo tipo de servicio</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={nuevoTipo.nombre}
                      onChange={(e) => setNuevoTipo({ ...nuevoTipo, nombre: e.target.value })}
                      placeholder="Ej: Jardinería"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-slate-500 mb-1">Precio día hábil</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                        <input
                          type="number"
                          value={nuevoTipo.precioHoraNormal || ''}
                          onChange={(e) => setNuevoTipo({ ...nuevoTipo, precioHoraNormal: Number(e.target.value) })}
                          className="w-full border border-slate-200 rounded-lg pl-8 pr-3 py-2"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-500 mb-1">Precio finde/feriado</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                        <input
                          type="number"
                          value={nuevoTipo.precioHoraFinde || ''}
                          onChange={(e) => setNuevoTipo({ ...nuevoTipo, precioHoraFinde: Number(e.target.value) })}
                          className="w-full border border-slate-200 rounded-lg pl-8 pr-3 py-2"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setShowAddTipo(false)} className="flex-1">
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={agregarTipoServicio} className="flex-1">
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* FERIADOS */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Feriados
              </CardTitle>
              <div className="flex items-center gap-2">
                <select
                  value={anioFiltro}
                  onChange={(e) => setAnioFiltro(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm"
                >
                  <option value="2026">2026</option>
                </select>
                <Button size="sm" variant="outline" onClick={() => setShowAddFeriado(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Formulario agregar feriado */}
            {showAddFeriado && (
              <div className="p-4 border-b bg-slate-50">
                <h4 className="font-medium text-slate-900 mb-3">Agregar feriado</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-slate-500 mb-1">Fecha</label>
                      <input
                        type="date"
                        value={nuevoFeriado.fecha}
                        onChange={(e) => setNuevoFeriado({ ...nuevoFeriado, fecha: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-500 mb-1">Tipo</label>
                      <select
                        value={nuevoFeriado.tipo}
                        onChange={(e) => setNuevoFeriado({ ...nuevoFeriado, tipo: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2"
                      >
                        <option value="inamovible">Inamovible</option>
                        <option value="trasladable">Trasladable</option>
                        <option value="puente">Día puente</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={nuevoFeriado.nombre}
                      onChange={(e) => setNuevoFeriado({ ...nuevoFeriado, nombre: e.target.value })}
                      placeholder="Ej: Día de la Bandera"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setShowAddFeriado(false)} className="flex-1">
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={agregarFeriado} className="flex-1">
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de feriados */}
            <div className="max-h-[500px] overflow-y-auto divide-y">
              {feriadosFiltrados.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No hay feriados cargados para {anioFiltro}
                </div>
              ) : (
                feriadosFiltrados
                  .sort((a, b) => a.fecha.localeCompare(b.fecha))
                  .map((feriado) => (
                    <div 
                      key={feriado.id} 
                      className="p-3 flex items-center justify-between hover:bg-slate-50 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 text-center">
                          <p className="text-sm font-medium text-slate-900">
                            {formatDate(feriado.fecha)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{feriado.nombre}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            feriado.tipo === 'inamovible' 
                              ? 'bg-red-100 text-red-700' 
                              : feriado.tipo === 'trasladable'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {feriado.tipo === 'inamovible' ? 'Inamovible' : 
                             feriado.tipo === 'trasladable' ? 'Trasladable' : 'Día puente'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => eliminarFeriado(feriado.id)}
                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
              )}
            </div>

            {/* Footer con info */}
            <div className="p-3 border-t bg-slate-50 text-xs text-slate-500">
              <p>
                <strong>{feriadosFiltrados.length}</strong> feriados en {anioFiltro} • 
                Los fines de semana (Sáb y Dom) se detectan automáticamente
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
