// src/components/layout/admin-sidebar.tsx
// CAMBIOS: estructura plana → navegación por secciones
// Pagos movido a Finanzas, Reportes como sección propia

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
  Banknote,
  BarChart3,
  Wrench,
  BookOpen,
  CreditCard,
} from 'lucide-react'

// Tipo para ítems de navegación
type NavItem = {
  name: string
  href: string
  icon: React.ElementType
  badge?: number
}

// Tipo para secciones del menú
type NavSection = {
  label: string
  items: NavItem[]
}

// Ítems sin sección (nivel raíz)
const rootItems: NavItem[] = [
  { name: 'Dashboard',      href: '/admin/dashboard',      icon: LayoutDashboard },
  { name: 'Calendario',     href: '/admin/calendario',     icon: Calendar },
  { name: 'Departamentos',  href: '/admin/departamentos',  icon: Building },
]

// Secciones agrupadas
const sections: NavSection[] = [
  {
    label: 'Operaciones',
    items: [
      { name: 'Turnos Limpieza', href: '/admin/turnos',        icon: Sparkles },
      { name: 'Mantenimiento',   href: '/admin/mantenimiento', icon: Wrench },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      { name: 'Liquidaciones',    href: '/admin/liquidaciones', icon: TrendingUp },
      { name: 'Gastos',           href: '/admin/gastos',        icon: Receipt },
      // MOVIDO: antes estaba en Equipo → ahora en Finanzas
      { name: 'Pagos empleados',  href: '/admin/pagos',         icon: CreditCard },
    ],
  },
  {
    label: 'Reportes',
    items: [
      { name: 'Ocupación',     href: '/admin/reportes/ocupacion',     icon: BarChart3 },
      { name: 'Rentabilidad',  href: '/admin/reportes/rentabilidad',  icon: TrendingUp },
      { name: 'Equipo',        href: '/admin/reportes/equipo',        icon: BookOpen },
    ],
  },
  {
    label: 'Equipo',
    items: [
      { name: 'Empleados', href: '/admin/empleados', icon: Users },
    ],
  },
]

// Ítems secundarios (fijo al fondo)
const secondaryItems: NavItem[] = [
  { name: 'Configuración', href: '/admin/configuracion', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  const linkClass = (href: string) =>
    cn(
      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
      isActive(href)
        ? 'bg-slate-800 text-white'
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
    )

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

      {/* Navegación */}
      <nav className="flex-1 px-4 overflow-y-auto space-y-1">

        {/* Ítems raíz (sin sección) */}
        {rootItems.map((item) => (
          <Link key={item.name} href={item.href} className={linkClass(item.href)}>
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="flex-1">{item.name}</span>
            {item.badge && (
              <span className="flex items-center justify-center w-5 h-5 text-xs font-medium bg-amber-500 text-white rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ))}

        {/* Secciones agrupadas */}
        {sections.map((section) => (
          <div key={section.label} className="pt-4">
            {/* Label de sección */}
            <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {section.label}
            </p>
            {section.items.map((item) => (
              <Link key={item.name} href={item.href} className={linkClass(item.href)}>
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className="flex items-center justify-center w-5 h-5 text-xs font-medium bg-amber-500 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Configuración + logout */}
      <div className="p-4 border-t border-slate-800 space-y-1">
        {secondaryItems.map((item) => (
          <Link key={item.name} href={item.href} className={linkClass(item.href)}>
            <item.icon className="w-5 h-5 shrink-0" />
            {item.name}
          </Link>
        ))}
        <button className={cn(linkClass(''), 'w-full')}>
          <LogOut className="w-5 h-5 shrink-0" />
          Cerrar sesión
        </button>
      </div>

    </aside>
  )
}