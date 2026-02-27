# AgendaYa - Plataforma SaaS Multi-Tenant para Gestión de Citas

## Descripción

AgendaYa es una plataforma SaaS multi-tenant completa para gestión de citas y servicios. Permite que múltiples negocios se registren, configuren sus servicios, especialistas y gestionen reservas de clientes.

## Arquitectura

### Sistema Multi-Tenant
- Aislamiento de datos por negocio mediante `businessId`
- Role-Based Access Control (RBAC) con 4 roles
- Arquitectura API-First desacoplada del frontend

### Roles del Sistema
| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **SUPER_ADMIN** | Administrador de plataforma | Gestión global, ver todos los negocios, métricas |
| **BUSINESS_OWNER** | Dueño de negocio | CRUD negocio, especialistas, servicios, citas, pagos |
| **SPECIALIST** | Especialista del negocio | Ver su agenda, marcar citas completadas |
| **CLIENT** | Cliente final | Explorar, reservar, subir comprobantes |

## Flujo de Estados de Citas

```
PENDING → (cliente sube comprobante) → PAYMENT_PENDING
PAYMENT_PENDING → (negocio valida) → CONFIRMED o REJECTED
CONFIRMED → (especialista completa) → COMPLETED
```

## Instalación y Configuración

### 1. Poblar la base de datos (Seed)

Para crear datos de prueba, ejecuta:

```bash
curl -X POST http://localhost:3000/api/seed
```

O desde el navegador, visita: `/api/seed` con método POST

### 2. Credenciales de Prueba

Una vez ejecutado el seed, puedes usar estas credenciales:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Super Admin | admin@agendaya.com | admin123 |
| Business Owner | owner@demo.com | owner123 |
| Specialist | specialist@demo.com | spec123 |
| Client | cliente@demo.com | cliente123 |

## Estructura del Proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/           # Autenticación JWT
│   │   ├── businesses/     # CRUD negocios
│   │   ├── categories/     # Categorías
│   │   ├── specialists/    # Especialistas
│   │   ├── services/       # Servicios
│   │   ├── appointments/   # Citas
│   │   ├── payments/       # Pagos
│   │   └── seed/           # Datos de prueba
│   ├── auth/               # Página de login/registro
│   ├── dashboard/          # Dashboards por rol
│   ├── explore/            # Explorar negocios
│   └── business/[slug]/    # Detalle de negocio
├── components/
│   └── ui/                 # Componentes shadcn/ui
├── hooks/
│   └── use-api.ts          # Hook de autenticación
├── lib/
│   ├── auth.ts             # Utilidades JWT
│   └── db.ts               # Cliente Prisma
├── store/
│   └── auth.ts             # Estado global (Zustand)
└── types/
    └── index.ts            # Tipos TypeScript
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Negocios
- `GET /api/businesses` - Listar negocios (público)
- `POST /api/businesses` - Crear negocio
- `GET /api/businesses/[slug]` - Detalle de negocio

### Categorías
- `GET /api/categories` - Listar categorías
- `POST /api/categories` - Crear categoría (Super Admin)

### Servicios
- `GET /api/services` - Listar servicios
- `POST /api/services` - Crear servicio

### Especialistas
- `GET /api/specialists` - Listar especialistas
- `POST /api/specialists` - Crear especialista

### Citas
- `GET /api/appointments` - Listar citas
- `POST /api/appointments` - Crear cita
- `POST /api/appointments/[id]/cancel` - Cancelar cita
- `POST /api/appointments/[id]/complete` - Completar cita

### Pagos
- `GET /api/payments` - Listar pagos
- `POST /api/payments` - Subir comprobante
- `POST /api/payments/[id]/validate` - Validar/rechazar pago

## Tecnologías

- **Framework**: Next.js 16 con App Router
- **Lenguaje**: TypeScript 5
- **Base de datos**: SQLite con Prisma ORM
- **Autenticación**: JWT (jsonwebtoken + bcryptjs)
- **Estado**: Zustand
- **UI**: Tailwind CSS + shadcn/ui
- **Iconos**: Lucide React

## Modelo de Datos

Ver `prisma/schema.prisma` para el esquema completo.

### Entidades principales
- User (usuarios con roles)
- Business (negocios/tenants)
- Category (categorías de negocio)
- Specialty (especialidades del negocio)
- Specialist (especialistas)
- Service (servicios con precios)
- Schedule (horarios laborales)
- Appointment (citas)
- Payment (pagos y comprobantes)
- PaymentMethod (métodos de pago del negocio)
- Subscription (suscripciones)

## Comandos

```bash
# Desarrollo
bun run dev

# Linting
bun run lint

# Base de datos
bun run db:push      # Sincronizar esquema
bun run db:generate  # Generar cliente Prisma
```

## Uso de la Aplicación

### Como Cliente
1. Regístrate en `/auth?mode=register`
2. Explora negocios en `/explore`
3. Selecciona un negocio, servicio y especialista
4. Reserva tu cita
5. Sube el comprobante de pago
6. Espera confirmación

### Como Business Owner
1. Regístrate y crea tu negocio
2. Configura especialidades y servicios
3. Agrega especialistas con sus horarios
4. Configura métodos de pago
5. Valida los comprobantes de pago
6. Gestiona tu agenda

### Como Especialista
1. Accede a tu dashboard
2. Ve tu agenda de citas
3. Marca las citas como completadas
4. Registra notas de atención

## Licencia

MIT

