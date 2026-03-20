// src/app/api/form-options/route.ts
// Endpoint GET: devuelve empleadas, departamentos y límites de horas
// Fuente: hoja "Info - Form gastos"

import { NextResponse } from 'next/server';
import { getSheetsClient, SHEET_ID, HOJA_INFO_FORM } from '@/lib/google-sheets';

export interface LimiteDepartamento {
  nombre: string;
  limiteHoras: number;
  permiteExcederConLavado: boolean;
}

export interface OpcionesFormulario {
  empleadas: string[];
  departamentos: string[];
  limites: LimiteDepartamento[];
}

export async function GET() {
  try {
    const sheets = getSheetsClient();

    // Leemos las columnas que necesitamos en una sola llamada
    // AF = empleadas, AH = departamentos, AN:AP = límites y notas
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SHEET_ID,
      ranges: [
        `${HOJA_INFO_FORM}!AI2:AI`,  // Nombre Form (empleadas activas)
        `${HOJA_INFO_FORM}!AF2:AF`,  // Departamentos activos
        `${HOJA_INFO_FORM}!AN2:AP`,  // depto_limite | limite_horas | notas
      ],
    });

    const [rangoEmpleadas, rangoDepartamentos, rangoLimites] =
      response.data.valueRanges ?? [];

    // Filtramos celdas vacías y aplanamos el array de arrays
    const empleadas = (rangoEmpleadas?.values ?? [])
      .flat()
      .filter((v): v is string => !!v && v.trim() !== '');

    const departamentos = (rangoDepartamentos?.values ?? [])
      .flat()
      .filter((v): v is string => !!v && v.trim() !== '');

    // Construimos la lista de límites por departamento
    const limites: LimiteDepartamento[] = (rangoLimites?.values ?? [])
      .filter((fila) => fila[0] && fila[1]) // necesitamos nombre y límite
      .map((fila) => ({
        nombre: String(fila[0]).trim(),
        limiteHoras: parseFloat(String(fila[1])),
        permiteExcederConLavado: String(fila[2] ?? '')
          .toLowerCase()
          .includes('hay que lavar'),
      }));

    const opciones: OpcionesFormulario = {
      empleadas,
      departamentos,
      limites,
    };

    return NextResponse.json(opciones);
  } catch (error) {
    console.error('Error al leer opciones del formulario:', error);
    return NextResponse.json(
      { error: 'No se pudieron cargar las opciones del formulario' },
      { status: 500 }
    );
  }
}