'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Building2,
  ClipboardList,
  Sparkles,
  DollarSign,
  Users,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children?: { label: string; href: string }[]
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Calendario',
    href: '/calendario',
    icon: Calendar,
  },
  {
    label: 'Departamentos',
    href: '/departamentos',
    icon: Building2,
  },
  {
    label: 'Reservas',
    href: '/reservas',
    icon: ClipboardList,
  },
  {
    label: 'Operaciones',
    href: '/operaciones',
    icon: Sparkles,
    children: [
      { label: 'Turnos Limpieza', href: '/operaciones/turnos' },
      { label: 'Mantenimiento', href: '/operaciones/mantenimiento' },
    ],
  },
  {
    label: 'Finanzas',
    href: '/finanzas',
    icon: DollarSign,
    children: [
      { label: 'Liquidaciones', href: '/finanzas/liquidaciones' },
      { label: 'Gastos', href: '/finanzas/gastos' },
      { label: 'Reportes', href: '/finanzas/reportes' },
    ],
  },
  {
    label: 'Equipo',
    href: '/equipo',
    icon: Users,
    children: [
      { label: 'Empleados', href: '/equipo/empleados' },
      { label: 'Pagos', href: '/equipo/pagos' },
    ],
  },
  {
    label: 'Configuración',
    href: '/configuracion',
    icon: Settings,
  },
]

function NavItemComponent({ item, isCollapsed }: { item: NavItem; isCollapsed: boolean }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
  const hasChildren = item.children && item.children.length > 0

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            isActive
              ? 'bg-primary/10 text-primary'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          )}
        >
          <item.icon className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  isOpen && 'rotate-180'
                )}
              />
            </>
          )}
        </button>
        {!isCollapsed && isOpen && (
          <div className="ml-8 mt-1 space-y-1">
            {item.children!.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  'block px-3 py-2 rounded-lg text-sm transition-colors',
                  pathname === child.href
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                )}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      <item.icon className="h-5 w-5 flex-shrink-0" />
      {!isCollapsed && <span>{item.label}</span>}
    </Link>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">Nido</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {navItems.map((item) => (
            <NavItemComponent key={item.href} item={item} isCollapsed={isCollapsed} />
          ))}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 bg-white">
          <div className={cn(
            'flex items-center gap-3',
            isCollapsed && 'justify-center'
          )}>
            <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">AD</span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Admin</p>
                <p className="text-xs text-gray-500 truncate">admin@benveo.com</p>
              </div>
            )}
            {!isCollapsed && (
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn(
        'transition-all duration-300',
        isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      )}>
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden lg:block">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
