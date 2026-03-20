// src/lib/google-sheets.ts
// Cliente autenticado para interactuar con Google Sheets API
 
import { google } from 'googleapis';
 
/**
 * Devuelve una instancia autenticada de Google Sheets
 * usando las credenciales de la Service Account guardadas en variables de entorno
 */
export function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
 
  return google.sheets({ version: 'v4', auth });
}
 
// ID del Google Sheet principal (de la URL del sheet)
export const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
 
// Nombres exactos de las hojas
export const HOJA_INFO_FORM = 'Info - Form gastos';
export const HOJA_TURNOS = 'Turnos limpieza 2.0';
 