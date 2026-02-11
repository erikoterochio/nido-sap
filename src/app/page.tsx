"use client";

import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  ChevronRight,
  Building,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";

// Datos de ejemplo (después vendrán de la API)
const stats = [
  {
    name: "Ingresos Brutos",
    value: 3245,
    currency: "USD" as const,
    change: 12,
    changeType: "positive",
    icon: DollarSign,
  },
  {
    name: "Gastos Totales",
    value: 1234500,
    currency: "ARS" as const,
    change: 5,
    changeType: "negative",
    icon: TrendingDown,
  },
  {
    name: "Turnos Limpieza",
    value: 156,
    suffix: "turnos",
    subtext: "387.5 horas",
    icon: Clock,
  },
  {
    name: "Pago Limpieza",
    value: 2456800,
    currency: "ARS" as const,
    alert: "3 sin pagar",
    icon: DollarSign,
  },
];

const alertas = [
  {
    id: 1,
    tipo: "turno",
    mensaje: "Turno inusual: Sandra - Petit - 12 horas",
    link: "/admin/turnos?id=1",
  },
  {
    id: 2,
    tipo: "gasto",
    mensaje: "Gasto sin categoría: $15,000 - Defensa I",
    link: "/admin/gastos?id=2",
  },
];

const departamentos = [
  {
    nombre: "Defensa I",
    ingresos: 512,
    gastos: 89500,
    limpieza: 156400,
    saldo: 287,
    estado: "listo",
  },
  {
    nombre: "Eslovenia I",
    ingresos: 386,
    gastos: 45200,
    limpieza: 98500,
    saldo: 198,
    estado: "revisar",
  },
  {
    nombre: "Araoz",
    ingresos: 245,
    gastos: 34100,
    limpieza: 67200,
    saldo: 156,
    estado: "listo",
  },
  {
    nombre: "Defensa II",
    ingresos: 412,
    gastos: 52300,
    limpieza: 89000,
    saldo: 223,
    estado: "listo",
  },
];

export default function AdminDashboard() {
  const [selectedMonth, setSelectedMonth] = useState("2025-01");

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Enero 2025</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-10 px-4 border border-gray-300 rounded-xl bg-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="2025-01">Enero 2025</option>
            <option value="2024-12">Diciembre 2024</option>
            <option value="2024-11">Noviembre 2024</option>
          </select>
          <Button>Generar Reportes</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.currency
                      ? formatCurrency(stat.value, stat.currency)
                      : stat.value}
                    {stat.suffix && (
                      <span className="text-base font-normal text-gray-500 ml-1">
                        {stat.suffix}
                      </span>
                    )}
                  </p>
                  {stat.change && (
                    <p
                      className={cn(
                        "text-xs mt-1 flex items-center gap-1",
                        stat.changeType === "positive"
                          ? "text-emerald-600"
                          : "text-red-500"
                      )}
                    >
                      {stat.changeType === "positive" ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {stat.change}% vs mes ant.
                    </p>
                  )}
                  {stat.subtext && (
                    <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
                  )}
                  {stat.alert && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {stat.alert}
                    </p>
                  )}
                </div>
                <div className="p-2 bg-gray-100 rounded-lg">
                  <stat.icon className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-amber-800">Requiere atención</h3>
            </div>
            <div className="space-y-2">
              {alertas.map((alerta) => (
                <div
                  key={alerta.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-amber-700">{alerta.mensaje}</span>
                  <a
                    href={alerta.link}
                    className="text-amber-600 font-medium hover:underline flex items-center gap-1"
                  >
                    Revisar
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de departamentos */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle>Resumen por Departamento</CardTitle>
          <a
            href="/admin/departamentos"
            className="text-sm text-brand-600 font-medium hover:underline flex items-center gap-1"
          >
            Ver todos
            <ChevronRight className="w-4 h-4" />
          </a>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="px-6 py-3 font-medium">Departamento</th>
                <th className="px-6 py-3 font-medium">Ingresos</th>
                <th className="px-6 py-3 font-medium">Gastos</th>
                <th className="px-6 py-3 font-medium">Limpieza</th>
                <th className="px-6 py-3 font-medium">Saldo</th>
                <th className="px-6 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {departamentos.map((dpto) => (
                <tr
                  key={dpto.nombre}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Building className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-900">
                        {dpto.nombre}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatCurrency(dpto.ingresos, "USD")}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatCurrency(dpto.gastos, "ARS")}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatCurrency(dpto.limpieza, "ARS")}
                  </td>
                  <td className="px-6 py-4 font-medium text-emerald-600">
                    {formatCurrency(dpto.saldo, "USD")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                        dpto.estado === "listo"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      )}
                    >
                      {dpto.estado === "listo" ? "Listo" : "Revisar"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
