// src/app/api/registrar-turno/route.ts
// Endpoint POST: valida, guarda en Google Sheets y en Supabase

import { NextRequest, NextResponse } from 'next/server';
import { getSheetsClient, SHEET_ID, HOJA_TURNOS } from '@/lib/google-sheets';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DatosTurno {
  nombre: string;
  departamento: string;
  fecha: string;        // formato YYYY-MM-DD
  horaEntrada: string;  // formato HH:MM
  horaSalida: string;   // formato HH:MM
  viaticos: number;
  comentarios: string;
  huboLavado: boolean;
}

/**
 * Calcula la duración en horas entre dos strings "HH:MM"
 */
function calcularDuracion(entrada: string, salida: string): number {
  const [hEntrada, mEntrada] = entrada.split(':').map(Number);
  const [hSalida, mSalida] = salida.split(':').map(Number);
  return (hSalida * 60 + mSalida - (hEntrada * 60 + mEntrada)) / 60;
}

/**
 * Determina si una fecha es fin de semana o feriado
 * consultando la tabla diaespecial de Supabase
 */
async function esFeriadoOFinde(fecha: string): Promise<boolean> {
  const date = new Date(fecha + 'T00:00:00');
  const diaSemana = date.getUTCDay(); // 0=domingo, 6=sábado

  // Fin de semana
  if (diaSemana === 0 || diaSemana === 6) return true;

  // Feriado en base de datos
  const feriado = await prisma.diaEspecial.findFirst({
    where: {
      fecha: new Date(fecha + 'T00:00:00'),
      tipo: 'FERIADO',
    },
  });

  return !!feriado;
}

export async function POST(req: NextRequest) {
  try {
    const datos: DatosTurno = await req.json();

    // Validación básica de campos requeridos
    if (!datos.nombre || !datos.departamento || !datos.fecha || !datos.horaEntrada || !datos.horaSalida) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    const duracionHoras = calcularDuracion(datos.horaEntrada, datos.horaSalida);

    if (duracionHoras <= 0) {
      return NextResponse.json(
        { error: 'La hora de salida debe ser posterior a la hora de entrada' },
        { status: 400 }
      );
    }

    // ── Buscar empleada en Supabase ────────────────────────────────────────────
    // El nombre viene como "Nombre Apellido" desde el form
    const partes = datos.nombre.trim().split(' ');
    const nombre = partes[0];
    const apellido = partes.slice(1).join(' '); // soporta apellidos compuestos

    const empleado = await prisma.empleado.findFirst({
      where: { nombre, apellido, activo: true },
    });

    // ── Determinar si es feriado/finde ─────────────────────────────────────────
    const esFinde = await esFeriadoOFinde(datos.fecha);

    // ── Calcular precio y monto ────────────────────────────────────────────────
    const precioHora = empleado
      ? (esFinde ? Number(empleado.precioHoraFinde) : Number(empleado.precioHoraNormal))
      : 0;

    const montoTotal = precioHora * duracionHoras + datos.viaticos;

    // ── Buscar departamento en Supabase ────────────────────────────────────────
    const departamento = await prisma.departamento.findFirst({
      where: { nombre: datos.departamento },
    });

    // ── Guardar en Supabase (tabla turno) ──────────────────────────────────────
    if (empleado && departamento) {
      const fechaDate = new Date(datos.fecha + 'T00:00:00');
      const mes = new Date(fechaDate.getFullYear(), fechaDate.getMonth(), 1);

      await prisma.turno.create({
        data: {
          id: crypto.randomUUID(),
          empleadoId: empleado.id,
          departamentoId: departamento.id,
          fecha: fechaDate,
          horaEntrada: datos.horaEntrada,
          horaSalida: datos.horaSalida,
          duracionHoras,
          viaticos: datos.viaticos,
          esFeriadoFinde: esFinde,
          comentarios: datos.comentarios || null,
          precioHora,
          montoTotal,
          mes,
          estado: 'PENDIENTE_REVISION',
          alertas: [],
          updatedAt: new Date(),
        },
      });
    }

    // ── Guardar en Google Sheets ───────────────────────────────────────────────
    const marcaTemporal = new Date().toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    });

    const fila = [
      marcaTemporal,
      datos.nombre,
      datos.departamento,
      datos.fecha,
      datos.horaEntrada,
      datos.horaSalida,
      duracionHoras.toFixed(1).replace('.', ','),
      datos.viaticos || 0,
      datos.huboLavado ? 'SÍ' : 'NO',
      esFinde ? 'SÍ' : 'NO',
      datos.comentarios || '',
    ];

    const sheets = getSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${HOJA_TURNOS}!A:J`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [fila] },
    });

    return NextResponse.json({
      ok: true,
      duracionHoras,
      esFinde,
      montoTotal: empleado ? montoTotal : null,
      guardadoEnSupabase: !!(empleado && departamento),
    });

  } catch (error) {
    console.error('Error al registrar turno:', error);
    return NextResponse.json(
      { error: 'No se pudo guardar el turno. Intentá de nuevo.' },
      { status: 500 }
    );
  }
}