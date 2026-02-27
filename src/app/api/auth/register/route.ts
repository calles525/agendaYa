// ==================== AUTH REGISTER ====================
// POST /api/auth/register - Registrar nuevo usuario

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { validateBody, registerSchema } from '@/lib/validations'
import type { ApiResponse, User } from '@/types'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    const validation = validateBody(registerSchema, body)
    
    if (!validation.success) {
      return validation.error
    }

    const { name, email, password, phone } = validation.data

    // Verificar si el email ya existe
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'El email ya está registrado',
      }, { status: 400 })
    }

    // Hash de la contraseña
    const hashedPassword = await hashPassword(password)

    // Crear usuario
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        phone: phone || null,
        role: 'CLIENT', // Por defecto, los nuevos usuarios son clientes
        isActive: true,
      },
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
      },
    })

    // Generar token JWT
    const { generateToken } = await import('@/lib/auth')
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'CLIENT',
    })

    logger.info('Usuario registrado', { 
      email: user.email, 
      role: user.role,
      duration: `${Date.now() - startTime}ms`
    })

    return NextResponse.json<ApiResponse<{ user: User; token: string }>>({
      success: true,
      data: {
        user: user as User,
        token,
      },
      message: 'Cuenta creada exitosamente',
    }, { status: 201 })

  } catch (error) {
    logger.error('Error en registro', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 })
  }
}
