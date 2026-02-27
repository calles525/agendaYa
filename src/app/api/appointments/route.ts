// ==================== APPOINTMENTS API ====================
// GET /api/appointments - Listar citas
// POST /api/appointments - Crear cita

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateAuth, canAccessBusiness } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { validateBody, validateQuery, createAppointmentSchema, paginationSchema } from '@/lib/validations'
import type { ApiResponse, Appointment } from '@/types'

// ==================== GET ====================
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const authHeader = request.headers.get('authorization')
    const authResult = await validateAuth(authHeader)

    if (!authResult.success || !authResult.user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No autorizado',
      }, { status: 401 })
    }

    // Validar query params
    const queryValidation = validateQuery(paginationSchema, request)
    if (!queryValidation.success) {
      return queryValidation.error
    }
    
    const { page, limit } = queryValidation.data
    
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    const specialistId = searchParams.get('specialistId')
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status')
    const date = searchParams.get('date')

    // Construir filtros según el rol
    const where: Record<string, unknown> = {}

    if (authResult.user.role === 'CLIENT') {
      where.clientId = authResult.user.userId
    } else if (authResult.user.role === 'SPECIALIST') {
      const specialist = await db.specialist.findUnique({
        where: { userId: authResult.user.userId },
        select: { id: true },
      })
      if (specialist) {
        where.specialistId = specialist.id
      }
    } else if (authResult.user.role === 'BUSINESS_OWNER') {
      if (businessId) {
        where.businessId = businessId
      } else if (authResult.user.businessId) {
        where.businessId = authResult.user.businessId
      }
    }
    // SUPER_ADMIN puede ver todo

    // Filtros adicionales
    if (businessId && !where.businessId) where.businessId = businessId
    if (specialistId) where.specialistId = specialistId
    if (clientId && authResult.user.role !== 'CLIENT') where.clientId = clientId
    if (status) where.status = status
    if (date) {
      const dateObj = new Date(date)
      where.date = {
        gte: new Date(dateObj.setHours(0, 0, 0, 0)),
        lt: new Date(dateObj.setHours(23, 59, 59, 999)),
      }
    }

    const [appointments, total] = await Promise.all([
      db.appointment.findMany({
        where,
        include: {
          client: {
            select: { id: true, name: true, email: true, phone: true },
          },
          specialist: {
            include: {
              user: { select: { id: true, name: true } },
              specialty: true,
            },
          },
          service: true,
          business: { select: { id: true, name: true } },
          payment: { include: { paymentMethod: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ date: 'asc' }, { time: 'asc' }],
      }),
      db.appointment.count({ where }),
    ])

    logger.db('SELECT', 'Appointment', Date.now() - startTime)

    return NextResponse.json({
      success: true,
      data: appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })

  } catch (error) {
    logger.error('Error listando citas', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 })
  }
}

// ==================== POST ====================
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const authHeader = request.headers.get('authorization')
    const authResult = await validateAuth(authHeader)

    if (!authResult.success || !authResult.user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No autorizado',
      }, { status: 401 })
    }

    const body = await request.json()
    const validation = validateBody(createAppointmentSchema, body)
    
    if (!validation.success) {
      return validation.error
    }

    const { businessId, specialistId, serviceId, date, time, clientNotes } = validation.data

    // Verificar que el negocio existe y está activo
    const business = await db.business.findFirst({
      where: { id: businessId, isActive: true },
    })

    if (!business) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Negocio no encontrado o inactivo',
      }, { status: 404 })
    }

    // Obtener información del servicio
    const service = await db.service.findFirst({
      where: { 
        id: serviceId,
        businessId,
        isActive: true,
      },
    })

    if (!service) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Servicio no encontrado',
      }, { status: 404 })
    }

    // Verificar que el especialista pertenece al negocio
    const specialist = await db.specialist.findFirst({
      where: { 
        id: specialistId,
        businessId,
        isActive: true,
      },
    })

    if (!specialist) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Especialista no encontrado',
      }, { status: 404 })
    }

    // Calcular hora de fin
    const [hours, minutes] = time.split(':').map(Number)
    const endTime = new Date()
    endTime.setHours(hours, minutes + service.duration, 0, 0)
    const endTimeStr = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`

    // Verificar disponibilidad
    const existingAppointments = await db.appointment.findMany({
      where: {
        specialistId,
        date: new Date(date),
        status: { in: ['PENDING', 'PAYMENT_PENDING', 'CONFIRMED'] },
        OR: [
          { time: { lte: time }, endTime: { gt: time } },
          { time: { lt: endTimeStr }, endTime: { gte: endTimeStr } },
        ],
      },
    })

    if (existingAppointments.length > 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'El especialista no está disponible en ese horario',
      }, { status: 400 })
    }

    // Crear cita y pago pendiente en una transacción
    const appointment = await db.$transaction(async (tx) => {
      const newAppointment = await tx.appointment.create({
        data: {
          businessId,
          clientId: authResult.user!.userId,
          specialistId,
          serviceId,
          date: new Date(date),
          time,
          endTime: endTimeStr,
          clientNotes,
          status: 'PENDING',
          payment: {
            create: {
              amount: service.price,
              status: 'PENDING',
            },
          },
        },
        include: {
          service: true,
          specialist: {
            include: { user: { select: { name: true } } },
          },
          business: { select: { name: true } },
          payment: true,
        },
      })
      
      return newAppointment
    })

    logger.info('Cita creada', { 
      appointmentId: appointment.id,
      businessId,
      duration: `${Date.now() - startTime}ms`
    })

    return NextResponse.json<ApiResponse<Appointment>>({
      success: true,
      data: appointment as Appointment,
      message: 'Cita creada exitosamente',
    }, { status: 201 })

  } catch (error) {
    logger.error('Error creando cita', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 })
  }
}
