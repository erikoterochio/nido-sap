'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Redirigir automáticamente a empleados
export default function EquipoPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/equipo/empleados')
  }, [router])
  
  return null
}
