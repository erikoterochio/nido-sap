// src/app/api/registrar-turno/route.ts
// Endpoint POST: valida, guarda en Supabase y en Google Sheets
// Cambios: acepta FormData (antes JSON), guarda motivosExceso y fotosUrls

import { NextRequest, NextResponse } from 'next/server';
import { getSheetsClient, SHEET_ID, HOJA_TURNOS } from '@/lib/google-sheets';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?pgbouncer=true&connection_limit=1',
    },
  },
});

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface DatosTurno {
  nombre: string;
  departamento: string;
  fecha: string;          // YYYY-MM-DD
  horaEntrada: string;    // HH:MM
  horaSalida: string;     // HH:MM
  viaticos: number;
  comentarios: string;
  motivosExceso: string[]; // reemplaza huboLavado
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcularDuracion(entrada: string, salida: string): number {
  const [hE, mE] = entrada.split(':').map(Number);
  const [hS, mS] = salida.split(':').map(Number);
  return (hS * 60 + mS - (hE * 60 + mE)) / 60;
}

async function esFeriadoOFinde(fecha: string): Promise<boolean> {
  const date     = new Date(fecha + 'T00:00:00');
  const diaSemana = date.getUTCDay();
  if (diaSemana === 0 || diaSemana === 6) return true;

  const feriado = await prisma.diaEspecial.findFirst({
    where: { fecha: new Date(fecha + 'T00:00:00'), tipo: 'FERIADO' },
  });
  return !!feriado;
}

/**
 * Sube un archivo a Supabase Storage usando la API REST directamente.
 * Bucket: turnos-fotos (debe ser público en Supabase).
 * Retorna la URL pública o null si falló.
 */
async function subirFoto(
  turnoId: string,
  archivo: File,
  indice: number
): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Usamos la anon key (no service_role) combinada con la política de INSERT
  // en el bucket turnos-fotos. Permite subir pero no listar ni borrar.
  const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    console.warn('Variables de Supabase Storage no configuradas');
    return null;
  }

  // Path dentro del bucket: {turnoId}/0.jpg, {turnoId}/1.png, etc.
  const extension = archivo.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path      = `${turnoId}/${indice}.${extension}`;

  try {
    const arrayBuffer = await archivo.arrayBuffer();

    const res = await fetch(
      `${supabaseUrl}/storage/v1/object/turnos-fotos/${path}`,
      {
        method:  'POST',
        headers: {
          Authorization: `Bearer ${anonKey}`,
          'Content-Type': archivo.type || 'image/jpeg',
        },
        body: arrayBuffer,
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error(`Error subiendo foto ${indice}:`, err);
      return null;
    }

    // URL pública del bucket
    return `${supabaseUrl}/storage/v1/object/public/turnos-fotos/${path}`;
  } catch (err) {
    console.error(`Excepción subiendo foto ${indice}:`, err);
    return null;
  }
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // Parsear FormData (antes era req.json())
    const formData = await req.formData();

    const datosRaw = formData.get('datos');
    if (!datosRaw || typeof datosRaw !== 'string') {
      return NextResponse.json({ error: 'Faltan datos del turno' }, { status: 400 });
    }

    const datos: DatosTurno = JSON.parse(datosRaw);
    const archivos           = formData.getAll('fotos') as File[];

    // Validación de campos requeridos
    if (!datos.nombre || !datos.departamento || !datos.fecha || !datos.horaEntrada || !datos.horaSalida) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const duracionHoras = calcularDuracion(datos.horaEntrada, datos.horaSalida);
    if (duracionHoras <= 0) {
      return NextResponse.json(
        { error: 'La hora de salida debe ser posterior a la hora de entrada' },
        { status: 400 }
      );
    }

    // ── Buscar empleada ──────────────────────────────────────────────────────
    const partes   = datos.nombre.trim().split(' ');
    const nombre   = partes[0];
    const apellido = partes.slice(1).join(' ');

    const empleado = await prisma.empleado.findFirst({
      where: { nombre, apellido, activo: true },
    });

    // ── Determinar si es feriado/finde ───────────────────────────────────────
    const esFinde = await esFeriadoOFinde(datos.fecha);

    // ── Calcular precio y monto ──────────────────────────────────────────────
    const precioHora = empleado
      ? (esFinde ? Number(empleado.precioHoraFinde) : Number(empleado.precioHoraNormal))
      : 0;
    const montoTotal = precioHora * duracionHoras + datos.viaticos;

    // ── Buscar departamento ──────────────────────────────────────────────────
    const departamento = await prisma.departamento.findFirst({
      where: { nombre: datos.departamento },
    });

    // ── Crear el turno en Supabase ───────────────────────────────────────────
    let turnoId: string | null = null;

    if (empleado && departamento) {
      const fechaDate = new Date(datos.fecha + 'T00:00:00');
      const mes       = new Date(fechaDate.getFullYear(), fechaDate.getMonth(), 1);
      turnoId         = crypto.randomUUID();

      await prisma.turnoLimpieza.create({
        data: {
          id:             turnoId,
          tipo:           'LIMPIEZA',
          empleadoId:     empleado.id,
          departamentoId: departamento.id,
          fecha:          fechaDate,
          horaEntrada:    datos.horaEntrada,
          horaSalida:     datos.horaSalida,
          duracionHoras,
          viaticos:       datos.viaticos,
          esFeriadoFinde: esFinde,
          comentarios:    datos.comentarios || null,
          precioHora,
          montoTotal,
          mes,
          estado:         'PENDIENTE_REVISION',
          alertas:        [],
          motivosExceso:  datos.motivosExceso ?? [],
          fotosUrls:      [], // se actualizan después de subir las fotos
          updatedAt:      new Date(),
        },
      });
    }

    // ── Subir fotos y actualizar el turno con las URLs ───────────────────────
    // Se hace después de crear el turno para tener el turnoId disponible.
    // Si falla alguna foto no se bloquea el registro.
    let fotosUrls: string[] = [];

    if (turnoId && archivos.length > 0) {
      const resultados = await Promise.all(
        archivos.map((archivo, i) => subirFoto(turnoId!, archivo, i))
      );
      fotosUrls = resultados.filter((url): url is string => url !== null);

      if (fotosUrls.length > 0) {
        await prisma.turnoLimpieza.update({
          where: { id: turnoId },
          data:  { fotosUrls },
        });
      }
    }

    // ── Guardar en Google Sheets ─────────────────────────────────────────────
    const marcaTemporal = new Date().toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    });

    // Convertir motivos a texto legible para el sheet
    const motivosTexto = datos.motivosExceso.length > 0
      ? datos.motivosExceso
          .map((m) => ({
            lavado_sabanas_toallas: 'Lavado sábanas/toallas',
            estadia_larga:          'Estadía larga',
            otros:                  'Otros',
          }[m] ?? m))
          .join(', ')
      : '';

    const fila = [
      marcaTemporal,
      datos.nombre,
      datos.departamento,
      datos.fecha,
      datos.horaEntrada,
      datos.horaSalida,
      duracionHoras.toFixed(1).replace('.', ','),
      datos.viaticos || 0,
      motivosTexto,          // reemplaza la columna "¿Hubo lavado?"
      esFinde ? 'SÍ' : 'NO',
      datos.comentarios || '',
      fotosUrls.length > 0 ? `${fotosUrls.length} foto(s)` : '',
    ];

    const sheets = getSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId:   SHEET_ID,
      range:           `${HOJA_TURNOS}!A:L`,
      valueInputOption: 'USER_ENTERED',
      requestBody:     { values: [fila] },
    });

    return NextResponse.json({
      ok: true,
      duracionHoras,
      esFinde,
      montoTotal:         empleado ? montoTotal : null,
      guardadoEnSupabase: !!(empleado && departamento),
      fotosSubidas:       fotosUrls.length,
    });

  } catch (error) {
    console.error('Error al registrar turno:', error);
    return NextResponse.json(
      { error: 'No se pudo guardar el turno. Intentá de nuevo.' },
      { status: 500 }
    );
  }
}