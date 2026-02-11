'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ClipboardList, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Inicio', href: '/staff/registrar', icon: Home },
  { name: 'Historial', href: '/staff/historial', icon: ClipboardList },
  { name: 'Perfil', href: '/staff/perfil', icon: User },
]

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Main content */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-area-pb">
        <div className="flex justify-around">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center py-3 px-6 transition-colors',
                  isActive ? 'text-primary' : 'text-slate-400'
                )}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
