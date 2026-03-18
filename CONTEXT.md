# Nido SAP — Estado del Proyecto
Repositorio: https://github.com/erikoterochio/nido-sap

## ¿Qué es esto?
CRM web para gestión de departamentos de alquiler temporal (CoLiving - Benveo).
Reemplaza un sistema de Google Sheets + Forms + AppScript.

## Stack técnico
- Framework: Next.js (TypeScript)
- ORM: Prisma
- Base de datos: Supabase (PostgreSQL) — región São Paulo
- Auth: NextAuth.js
- Estilos: Tailwind CSS + shadcn/ui
- Deploy: Vercel
- Repo: https://github.com/erikoterochio/nido-sap

## Estructura de carpetas
src/
├── app/
│   ├── admin/         # Vistas de administración
│   │   ├── dashboard/
│   │   ├── turnos/
│   │   └── liquidaciones/
│   ├── staff/         # Vistas para staff de limpieza
│   │   ├── registrar/
│   │   ├── historial/
│   │   └── perfil/
│   └── api/           # API Backend
├── components/        # Componentes reutilizables
└── lib/               # Utilidades
prisma/
├── schema.prisma      # Modelo de datos
└── seed.ts            # Datos de ejemplo
schema.sql             # Schema para Supabase

## Usuarios de prueba
- Admin: juana@benveo.net / admin123
- Staff: sandra@benveo.net / 1234

## Funcionalidades — Estado actual

### ✅ Admin (base armada)
- Dashboard con KPIs mensuales
- Lista de turnos con detección de errores
- Edición de turnos con historial de cambios
- P&L por departamento
- Gráficos de evolución

### 🔲 Admin (pendiente)
- Gestión de empleados
- Configuración de feriados y fines de semana
- Exportación PDF

### ✅ Staff limpieza (base armada)
- Registro de turnos (formato 24hs)
- Registro de gastos
- Historial de turnos y pagos
- Vista de saldo pendiente
- Perfil personal

## Reglas de negocio clave
- Feriados/fines de semana los define el admin (no automático)
- El sistema detecta turnos con duración inusual (>8 horas)
- Todos los cambios quedan en historial de auditoría
- Soft delete — los datos nunca se eliminan
- Los tipos de gastos son dinámicos (se agregan desde backoffice)
- El historial de pagos debe mostrar anticipos y saldos negativos
- El staff puede ver si tiene pagos pendientes o saldos negativos

## Comandos útiles
npm run dev          # Servidor local
npm run db:push      # Sincronizar schema con DB
npm run db:generate  # Generar cliente Prisma
npm run db:studio    # Abrir Prisma Studio (GUI)
npm run db:seed      # Cargar datos de ejemplo
npm run build        # Compilar para producción
```

---

## Instrucciones del Proyecto para Claude

Y esto va en el campo **"Project Instructions"** cuando crees el proyecto en Claude.ai:
```
Estoy construyendo un CRM web llamado "Nido SAP" para gestión de 
departamentos de alquiler temporal (CoLiving - Benveo).

Stack: Next.js + TypeScript + Prisma + Supabase + NextAuth + Tailwind + shadcn/ui
Repo: https://github.com/erikoterochio/nido-sap

Reglas para trabajar:
- Trabajamos módulo por módulo, un tema por conversación
- Todo el código va en TypeScript
- Los comentarios y nombres de variables en español
- Ante cualquier duda, preguntá antes de asumir
- Cuando modifiques un archivo, indicá claramente qué cambió y por qué
- El CONTEXT.md está subido al proyecto y refleja el estado actual

Negocio:
- Hay dos roles: Admin y Staff de limpieza
- Los feriados/fines de semana los define el admin
- Los datos nunca se eliminan (soft delete)
- Es crítico evitar errores en la carga y poder corregirlos fácilmente
