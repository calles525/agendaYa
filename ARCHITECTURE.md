# AgendaYa - Arquitectura del Sistema SaaS Multi-Tenant

## 🏛️ Visión General

AgendaYa es una plataforma SaaS multi-tenant para gestión de citas y servicios. Permite que múltiples negocios se registren, configuren sus servicios, especialistas y gestionen reservas de clientes.

---

## 🎯 Principios de Diseño

1. **Multi-Tenancy**: Aislamiento de datos por negocio mediante `businessId`
2. **Role-Based Access Control (RBAC)**: 4 roles con permisos específicos
3. **Escalabilidad**: Arquitectura modular preparada para microservicios
4. **API-First**: Backend REST desacoplado del frontend
5. **MVP First**: Funcionalidades core primero, features avanzadas después

---

## 👥 Sistema de Roles

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **SUPER_ADMIN** | Administrador de plataforma | Gestión global, ver todos los negocios, métricas |
| **BUSINESS_OWNER** | Dueño de negocio | CRUD negocio, especialistas, servicios, citas, pagos |
| **SPECIALIST** | Especialista del negocio | Ver su agenda, marcar citas completadas |
| **CLIENT** | Cliente final | Explorar, reservar, subir comprobantes |

---

## 🗄️ Modelo de Datos

### Entidades Principales

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MODELO DE DATOS                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│     User     │       │   Business   │       │   Category   │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id           │       │ id           │       │ id           │
│ email        │──┐    │ name         │──┐    │ name         │
│ password     │  │    │ slug         │  │    │ description  │
│ name         │  │    │ ownerId      │◀─┘    │ icon         │
│ phone        │  │    │ categoryId   │◀──────│ isActive     │
│ role         │  │    │ description  │       └──────────────┘
│ avatar       │  │    │ logo         │
│ isActive     │  │    │ address      │       ┌──────────────┐
│ createdAt    │  │    │ phone        │       │ Subscription │
└──────────────┘  │    │ email        │       ├──────────────┤
                  │    │ isActive     │       │ id           │
                  │    │ plan         │       │ businessId   │
                  │    │ maxSpecialists│      │ plan         │
                  │    └──────────────┘       │ status       │
                  │            │              │ currentPeriod│
                  │            │              │ amount       │
                  │            ▼              └──────────────┘
                  │    ┌──────────────┐
                  │    │  Specialty   │
                  │    ├──────────────┤            ┌──────────────┐
                  │    │ id           │            │   Service    │
                  │    │ businessId   │            ├──────────────┤
                  │    │ name         │◀───────────│ id           │
                  │    │ description  │            │ businessId   │
                  │    └──────────────┘            │ specialtyId  │
                  │            │                   │ name         │
                  │            │                   │ description  │
                  │            ▼                   │ duration     │
                  │    ┌──────────────┐            │ price        │
                  │    │  Specialist  │            │ isActive     │
                  │    ├──────────────┤            └──────────────┘
                  │    │ id           │                   │
                  └───▶│ userId       │                   │
                       │ businessId   │                   ▼
                       │ specialtyId  │            ┌──────────────┐
                       │ bio          │            │  Appointment │
                       │ isActive     │            ├──────────────┤
                       └──────────────┘            │ id           │
                             │                     │ businessId   │
                             │                     │ clientId     │
                             ▼                     │ specialistId │
                       ┌──────────────┐            │ serviceId    │
                       │   Schedule   │            │ date         │
                       ├──────────────┤            │ time         │
                       │ id           │            │ status       │
                       │ specialistId │            │ notes        │
                       │ dayOfWeek    │            │ paymentId    │
                       │ startTime    │            └──────────────┘
                       │ endTime      │                   │
                       │ isActive     │                   ▼
                       └──────────────┘            ┌──────────────┐
                                                   │   Payment    │
                       ┌──────────────┐            ├──────────────┤
                       │PaymentMethod │            │ id           │
                       ├──────────────┤            │ appointmentId│
                       │ id           │            │ methodId     │
                       │ businessId   │            │ amount       │
                       │ name         │            │ status       │
                       │ type         │            │ reference    │
                       │ details      │            │ receiptImage │
                       │ isActive     │            │ validatedAt  │
                       └──────────────┘            │ validatedBy  │
                                                   └──────────────┘
