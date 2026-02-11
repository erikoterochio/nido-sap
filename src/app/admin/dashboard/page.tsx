'use client'

import { useState } from 'react'
import {
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  ChevronRight,
  Building,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Datos de ejemplo - en producción vendrían de la API
const stats = [
  {
    title: 'Ingresos Brutos',
    value: 'USD 3,245',
    change: '+12%',
    trend: 'up',
    icon: DollarSign,
  },
  {
    title: 'Gastos Totales',
    value: '$1,234,500',
    change: '+5%',
    trend: 'down',
    icon: TrendingUp,
  },
  {
    title: 'Horas Limpieza',
    value: '387.5',
    subtitle: '156 turnos',
    icon: Clock,
  },
  {
    title: 'Pago Limpieza',
    value: '$2,456,800',
    alert: '3 sin pagar',
    icon: DollarSign,
  },
]

const alerts = [
  {
    type: 'warning',
    message: 'Turno inusual: Sandra - Petit - 12 horas',
    action: 'Revisar',
  },
  {
    type: 'warning',
    message: 'Gasto sin categoría: $15,000 - Defensa I',
    action: 'Revisar',
  },
]

const departamentos = [
  {
    nombre: 'Defensa I',
    ingresos: 'USD 512',
    gastos: '$89,500',
    limpieza: '$156,400',
    saldo: 'USD 287',
    estado: 'Listo',
  },
  {
    nombre: 'Eslovenia I',
    ingresos: 'USD 386',
    gastos: '$45,200',
    limpieza: '$98,500',
    saldo: 'USD 198',
    estado: 'Revisar',
  },
  {
    nombre: 'Araoz',
    ingresos: 'USD 245',
    gastos: '$34,100',
    limpieza: '$67,200',
    saldo: 'USD 156',
    estado: 'Listo',
  },
]

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState('Enero 2025')

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">{selectedMonth}</p>
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
          <Button>Generar Reportes</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <stat.icon className="w-5 h-5 text-slate-600" />
                </div>
                {stat.change && (
                  <span
                    className={`flex items-center text-sm font-medium ${
                      stat.trend === 'up' ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 mr-1" />
                    )}
                    {stat.change}
                  </span>
                )}
                {stat.alert && (
                  <span className="flex items-center text-sm font-medium text-amber-600">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {stat.alert}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">{stat.title}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              {stat.subtitle && (
                <p className="text-sm text-slate-400 mt-1">{stat.subtitle}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-amber-800">Requiere atención</h3>
            </div>
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-amber-700">{alert.message}</span>
                  <Button variant="ghost" size="sm" className="text-amber-600">
                    {alert.action}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Departamentos Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50 rounded-t-xl">
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Resumen por Departamento
          </CardTitle>
          <Button variant="ghost" size="sm">
            Ver todos
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-slate-500 border-b">
                <th className="px-6 py-4 font-medium">Departamento</th>
                <th className="px-6 py-4 font-medium">Ingresos</th>
                <th className="px-6 py-4 font-medium">Gastos</th>
                <th className="px-6 py-4 font-medium">Limpieza</th>
                <th className="px-6 py-4 font-medium">Saldo</th>
                <th className="px-6 py-4 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {departamentos.map((depto) => (
                <tr
                  key={depto.nombre}
                  className="border-b last:border-0 hover:bg-slate-50 cursor-pointer"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {depto.nombre}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{depto.ingresos}</td>
                  <td className="px-6 py-4 text-slate-600">{depto.gastos}</td>
                  <td className="px-6 py-4 text-slate-600">{depto.limpieza}</td>
                  <td className="px-6 py-4 font-medium text-emerald-600">
                    {depto.saldo}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        depto.estado === 'Listo'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {depto.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
