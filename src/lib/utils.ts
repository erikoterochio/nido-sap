import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- Helpers usados por páginas admin/staff ---

export function formatCurrency(
  value: number,
  currency: string = "ARS",
  locale: string = "es-AR"
) {
  const n = Number(value ?? 0)
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatDate(
  date: Date | string | number,
  locale: string = "es-AR"
) {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ""
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d)
}

export function isValidTime(value: string) {
  // "HH:MM" 00:00–23:59
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value)
}

export function calculateDuration(start: string, end: string) {
  // retorna minutos (puede ser 0 si inválido)
  if (!isValidTime(start) || !isValidTime(end)) return 0
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  const startMin = sh * 60 + sm
  const endMin = eh * 60 + em
  return Math.max(0, endMin - startMin)
}

export function formatDuration(totalMinutes: number) {
  const m = Math.max(0, Math.floor(Number(totalMinutes || 0)))
  const h = Math.floor(m / 60)
  const mm = m % 60
  if (h === 0) return `${mm} min`
  return `${h} h ${mm} min`
}
