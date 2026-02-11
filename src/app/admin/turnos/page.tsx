'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Esta página redirige automáticamente a la primera pestaña
export default function TurnosPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/admin/turnos/pagos-semana')
  }, [router])

  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}
