import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateAuth, hashPassword } from '@/lib/auth'
import type { ApiResponse, Business } from '@/types'

// GET /api/businesses - Listar negocios (público con filtros)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const city = searchParams.get('city')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where = {
      isActive: true,
      isVerified: true,
      ...(category && { categoryId: category }),
      ...(city && { city: { contains: city, mode: 'insensitive' as const } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [businesses, total] = await Promise.all([
      db.business.findMany({
        where,
        include: {
          category: true,
          _count: { select: { specialists: true, services: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.business.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: businesses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })

  } catch (error) {
    console.error('Error listando negocios:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 })
  }
}

// POST /api/businesses - Crear negocio (Business Owner)
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

    // CLIENT, BUSINESS_OWNER o SUPER_ADMIN pueden crear negocios
    // BUSINESS_OWNER solo puede si no tiene uno todavía
    if (authResult.user.role === 'CLIENT') {
      // Cliente puede crear negocio
    } else if (authResult.user.role === 'BUSINESS_OWNER') {
      // Verificar si ya tiene un negocio
      const existingBusiness = await db.business.findFirst({
        where: { ownerId: authResult.user.userId },
      })
      if (existingBusiness) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Ya tienes un negocio registrado',
        }, { status: 403 })
      }
    } else if (authResult.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No tienes permiso para registrar negocios',
      }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      description,
      categoryId,
      phone,
      email,
      address,
      city,
      state,
      country,
      zipCode,
    } = body

    if (!name || !categoryId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Nombre y categoría son requeridos',
      }, { status: 400 })
    }

    // Generar slug único
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    
    let slug = baseSlug
    let counter = 1
    while (await db.business.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Si es CLIENT, actualizar a BUSINESS_OWNER
    if (authResult.user.role === 'CLIENT') {
      await db.user.update({
        where: { id: authResult.user.userId },
        data: { role: 'BUSINESS_OWNER' },
      })
    }

    // Crear negocio con suscripción FREE
    const business = await db.business.create({
      data: {
        name,
        slug,
        description,
        categoryId,
        phone,
        email,
        address,
        city,
        state,
        country,
        zipCode,
        ownerId: authResult.user.userId,
        subscription: {
          create: {
            plan: 'FREE',
            status: 'TRIAL',
            maxSpecialists: 1,
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 días
          },
        },
      },
      include: {
        category: true,
        subscription: true,
      },
    })

    return NextResponse.json<ApiResponse<Business>>({
      success: true,
      data: business as Business,
      message: 'Negocio registrado exitosamente',
    }, { status: 201 })

  } catch (error) {
    console.error('Error creando negocio:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 })
  }
}
