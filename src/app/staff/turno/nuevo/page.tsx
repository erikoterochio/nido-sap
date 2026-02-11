"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  calculateDuration,
  formatDuration,
  formatCurrency,
  isValidTime,
} from "@/lib/utils";

// Datos de ejemplo - vendrán de la API
const departamentos = [
  { id: "1", nombre: "Defensa I" },
  { id: "2", nombre: "Defensa II" },
  { id: "3", nombre: "Eslovenia I (502)" },
  { id: "4", nombre: "Eslovenia II (904)" },
  { id: "5", nombre: "Araoz" },
  { id: "6", nombre: "Moreno" },
  { id: "7", nombre: "Petit" },
  { id: "8", nombre: "Azopardo" },
];

export default function NuevoTurnoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [departamentoId, setDepartamentoId] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [horaEntrada, setHoraEntrada] = useState("");
  const [horaSalida, setHoraSalida] = useState("");
  const [viaticos, setViaticos] = useState("");
  const [comentarios, setComentarios] = useState("");

  // Calculated values
  const [duracionMinutos, setDuracionMinutos] = useState(0);
  const [esPrecioEspecial, setEsPrecioEspecial] = useState(false);
  const [precioHora, setPrecioHora] = useState(6000);
  const [montoTotal, setMontoTotal] = useState(0);

  // Calcular duración y monto cuando cambian las horas
  useEffect(() => {
    if (horaEntrada && horaSalida && isValidTime(horaEntrada) && isValidTime(horaSalida)) {
      const duracion = calculateDuration(horaEntrada, horaSalida);
      setDuracionMinutos(duracion);

      // El precio especial se determina desde el backend basado en la fecha
      // Por ahora simulamos
      const fechaObj = new Date(fecha);
      const esFinDeSemana = fechaObj.getDay() === 0 || fechaObj.getDay() === 6;
      setEsPrecioEspecial(esFinDeSemana);
      
      const precio = esFinDeSemana ? 7000 : 6000;
      setPrecioHora(precio);

      const horas = duracion / 60;
      const viaticosNum = parseFloat(viaticos) || 0;
      setMontoTotal(horas * precio + viaticosNum);
    } else {
      setDuracionMinutos(0);
      setMontoTotal(0);
    }
  }, [horaEntrada, horaSalida, fecha, viaticos]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!departamentoId) {
      newErrors.departamento = "Seleccioná un departamento";
    }
    if (!fecha) {
      newErrors.fecha = "La fecha es requerida";
    }
    if (!horaEntrada || !isValidTime(horaEntrada)) {
      newErrors.horaEntrada = "Ingresá una hora válida (HH:mm)";
    }
    if (!horaSalida || !isValidTime(horaSalida)) {
      newErrors.horaSalida = "Ingresá una hora válida (HH:mm)";
    }
    if (duracionMinutos <= 0) {
      newErrors.horaSalida = "La hora de salida debe ser posterior a la entrada";
    }
    if (duracionMinutos > 12 * 60) {
      newErrors.horaSalida = "¿Segura que el turno duró más de 12 horas?";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      // TODO: Implementar llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      router.push("/staff?success=turno");
    } catch (error) {
      setErrors({ form: "Error al guardar el turno. Intentá de nuevo." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-4 sticky top-0 z-10">
        <Link href="/staff" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Registrar Turno</h1>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Departamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Departamento *
          </label>
          <select
            value={departamentoId}
            onChange={(e) => setDepartamentoId(e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
              errors.departamento ? "border-red-300" : "border-gray-300"
            }`}
          >
            <option value="">Seleccionar...</option>
            {departamentos.map((dpto) => (
              <option key={dpto.id} value={dpto.id}>
                {dpto.nombre}
              </option>
            ))}
          </select>
          {errors.departamento && (
            <p className="mt-1 text-sm text-red-600">{errors.departamento}</p>
          )}
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Fecha del turno
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
              errors.fecha ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.fecha && (
            <p className="mt-1 text-sm text-red-600">{errors.fecha}</p>
          )}
        </div>

        {/* Horas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Hora entrada *
            </label>
            <input
              type="time"
              value={horaEntrada}
              onChange={(e) => setHoraEntrada(e.target.value)}
              placeholder="00:00"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                errors.horaEntrada ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.horaEntrada && (
              <p className="mt-1 text-sm text-red-600">{errors.horaEntrada}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Hora salida *
            </label>
            <input
              type="time"
              value={horaSalida}
              onChange={(e) => setHoraSalida(e.target.value)}
              placeholder="00:00"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                errors.horaSalida ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.horaSalida && (
              <p className="mt-1 text-sm text-red-600">{errors.horaSalida}</p>
            )}
          </div>
        </div>

        {/* Duración calculada */}
        {duracionMinutos > 0 && (
          <Card className="bg-brand-50 border-brand-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-brand-700 mb-1">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">Duración</span>
              </div>
              <p className="text-3xl font-bold text-brand-700">
                {formatDuration(duracionMinutos)}
              </p>
              {esPrecioEspecial && (
                <p className="text-sm text-brand-600 mt-1">
                  Precio fin de semana/feriado aplicado
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Viáticos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Viáticos
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              $
            </span>
            <input
              type="number"
              value={viaticos}
              onChange={(e) => setViaticos(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Comentarios */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Comentarios
          </label>
          <textarea
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
            placeholder="Notas adicionales..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
          />
        </div>

        {/* Error general */}
        {errors.form && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
            {errors.form}
          </div>
        )}

        {/* Footer con total y botón */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 space-y-3">
          {montoTotal > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total a cobrar:</span>
              <span className="text-xl font-bold text-brand-600">
                {formatCurrency(montoTotal)}
              </span>
            </div>
          )}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isLoading || duracionMinutos <= 0}
        >
          {isLoading ? "Guardando..." : "Guardar Turno"}
        </Button>
        </div>
        
        {/* Spacer para el footer fijo */}
        <div className="h-32" />
      </form>
    </div>
  );
}
