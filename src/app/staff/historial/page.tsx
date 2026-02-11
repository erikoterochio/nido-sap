'use client'

import { useState } from 'react'
import { Clock, DollarSign, Check, AlertCircle, ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Datos de ejemplo
const resumenGeneral = {
  totalGanado: 856400,
  totalPagado: 750000,
  pendiente: 106400,
  anticipos: 50000,
  saldoFinal: 56400,
}

const pagos = [
  {
    id: '1',
    fecha: '05/01/2025',
    concepto: 'Pago Diciembre 2024',
    monto: 320000,
    estado: 'PAGADO',
  },
  {
    id: '2',
    fecha: '20/12/2024',
    concepto: 'Anticipo',
    monto: -50000,
    estado: 'DESCONTADO',
  },
  {
    id: '3',
    fecha: '05/12/2024',
    concepto: 'Pago Noviembre 2024',
    monto: 280000,
    estado: 'PAGADO',
  },
]

const turnosPorMes = [
  {
    mes: 'Enero 2025',
    turnos: [
      { depto: 'Defensa I', fecha: '14/01', horario: '11:00 - 15:00', horas: 4, monto: 24000, estado: 'PENDIENTE' },
      { depto: 'Eslovenia II', fecha: '13/01', horario: '09:00 - 12:00', horas: 3, monto: 18000, estado: 'PENDIENTE' },
      { depto: 'Araoz', fecha: '12/01', horario: '10:00 - 14:30', horas: 4.5, monto: 27000, estado: 'PENDIENTE' },
      { depto: 'Petit', fecha: '10/01', horario: '11:00 - 16:00', horas: 5, monto: 37900, estado: 'PENDIENTE' },
    ],
    totalHoras: 23.5,
    totalMonto: 156400,
  },
  {
    mes: 'Diciembre 2024',
    turnos: [
      { depto: 'Defensa I', fecha: '28/12', horario: '11:00 - 15:00', horas: 4, monto: 28000, estado: 'PAGADO' },
      { depto: 'Moreno', fecha: '26/12', horario: '10:00 - 13:00', horas: 3, monto: 21000, estado: 'PAGADO' },
    ],
    totalHoras: 45,
    totalMonto: 320000,
  },
]

export default function HistorialPage() {
  const [activeTab, setActiveTab] = useState<'turnos' | 'pagos'>('turnos')
  const [expandedMonth, setExpandedMonth] = useState<string>('Enero 2025')

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b sticky top-0 z-10">
        <h1 className="text-xl font-semibold text-slate-900">Historial</h1>
      </div>

      {/* Resumen de saldo */}
      <div className="px-6 py-4">
        <Card className={resumenGeneral.saldoFinal >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-600">Tu saldo actual</p>
                <p className={`text-2xl font-bold ${resumenGeneral.saldoFinal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {resumenGeneral.saldoFinal >= 0 ? '' : '-'}$
                  {Math.abs(resumenGeneral.saldoFinal).toLocaleString('es-AR')}
                </p>
              </div>
              <div className={`p-3 rounded-full ${resumenGeneral.saldoFinal >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                {resumenGeneral.saldoFinal >= 0 ? (
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <p className="text-slate-500">Ganado</p>
                <p className="font-medium">${resumenGeneral.totalGanado.toLocaleString('es-AR')}</p>
              </div>
              <div>
                <p className="text-slate-500">Pagado</p>
                <p className="font-medium">${resumenGeneral.totalPagado.toLocaleString('es-AR')}</p>
              </div>
              <div>
                <p className="text-slate-500">Anticipos</p>
                <p className="font-medium text-amber-600">-${resumenGeneral.anticipos.toLocaleString('es-AR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-4">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('turnos')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'turnos'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Turnos
          </button>
          <button
            onClick={() => setActiveTab('pagos')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'pagos'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600'
            }`}
          >
            <DollarSign className="w-4 h-4 inline mr-2" />
            Pagos
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-24">
        {activeTab === 'turnos' && (
          <div className="space-y-4">
            {turnosPorMes.map((mesData) => (
              <Card key={mesData.mes}>
                {/* Header del mes */}
                <button
                  onClick={() => setExpandedMonth(expandedMonth === mesData.mes ? '' : mesData.mes)}
                  className="w-full px-4 py-3 flex items-center justify-between border-b"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{mesData.mes}</p>
                    <p className="text-sm text-slate-500">
                      {mesData.turnos.length} turnos • {mesData.totalHoras} horas
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-primary">
                      ${mesData.totalMonto.toLocaleString('es-AR')}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        expandedMonth === mesData.mes ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Lista de turnos */}
                {expandedMonth === mesData.mes && (
                  <CardContent className="p-0 divide-y">
                    {mesData.turnos.map((turno, i) => (
                      <div key={i} className="px-4 py-3 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900">{turno.depto}</p>
                            {turno.estado === 'PAGADO' && (
                              <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">
                                Pagado
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500">
                            {turno.fecha} • {turno.horario}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-slate-900">
                            ${turno.monto.toLocaleString('es-AR')}
                          </p>
                          <p className="text-sm text-slate-500">{turno.horas}hs</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'pagos' && (
          <div className="space-y-3">
            {pagos.map((pago) => (
              <Card key={pago.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        pago.monto > 0 ? 'bg-emerald-100' : 'bg-amber-100'
                      }`}
                    >
                      {pago.monto > 0 ? (
                        <Check className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{pago.concepto}</p>
                      <p className="text-sm text-slate-500">{pago.fecha}</p>
                    </div>
                  </div>
                  <p
                    className={`font-semibold ${
                      pago.monto > 0 ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {pago.monto > 0 ? '+' : ''}${Math.abs(pago.monto).toLocaleString('es-AR')}
                  </p>
                </CardContent>
              </Card>
            ))}

            {pagos.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No hay pagos registrados
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
