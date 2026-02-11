'use client'

import { useState } from 'react'
import {
  Users,
  DollarSign,
  Check,
  X,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Download,
  Receipt,
  FileText,
  Calendar,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Datos de ejemplo - Histórico de pagos por empleado
const historicoPagos = [
  {
    empleadoId: '1',
    nombre: 'Sandra Lastra',
    cvuAlias: 'vaso.cebra.anafe.mp',
    semanas: [
      { 
        semana: 'Sem 3 (17-23/01)', 
        fechaInicio: '17/01/2025',
        fechaFin: '23/01/2025',
        horas: 18.5, 
        horasFinde: 7.5,
        viaticos: 3500,
        monto: 121500, 
        pagado: false, 
        fechaPago: null, 
        requiereFactura: true, 
        facturaOk: false 
      },
      { 
        semana: 'Sem 2 (10-16/01)', 
        fechaInicio: '10/01/2025',
        fechaFin: '16/01/2025',
        horas: 20, 
        horasFinde: 4,
        viaticos: 2000,
        monto: 130000, 
        pagado: true, 
        fechaPago: '16/01/2025', 
        requiereFactura: true, 
        facturaOk: true 
      },
      { 
        semana: 'Sem 1 (03-09/01)', 
        fechaInicio: '03/01/2025',
        fechaFin: '09/01/2025',
        horas: 22, 
        horasFinde: 0,
        viaticos: 0,
        monto: 132000, 
        pagado: true, 
        fechaPago: '09/01/2025', 
        requiereFactura: true, 
        facturaOk: true 
      },
      { 
        semana: 'Sem 52 (27/12-02/01)', 
        fechaInicio: '27/12/2024',
        fechaFin: '02/01/2025',
        horas: 14, 
        horasFinde: 6,
        viaticos: 5000,
        monto: 131000, 
        pagado: true, 
        fechaPago: '02/01/2025', 
        requiereFactura: true, 
        facturaOk: false 
      },
      { 
        semana: 'Sem 51 (20-26/12)', 
        fechaInicio: '20/12/2024',
        fechaFin: '26/12/2024',
        horas: 20, 
        horasFinde: 8,
        viaticos: 0,
        monto: 176000, 
        pagado: true, 
        fechaPago: '26/12/2024', 
        requiereFactura: false, 
        facturaOk: false 
      },
    ],
    anticipos: [
      { fecha: '15/03/2024', monto: 50000, motivo: 'Adelanto solicitado', descontado: true },
    ],
    saldoPendiente: 121500, // Lo que falta pagar
    totalHistorico: 690500,
  },
  {
    empleadoId: '2',
    nombre: 'Juliana García',
    cvuAlias: 'juliana.garcia.mp',
    semanas: [
      { 
        semana: 'Sem 3 (17-23/01)', 
        fechaInicio: '17/01/2025',
        fechaFin: '23/01/2025',
        horas: 7, 
        horasFinde: 4,
        viaticos: 2500,
        monto: 48500, 
        pagado: false, 
        fechaPago: null, 
        requiereFactura: false, 
        facturaOk: false 
      },
      { 
        semana: 'Sem 2 (10-16/01)', 
        fechaInicio: '10/01/2025',
        fechaFin: '16/01/2025',
        horas: 12, 
        horasFinde: 0,
        viaticos: 0,
        monto: 72000, 
        pagado: true, 
        fechaPago: '16/01/2025', 
        requiereFactura: false, 
        facturaOk: false 
      },
      { 
        semana: 'Sem 1 (03-09/01)', 
        fechaInicio: '03/01/2025',
        fechaFin: '09/01/2025',
        horas: 8, 
        horasFinde: 0,
        viaticos: 1500,
        monto: 49500, 
        pagado: true, 
        fechaPago: '09/01/2025', 
        requiereFactura: false, 
        facturaOk: false 
      },
    ],
    anticipos: [],
    saldoPendiente: 48500,
    totalHistorico: 170000,
  },
  {
    empleadoId: '3',
    nombre: 'Luciana Falero',
    cvuAlias: 'Lucianafalero1988',
    semanas: [
      { 
        semana: 'Sem 3 (17-23/01)', 
        fechaInicio: '17/01/2025',
        fechaFin: '23/01/2025',
        horas: 8, 
        horasFinde: 0,
        viaticos: 0,
        monto: 48000, 
        pagado: false, 
        fechaPago: null, 
        requiereFactura: false, 
        facturaOk: false 
      },
      { 
        semana: 'Sem 2 (10-16/01)', 
        fechaInicio: '10/01/2025',
        fechaFin: '16/01/2025',
        horas: 16, 
        horasFinde: 0,
        viaticos: 0,
        monto: 96000, 
        pagado: false, 
        fechaPago: null, 
        requiereFactura: false, 
        facturaOk: false 
      },
      { 
        semana: 'Sem 1 (03-09/01)', 
        fechaInicio: '03/01/2025',
        fechaFin: '09/01/2025',
        horas: 10, 
        horasFinde: 0,
        viaticos: 0,
        monto: 60000, 
        pagado: true, 
        fechaPago: '09/01/2025', 
        requiereFactura: false, 
        facturaOk: false 
      },
    ],
    anticipos: [],
    saldoPendiente: 144000, // 2 semanas sin pagar
    totalHistorico: 204000,
  },
  {
    empleadoId: '4',
    nombre: 'Jesica Vilaseco',
    cvuAlias: 'jesicavilaseco',
    semanas: [
      { 
        semana: 'Sem 2 (10-16/01)', 
        fechaInicio: '10/01/2025',
        fechaFin: '16/01/2025',
        horas: 6, 
        horasFinde: 0,
        viaticos: 0,
        monto: 36000, 
        pagado: true, 
        fechaPago: '16/01/2025', 
        requiereFactura: false, 
        facturaOk: false 
      },
    ],
    anticipos: [],
    saldoPendiente: 0,
    totalHistorico: 36000,
  },
]

export default function HistorialPagosPage() {
  const [expandedEmpleado, setExpandedEmpleado] = useState<string | null>(historicoPagos[0].empleadoId)
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'pendientes' | 'pagados'>('todos')

  const totalPendienteGlobal = historicoPagos.reduce((acc, emp) => acc + emp.saldoPendiente, 0)
  const empleadosConPendiente = historicoPagos.filter(e => e.saldoPendiente > 0).length

  return (
    <div className="space-y-6">
      {/* Resumen general */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Users className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{historicoPagos.length}</p>
                <p className="text-sm text-slate-500">Empleados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={totalPendienteGlobal > 0 ? 'border-amber-200 bg-amber-50' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${totalPendienteGlobal > 0 ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                <DollarSign className={`w-5 h-5 ${totalPendienteGlobal > 0 ? 'text-amber-600' : 'text-emerald-600'}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${totalPendienteGlobal > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  ${totalPendienteGlobal.toLocaleString('es-AR')}
                </p>
                <p className="text-sm text-slate-500">Total pendiente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{empleadosConPendiente}</p>
                <p className="text-sm text-slate-500">Con pagos pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Receipt className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {historicoPagos.reduce((acc, emp) => 
                    acc + emp.semanas.filter(s => s.requiereFactura && !s.facturaOk).length, 0
                  )}
                </p>
                <p className="text-sm text-slate-500">Facturas pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <Button
          variant={filtroEstado === 'todos' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltroEstado('todos')}
        >
          Todos
        </Button>
        <Button
          variant={filtroEstado === 'pendientes' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltroEstado('pendientes')}
          className={filtroEstado !== 'pendientes' ? 'border-amber-300 bg-amber-50 text-amber-700' : ''}
        >
          <AlertCircle className="w-4 h-4 mr-1" />
          Con pendientes ({empleadosConPendiente})
        </Button>
        <Button
          variant={filtroEstado === 'pagados' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltroEstado('pagados')}
        >
          <Check className="w-4 h-4 mr-1" />
          Al día
        </Button>
      </div>

      {/* Lista de empleados con su historial */}
      <div className="space-y-4">
        {historicoPagos
          .filter(emp => {
            if (filtroEstado === 'pendientes') return emp.saldoPendiente > 0
            if (filtroEstado === 'pagados') return emp.saldoPendiente === 0
            return true
          })
          .map((empleado) => {
            const isExpanded = expandedEmpleado === empleado.empleadoId
            const tienePendiente = empleado.saldoPendiente > 0
            const tieneFacturasPendientes = empleado.semanas.some(s => s.requiereFactura && !s.facturaOk)

            return (
              <Card 
                key={empleado.empleadoId}
                className={tienePendiente ? 'border-amber-200' : ''}
              >
                {/* Header del empleado */}
                <div
                  className={`p-4 flex items-center justify-between cursor-pointer ${
                    tienePendiente ? 'bg-amber-50' : 'hover:bg-slate-50'
                  }`}
                  onClick={() => setExpandedEmpleado(isExpanded ? null : empleado.empleadoId)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      tienePendiente ? 'bg-amber-100' : 'bg-slate-100'
                    }`}>
                      <Users className={`w-6 h-6 ${tienePendiente ? 'text-amber-600' : 'text-slate-600'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">{empleado.nombre}</p>
                        {tienePendiente && (
                          <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
                            Pendiente
                          </span>
                        )}
                        {tieneFacturasPendientes && (
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Receipt className="w-3 h-3" />
                            Factura
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{empleado.cvuAlias}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-sm text-slate-500">Semanas</p>
                      <p className="font-medium">{empleado.semanas.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-500">Total histórico</p>
                      <p className="font-medium">${empleado.totalHistorico.toLocaleString('es-AR')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-500">Saldo pendiente</p>
                      <p className={`font-bold text-lg ${
                        empleado.saldoPendiente > 0 ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {empleado.saldoPendiente > 0 
                          ? `$${empleado.saldoPendiente.toLocaleString('es-AR')}`
                          : 'Al día'
                        }
                      </p>
                    </div>
                    <div className="w-8">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Detalle expandido */}
                {isExpanded && (
                  <div className="border-t">
                    {/* Anticipos si hay */}
                    {empleado.anticipos.length > 0 && (
                      <div className="p-4 bg-blue-50 border-b">
                        <p className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Anticipos
                        </p>
                        {empleado.anticipos.map((ant, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-blue-700">{ant.fecha} - {ant.motivo}</span>
                            <span className={`font-medium ${ant.descontado ? 'text-slate-500 line-through' : 'text-blue-700'}`}>
                              -${ant.monto.toLocaleString('es-AR')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tabla de semanas */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500">
                            <th className="text-left px-4 py-3 font-medium">Semana</th>
                            <th className="text-center px-4 py-3 font-medium">Horas</th>
                            <th className="text-center px-4 py-3 font-medium">Hs Finde</th>
                            <th className="text-right px-4 py-3 font-medium">Viáticos</th>
                            <th className="text-right px-4 py-3 font-medium">Monto</th>
                            <th className="text-center px-4 py-3 font-medium">Estado Pago</th>
                            <th className="text-center px-4 py-3 font-medium">Factura</th>
                          </tr>
                        </thead>
                        <tbody>
                          {empleado.semanas.map((sem, idx) => (
                            <tr 
                              key={idx} 
                              className={`border-t ${!sem.pagado ? 'bg-amber-50' : 'hover:bg-slate-50'}`}
                            >
                              <td className="px-4 py-3">
                                <p className="font-medium text-slate-900">{sem.semana}</p>
                                <p className="text-xs text-slate-400">{sem.fechaInicio} - {sem.fechaFin}</p>
                              </td>
                              <td className="px-4 py-3 text-center">{sem.horas - sem.horasFinde}hs</td>
                              <td className="px-4 py-3 text-center">
                                {sem.horasFinde > 0 ? (
                                  <span className="text-amber-600">{sem.horasFinde}hs</span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {sem.viaticos > 0 
                                  ? `$${sem.viaticos.toLocaleString('es-AR')}` 
                                  : <span className="text-slate-400">-</span>
                                }
                              </td>
                              <td className="px-4 py-3 text-right font-semibold">
                                ${sem.monto.toLocaleString('es-AR')}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {sem.pagado ? (
                                  <div className="flex flex-col items-center">
                                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                      <Check className="w-3 h-3" />
                                      Pagado
                                    </span>
                                    <span className="text-xs text-slate-400 mt-0.5">{sem.fechaPago}</span>
                                  </div>
                                ) : (
                                  <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">
                                    Pendiente
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {sem.requiereFactura ? (
                                  sem.facturaOk ? (
                                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full flex items-center justify-center gap-1">
                                      <Check className="w-3 h-3" />
                                      OK
                                    </span>
                                  ) : (
                                    <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                                      Pendiente
                                    </span>
                                  )
                                ) : (
                                  <span className="text-slate-400 text-xs">No aplica</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Footer con acciones */}
                    <div className="p-4 bg-slate-50 flex justify-between items-center">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar historial
                      </Button>
                      {empleado.saldoPendiente > 0 && (
                        <Button size="sm">
                          Pagar pendiente (${empleado.saldoPendiente.toLocaleString('es-AR')})
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
      </div>
    </div>
  )
}
