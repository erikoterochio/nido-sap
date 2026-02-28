'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  CreditCard,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type PuestoEmpleado = 'ADMINISTRACION' | 'HOST' | 'BARISTA' | 'ENCARGADO' | 'STAFF_LIMPIEZA' | 'MANTENIMIENTO' | 'SEGURIDAD' | 'COCINERO' | 'COMUNICACION' | 'CO_HOST'
type StatusEmpleado = 'ACTIVO' | 'INACTIVO' | 'VACACIONES' | 'LICENCIA'
type UnidadNegocio = 'COWORK' | 'COLIVING' | 'TURISMO' | 'AMBOS' | 'GENERAL'
type TipoSueldo = 'UN_NETO' | 'DOS_NETOS' | 'NETO_MAS_BRUTO' | 'MONOTRIBUTO' | 'POR_HORA'

interface FormData {
  nombre: string
  apellido: string
  fechaNacimiento: string
  dni: string
  cuil: string
  telefono: string
  email: string
  domicilio: string
  puesto: PuestoEmpleado | ''
  unidadNegocio: UnidadNegocio | ''
  status: StatusEmpleado
  fechaIngreso: string
  tipoSueldo: TipoSueldo | ''
  sueldoBase: string
  precioHora: string
  horasMensuales: string
  cvuAlias: string
}

const puestos: { value: PuestoEmpleado; label: string }[] = [
  { value: 'STAFF_LIMPIEZA', label: 'Staff de Limpieza' },
  { value: 'HOST', label: 'Host' },
  { value: 'CO_HOST', label: 'Co-Host' },
  { value: 'ADMINISTRACION', label: 'Administración' },
  { value: 'ENCARGADO', label: 'Encargado/a' },
  { value: 'BARISTA', label: 'Barista' },
  { value: 'MANTENIMIENTO', label: 'Mantenimiento' },
  { value: 'SEGURIDAD', label: 'Seguridad' },
  { value: 'COCINERO', label: 'Cocinero/a' },
  { value: 'COMUNICACION', label: 'Comunicación' },
]

const unidades: { value: UnidadNegocio; label: string }[] = [
  { value: 'COLIVING', label: 'CoLiving' },
  { value: 'COWORK', label: 'CoWork' },
  { value: 'AMBOS', label: 'CoWork + CoLiving' },
  { value: 'TURISMO', label: 'Turismo' },
  { value: 'GENERAL', label: 'General' },
]

const estados: { value: StatusEmpleado; label: string }[] = [
  { value: 'ACTIVO', label: 'Activo' },
  { value: 'INACTIVO', label: 'Inactivo' },
  { value: 'VACACIONES', label: 'Vacaciones' },
  { value: 'LICENCIA', label: 'Licencia' },
]

const tiposSueldo: { value: TipoSueldo; label: string; descripcion: string }[] = [
  { value: 'POR_HORA', label: 'Por Hora', descripcion: 'Pago según horas trabajadas' },
  { value: 'MONOTRIBUTO', label: 'Monotributo', descripcion: 'Factura como monotributista' },
  { value: 'UN_NETO', label: 'Un Neto', descripcion: 'Sueldo neto único' },
  { value: 'DOS_NETOS', label: 'Dos Netos', descripcion: 'Sueldo dividido en dos pagos' },
  { value: 'NETO_MAS_BRUTO', label: 'Neto + Bruto', descripcion: 'Parte en blanco + parte en negro' },
]

// Mock data - en producción vendría de la API
const mockEmpleado = {
  id: 'emp1',
  nombre: 'Carolina',
  apellido: 'Gómez',
  email: 'carolina@benveo.com',
  telefono: '+54 11 5555-1234',
  dni: '35.456.789',
  cuil: '27-35456789-4',
  fechaNacimiento: '1990-05-15',
  domicilio: 'Av. Corrientes 1234, CABA',
  puesto: 'STAFF_LIMPIEZA' as PuestoEmpleado,
  unidadNegocio: 'COLIVING' as UnidadNegocio,
  status: 'ACTIVO' as StatusEmpleado,
  tipoSueldo: 'POR_HORA' as TipoSueldo,
  sueldoBase: null as number | null,
  precioHora: 6000,
  horasMensuales: 40,
  fechaIngreso: '2024-03-15',
  cvuAlias: 'carolina.gomez.mp',
}

