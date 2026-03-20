// src/app/api/registrar-turno/route.ts
// Endpoint POST: valida y guarda un turno en "Turnos limpieza 2.0"

import { NextRequest, NextResponse } from 'next/server';
import { getSheetsClient, SHEET_ID, HOJA_TURNOS } from '@/lib/google-sheets';

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
 * Calcula la duración en horas entre dos strings de hora "HH:MM"
 */
function calcularDuracion(entrada: string, salida: string): number {
  const [hEntrada, mEntrada] = entrada.split(':').map(Number);
  const [hSalida, mSalida] = salida.split(':').map(Number);

  const minutosEntrada = hEntrada * 60 + mEntrada;
  const minutosSalida = hSalida * 60 + mSalida;

  return (minutosSalida - minutosEntrada) / 60;
}

export async function POST(req: NextRequest) {
  try {
    const datos: DatosTurno = await req.json();

    // Validación básica de campos requeridos
    if (
      !datos.nombre ||
      !datos.departamento ||
      !datos.fecha ||
      !datos.horaEntrada ||
      !datos.horaSalida
    ) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    // Calculamos duración
    const duracionHoras = calcularDuracion(datos.horaEntrada, datos.horaSalida);

    if (duracionHoras <= 0) {
      return NextResponse.json(
        { error: 'La hora de salida debe ser posterior a la hora de entrada' },
        { status: 400 }
      );
    }

    // Timestamp del momento en que se envía el formulario
    const marcaTemporal = new Date().toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    });

    // Fila a insertar en "Turnos limpieza 2.0"
    // El orden de columnas replica el formulario original
    const fila = [
      marcaTemporal,              // Marca temporal
      datos.nombre,               // Nombre y apellido
      datos.departamento,         // Departamento
      datos.fecha,                // Fecha del turno
      datos.horaEntrada,          // Hora de entrada
      datos.horaSalida,           // Hora de salida
      duracionHoras.toFixed(1),   // Duración calculada (ej: "2.5")
      datos.viaticos || 0,        // Viáticos
      datos.huboLavado ? 'SÍ' : 'NO', // ¿Hubo lavado?
      datos.comentarios || '',    // Comentarios adicionales
    ];

    const sheets = getSheetsClient();

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${HOJA_TURNOS}!A:J`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [fila],
      },
    });

    return NextResponse.json({ ok: true, duracionHoras });
  } catch (error) {
    console.error('Error al registrar turno:', error);
    return NextResponse.json(
      { error: 'No se pudo guardar el turno. Intentá de nuevo.' },
      { status: 500 }
    );
  }
}