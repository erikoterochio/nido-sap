'use client';

// src/app/registrar/page.tsx
// Formulario para que las empleadas registren sus turnos de limpieza

import { useEffect, useState } from 'react';

// ─── Tipos locales ────────────────────────────────────────────────────────────

interface LimiteDepartamento {
  nombre: string;
  limiteHoras: number;
  permiteExcederConLavado: boolean;
}

interface OpcionesFormulario {
  empleadas: string[];
  departamentos: string[];
  limites: LimiteDepartamento[];
}

interface FormData {
  nombre: string;
  departamento: string;
  fecha: string;
  horaEntrada: string;
  horaSalida: string;
  viaticos: string;
  comentarios: string;
  huboLavado: boolean;
}

const formInicial: FormData = {
  nombre: '',
  departamento: '',
  fecha: new Date().toISOString().split('T')[0],
  horaEntrada: '',
  horaSalida: '',
  viaticos: '',
  comentarios: '',
  huboLavado: false,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcularDuracion(entrada: string, salida: string): number | null {
  if (!entrada || !salida) return null;
  const [hE, mE] = entrada.split(':').map(Number);
  const [hS, mS] = salida.split(':').map(Number);
  const minutos = hS * 60 + mS - (hE * 60 + mE);
  return minutos > 0 ? minutos / 60 : null;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function RegistrarTurno() {
  const [opciones, setOpciones] = useState<OpcionesFormulario | null>(null);
  const [form, setForm] = useState<FormData>(formInicial);
  const [error, setError] = useState<string>('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Límite del departamento seleccionado
  const limiteDepartamento: LimiteDepartamento | undefined =
    opciones?.limites?.find((l) => l.nombre === form.departamento);

  // Duración calculada en tiempo real
  const duracion = calcularDuracion(form.horaEntrada, form.horaSalida);

  // Límite efectivo: si marcó lavado y el depto lo permite, se suma 1 hora
  const limiteEfectivo = limiteDepartamento
    ? limiteDepartamento.limiteHoras + (form.huboLavado && limiteDepartamento.permiteExcederConLavado ? 1 : 0)
    : null;

  // ¿La duración supera el límite base? (para mostrar el checkbox de lavado)
  const superaLimiteBase =
    duracion !== null &&
    limiteDepartamento !== undefined &&
    duracion > limiteDepartamento.limiteHoras;

  // ¿Se excede el límite efectivo? (para bloquear el envío)
  const excedeLimite =
    duracion !== null &&
    limiteEfectivo !== null &&
    duracion > limiteEfectivo;

  // ─── Cargar opciones al montar ─────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/form-options')
      .then((r) => r.json())
      .then((data: OpcionesFormulario) => {
        setOpciones(data);
        setCargando(false);
      })
      .catch(() => {
        setError('No se pudieron cargar los datos. Recargá la página.');
        setCargando(false);
      });
  }, []);

  // ─── Manejador de cambios ──────────────────────────────────────────────────
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    const checked =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'departamento' ? { huboLavado: false } : {}),
    }));

    setError('');
  }

  // ─── Envío del formulario ──────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (duracion === null || duracion <= 0) {
      setError('La hora de salida debe ser posterior a la hora de entrada.');
      return;
    }

    if (excedeLimite) {
      setError(
        `Este departamento tiene un límite de ${limiteDepartamento!.limiteHoras} horas. ` +
          `Estás cargando ${duracion.toFixed(1)} horas.`
      );
      return;
    }

    setEnviando(true);

    try {
      const res = await fetch('/api/registrar-turno', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          viaticos: parseFloat(form.viaticos) || 0,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Error desconocido');
      }

      setEnviado(true);
      setForm(formInicial);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'No se pudo guardar. Intentá de nuevo.'
      );
    } finally {
      setEnviando(false);
    }
  }

  // ─── Pantalla de éxito ─────────────────────────────────────────────────────
  if (enviado) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            ¡Turno registrado!
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            El turno se guardó correctamente.
          </p>
          <button
            onClick={() => setEnviado(false)}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Registrar otro turno
          </button>
        </div>
      </div>
    );
  }

  // ─── Pantalla de carga ─────────────────────────────────────────────────────
  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </div>
    );
  }

  // ─── Error de carga inicial ────────────────────────────────────────────────
  if (!opciones) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm text-center max-w-sm">
          {error || 'No se pudieron cargar los datos. Recargá la página.'}
        </div>
      </div>
    );
  }

  // ─── Formulario principal ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Encabezado */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Registrar turno</h1>
          <p className="text-gray-500 text-sm mt-1">Benveo · CoLiving</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tu nombre *
            </label>
            <select
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccioná tu nombre</option>
              {(opciones.empleadas ?? []).map((emp) => (
                <option key={emp} value={emp}>
                  {emp}
                </option>
              ))}
            </select>
          </div>

          {/* Departamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departamento *
            </label>
            <select
              name="departamento"
              value={form.departamento}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccioná el departamento</option>
              {(opciones.departamentos ?? []).map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>

            {limiteDepartamento && (
              <p className="text-xs text-gray-400 mt-1">
                Límite: {limiteDepartamento.limiteHoras} hs
                {limiteDepartamento.permiteExcederConLavado &&
                  ' (puede extenderse si hubo lavado)'}
              </p>
            )}
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha del turno *
            </label>
            <input
              type="date"
              name="fecha"
              value={form.fecha}
              onChange={handleChange}
              required
              max={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Horas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora entrada *
              </label>
              <input
                type="time"
                name="horaEntrada"
                value={form.horaEntrada}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora salida *
              </label>
              <input
                type="time"
                name="horaSalida"
                value={form.horaSalida}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Duración calculada */}
          {duracion !== null && duracion > 0 && (
            <div className="space-y-2">
              {/* Indicador de horas cargadas */}
              <div className="bg-gray-100 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-600">Horas cargadas</span>
                <span className={`text-lg font-bold ${excedeLimite ? 'text-red-600' : 'text-gray-900'}`}>
                  {duracion.toFixed(1)} hs
                </span>
              </div>

              {/* Alerta de exceso */}
              {excedeLimite && (
                <div className="bg-red-50 border border-red-300 rounded-xl px-4 py-3 flex items-start gap-2">
                  <span className="text-red-600 font-black text-lg leading-none mt-0.5">!</span>
                  <p className="text-red-700 text-sm font-medium">
                    El tope de horas para <strong>{form.departamento}</strong> es de{' '}
                    <strong>{limiteEfectivo} hs</strong>
                    {form.huboLavado && limiteDepartamento!.permiteExcederConLavado
                      ? ' (incluye +1 hs por lavado)'
                      : ''}.{' '}
                    Estás cargando {duracion!.toFixed(1)} hs.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Checkbox de lavado: solo aparece cuando se supera el límite base */}
          {limiteDepartamento?.permiteExcederConLavado &&
            superaLimiteBase && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <input
                  type="checkbox"
                  id="huboLavado"
                  name="huboLavado"
                  checked={form.huboLavado}
                  onChange={handleChange}
                  className="mt-0.5 w-5 h-5 accent-amber-500"
                />
                <label
                  htmlFor="huboLavado"
                  className="text-sm text-amber-800 cursor-pointer"
                >
                  <span className="font-medium">¿Hubo lavado?</span>
                  <br />
                  <span className="text-amber-600">
                    Marcá esto si el turno se extendió por lavar ropa o sábanas.
                  </span>
                </label>
              </div>
            )}

          {/* Viáticos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Viáticos ($ ARS)
            </label>
            <input
              type="number"
              name="viaticos"
              value={form.viaticos}
              onChange={handleChange}
              min="0"
              placeholder="0"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Comentarios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comentarios
            </label>
            <textarea
              name="comentarios"
              value={form.comentarios}
              onChange={handleChange}
              rows={3}
              placeholder="Algo que quieras aclarar sobre el turno..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Botón enviar */}
          <button
            type="submit"
            disabled={enviando || excedeLimite}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-base hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {enviando ? 'Guardando...' : 'Registrar turno'}
          </button>
        </form>
      </div>
    </div>
  );
}