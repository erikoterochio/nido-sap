'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Building2,
  LayoutDashboard,
  Building,
  Sparkles,
  Receipt,
  TrendingUp,
  Users,
  Settings,
  LogOut,
  Calendar,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Departamentos', href: '/admin/departamentos', icon: Building },
  { name: 'Turnos Limpieza', href: '/admin/turnos', icon: Sparkles },
  { name: 'Gastos', href: '/admin/gastos', icon: Receipt },
  { name: 'P&L', href: '/admin/liquidaciones', icon: TrendingUp },
  { name: 'Empleados', href: '/admin/empleados', icon: Users },
  { name: 'Calendario', href: '/admin/configuracion', icon: Calendar },
  { name: 'Configuración', href: '/admin/configuracion/general', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-6">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold">Benveo</p>
            <p className="text-xs text-slate-400">CoLiving</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors w-full">
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
