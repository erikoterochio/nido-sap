"use client";

import Link from "next/link";
import { Plus, Package, ChevronRight, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

// Datos de ejemplo
const resumenMes = {
  horas: 23.5,
  aCobrar: 156400,
  pendiente: 45000,
  anticipo: 0,
};

const ultimosTurnos = [
  {
    id: 1,
    departamento: "Defensa I",
    fecha: new Date(),
    horaEntrada: "11:00",
    horaSalida: "15:00",
    duracion: 4,
    pagado: false,
  },
  {
    id: 2,
    departamento: "Eslovenia II",
    fecha: new Date(Date.now() - 86400000),
    horaEntrada: "09:00",
    horaSalida: "12:00",
    duracion: 3,
    pagado: true,
  },
];

export default function StaffHomePage() {
  return (
    <div>
      {/* Header */}
      <header className="bg-brand-600 text-white px-6 py-6">
        <p className="text-brand-200 text-sm">Hola,</p>
        <h1 className="text-xl font-semibold">Sandra Lastra</h1>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Resumen del mes */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm text-gray-500 mb-3">Este mes</h3>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {resumenMes.horas}
                </p>
                <p className="text-sm text-gray-500">horas</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-brand-600">
                  {formatCurrency(resumenMes.aCobrar)}
                </p>
                <p className="text-sm text-gray-500">a cobrar</p>
              </div>
            </div>

            {/* Alertas de saldo */}
            {resumenMes.pendiente > 0 && (
              <div className="mt-4 p-3 bg-amber-50 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span className="text-sm text-amber-700">
                  Tenés {formatCurrency(resumenMes.pendiente)} pendientes de pago
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acciones principales */}
        <Link href="/staff/turno/nuevo">
          <Button size="lg" className="w-full h-14 text-base">
            <Plus className="w-5 h-5" />
            Registrar Turno
          </Button>
        </Link>

        <Link href="/staff/gasto/nuevo">
          <Button variant="outline" size="lg" className="w-full h-14 text-base">
            <Package className="w-5 h-5" />
            Registrar Gasto / Insumo
          </Button>
        </Link>

        {/* Últimos turnos */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm text-gray-500">Últimos turnos</h3>
              <Link
                href="/staff/historial"
                className="text-sm text-brand-600 font-medium flex items-center gap-1"
              >
                Ver todos
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {ultimosTurnos.map((turno) => (
                <div
                  key={turno.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Clock className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {turno.departamento}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(turno.fecha)}, {turno.horaEntrada} -{" "}
                        {turno.horaSalida}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-brand-600">
                      {turno.duracion} hs
                    </p>
                    {!turno.pagado && (
                      <p className="text-xs text-amber-600">Pendiente</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
