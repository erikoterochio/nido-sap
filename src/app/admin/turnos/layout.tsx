'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Clock, DollarSign, FileText, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  {
    id: 'pagos-semana',
    name: 'Pagos de la Semana',
    icon: DollarSign,
    href: '/admin/turnos/pagos-semana',
  },
  {
    id: 'historial-pagos',
    name: 'Histórico de Pagos',
    icon: FileText,
    href: '/admin/turnos/historial-pagos',
  },
  {
    id: 'detalle-horas',
    name: 'Detalle de Horas',
    icon: Clock,
    href: '/admin/turnos/detalle-horas',
  },
  {
    id: 'configuracion',
    name: 'Configuración',
    icon: Settings,
    href: '/admin/turnos/configuracion',
  },
]

export default function TurnosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Turnos y Horas</h1>
        <p className="text-slate-500">Gestión de turnos, pagos y horas del equipo de limpieza y mantenimiento</p>
      </div>

      {/* Tabs de navegación */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || 
            (pathname === '/admin/turnos' && tab.id === 'pagos-semana')
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </Link>
          )
        })}
      </div>

      {children}
    </div>
  )
}
