# Benveo CoLiving

Sistema de gestión para CoLiving - MVP enfocado en reportería P&L y liquidaciones de limpieza.

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+ instalado
- Cuenta en [Supabase](https://supabase.com) (gratis)
- Cuenta en [GitHub](https://github.com) (gratis)
- Cuenta en [Vercel](https://vercel.com) (gratis)

### 1. Configurar Base de Datos (Supabase)

1. Crear cuenta en https://supabase.com
2. Crear nuevo proyecto (región: São Paulo)
3. Guardar la contraseña de la base de datos
4. Ir a **Settings > Database > Connection string > URI**
5. Copiar el connection string

### 2. Configurar el Proyecto Local

```bash
# Clonar o descomprimir el proyecto
cd benveo-coliving

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env.local
```

Editar `.env.local` con tus datos:
```env
DATABASE_URL="postgresql://postgres:[TU_PASSWORD]@db.[TU_PROJECT].supabase.co:5432/postgres"
NEXTAUTH_SECRET="generar-con-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Inicializar Base de Datos

```bash
# Crear las tablas
npm run db:push

# Generar cliente Prisma
npm run db:generate

# Cargar datos de ejemplo
npm run db:seed
```

### 4. Ejecutar en Desarrollo

```bash
npm run dev
```

Abrir http://localhost:3000

**Usuarios de prueba:**
- Admin: `juana@benveo.net` / `admin123`
- Staff: `sandra@benveo.net` / `1234`

### 5. Deploy a Producción (Vercel)

```bash
# Crear repositorio en GitHub (privado)
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/benveo-coliving.git
git push -u origin main
```

En Vercel:
1. "Add New Project"
2. Importar desde GitHub
3. Agregar variables de entorno:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (tu-dominio.vercel.app)
4. Deploy

## 📁 Estructura del Proyecto

```
benveo-coliving/
├── prisma/
│   ├── schema.prisma     # Modelo de datos
│   └── seed.ts           # Datos de ejemplo
├── src/
│   ├── app/
│   │   ├── admin/        # Vistas de administración
│   │   │   ├── dashboard/
│   │   │   ├── turnos/
│   │   │   └── liquidaciones/
│   │   ├── staff/        # Vistas para staff limpieza
│   │   │   ├── registrar/
│   │   │   ├── historial/
│   │   │   └── perfil/
│   │   └── api/          # API Backend
│   ├── components/       # Componentes reutilizables
│   └── lib/              # Utilidades
└── public/               # Archivos estáticos
```

## 🎯 Funcionalidades MVP

### Admin
- [x] Dashboard con KPIs mensuales
- [x] Lista de turnos con detección de errores
- [x] Edición de turnos con historial de cambios
- [x] P&L por departamento
- [x] Gráficos de evolución
- [ ] Gestión de empleados (pendiente)
- [ ] Configuración de feriados (pendiente)
- [ ] Exportación PDF (pendiente)

### Staff Limpieza
- [x] Registro de turnos (formato 24hs)
- [x] Registro de gastos
- [x] Historial de turnos y pagos
- [x] Vista de saldo pendiente
- [x] Perfil personal

## 🛠 Comandos Útiles

```bash
# Desarrollo
npm run dev           # Iniciar servidor desarrollo

# Base de datos
npm run db:push       # Sincronizar schema con DB
npm run db:generate   # Generar cliente Prisma
npm run db:studio     # Abrir Prisma Studio (GUI)
npm run db:seed       # Cargar datos de ejemplo

# Producción
npm run build         # Compilar para producción
npm run start         # Iniciar servidor producción
```

## 📝 Notas

- Los fines de semana y feriados se configuran desde el panel de admin
- El sistema detecta automáticamente turnos con duración inusual (>8 horas)
- Todos los cambios quedan registrados en el historial de auditoría
- Los datos nunca se eliminan (soft delete)

## 🔒 Seguridad

- Código fuente en repositorio privado
- Base de datos solo accesible desde backend
- Contraseñas hasheadas con bcrypt
- Variables sensibles en variables de entorno (nunca en código)

---

Desarrollado para Benveo CoLiving © 2025
