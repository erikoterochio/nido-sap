-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.anticipo (
  id text NOT NULL,
  empleadoId text NOT NULL,
  fecha date NOT NULL,
  monto numeric NOT NULL,
  motivo text,
  estado USER-DEFINED NOT NULL DEFAULT 'PENDIENTE'::"EstadoAnticipo",
  descontadoEn date,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT anticipo_pkey PRIMARY KEY (id),
  CONSTRAINT Anticipo_empleadoId_fkey FOREIGN KEY (empleadoId) REFERENCES public.empleado(id)
);
CREATE TABLE public.auditlog (
  id text NOT NULL,
  usuarioId text NOT NULL,
  accion text NOT NULL,
  entidad text,
  entidadId text,
  detalles jsonb,
  ip text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT auditlog_pkey PRIMARY KEY (id),
  CONSTRAINT AuditLog_usuarioId_fkey FOREIGN KEY (usuarioId) REFERENCES public.usuario(id)
);
CREATE TABLE public.configuracion (
  id text NOT NULL,
  clave text NOT NULL,
  valor jsonb NOT NULL,
  descripcion text,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT configuracion_pkey PRIMARY KEY (id)
);
CREATE TABLE public.departamento (
  id text NOT NULL,
  nombre text NOT NULL,
  direccion text,
  duenos ARRAY,
  mailDueno text,
  comisionPorcentaje numeric NOT NULL DEFAULT 0.20,
  quienPagaServicios USER-DEFINED NOT NULL DEFAULT 'BENVEO'::"ResponsableServicios",
  descuentoBajarDinero boolean NOT NULL DEFAULT false,
  limpiezasIncluidas boolean NOT NULL DEFAULT false,
  airbnbId text,
  estado USER-DEFINED NOT NULL DEFAULT 'ACTIVO'::"EstadoDepartamento",
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT departamento_pkey PRIMARY KEY (id)
);
CREATE TABLE public.diaespecial (
  id text NOT NULL,
  fecha date NOT NULL,
  tipo USER-DEFINED NOT NULL,
  descripcion text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT diaespecial_pkey PRIMARY KEY (id)
);
CREATE TABLE public.empleado (
  id text NOT NULL,
  usuarioId text,
  nombre text NOT NULL,
  apellido text NOT NULL,
  dni text,
  telefono text,
  email text,
  precioHoraNormal numeric NOT NULL DEFAULT 6000,
  precioHoraFinde numeric NOT NULL DEFAULT 7000,
  cvuAlias text,
  saldoPendiente numeric NOT NULL DEFAULT 0,
  activo boolean NOT NULL DEFAULT true,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT empleado_pkey PRIMARY KEY (id),
  CONSTRAINT Empleado_usuarioId_fkey FOREIGN KEY (usuarioId) REFERENCES public.usuario(id)
);
CREATE TABLE public.gasto (
  id text NOT NULL,
  departamentoId text NOT NULL,
  empleadoId text NOT NULL,
  tipoGastoId text NOT NULL,
  fecha date NOT NULL,
  monto numeric NOT NULL,
  quienPago USER-DEFINED NOT NULL,
  comentarios text,
  mes date NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT gasto_pkey PRIMARY KEY (id),
  CONSTRAINT Gasto_departamentoId_fkey FOREIGN KEY (departamentoId) REFERENCES public.departamento(id),
  CONSTRAINT Gasto_empleadoId_fkey FOREIGN KEY (empleadoId) REFERENCES public.empleado(id),
  CONSTRAINT Gasto_tipoGastoId_fkey FOREIGN KEY (tipoGastoId) REFERENCES public.tipogasto(id)
);
CREATE TABLE public.historialcambio (
  id text NOT NULL,
  entidad text NOT NULL,
  entidadId text NOT NULL,
  campoModificado text NOT NULL,
  valorAnterior text,
  valorNuevo text,
  motivo text NOT NULL,
  comentario text,
  usuarioId text NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT historialcambio_pkey PRIMARY KEY (id),
  CONSTRAINT historial_turno FOREIGN KEY (entidadId) REFERENCES public.turno(id),
  CONSTRAINT historial_gasto FOREIGN KEY (entidadId) REFERENCES public.gasto(id)
);
CREATE TABLE public.ingresomensual (
  id text NOT NULL,
  departamentoId text NOT NULL,
  mes date NOT NULL,
  ingresoBrutoUSD numeric NOT NULL,
  fuente text,
  notas text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT ingresomensual_pkey PRIMARY KEY (id),
  CONSTRAINT IngresoMensual_departamentoId_fkey FOREIGN KEY (departamentoId) REFERENCES public.departamento(id)
);
CREATE TABLE public.liquidacion (
  id text NOT NULL,
  departamentoId text NOT NULL,
  mes date NOT NULL,
  ingresoBrutoUSD numeric NOT NULL,
  comisionPorcentaje numeric NOT NULL,
  comisionMonto numeric NOT NULL,
  ingresoNetoUSD numeric NOT NULL,
  gastosServicios numeric NOT NULL DEFAULT 0,
  detalleServicios jsonb,
  gastosLimpiezaTurnos numeric NOT NULL DEFAULT 0,
  gastosLimpiezaInsumos numeric NOT NULL DEFAULT 0,
  gastosLimpiezaOtros numeric NOT NULL DEFAULT 0,
  totalHorasLimpieza numeric NOT NULL DEFAULT 0,
  gastosMantenimiento numeric NOT NULL DEFAULT 0,
  gastosReposicion numeric NOT NULL DEFAULT 0,
  gastosOtros numeric NOT NULL DEFAULT 0,
  totalGastosARS numeric NOT NULL,
  tipoCambio numeric NOT NULL,
  totalGastosUSD numeric NOT NULL,
  saldoLiquidacionUSD numeric NOT NULL,
  saldoLiquidacionARS numeric NOT NULL,
  estado USER-DEFINED NOT NULL DEFAULT 'BORRADOR'::"EstadoLiquidacion",
  fechaAprobacion timestamp without time zone,
  fechaEnvio timestamp without time zone,
  fechaPago timestamp without time zone,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT liquidacion_pkey PRIMARY KEY (id),
  CONSTRAINT Liquidacion_departamentoId_fkey FOREIGN KEY (departamentoId) REFERENCES public.departamento(id)
);
CREATE TABLE public.pagoempleado (
  id text NOT NULL,
  empleadoId text NOT NULL,
  fecha date NOT NULL,
  monto numeric NOT NULL,
  concepto text NOT NULL,
  periodo text,
  metodoPago text,
  comprobante text,
  notas text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT pagoempleado_pkey PRIMARY KEY (id),
  CONSTRAINT PagoEmpleado_empleadoId_fkey FOREIGN KEY (empleadoId) REFERENCES public.empleado(id)
);
CREATE TABLE public.tipogasto (
  id text NOT NULL,
  nombre text NOT NULL,
  categoria USER-DEFINED NOT NULL,
  esServicio boolean NOT NULL DEFAULT false,
  activo boolean NOT NULL DEFAULT true,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT tipogasto_pkey PRIMARY KEY (id)
);
CREATE TABLE public.turno (
  id text NOT NULL,
  departamentoId text NOT NULL,
  empleadoId text NOT NULL,
  fecha date NOT NULL,
  horaEntrada text NOT NULL,
  horaSalida text NOT NULL,
  duracionHoras numeric NOT NULL,
  viaticos numeric NOT NULL DEFAULT 0,
  esFeriadoFinde boolean NOT NULL DEFAULT false,
  comentarios text,
  precioHora numeric NOT NULL,
  montoTotal numeric NOT NULL,
  mes date NOT NULL,
  estado USER-DEFINED NOT NULL DEFAULT 'PENDIENTE_REVISION'::"EstadoTurno",
  alertas ARRAY,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT turno_pkey PRIMARY KEY (id),
  CONSTRAINT TurnoLimpieza_departamentoId_fkey FOREIGN KEY (departamentoId) REFERENCES public.departamento(id),
  CONSTRAINT TurnoLimpieza_empleadoId_fkey FOREIGN KEY (empleadoId) REFERENCES public.empleado(id)
);
CREATE TABLE public.usuario (
  id text NOT NULL,
  email text NOT NULL,
  passwordHash text NOT NULL,
  nombre text NOT NULL,
  rol USER-DEFINED NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT usuario_pkey PRIMARY KEY (id)
);