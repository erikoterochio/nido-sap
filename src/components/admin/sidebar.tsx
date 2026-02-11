"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  ChevronDown,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Departamentos",
    href: "/admin/departamentos",
    icon: Building,
  },
  {
    name: "Turnos Limpieza",
    href: "/admin/turnos",
    icon: Sparkles,
    badge: 3, // Para mostrar alertas
  },
  {
    name: "Gastos",
    href: "/admin/gastos",
    icon: Receipt,
  },
  {
    name: "P&L",
    href: "/admin/pl",
    icon: TrendingUp,
  },
  {
    name: "Liquidaciones",
    href: "/admin/liquidaciones",
    icon: Calendar,
  },
  {
    name: "Empleados",
    href: "/admin/empleados",
    icon: Users,
  },
];

const secondaryNavigation = [
  {
    name: "Configuración",
    href: "/admin/configuracion",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-gray-900 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
        <div className="flex items-center justify-center w-10 h-10 bg-brand-600 rounded-xl">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-white">Benveo</p>
          <p className="text-xs text-gray-400">CoLiving</p>
        </div>
      </div>

      {/* Navegación principal */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className="flex items-center justify-center w-5 h-5 text-xs font-medium bg-amber-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Navegación secundaria */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-1">
        {secondaryNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Usuario */}
      <div className="px-3 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">JL</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Juana López</p>
            <p className="text-xs text-gray-400 truncate">Admin</p>
          </div>
          <button className="text-gray-400 hover:text-white">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
