'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  iconColor?: string
  iconBgColor?: string
  valueColor?: string
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  action?: React.ReactNode
  className?: string
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-gray-600',
  iconBgColor = 'bg-gray-100',
  valueColor,
  trend,
  action,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={cn("p-2 rounded-lg", iconBgColor)}>
                <Icon className={cn("h-5 w-5", iconColor)} />
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">{title}</p>
              <p className={cn("text-xl font-bold", valueColor)}>{value}</p>
              {subtitle && (
                <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          
          {(trend || action) && (
            <div className="text-right">
              {trend && (
                <div className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}>
                  {trend.isPositive ? '↑' : '↓'} {trend.value}%
                  <span className="text-gray-400 ml-1">{trend.label}</span>
                </div>
              )}
              {action}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface EmpleadoAvatarProps {
  nombre: string
  apellido: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function EmpleadoAvatar({ nombre, apellido, size = 'md', className }: EmpleadoAvatarProps) {
  const initials = `${nombre[0]}${apellido[0]}`.toUpperCase()
  
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  }
  
  return (
    <div className={cn(
      "rounded-full bg-primary/10 text-primary font-medium flex items-center justify-center",
      sizeClasses[size],
      className
    )}>
      {initials}
    </div>
  )
}

// Badge configs for reuse
export const puestoConfig: Record<string, { label: string; color: string }> = {
  STAFF_LIMPIEZA: { label: 'Limpieza', color: 'bg-blue-100 text-blue-800' },
  HOST: { label: 'Host', color: 'bg-purple-100 text-purple-800' },
  CO_HOST: { label: 'Co-Host', color: 'bg-purple-100 text-purple-800' },
  ADMINISTRACION: { label: 'Administración', color: 'bg-gray-100 text-gray-800' },
  MANTENIMIENTO: { label: 'Mantenimiento', color: 'bg-orange-100 text-orange-800' },
  ENCARGADO: { label: 'Encargado/a', color: 'bg-green-100 text-green-800' },
  BARISTA: { label: 'Barista', color: 'bg-amber-100 text-amber-800' },
  SEGURIDAD: { label: 'Seguridad', color: 'bg-red-100 text-red-800' },
  COCINERO: { label: 'Cocinero/a', color: 'bg-yellow-100 text-yellow-800' },
  COMUNICACION: { label: 'Comunicación', color: 'bg-pink-100 text-pink-800' },
}

export const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVO: { label: 'Activo', color: 'bg-green-100 text-green-800' },
  INACTIVO: { label: 'Inactivo', color: 'bg-gray-100 text-gray-800' },
  VACACIONES: { label: 'Vacaciones', color: 'bg-yellow-100 text-yellow-800' },
  LICENCIA: { label: 'Licencia', color: 'bg-blue-100 text-blue-800' },
}

export const unidadConfig: Record<string, { label: string; color: string }> = {
  COWORK: { label: 'CoWork', color: 'text-blue-600' },
  COLIVING: { label: 'CoLiving', color: 'text-green-600' },
  TURISMO: { label: 'Turismo', color: 'text-purple-600' },
  AMBOS: { label: 'CoWork + CoLiving', color: 'text-orange-600' },
  GENERAL: { label: 'General', color: 'text-gray-600' },
}

// Utility functions
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
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

export function calcularAntiguedad(fechaIngreso: string): string {
  const ingreso = new Date(fechaIngreso)
  const hoy = new Date()
  const meses = (hoy.getFullYear() - ingreso.getFullYear()) * 12 + (hoy.getMonth() - ingreso.getMonth())
  
  if (meses < 1) return 'Menos de un mes'
  if (meses < 12) return `${meses} meses`
  
  const años = Math.floor(meses / 12)
  const mesesRestantes = meses % 12
  
  if (mesesRestantes === 0) {
    return `${años} año${años > 1 ? 's' : ''}`
  }
  return `${años} año${años > 1 ? 's' : ''} y ${mesesRestantes} mes${mesesRestantes > 1 ? 'es' : ''}`
}
