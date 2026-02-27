import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateAuth, canAccessBusiness, hashPassword } from '@/lib/auth'
import type { ApiResponse, Specialist } from '@/types'

// GET /api/specialists - Listar especialistas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    const includeSchedules = searchParams.get('includeSchedules') === 'true'

    if (!businessId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'businessId es requerido',
      }, { status: 400 })
    }

    const specialists = await db.specialist.findMany({
      where: {
        businessId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        specialty: true,
        ...(includeSchedules && { schedules: true }),
      },
    })

    return NextResponse.json<ApiResponse<Specialist[]>>({
      success: true,
      data: specialists as Specialist[],
    })

  } catch (error) {
    console.error('Error listando especialistas:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 })
  }
}

// POST /api/specialists - Crear especialista
export async function POST(request: NextRequest) {
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
    const { 
      businessId, 
      name, 
      email, 
      password, 
      phone,
      specialtyId, 
      title, 
      bio,
      schedules 
    } = body

    if (!businessId || !name || !email || !password || !specialtyId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'businessId, nombre, email, contraseña y especialidad son requeridos',
      }, { status: 400 })
    }

    // Verificar permisos
    if (!canAccessBusiness(authResult.user, businessId)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No tienes permisos para este negocio',
      }, { status: 403 })
    }

    // Verificar límite de especialistas según plan
    const subscription = await db.subscription.findUnique({
      where: { businessId },
    })

    const currentSpecialists = await db.specialist.count({
      where: { businessId, isActive: true },
    })

    if (subscription && currentSpecialists >= subscription.maxSpecialists) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Has alcanzado el límite de ${subscription.maxSpecialists} especialistas de tu plan`,
      }, { status: 400 })
    }

    // Verificar si el email ya existe
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'El email ya está registrado',
      }, { status: 400 })
    }

    // Crear usuario y especialista
    const hashedPassword = await hashPassword(password)
    
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: 'SPECIALIST',
        isActive: true,
      },
    })

    const specialist = await db.specialist.create({
      data: {
        businessId,
        userId: user.id,
        specialtyId,
        title,
        bio,
        ...(schedules && {
          schedules: {
            createMany: { data: schedules },
          },
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        specialty: true,
        schedules: true,
      },
    })

    return NextResponse.json<ApiResponse<Specialist>>({
      success: true,
      data: specialist as Specialist,
      message: 'Especialista creado exitosamente',
    }, { status: 201 })

  } catch (error) {
    console.error('Error creando especialista:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 })
  }
}