export default function EditarEmpleadoPage() {
  const router = useRouter()
  const params = useParams()
  const empleadoId = params.id as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    dni: '',
    cuil: '',
    telefono: '',
    email: '',
    domicilio: '',
    puesto: '',
    unidadNegocio: '',
    status: 'ACTIVO',
    fechaIngreso: '',
    tipoSueldo: '',
    sueldoBase: '',
    precioHora: '',
    horasMensuales: '',
    cvuAlias: '',
  })

  useEffect(() => {
    // Simular carga de datos
    const loadEmpleado = async () => {
      setIsLoading(true)
      // En producción: const response = await fetch(`/api/empleados/${empleadoId}`)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const emp = mockEmpleado
      setFormData({
        nombre: emp.nombre,
        apellido: emp.apellido,
        fechaNacimiento: emp.fechaNacimiento || '',
        dni: emp.dni,
        cuil: emp.cuil,
        telefono: emp.telefono || '',
        email: emp.email || '',
        domicilio: emp.domicilio || '',
        puesto: emp.puesto,
        unidadNegocio: emp.unidadNegocio,
        status: emp.status,
        fechaIngreso: emp.fechaIngreso,
        tipoSueldo: emp.tipoSueldo,
        sueldoBase: emp.sueldoBase?.toString() || '',
        precioHora: emp.precioHora?.toString() || '',
        horasMensuales: emp.horasMensuales?.toString() || '',
        cvuAlias: emp.cvuAlias || '',
      })
      setIsLoading(false)
    }
    
    loadEmpleado()
  }, [empleadoId])

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es requerido'
    if (!formData.dni.trim()) newErrors.dni = 'El DNI es requerido'
    if (!formData.cuil.trim()) newErrors.cuil = 'El CUIL es requerido'
    if (!formData.puesto) newErrors.puesto = 'Selecciona un puesto'
    if (!formData.unidadNegocio) newErrors.unidadNegocio = 'Selecciona una unidad de negocio'
    if (!formData.tipoSueldo) newErrors.tipoSueldo = 'Selecciona un tipo de sueldo'
    
    if (formData.tipoSueldo === 'POR_HORA' && !formData.precioHora) {
      newErrors.precioHora = 'El precio por hora es requerido'
    }
    if (formData.tipoSueldo && formData.tipoSueldo !== 'POR_HORA' && !formData.sueldoBase) {
      newErrors.sueldoBase = 'El sueldo base es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/empleados/${empleadoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push(`/equipo/empleados/${empleadoId}`)
      } else {
        const data = await response.json()
        alert(data.error || 'Error al actualizar empleado')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar empleado')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isPorHora = formData.tipoSueldo === 'POR_HORA'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/equipo/empleados/${empleadoId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Empleado</h1>
          <p className="text-gray-500">{formData.nombre} {formData.apellido}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Datos Personales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Datos Personales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => updateField('nombre', e.target.value)}
                      className={cn(errors.nombre && 'border-red-500')}
                    />
                    {errors.nombre && <p className="text-xs text-red-500">{errors.nombre}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido *</Label>
                    <Input
                      id="apellido"
                      value={formData.apellido}
                      onChange={(e) => updateField('apellido', e.target.value)}
                      className={cn(errors.apellido && 'border-red-500')}
                    />
                    {errors.apellido && <p className="text-xs text-red-500">{errors.apellido}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dni">DNI *</Label>
                    <Input
                      id="dni"
                      value={formData.dni}
                      onChange={(e) => updateField('dni', e.target.value)}
                      className={cn(errors.dni && 'border-red-500')}
                    />
                    {errors.dni && <p className="text-xs text-red-500">{errors.dni}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cuil">CUIL *</Label>
                    <Input
                      id="cuil"
                      value={formData.cuil}
                      onChange={(e) => updateField('cuil', e.target.value)}
                      className={cn(errors.cuil && 'border-red-500')}
                    />
                    {errors.cuil && <p className="text-xs text-red-500">{errors.cuil}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                    <Input
                      id="fechaNacimiento"
                      type="date"
                      value={formData.fechaNacimiento}
                      onChange={(e) => updateField('fechaNacimiento', e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="telefono"
                        value={formData.telefono}
                        onChange={(e) => updateField('telefono', e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domicilio">Domicilio</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="domicilio"
                      value={formData.domicilio}
                      onChange={(e) => updateField('domicilio', e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Datos Laborales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Datos Laborales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Puesto *</Label>
                    <Select
                      value={formData.puesto}
                      onValueChange={(value) => updateField('puesto', value)}
                    >
                      <SelectTrigger className={cn(errors.puesto && 'border-red-500')}>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {puestos.map(p => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.puesto && <p className="text-xs text-red-500">{errors.puesto}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Unidad de Negocio *</Label>
                    <Select
                      value={formData.unidadNegocio}
                      onValueChange={(value) => updateField('unidadNegocio', value)}
                    >
                      <SelectTrigger className={cn(errors.unidadNegocio && 'border-red-500')}>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {unidades.map(u => (
                          <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.unidadNegocio && <p className="text-xs text-red-500">{errors.unidadNegocio}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => updateField('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map(e => (
                          <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaIngreso">Fecha de Ingreso</Label>
                  <div className="relative max-w-xs">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="fechaIngreso"
                      type="date"
                      value={formData.fechaIngreso}
                      onChange={(e) => updateField('fechaIngreso', e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Datos de Pago */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Datos de Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Sueldo *</Label>
                  <Select
                    value={formData.tipoSueldo}
                    onValueChange={(value) => updateField('tipoSueldo', value)}
                  >
                    <SelectTrigger className={cn(errors.tipoSueldo && 'border-red-500')}>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposSueldo.map(t => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label} <span className="text-gray-400">({t.descripcion})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.tipoSueldo && <p className="text-xs text-red-500">{errors.tipoSueldo}</p>}
                </div>

                {formData.tipoSueldo && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {isPorHora ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="precioHora">Precio por Hora *</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                            <Input
                              id="precioHora"
                              type="number"
                              value={formData.precioHora}
                              onChange={(e) => updateField('precioHora', e.target.value)}
                              className={cn("pl-7", errors.precioHora && 'border-red-500')}
                            />
                          </div>
                          {errors.precioHora && <p className="text-xs text-red-500">{errors.precioHora}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="horasMensuales">Horas Mensuales Estimadas</Label>
                          <Input
                            id="horasMensuales"
                            type="number"
                            value={formData.horasMensuales}
                            onChange={(e) => updateField('horasMensuales', e.target.value)}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="sueldoBase">Sueldo Base Mensual *</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                          <Input
                            id="sueldoBase"
                            type="number"
                            value={formData.sueldoBase}
                            onChange={(e) => updateField('sueldoBase', e.target.value)}
                            className={cn("pl-7", errors.sueldoBase && 'border-red-500')}
                          />
                        </div>
                        {errors.sueldoBase && <p className="text-xs text-red-500">{errors.sueldoBase}</p>}
                      </div>
                    )}
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="cvuAlias">CVU / Alias de Pago</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="cvuAlias"
                      value={formData.cvuAlias}
                      onChange={(e) => updateField('cvuAlias', e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Guardar Cambios</CardTitle>
                <CardDescription>
                  Revisa los cambios antes de guardar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
                <Link href={`/equipo/empleados/${empleadoId}`} className="block">
                  <Button type="button" variant="outline" className="w-full">
                    Cancelar
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {formData.status === 'INACTIVO' && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-yellow-800">Estado Inactivo</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        El empleado no podrá ser asignado a nuevos turnos mientras esté inactivo.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
