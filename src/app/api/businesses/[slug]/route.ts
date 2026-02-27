import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { ApiResponse, Business } from '@/types'

// GET /api/businesses/[slug] - Obtener negocio por slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const business = await db.business.findUnique({
      where: { slug },
      include: {
        category: true,
        subscription: true,
        specialties: { where: { isActive: true } },
        services: { 
          where: { isActive: true },
          include: { specialty: true },
          orderBy: { sortOrder: 'asc' },
        },
        specialists: {
          where: { isActive: true },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
            specialty: true,
            schedules: { where: { isActive: true } },
          },
        },
        paymentMethods: { where: { isActive: true } },
        _count: {
          select: { specialists: true, services: true },
        },
      },
    })

    if (!business) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Negocio no encontrado',
      }, { status: 404 })
    }

    return NextResponse.json<ApiResponse<Business>>({
      success: true,
      data: business as Business,
    })

  } catch (error) {
    console.error('Error obteniendo negocio:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 })
  }
}
