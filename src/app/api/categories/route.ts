import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateAuth } from '@/lib/auth'
import type { ApiResponse, Category } from '@/types'

// GET /api/categories - Obtener todas las categorías activas
export async function GET(request: NextRequest) {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json<ApiResponse<Category[]>>({
      success: true,
      data: categories as Category[],
    })

  } catch (error) {
    console.error('Error obteniendo categorías:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 })
  }
}

// POST /api/categories - Crear categoría (Solo Super Admin)
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

    if (authResult.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Solo Super Admin puede crear categorías',
      }, { status: 403 })
    }

    const body = await request.json()
    const { name, slug, description, icon, color, sortOrder } = body

    if (!name || !slug) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Nombre y slug son requeridos',
      }, { status: 400 })
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        description,
        icon,
        color,
        sortOrder: sortOrder || 0,
      },
    })

    return NextResponse.json<ApiResponse<Category>>({
      success: true,
      data: category as Category,
      message: 'Categoría creada exitosamente',
    }, { status: 201 })

  } catch (error) {
    console.error('Error creando categoría:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 })
  }
}
