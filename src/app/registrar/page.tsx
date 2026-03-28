'use client';

// src/app/registrar/page.tsx
// Formulario para que las empleadas registren sus turnos de limpieza
// Cambios: motivos múltiples de exceso (reemplaza checkbox), upload de fotos

import { useEffect, useRef, useState } from 'react';

// ─── Constantes ───────────────────────────────────────────────────────────────

// Motivos posibles para extenderse en el turno
const MOTIVOS_EXCESO = [
  { id: 'lavado_sabanas_toallas', label: 'Lavado sábanas / toallas' },
  { id: 'estadia_larga',          label: 'Estadía de huésped larga' },
  { id: 'otros',                  label: 'Otros (detallá en comentarios)' },
] as const;

// Genera array de horas ["00","01",...,"23"]
const HORAS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
// Genera array de minutos ["00","15","30","45"]
const MINUTOS = ['00', '15', '30', '45'];

// ─── Tipos ────────────────────────────────────────────────────────────────────

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
  horaEntradaH: string;
  horaEntradaM: string;
  horaSalidaH: string;
  horaSalidaM: string;
  viaticos: string;
  comentarios: string;
  // Reemplaza el anterior huboLavado: boolean
  motivosExceso: string[];
}

const formInicial: FormData = {
  nombre:       '',
  departamento: '',
  fecha:        new Date().toISOString().split('T')[0],
  horaEntradaH: '',
  horaEntradaM: '00',
  horaSalidaH:  '',
  horaSalidaM:  '00',
  viaticos:     '',
  comentarios:  '',
  motivosExceso: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcularDuracion(entrada: string, salida: string): number | null {
  if (!entrada || !salida) return null;
  const [hE, mE] = entrada.split(':').map(Number);
  const [hS, mS] = salida.split(':').map(Number);
  const minutos = hS * 60 + mS - (hE * 60 + mE);
  return minutos > 0 ? minutos / 60 : null;
}

function combinarHora(h: string, m: string): string {
  return h && m ? `${h}:${m}` : '';
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function RegistrarTurno() {
  const [opciones, setOpciones]       = useState<OpcionesFormulario | null>(null);
  const [form, setForm]               = useState<FormData>(formInicial);
  const [fotos, setFotos]             = useState<File[]>([]);
  const [previews, setPreviews]       = useState<string[]>([]);
  const [error, setError]             = useState<string>('');
  const [enviando, setEnviando]       = useState(false);
  const [enviado, setEnviado]         = useState(false);
  const [cargando, setCargando]       = useState(true);
  const inputFotosRef                 = useRef<HTMLInputElement>(null);

  // Límite del departamento seleccionado
  const limiteDepartamento = opciones?.limites?.find(
    (l) => l.nombre === form.departamento
  );

  // Combinar campos de hora
  const horaEntrada = combinarHora(form.horaEntradaH, form.horaEntradaM);
  const horaSalida  = combinarHora(form.horaSalidaH,  form.horaSalidaM);

  // Duración calculada en tiempo real
  const duracion = calcularDuracion(horaEntrada, horaSalida);

  // Si tiene al menos un motivo y el depto lo permite → +1 hora de margen
  const tieneMotivo     = form.motivosExceso.length > 0;
  const limiteEfectivo  = limiteDepartamento
    ? limiteDepartamento.limiteHoras +
      (tieneMotivo && limiteDepartamento.permiteExcederConLavado ? 1 : 0)
    : null;

  // ¿Supera el límite efectivo? (bloquea el envío)
  const excedeLimite =
    duracion !== null &&
    limiteEfectivo !== null &&
    duracion > limiteEfectivo;

  // ─── Cargar opciones al montar ───────────────────────────────────────────
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

  // ─── Manejador de cambios de texto / select ──────────────────────────────
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // Al cambiar departamento, resetear los motivos
      ...(name === 'departamento' ? { motivosExceso: [] } : {}),
    }));
    setError('');
  }

  // ─── Toggle de motivos de exceso ─────────────────────────────────────────
  function toggleMotivo(motivoId: string) {
    setForm((prev) => ({
      ...prev,
      motivosExceso: prev.motivosExceso.includes(motivoId)
        ? prev.motivosExceso.filter((m) => m !== motivoId)
        : [...prev.motivosExceso, motivoId],
    }));
    setError('');
  }

  // ─── Manejo de fotos ─────────────────────────────────────────────────────
  function handleSeleccionarFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const archivos = Array.from(e.target.files ?? []);
    if (archivos.length === 0) return;

    setFotos((prev) => [...prev, ...archivos]);

    // Generar previews con FileReader
    archivos.forEach((archivo) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviews((prev) => [...prev, ev.target!.result as string]);
      };
      reader.readAsDataURL(archivo);
    });

    // Limpiar input para poder volver a seleccionar el mismo archivo
    if (inputFotosRef.current) inputFotosRef.current.value = '';
  }

  function removerFoto(indice: number) {
    setFotos((prev) => prev.filter((_, i) => i !== indice));
    setPreviews((prev) => prev.filter((_, i) => i !== indice));
  }

  // ─── Envío del formulario ────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (duracion === null || duracion <= 0) {
      setError('La hora de salida debe ser posterior a la hora de entrada.');
      return;
    }

    if (excedeLimite) {
      setError(
        `Este departamento tiene un límite de ${limiteDepartamento!.limiteHoras} hs. ` +
          `Estás cargando ${duracion.toFixed(1)} hs.`
      );
      return;
    }

    setEnviando(true);

    try {
      // Armamos un FormData para poder enviar fotos junto con los datos
      const payload = new FormData();
      payload.append(
        'datos',
        JSON.stringify({
          nombre:        form.nombre,
          departamento:  form.departamento,
          fecha:         form.fecha,
          horaEntrada,
          horaSalida,
          viaticos:      parseFloat(form.viaticos) || 0,
          comentarios:   form.comentarios,
          motivosExceso: form.motivosExceso,
        })
      );
      fotos.forEach((foto) => payload.append('fotos', foto));

      const res = await fetch('/api/registrar-turno', {
        method: 'POST',
        body:   payload, // sin Content-Type: lo pone el browser automáticamente con boundary
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Error desconocido');
      }

      setEnviado(true);
      setForm(formInicial);
      setFotos([]);
      setPreviews([]);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'No se pudo guardar. Intentá de nuevo.'
      );
    } finally {
      setEnviando(false);
    }
  }

  // ─── Pantalla de éxito ───────────────────────────────────────────────────
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

  // ─── Pantalla de carga ───────────────────────────────────────────────────
  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </div>
    );
  }

  // ─── Error de carga inicial ──────────────────────────────────────────────
  if (!opciones) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm text-center max-w-sm">
          {error || 'No se pudieron cargar los datos. Recargá la página.'}
        </div>
      </div>
    );
  }

  // ─── Formulario principal ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-5">
      <div className="max-w-md mx-auto">

        {/* Encabezado */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Registrar turno</h1>
          <p className="text-gray-500 text-sm mt-1">Benveo · CoLiving</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Nombre ─────────────────────────────────────────────────── */}
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
                <option key={emp} value={emp}>{emp}</option>
              ))}
            </select>
          </div>

          {/* ── Departamento ────────────────────────────────────────────── */}
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
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>

            {limiteDepartamento && (
              <p className="text-sm text-gray-500 mt-2 font-medium">
                ⏱ Límite: {limiteDepartamento.limiteHoras} hs
                {limiteDepartamento.permiteExcederConLavado &&
                  ' · puede extenderse +1 hs si hay motivo'}
              </p>
            )}
          </div>

          {/* ── Motivos de exceso ─────────────────────────────────────────
              Visible siempre que el depto permita extenderse,
              no solo cuando se superan las horas.                         */}
          {limiteDepartamento?.permiteExcederConLavado && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 space-y-2">
              <p className="text-sm font-medium text-amber-800">
                ¿Por qué se extendió el turno?
              </p>
              <p className="text-xs text-amber-600">
                Seleccioná si aplica. Esto permite cargar hasta{' '}
                {limiteDepartamento.limiteHoras + 1} hs en este departamento.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {MOTIVOS_EXCESO.map((motivo) => {
                  const seleccionado = form.motivosExceso.includes(motivo.id);
                  return (
                    <button
                      key={motivo.id}
                      type="button"
                      onClick={() => toggleMotivo(motivo.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        seleccionado
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white text-amber-700 border-amber-300 hover:border-amber-500'
                      }`}
                    >
                      {seleccionado ? '✓ ' : ''}{motivo.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Fecha ───────────────────────────────────────────────────── */}
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

          {/* ── Horas (selectores compatibles con iOS Safari) ─────────── */}
          <div className="space-y-3">

            {/* Hora entrada */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora entrada *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  name="horaEntradaH"
                  value={form.horaEntradaH}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Hora</option>
                  {HORAS.map((h) => (
                    <option key={h} value={h}>{h}hs</option>
                  ))}
                </select>
                <select
                  name="horaEntradaM"
                  value={form.horaEntradaM}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {MINUTOS.map((m) => (
                    <option key={m} value={m}>{m}min</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hora salida */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora salida *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  name="horaSalidaH"
                  value={form.horaSalidaH}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Hora</option>
                  {HORAS.map((h) => (
                    <option key={h} value={h}>{h}hs</option>
                  ))}
                </select>
                <select
                  name="horaSalidaM"
                  value={form.horaSalidaM}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {MINUTOS.map((m) => (
                    <option key={m} value={m}>{m}min</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Duración calculada ───────────────────────────────────────── */}
          {duracion !== null && duracion > 0 && (
            <div className="space-y-2">
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
                    El tope para <strong>{form.departamento}</strong> es de{' '}
                    <strong>{limiteEfectivo} hs</strong>
                    {tieneMotivo && limiteDepartamento?.permiteExcederConLavado
                      ? ' (incluye +1 hs por el motivo indicado)'
                      : ''}.{' '}
                    Estás cargando {duracion.toFixed(1)} hs.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Viáticos ────────────────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Viáticos ($ ARS)
            </label>
            <input
              type="number"
              name="viaticos"
              inputMode="numeric"
              value={form.viaticos}
              onChange={handleChange}
              min="0"
              placeholder="0"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ── Comentarios ─────────────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comentarios
            </label>
            <textarea
              name="comentarios"
              value={form.comentarios}
              onChange={handleChange}
              rows={3}
              placeholder={
                form.motivosExceso.includes('otros')
                  ? 'Explicá el motivo por el que se extendió el turno...'
                  : 'Algo que quieras aclarar sobre el turno...'
              }
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* ── Fotos ───────────────────────────────────────────────────────
              Las fotos se guardan en Supabase Storage (bucket: turnos-fotos)
              y quedan accesibles desde el detalle del turno en el admin.   */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fotos del trabajo
            </label>
            <p className="text-xs text-gray-400 mb-2">
              Podés agregar fotos del departamento limpio o del trabajo realizado.
            </p>

            {/* Grid de previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Foto ${i + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removerFoto(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow"
                      aria-label="Eliminar foto"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Botón de agregar fotos */}
            <button
              type="button"
              onClick={() => inputFotosRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 px-4 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
            >
              {previews.length === 0 ? '📷 Agregar fotos' : '📷 Agregar más fotos'}
            </button>

            {/* Input oculto — acepta solo imágenes, permite múltiple selección */}
            <input
              ref={inputFotosRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleSeleccionarFotos}
              className="hidden"
            />
          </div>

          {/* ── Error ───────────────────────────────────────────────────── */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* ── Botón enviar ─────────────────────────────────────────────── */}
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