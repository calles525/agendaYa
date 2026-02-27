import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateAuth, canAccessBusiness } from '@/lib/auth'
import type { ApiResponse, Service } from '@/types'

// GET /api/services - Listar servicios (con filtros)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    const specialtyId = searchParams.get('specialtyId')

    if (!businessId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'businessId es requerido',
      }, { status: 400 })
    }

    const services = await db.service.findMany({
      where: {
        businessId,
        isActive: true,
        ...(specialtyId && { specialtyId }),
      },
      include: {
        specialty: true,
      },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json<ApiResponse<Service[]>>({
      success: true,
      data: services as Service[],
    })

  } catch (error) {
    console.error('Error listando servicios:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 })
  }
}

// POST /api/services - Crear servicio
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
    const { businessId, name, description, duration, price, specialtyId, image } = body

    if (!businessId || !name || !price) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'businessId, nombre y precio son requeridos',
      }, { status: 400 })
    }

    // Verificar permisos
    if (!canAccessBusiness(authResult.user, businessId)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No tienes permisos para este negocio',
      }, { status: 403 })
    }

    const service = await db.service.create({
      data: {
        businessId,
        name,
        description,
        duration: duration || 30,
        price, // en centavos
        specialtyId,
        image,
      },
    })

    return NextResponse.json<ApiResponse<Service>>({
      success: true,
      data: service as Service,
      message: 'Servicio creado exitosamente',
    }, { status: 201 })

  } catch (error) {
    console.error('Error creando servicio:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 })
  }
}
