'use client'

import { User, Phone, Mail, CreditCard, LogOut, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const userData = {
  nombre: 'Sandra Lastra',
  email: 'sandramarcelalastra74@gmail.com',
  telefono: '11 3341-6158',
  cvuAlias: 'vaso.cebra.anafe.mp',
  precioHoraNormal: 6000,
  precioHoraFinde: 7000,
}

export default function PerfilPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b">
        <h1 className="text-xl font-semibold text-slate-900">Mi Perfil</h1>
      </div>

      <div className="px-6 py-6 space-y-4">
        {/* Avatar y nombre */}
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">{userData.nombre}</h2>
          <p className="text-slate-500">Staff Limpieza</p>
        </div>

        {/* Info de contacto */}
        <Card>
          <CardContent className="p-0 divide-y">
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Mail className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500">Email</p>
                <p className="text-slate-900">{userData.email}</p>
              </div>
            </div>
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Phone className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500">Teléfono</p>
                <p className="text-slate-900">{userData.telefono}</p>
              </div>
            </div>
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500">CVU / Alias</p>
                <p className="text-slate-900">{userData.cvuAlias}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tarifas */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-slate-900 mb-3">Mis Tarifas</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Hora normal (Lun-Vie)</span>
                <span className="font-medium">${userData.precioHoraNormal.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Hora finde/feriado</span>
                <span className="font-medium">${userData.precioHoraFinde.toLocaleString('es-AR')}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Las tarifas son definidas por administración
            </p>
          </CardContent>
        </Card>

        {/* Cerrar sesión */}
        <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
          <LogOut className="w-5 h-5 mr-2" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  )
}
