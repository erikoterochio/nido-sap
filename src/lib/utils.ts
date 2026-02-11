import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: 'ARS' | 'USD' = 'ARS'): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(amount)
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) return `${h}hs`
  return `${h}hs ${m}min`
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatTime(time: string): string {
  return time.slice(0, 5) // "HH:MM"
}

export function calculateDuration(entrada: string, salida: string): number {
  const [hE, mE] = entrada.split(':').map(Number)
  const [hS, mS] = salida.split(':').map(Number)
  const minutosEntrada = hE * 60 + mE
  const minutosSalida = hS * 60 + mS
  return (minutosSalida - minutosEntrada) / 60
}

export function getFirstDayOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function getMonthName(date: Date): string {
  return date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
}
