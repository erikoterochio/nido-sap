'use client'

import { useState } from 'react'
import {
  Calendar,
  DollarSign,
  Users,
  CreditCard,
  Check,
  Download,
  X,
  AlertTriangle,
  Copy,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Calcular semana actual (Viernes a Jueves)
function getSemanaActual() {
  const hoy = new Date()
  const diaSemana = hoy.getDay() // 0=Dom, 1=Lun, ... 5=Vie, 6=Sab
  
  // Encontrar el viernes de esta semana
  let diasAlViernes = diaSemana >= 5 ? diaSemana - 5 : diaSemana + 2
  const viernes = new Date(hoy)
  viernes.setDate(hoy.getDate() - diasAlViernes)
  
  // Jueves es viernes + 6 días
  const jueves = new Date(viernes)
  jueves.setDate(viernes.getDate() + 6)
  
  return {
    inicio: viernes.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
    fin: jueves.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
    inicioFull: viernes,
    finFull: jueves,
  }
}

const semanaActual = {
  inicio: '17/01',
  fin: '23/01',
  diaPago: 'Jueves 23/01/2025',
}

// Datos de ejemplo - Resumen de la semana por empleado
const resumenSemanal = [
  {
    empleadoId: '1',
    nombre: 'Sandra Lastra',
    turnos: [
      { fecha: '17/01', depto: 'Defensa I', horas: 4, esFinde: true, viaticos: 2000 },
      { fecha: '18/01', depto: 'Eslovenia I', horas: 3.5, esFinde: true, viaticos: 0 },
      { fecha: '20/01', depto: 'Petit', horas: 4, esFinde: false, viaticos: 0 },
      { fecha: '21/01', depto: 'Moreno', horas: 4, esFinde: false, viaticos: 1500 },
      { fecha: '22/01', depto: 'Defensa II', horas: 3, esFinde: false, viaticos: 0 },
    ],
    horasNormales: 11,
    horasFinde: 7.5,
    precioHoraNormal: 6000,
    precioHoraFinde: 7000,
    viaticosTotal: 3500,
    cvuAlias: 'vaso.cebra.anafe.mp',
  },
  {
    empleadoId: '2',
    nombre: 'Juliana García',
    turnos: [
      { fecha: '19/01', depto: 'Azopardo', horas: 4, esFinde: true, viaticos: 2500 },
      { fecha: '21/01', depto: 'Araoz', horas: 3, esFinde: false, viaticos: 0 },
    ],
    horasNormales: 3,
    horasFinde: 4,
    precioHoraNormal: 6000,
    precioHoraFinde: 7000,
    viaticosTotal: 2500,
    cvuAlias: 'juliana.garcia.mp',
  },
  {
    empleadoId: '3',
    nombre: 'Luciana Falero',
    turnos: [
      { fecha: '20/01', depto: 'Eslovenia II', horas: 4, esFinde: false, viaticos: 0 },
      { fecha: '22/01', depto: 'Defensa I', horas: 4, esFinde: false, viaticos: 0 },
    ],
    horasNormales: 8,
    horasFinde: 0,
    precioHoraNormal: 6000,
    precioHoraFinde: 7000,
    viaticosTotal: 0,
    cvuAlias: 'Lucianafalero1988',
  },
]

// Calcular totales
function calcularTotal(emp: typeof resumenSemanal[0]) {
  const subtotalNormal = emp.horasNormales * emp.precioHoraNormal
  const subtotalFinde = emp.horasFinde * emp.precioHoraFinde
  return subtotalNormal + subtotalFinde + emp.viaticosTotal
}

export default function PagosSemanaPage() {
  const [showPagoModal, setShowPagoModal] = useState(false)
  const [selectedEmpleado, setSelectedEmpleado] = useState<typeof resumenSemanal[0] | null>(null)
  const [pagosConfirmados, setPagosConfirmados] = useState<string[]>([])
  const [expandedEmpleado, setExpandedEmpleado] = useState<string | null>(null)

  const totalSemana = resumenSemanal.reduce((acc, emp) => acc + calcularTotal(emp), 0)
  const totalHoras = resumenSemanal.reduce((acc, emp) => acc + emp.horasNormales + emp.horasFinde, 0)
  const totalTurnos = resumenSemanal.reduce((acc, emp) => acc + emp.turnos.length, 0)
  
  const pendientesPago = resumenSemanal.filter(e => !pagosConfirmados.includes(e.empleadoId))
  const totalPendiente = pendientesPago.reduce((acc, emp) => acc + calcularTotal(emp), 0)

  const confirmarPago = (empleadoId: string) => {
    setPagosConfirmados([...pagosConfirmados, empleadoId])
    setShowPagoModal(false)
  }

  const copiarAlias = (alias: string) => {
    navigator.clipboard.writeText(alias)
  }

  return (
    <div className="space-y-6">
      {/* Info de la semana */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-lg text-slate-900">
                  Semana: Viernes {semanaActual.inicio} al Jueves {semanaActual.fin}
                </p>
                <p className="text-slate-500">
                  Día de pago: {semanaActual.diaPago}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Total a pagar</p>
              <p className="text-3xl font-bold text-primary">
                ${totalSemana.toLocaleString('es-AR')}
              </p>
              <p className="text-sm text-slate-400">{totalTurnos} turnos • {totalHoras}hs</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Users className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{resumenSemanal.length}</p>
                <p className="text-sm text-slate-500">Empleados</p>
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
              <div className="p-2 bg-amber-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">
                  ${totalPendiente.toLocaleString('es-AR')}
                </p>
                <p className="text-sm text-slate-500">Pendiente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  ${resumenSemanal.reduce((acc, e) => acc + e.viaticosTotal, 0).toLocaleString('es-AR')}
                </p>
                <p className="text-sm text-slate-500">Viáticos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla por empleado */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Detalle por Empleado
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <div className="divide-y">
          {resumenSemanal.map((emp) => {
            const total = calcularTotal(emp)
            const pagado = pagosConfirmados.includes(emp.empleadoId)
            const isExpanded = expandedEmpleado === emp.empleadoId
            
            return (
              <div key={emp.empleadoId}>
                {/* Fila principal */}
                <div 
                  className={`p-4 flex items-center justify-between ${pagado ? 'bg-emerald-50' : 'hover:bg-slate-50'} cursor-pointer`}
                  onClick={() => setExpandedEmpleado(isExpanded ? null : emp.empleadoId)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      pagado ? 'bg-emerald-100' : 'bg-slate-100'
                    }`}>
                      {pagado ? (
                        <Check className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Users className="w-5 h-5 text-slate-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{emp.nombre}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-slate-500">{emp.cvuAlias}</p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            copiarAlias(emp.cvuAlias)
                          }}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-sm text-slate-500">Turnos</p>
                      <p className="font-medium">{emp.turnos.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-500">Hs Normal</p>
                      <p className="font-medium">{emp.horasNormales}hs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-500">Hs Finde</p>
                      <p className={`font-medium ${emp.horasFinde > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                        {emp.horasFinde > 0 ? `${emp.horasFinde}hs` : '-'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-500">Viáticos</p>
                      <p className={`font-medium ${emp.viaticosTotal > 0 ? '' : 'text-slate-400'}`}>
                        {emp.viaticosTotal > 0 ? `$${emp.viaticosTotal.toLocaleString('es-AR')}` : '-'}
                      </p>
                    </div>
                    <div className="text-right min-w-[120px]">
                      <p className="text-sm text-slate-500">Total</p>
                      <p className={`text-xl font-bold ${pagado ? 'text-emerald-600' : 'text-primary'}`}>
                        ${total.toLocaleString('es-AR')}
                      </p>
                    </div>
                    
                    {!pagado ? (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedEmpleado(emp)
                          setShowPagoModal(true)
                        }}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pagar
                      </Button>
                    ) : (
                      <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                        Pagado
                      </span>
                    )}
                  </div>
                </div>

                {/* Detalle expandido */}
                {isExpanded && (
                  <div className="px-4 pb-4 bg-slate-50">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-slate-500">
                          <th className="text-left py-2 font-medium">Fecha</th>
                          <th className="text-left py-2 font-medium">Departamento</th>
                          <th className="text-center py-2 font-medium">Horas</th>
                          <th className="text-center py-2 font-medium">Tipo</th>
                          <th className="text-right py-2 font-medium">Viáticos</th>
                          <th className="text-right py-2 font-medium">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emp.turnos.map((turno, idx) => {
                          const precioHora = turno.esFinde ? emp.precioHoraFinde : emp.precioHoraNormal
                          const subtotal = turno.horas * precioHora + turno.viaticos
                          return (
                            <tr key={idx} className="border-t border-slate-200">
                              <td className="py-2">{turno.fecha}</td>
                              <td className="py-2">{turno.depto}</td>
                              <td className="py-2 text-center">{turno.horas}hs</td>
                              <td className="py-2 text-center">
                                {turno.esFinde ? (
                                  <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs">Finde</span>
                                ) : (
                                  <span className="text-slate-400">Normal</span>
                                )}
                              </td>
                              <td className="py-2 text-right">
                                {turno.viaticos > 0 ? `$${turno.viaticos.toLocaleString('es-AR')}` : '-'}
                              </td>
                              <td className="py-2 text-right font-medium">
                                ${subtotal.toLocaleString('es-AR')}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-slate-300 font-semibold">
                          <td colSpan={5} className="py-2 text-right">Total:</td>
                          <td className="py-2 text-right text-primary">${total.toLocaleString('es-AR')}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Acciones */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" disabled={pagosConfirmados.length === resumenSemanal.length}>
          <CreditCard className="w-4 h-4 mr-2" />
          Marcar Todos como Pagados
        </Button>
      </div>

      {/* Modal de Pago */}
      {showPagoModal && selectedEmpleado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[450px]">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Confirmar Pago</h2>
              <button onClick={() => setShowPagoModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-slate-600">Pago a</p>
                <p className="text-xl font-semibold text-slate-900">{selectedEmpleado.nombre}</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <p className="text-sm text-slate-400">{selectedEmpleado.cvuAlias}</p>
                  <button 
                    onClick={() => copiarAlias(selectedEmpleado.cvuAlias)}
                    className="text-primary hover:text-primary/80"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="bg-primary/10 rounded-xl p-4 text-center">
                <p className="text-sm text-primary">Monto a transferir</p>
                <p className="text-3xl font-bold text-primary">
                  ${calcularTotal(selectedEmpleado).toLocaleString('es-AR')}
                </p>
              </div>
              
              <div className="space-y-2 text-sm border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Horas normales ({selectedEmpleado.horasNormales}hs × $6.000)</span>
                  <span>${(selectedEmpleado.horasNormales * 6000).toLocaleString('es-AR')}</span>
                </div>
                {selectedEmpleado.horasFinde > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Horas finde ({selectedEmpleado.horasFinde}hs × $7.000)</span>
                    <span>${(selectedEmpleado.horasFinde * 7000).toLocaleString('es-AR')}</span>
                  </div>
                )}
                {selectedEmpleado.viaticosTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Viáticos</span>
                    <span>${selectedEmpleado.viaticosTotal.toLocaleString('es-AR')}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary" />
                  <span className="text-sm text-slate-600">Requiere factura de esta persona</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t bg-slate-50 rounded-b-2xl flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowPagoModal(false)}>
                Cancelar
              </Button>
              <Button 
                className="flex-1" 
                onClick={() => confirmarPago(selectedEmpleado.empleadoId)}
              >
                <Check className="w-4 h-4 mr-1" />
                Confirmar Pago Realizado
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
