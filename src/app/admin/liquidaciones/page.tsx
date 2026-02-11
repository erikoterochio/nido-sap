'use client'

import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Building,
  Download,
  Send,
  Check,
  ChevronRight,
  Calendar,
  DollarSign,
  BarChart3,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

// Datos de ejemplo para el gráfico
const evolucionData = [
  { mes: 'Ago', ingresos: 2100, gastos: 850, saldo: 1250 },
  { mes: 'Sep', ingresos: 2400, gastos: 920, saldo: 1480 },
  { mes: 'Oct', ingresos: 2200, gastos: 780, saldo: 1420 },
  { mes: 'Nov', ingresos: 2800, gastos: 1100, saldo: 1700 },
  { mes: 'Dic', ingresos: 3100, gastos: 950, saldo: 2150 },
  { mes: 'Ene', ingresos: 3245, gastos: 890, saldo: 2355 },
]

const departamentos = [
  { nombre: 'Defensa I', saldo: 287, estado: 'APROBADO' },
  { nombre: 'Defensa II', saldo: 156, estado: 'BORRADOR' },
  { nombre: 'Eslovenia I', saldo: 198, estado: 'LISTO_PARA_REVISAR' },
  { nombre: 'Eslovenia II', saldo: 245, estado: 'APROBADO' },
  { nombre: 'Araoz', saldo: 178, estado: 'ENVIADO' },
  { nombre: 'Moreno', saldo: 134, estado: 'BORRADOR' },
]

const estadoConfig: Record<string, { label: string; className: string }> = {
  BORRADOR: { label: 'Borrador', className: 'bg-slate-100 text-slate-600' },
  LISTO_PARA_REVISAR: { label: 'Por revisar', className: 'bg-amber-100 text-amber-700' },
  APROBADO: { label: 'Aprobado', className: 'bg-emerald-100 text-emerald-700' },
  ENVIADO: { label: 'Enviado', className: 'bg-blue-100 text-blue-700' },
  PAGADO: { label: 'Pagado', className: 'bg-purple-100 text-purple-700' },
}