```

---

## 📊 Flujo de Estados de Citas

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLUJO DE ESTADOS DE CITAS                           │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────┐
                    │   PENDING   │  ← Cliente solicita cita
                    │  (Pendiente)│
                    └──────┬──────┘
                           │
                           ▼ Cliente sube comprobante
                    ┌─────────────┐
                    │  PAYMENT_   │
                    │   PENDING   │  ← Pago pendiente de validación
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
       ┌───────────┐ ┌───────────┐ ┌───────────┐
       │ CONFIRMED │ │ REJECTED  │ │ EXPIRED   │
       │(Confirmada)│ │(Rechazada)│ │(Expirada) │
       └─────┬─────┘ └───────────┘ └───────────┘
             │
             ▼ Especialista completa atención
       ┌───────────┐
       │ COMPLETED │
       │(Completada)│
       └───────────┘

       ┌───────────┐
       │ CANCELLED │ ← Cancelable en cualquier momento
       │(Cancelada)│
       └───────────┘
```

---

## 🔐 Sistema de Autenticación

### JWT Token Structure
```json
{
  "sub": "user_id",
  "email": "user@email.com",
  "role": "BUSINESS_OWNER",
  "businessId": "business_id (si aplica)",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### Rutas Protegidas por Rol

| Ruta | SUPER_ADMIN | BUSINESS_OWNER | SPECIALIST | CLIENT |
|------|-------------|----------------|------------|--------|
| `/admin/*` | ✅ | ❌ | ❌ | ❌ |
| `/business/*` | ✅ | ✅ (propio) | ❌ | ❌ |
| `/specialist/*` | ✅ | ✅ | ✅ (propio) | ❌ |
| `/client/*` | ✅ | ❌ | ❌ | ✅ |
| `/explore/*` | ✅ | ✅ | ✅ | ✅ |

---

## 📁 Estructura de Módulos Backend

```
src/
├── app/
│   └── api/
│       ├── auth/
│       │   ├── register/route.ts
│       │   └── login/route.ts
│       ├── businesses/
│       │   ├── route.ts              # CRUD negocios
│       │   └── [id]/
│       │       ├── route.ts
│       │       ├── specialists/route.ts
│       │       ├── services/route.ts
│       │       └── appointments/route.ts
│       ├── categories/
│       │   └── route.ts
│       ├── specialists/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       ├── schedule/route.ts
│       │       └── appointments/route.ts
│       ├── services/
│       │   └── route.ts
│       ├── appointments/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       ├── cancel/route.ts
│       │       └── complete/route.ts
│       ├── payments/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── validate/route.ts
│       └── subscriptions/
│           └── route.ts
├── lib/
│   ├── auth.ts              # JWT utils
│   ├── db.ts                # Prisma client
│   └── middleware.ts        # Auth middleware
├── types/
│   └── index.ts             # TypeScript types
└── components/
    └── (componentes UI)
```

---

## 🎨 Estructura Frontend

```
src/app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/
│   ├── client/
│   │   ├── page.tsx              # Dashboard cliente
│   │   ├── explore/page.tsx      # Explorar negocios
│   │   ├── appointments/page.tsx # Mis citas
│   │   └── history/page.tsx      # Historial
│   ├── business/
│   │   ├── page.tsx              # Dashboard negocio
│   │   ├── specialists/page.tsx  # Gestionar especialistas
│   │   ├── services/page.tsx     # Gestionar servicios
│   │   ├── appointments/page.tsx # Gestión citas
│   │   ├── schedule/page.tsx     # Horarios
│   │   └── payments/page.tsx     # Validar pagos
│   ├── specialist/
│   │   ├── page.tsx              # Dashboard especialista
│   │   └── appointments/page.tsx # Mi agenda
│   └── admin/
│       ├── page.tsx              # Dashboard admin
│       ├── businesses/page.tsx   # Negocios
│       └── analytics/page.tsx    # Métricas
└── page.tsx                      # Landing page
```

---

## 🚀 Plan de Implementación MVP

### Fase 1: Core Backend (Semana 1)
- [x] Esquema de base de datos
- [ ] Autenticación JWT
- [ ] APIs de registro/login
- [ ] APIs CRUD de negocios
- [ ] APIs de especialistas

### Fase 2: Funcionalidades de Citas (Semana 2)
- [ ] APIs de servicios
- [ ] APIs de citas
- [ ] Flujo de estados
- [ ] APIs de pagos

### Fase 3: Frontend Core (Semana 3)
- [ ] Landing page
- [ ] Autenticación UI
- [ ] Dashboard cliente
- [ ] Dashboard negocio

### Fase 4: Refinamiento (Semana 4)
- [ ] Dashboard especialista
- [ ] Dashboard admin
- [ ] Testing
- [ ] Optimizaciones

---

## 📈 Escalabilidad Futura

1. **Microservicios**: Separar en servicios independientes
2. **Message Queue**: Redis/RabbitMQ para notificaciones
3. **CDN**: Para imágenes de comprobantes
4. **Cache**: Redis para datos frecuentes
5. **Analytics**: Integración con herramientas de BI

