import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'ARS') {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions) {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }
  return new Date(dateStr).toLocaleDateString('es-AR', options || defaultOptions)
}

export function isValidTime(time: string): boolean {
  const regex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/
  return regex.test(time)
}

export function calculateDuration(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  
  const diff = endMinutes - startMinutes
  return diff > 0 ? diff / 60 : (diff + 24 * 60) / 60
}

export function formatDuration(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}