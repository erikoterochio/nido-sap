'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

type PuestoEmpleado = 'ADMINISTRACION' | 'HOST' | 'BARISTA' | 'ENCARGADO' | 'STAFF_LIMPIEZA' | 'MANTENIMIENTO' | 'SEGURIDAD' | 'COCINERO' | 'COMUNICACION' | 'CO_HOST'
type UnidadNegocio = 'COWORK' | 'COLIVING' | 'TURISMO' | 'AMBOS' | 'GENERAL'
type TipoSueldo = 'UN_NETO' | 'DOS_NETOS' | 'NETO_MAS_BRUTO' | 'MONOTRIBUTO' | 'POR_HORA'

interface FormData {
  // Datos personales
  nombre: string
  apellido: string
  fechaNacimiento: string
  dni: string
  cuil: string
  telefono: string
  email: string
  domicilio: string
  // Datos laborales
  puesto: PuestoEmpleado | ''
  unidadNegocio: UnidadNegocio | ''
  fechaIngreso: string
  // Datos de pago
  tipoSueldo: TipoSueldo | ''
  sueldoBase: string
  precioHora: string
  horasMensuales: string
  cvuAlias: string
  // Crear usuario
  crearUsuario: boolean
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

const tiposSueldo: { value: TipoSueldo; label: string; descripcion: string }[] = [
  { value: 'POR_HORA', label: 'Por Hora', descripcion: 'Pago según horas trabajadas' },
  { value: 'MONOTRIBUTO', label: 'Monotributo', descripcion: 'Factura como monotributista' },
  { value: 'UN_NETO', label: 'Un Neto', descripcion: 'Sueldo neto único' },
  { value: 'DOS_NETOS', label: 'Dos Netos', descripcion: 'Sueldo dividido en dos pagos' },
  { value: 'NETO_MAS_BRUTO', label: 'Neto + Bruto', descripcion: 'Parte en blanco + parte en negro' },
]

export default function NuevoEmpleadoPage() {
  const router = useRouter()
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
    fechaIngreso: new Date().toISOString().split('T')[0],
    tipoSueldo: '',
    sueldoBase: '',
    precioHora: '',
    horasMensuales: '',
    cvuAlias: '',
    crearUsuario: false,
  })

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when field is updated
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
    if (!formData.fechaIngreso) newErrors.fechaIngreso = 'La fecha de ingreso es requerida'
    
    if (formData.tipoSueldo === 'POR_HORA' && !formData.precioHora) {
      newErrors.precioHora = 'El precio por hora es requerido'
    }
    if (formData.tipoSueldo && formData.tipoSueldo !== 'POR_HORA' && !formData.sueldoBase) {
      newErrors.sueldoBase = 'El sueldo base es requerido'
    }

    if (formData.crearUsuario && !formData.email) {
      newErrors.email = 'El email es requerido para crear un usuario'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // TODO: Implementar llamada a API
      const response = await fetch('/api/empleados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/equipo/empleados')
      } else {
        const data = await response.json()
        alert(data.error || 'Error al crear empleado')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear empleado')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isPorHora = formData.tipoSueldo === 'POR_HORA'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/equipo/empleados">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Empleado</h1>
          <p className="text-gray-500">Completa la información del nuevo integrante del equipo</p>
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
                      placeholder="Nombre"
                      className={cn(errors.nombre && 'border-red-500')}
                    />
                    {errors.nombre && (
                      <p className="text-xs text-red-500">{errors.nombre}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido *</Label>
                    <Input
                      id="apellido"
                      value={formData.apellido}
                      onChange={(e) => updateField('apellido', e.target.value)}
                      placeholder="Apellido"
                      className={cn(errors.apellido && 'border-red-500')}
                    />
                    {errors.apellido && (
                      <p className="text-xs text-red-500">{errors.apellido}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dni">DNI *</Label>
                    <Input
                      id="dni"
                      value={formData.dni}
                      onChange={(e) => updateField('dni', e.target.value)}
                      placeholder="12.345.678"
                      className={cn(errors.dni && 'border-red-500')}
                    />
                    {errors.dni && (
                      <p className="text-xs text-red-500">{errors.dni}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cuil">CUIL *</Label>
                    <Input
                      id="cuil"
                      value={formData.cuil}
                      onChange={(e) => updateField('cuil', e.target.value)}
                      placeholder="20-12345678-9"
                      className={cn(errors.cuil && 'border-red-500')}
                    />
                    {errors.cuil && (
                      <p className="text-xs text-red-500">{errors.cuil}</p>
                    )}
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
                        placeholder="+54 11 5555-1234"
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
                        placeholder="email@ejemplo.com"
                        className={cn("pl-9", errors.email && 'border-red-500')}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-500">{errors.email}</p>
                    )}
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
                      placeholder="Dirección completa"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Puesto *</Label>
                    <Select
                      value={formData.puesto}
                      onValueChange={(value) => updateField('puesto', value)}
                    >
                      <SelectTrigger className={cn(errors.puesto && 'border-red-500')}>
                        <SelectValue placeholder="Seleccionar puesto" />
                      </SelectTrigger>
                      <SelectContent>
                        {puestos.map(p => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.puesto && (
                      <p className="text-xs text-red-500">{errors.puesto}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Unidad de Negocio *</Label>
                    <Select
                      value={formData.unidadNegocio}
                      onValueChange={(value) => updateField('unidadNegocio', value)}
                    >
                      <SelectTrigger className={cn(errors.unidadNegocio && 'border-red-500')}>
                        <SelectValue placeholder="Seleccionar unidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {unidades.map(u => (
                          <SelectItem key={u.value} value={u.value}>
                            {u.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.unidadNegocio && (
                      <p className="text-xs text-red-500">{errors.unidadNegocio}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaIngreso">Fecha de Ingreso *</Label>
                  <div className="relative max-w-xs">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="fechaIngreso"
                      type="date"
                      value={formData.fechaIngreso}
                      onChange={(e) => updateField('fechaIngreso', e.target.value)}
                      className={cn("pl-9", errors.fechaIngreso && 'border-red-500')}
                    />
                  </div>
                  {errors.fechaIngreso && (
                    <p className="text-xs text-red-500">{errors.fechaIngreso}</p>
                  )}
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
                          <div>
                            <span>{t.label}</span>
                            <span className="text-xs text-gray-400 ml-2">({t.descripcion})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.tipoSueldo && (
                    <p className="text-xs text-red-500">{errors.tipoSueldo}</p>
                  )}
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
                              placeholder="6000"
                              className={cn("pl-7", errors.precioHora && 'border-red-500')}
                            />
                          </div>
                          {errors.precioHora && (
                            <p className="text-xs text-red-500">{errors.precioHora}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="horasMensuales">Horas Mensuales Estimadas</Label>
                          <Input
                            id="horasMensuales"
                            type="number"
                            value={formData.horasMensuales}
                            onChange={(e) => updateField('horasMensuales', e.target.value)}
                            placeholder="40"
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
                            placeholder="450000"
                            className={cn("pl-7", errors.sueldoBase && 'border-red-500')}
                          />
                        </div>
                        {errors.sueldoBase && (
                          <p className="text-xs text-red-500">{errors.sueldoBase}</p>
                        )}
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
                      placeholder="alias.mercadopago o CVU"
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    Para facilitar los pagos por transferencia
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Crear Usuario */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Acceso al Sistema</CardTitle>
                <CardDescription>
                  Crear credenciales para que el empleado pueda acceder a la app
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="crearUsuario"
                    checked={formData.crearUsuario}
                    onCheckedChange={(checked) => updateField('crearUsuario', checked as boolean)}
                  />
                  <div>
                    <Label htmlFor="crearUsuario" className="font-medium">
                      Crear usuario
                    </Label>
                    <p className="text-sm text-gray-500">
                      Se enviará un email con instrucciones para crear su contraseña
                    </p>
                  </div>
                </div>

                {formData.crearUsuario && !formData.email && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-700">
                        Debes ingresar un email para poder crear el usuario
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumen */}
            {formData.nombre && formData.apellido && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nombre:</span>
                    <span className="font-medium">{formData.nombre} {formData.apellido}</span>
                  </div>
                  {formData.puesto && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Puesto:</span>
                      <span className="font-medium">
                        {puestos.find(p => p.value === formData.puesto)?.label}
                      </span>
                    </div>
                  )}
                  {formData.unidadNegocio && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Unidad:</span>
                      <span className="font-medium">
                        {unidades.find(u => u.value === formData.unidadNegocio)?.label}
                      </span>
                    </div>
                  )}
                  {formData.tipoSueldo && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tipo sueldo:</span>
                      <span className="font-medium">
                        {tiposSueldo.find(t => t.value === formData.tipoSueldo)?.label}
                      </span>
                    </div>
                  )}
                  {isPorHora && formData.precioHora && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Precio/hora:</span>
                      <span className="font-medium">${parseInt(formData.precioHora).toLocaleString()}</span>
                    </div>
                  )}
                  {!isPorHora && formData.sueldoBase && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sueldo base:</span>
                      <span className="font-medium">${parseInt(formData.sueldoBase).toLocaleString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  'Guardando...'
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Empleado
                  </>
                )}
              </Button>
              <Link href="/equipo/empleados" className="w-full">
                <Button type="button" variant="outline" className="w-full">
                  Cancelar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
