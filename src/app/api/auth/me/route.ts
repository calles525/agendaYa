// ==================== AUTH ME ====================
// GET /api/auth/me - Obtener usuario actual

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateAuth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import type { ApiResponse, User, Business } from '@/types'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const authHeader = request.headers.get('authorization')
    const authResult = await validateAuth(authHeader)

    if (!authResult.success || !authResult.user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: authResult.error || 'No autorizado',
      }, { status: 401 })
    }

    // Obtener datos completos del usuario
    const userData = await db.user.findUnique({
      where: { id: authResult.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        ownedBusinesses: {
          select: { id: true },
        },
        specialistProfile: {
          select: { id: true, businessId: true },
        },
      },
    })

    if (!userData) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Usuario no encontrado',
      }, { status: 404 })
    }

    // Obtener negocio si aplica
    let business: Business | null = null
    if (userData.ownedBusinesses.length > 0) {
      business = await db.business.findUnique({
        where: { id: userData.ownedBusinesses[0].id },
        include: { 
          category: true,
          subscription: true,
        },
      }) as Business
    } else if (userData.specialistProfile) {
      business = await db.business.findUnique({
        where: { id: userData.specialistProfile.businessId },
        include: { 
          category: true,
        },
      }) as Business
    }

    const { password: _, ...userWithoutPassword } = userData

    logger.debug('Auth me completado', { 
      userId: userData.id, 
      duration: `${Date.now() - startTime}ms` 
    })

    return NextResponse.json<ApiResponse<{
      user: User
      business: Business | null
    }>>({
      success: true,
      data: {
        user: userWithoutPassword as User,
        business,
      },
    })

  } catch (error) {
    logger.error('Error en auth/me', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 })
  }
}
