// ==================== ESQUEMAS DE VALIDACIÓN CON ZOD ====================

import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import type { ApiResponse } from '@/types'

// ==================== AUTH ====================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 7, {
      message: 'El teléfono debe tener al menos 7 caracteres',
    }),
})

// ==================== BUSINESS ====================

export const createBusinessSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  slug: z
    .string()
    .min(2, 'El slug debe tener al menos 2 caracteres')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones')
    .optional(),
  description: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
  categoryId: z.string().min(1, 'La categoría es requerida'),
})

export const updateBusinessSchema = createBusinessSchema.partial()

// ==================== SPECIALIST ====================

export const createSpecialistSchema = z.object({
  userId: z.string().min(1, 'El usuario es requerido'),
  businessId: z.string().min(1, 'El negocio es requerido'),
  specialtyId: z.string().min(1, 'La especialidad es requerida'),
  title: z.string().max(50).optional(),
  bio: z.string().max(500).optional(),
  photo: z.string().url().optional().or(z.literal('')),
})

// ==================== SERVICE ====================

export const createServiceSchema = z.object({
  businessId: z.string().min(1, 'El negocio es requerido'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  description: z.string().max(500).optional(),
  duration: z.number().int().min(5).max(480).default(30), // 5 min - 8 horas
  price: z.number().int().min(0, 'El precio no puede ser negativo'),
  specialtyId: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
})

export const updateServiceSchema = createServiceSchema.partial().omit({ businessId: true })

// ==================== APPOINTMENT ====================

export const createAppointmentSchema = z.object({
  businessId: z.string().min(1, 'El negocio es requerido'),
  specialistId: z.string().min(1, 'El especialista es requerido'),
  serviceId: z.string().min(1, 'El servicio es requerido'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Fecha inválida',
  }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Formato de hora inválido (HH:mm)',
  }),
  clientNotes: z.string().max(500).optional(),
})

export const cancelAppointmentSchema = z.object({
  reason: z.string().max(200).optional(),
})

export const completeAppointmentSchema = z.object({
  notes: z.string().max(500).optional(),
})

// ==================== PAYMENT ====================

export const createPaymentSchema = z.object({
  appointmentId: z.string().min(1, 'La cita es requerida'),
  methodId: z.string().optional(),
  amount: z.number().int().min(0),
  reference: z.string().max(100).optional(),
  receiptImage: z.string().url().optional().or(z.literal('')),
})

export const validatePaymentSchema = z.object({
  validated: z.boolean(),
  rejectionReason: z.string().max(200).optional(),
})

// ==================== SCHEDULE ====================

export const createScheduleSchema = z.object({
  specialistId: z.string().min(1, 'El especialista es requerido'),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  breakStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().or(z.literal('')),
  breakEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().or(z.literal('')),
})

// ==================== PAGINATION ====================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// ==================== HELPER FUNCTIONS ====================

export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; error: NextResponse<ApiResponse> }

export function validateBody<T extends z.ZodType>(
  schema: T,
  body: unknown
): ValidationResult<z.infer<T>> {
  const result = schema.safeParse(body)
  
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }))
    
    return {
      success: false,
      error: NextResponse.json<ApiResponse>({
        success: false,
        error: 'Error de validación',
        details: errors,
      }, { status: 400 }),
    }
  }
  
  return { success: true, data: result.data }
}

export function validateQuery<T extends z.ZodType>(
  schema: T,
  request: NextRequest
): ValidationResult<z.infer<T>> {
  const { searchParams } = new URL(request.url)
  const params: Record<string, string> = {}
  
  searchParams.forEach((value, key) => {
    params[key] = value
  })
  
  return validateBody(schema, params)
}

// Validar body desde request
export async function parseAndValidateBody<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): Promise<ValidationResult<z.infer<T>>> {
  try {
    const body = await request.json()
    return validateBody(schema, body)
  } catch {
    return {
      success: false,
      error: NextResponse.json<ApiResponse>({
        success: false,
        error: 'Body JSON inválido',
      }, { status: 400 }),
    }
  }
}