export default function LiquidacionesPage() {
  const [selectedMonth, setSelectedMonth] = useState('Enero 2025')
  const [activeTab, setActiveTab] = useState<'resumen' | 'detalle'>('resumen')
  const [selectedDepto, setSelectedDepto] = useState<string | null>(null)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">P&L / Liquidaciones</h1>
          <p className="text-slate-500">Gestión de rentabilidad por departamento</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2 bg-white text-sm"
          >
            <option>Enero 2025</option>
            <option>Diciembre 2024</option>
            <option>Noviembre 2024</option>
          </select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Todo
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('resumen')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'resumen'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Resumen
        </button>
        <button
          onClick={() => setActiveTab('detalle')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'detalle'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4 inline mr-2" />
          Detalle por Depto
        </button>
      </div>

      {activeTab === 'resumen' && (
        <>
          {/* KPIs Row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-sm text-slate-500">Ingresos Totales</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">USD 3,245</p>
                <p className="text-sm text-emerald-600 mt-1">+12% vs mes anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="text-sm text-slate-500">Gastos Totales</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">USD 890</p>
                <p className="text-sm text-slate-500 mt-1">$1,023,500 ARS</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm text-slate-500">Saldo Neto</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600">USD 2,355</p>
                <p className="text-sm text-slate-500 mt-1">Margen: 72.5%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm text-slate-500">Liquidaciones</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">4/6</p>
                <p className="text-sm text-amber-600 mt-1">2 pendientes</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de evolución */}
          <Card className="mb-6">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Evolución P&L (Últimos 6 meses)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={evolucionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="mes" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="gastos" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Lista de departamentos */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Estado por Departamento
              </CardTitle>
            </CardHeader>
            <div className="divide-y">
              {departamentos.map((depto) => (
                <div
                  key={depto.nombre}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                  onClick={() => {
                    setSelectedDepto(depto.nombre)
                    setActiveTab('detalle')
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                      <Building className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{depto.nombre}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          estadoConfig[depto.estado].className
                        }`}
                      >
                        {estadoConfig[depto.estado].label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Saldo</p>
                      <p className="font-semibold text-emerald-600">USD {depto.saldo}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {activeTab === 'detalle' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Columna principal - P&L */}
          <div className="col-span-2 space-y-4">
            {/* Selector de departamento */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <select
                      value={selectedDepto || 'Defensa I'}
                      onChange={(e) => setSelectedDepto(e.target.value)}
                      className="text-lg font-semibold border-0 bg-transparent focus:outline-none cursor-pointer"
                    >
                      {departamentos.map((d) => (
                        <option key={d.nombre}>{d.nombre}</option>
                      ))}
                    </select>
                    <span className={`text-xs px-2 py-1 rounded-full ${estadoConfig['APROBADO'].className}`}>
                      Aprobado
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">Dirección: Defensa 1035</p>
                </div>
              </CardContent>
            </Card>

            {/* Ingresos */}
            <Card>
              <CardHeader className="bg-emerald-50 border-b border-emerald-100 py-3 px-4">
                <CardTitle className="text-emerald-800 flex items-center gap-2 text-base">
                  <TrendingUp className="w-4 h-4" />
                  INGRESOS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Ingreso Bruto (Airbnb)</span>
                  <span className="font-medium">USD 512.00</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>(-) Comisión Administración (20%)</span>
                  <span>- USD 102.40</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-semibold">
                  <span>Ingreso Neto</span>
                  <span className="text-emerald-600">USD 409.60</span>
                </div>
              </CardContent>
            </Card>

            {/* Gastos */}
            <Card>
              <CardHeader className="bg-red-50 border-b border-red-100 py-3 px-4">
                <CardTitle className="text-red-800 flex items-center gap-2 text-base">
                  <TrendingDown className="w-4 h-4" />
                  GASTOS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {/* Servicios */}
                <div className="mb-4">
                  <p className="text-sm text-slate-500 mb-2">Servicios</p>
                  <div className="space-y-2 text-sm pl-4 border-l-2 border-slate-200">
                    <div className="flex justify-between">
                      <span className="text-slate-600">ABL</span>
                      <span>$15,200</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Edesur</span>
                      <span>$23,450</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Metrogas</span>
                      <span>$8,900</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Expensas</span>
                      <span>$45,000</span>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 font-medium">
                    <span>Subtotal Servicios</span>
                    <span>$92,550</span>
                  </div>
                </div>

                {/* Limpieza */}
                <div className="mb-4">
                  <p className="text-sm text-slate-500 mb-2">Limpieza</p>
                  <div className="space-y-2 text-sm pl-4 border-l-2 border-slate-200">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Turnos (26.5 hs)</span>
                      <span>$156,400</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Insumos</span>
                      <span>$12,300</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Lavadero</span>
                      <span>$34,000</span>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 font-medium">
                    <span>Subtotal Limpieza</span>
                    <span>$202,700</span>
                  </div>
                </div>

                {/* Otros */}
                <div className="mb-4">
                  <p className="text-sm text-slate-500 mb-2">Otros Gastos</p>
                  <div className="space-y-2 text-sm pl-4 border-l-2 border-slate-200">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Mantenimiento</span>
                      <span>$25,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Reposición</span>
                      <span>$39,000</span>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 font-medium">
                    <span>Subtotal Otros</span>
                    <span>$64,000</span>
                  </div>
                </div>

                <div className="border-t pt-3 flex justify-between font-semibold text-red-600">
                  <span>TOTAL GASTOS</span>
                  <span>$359,250</span>
                </div>
              </CardContent>
            </Card>

            {/* Resultado */}
            <Card className="bg-primary text-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-primary-foreground/70">Saldo a Liquidar</p>
                    <p className="text-xs text-primary-foreground/70 mt-1">TC: $1,150 ARS/USD</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">USD 287.34</p>
                    <p className="text-primary-foreground/70">($330,441 ARS)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna lateral */}
          <div className="space-y-4">
            {/* Config del depto */}
            <Card>
              <CardHeader className="py-3 px-4 border-b">
                <CardTitle className="text-base">Configuración</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Dueño</span>
                  <span className="font-medium">Facundo Vega</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Comisión</span>
                  <span className="font-medium">20%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Servicios</span>
                  <span className="font-medium">Paga Benveo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bajar dinero</span>
                  <span className="font-medium">Sí descuenta</span>
                </div>
              </CardContent>
            </Card>

            {/* Turnos del mes */}
            <Card>
              <CardHeader className="py-3 px-4 border-b">
                <CardTitle className="text-base">Turnos del Mes</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2 max-h-48 overflow-auto">
                {[
                  { nombre: 'Sandra Lastra', fecha: '14/01', horario: '11:00-15:00', horas: 4 },
                  { nombre: 'Sandra Lastra', fecha: '10/01', horario: '11:20-15:00', horas: 3.7 },
                  { nombre: 'Juliana García', fecha: '08/01', horario: '09:30-13:30', horas: 4 },
                ].map((turno, i) => (
                  <div key={i} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg text-sm">
                    <div>
                      <p className="font-medium">{turno.nombre}</p>
                      <p className="text-slate-500 text-xs">{turno.fecha} {turno.horario}</p>
                    </div>
                    <span className="text-primary font-medium">{turno.horas}hs</span>
                  </div>
                ))}
              </CardContent>
              <div className="px-4 pb-4">
                <Button variant="ghost" size="sm" className="w-full text-primary">
                  Ver todos (8)
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>

            {/* Acciones */}
            <div className="space-y-2">
              <Button className="w-full">
                <Check className="w-4 h-4 mr-2" />
                Aprobar Liquidación
              </Button>
              <Button variant="outline" className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Enviar a Dueño
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Descargar PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
