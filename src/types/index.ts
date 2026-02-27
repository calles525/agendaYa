// ==================== TIPOS DE LA API ====================

// ==================== USUARIOS ====================

export interface User {
  id: string
  email: string
  name: string
  phone?: string | null
  avatar?: string | null
  role: 'SUPER_ADMIN' | 'BUSINESS_OWNER' | 'SPECIALIST' | 'CLIENT'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface JwtPayload {
  userId: string
  email: string
  role: UserRole
  businessId?: string
  iat: number
  exp: number
}

export type UserRole = 'SUPER_ADMIN' | 'BUSINESS_OWNER' | 'SPECIALIST' | 'CLIENT'

// ==================== NEGOCIO ====================

export interface Business {
  id: string
  name: string
  slug: string
  description?: string | null
  logo?: string | null
  coverImage?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  zipCode?: string | null
  currency: string
  timezone: string
  ownerId: string
  categoryId: string
  category?: Category
  isActive: boolean
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

// ==================== CATÁLOGOS ====================

export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  icon?: string | null
  color?: string | null
  isActive: boolean
  sortOrder: number
}

export interface Specialty {
  id: string
  businessId: string
  name: string
  description?: string | null
  color?: string | null
  isActive: boolean
}

// ==================== ESPECIALISTA ====================

export interface Specialist {
  id: string
  businessId: string
  userId: string
  user?: User
  specialtyId: string
  specialty?: Specialty
  title?: string | null
  bio?: string | null
  photo?: string | null
  isActive: boolean
}

// ==================== SERVICIO ====================

export interface Service {
  id: string
  businessId: string
  specialtyId?: string | null
  name: string
  description?: string | null
  duration: number
  price: number
  image?: string | null
  isActive: boolean
  sortOrder: number
}

// ==================== CITA ====================

export type AppointmentStatus = 
  | 'PENDING'
  | 'PAYMENT_PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'EXPIRED'

export interface Appointment {
  id: string
  businessId: string
  business?: Business
  clientId: string
  client?: User
  specialistId: string
  specialist?: Specialist
  serviceId: string
  service?: Service
  date: Date
  time: string
  endTime?: string | null
  status: AppointmentStatus
  clientNotes?: string | null
  businessNotes?: string | null
  cancellationReason?: string | null
  attendedAt?: Date | null
  attendanceNotes?: string | null
  payment?: Payment
  createdAt: Date
  updatedAt: Date
}

// ==================== PAGO ====================

export type PaymentStatus = 'PENDING' | 'UPLOADED' | 'VALIDATED' | 'REJECTED'

export interface Payment {
  id: string
  appointmentId: string
  methodId?: string | null
  paymentMethod?: PaymentMethod
  amount: number
  status: PaymentStatus
  reference?: string | null
  receiptImage?: string | null
  validatedAt?: Date | null
  validatedById?: string | null
  validatedBy?: User
  rejectionReason?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface PaymentMethod {
  id: string
  businessId: string
  name: string
  type: string
  details?: string | null
  instructions?: string | null
  isActive: boolean
}

// ==================== SUSCRIPCIÓN ====================

export type SubscriptionPlan = 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE'
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'TRIAL'

export interface Subscription {
  id: string
  businessId: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  maxSpecialists: number
  currentPeriodStart?: Date | null
  currentPeriodEnd?: Date | null
  amount?: number | null
  currency: string
  trialEndsAt?: Date | null
}

// ==================== HORARIO ====================

export interface Schedule {
  id: string
  specialistId: string
  dayOfWeek: number // 0 = Domingo
  startTime: string
  endTime: string
  breakStart?: string | null
  breakEnd?: string | null
  isActive: boolean
}

// ==================== API RESPONSE ====================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: unknown
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ==================== FILTROS ====================

export interface AppointmentFilters {
  businessId?: string
  specialistId?: string
  clientId?: string
  status?: AppointmentStatus
  date?: string
  page?: number
  limit?: number
}

export interface ServiceFilters {
  businessId: string
  specialtyId?: string
  isActive?: boolean
}
