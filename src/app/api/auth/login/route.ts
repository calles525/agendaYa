// ==================== AUTH LOGIN ====================
// POST /api/auth/login - Iniciar sesión

import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'
import { rateLimitConfigs } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { validateBody, loginSchema } from '@/lib/validations'
import type { ApiResponse, User, Business } from '@/types'
import { db } from '@/lib/db'

// Rate limit específico para login (más restrictivo)
const loginAttempts = new Map<string, { count: number; resetTime: number }>()

function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now()
  const config = rateLimitConfigs.auth
  const entry = loginAttempts.get(ip)
  
  if (!entry || now > entry.resetTime) {
    loginAttempts.set(ip, { count: 1, resetTime: now + config.windowMs })
    return { allowed: true, retryAfter: 0 }
  }
  
  if (entry.count >= config.max) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetTime - now) / 1000) }
  }
  
  entry.count++
  return { allowed: true, retryAfter: 0 }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             '127.0.0.1'
  
  try {
    // Verificar rate limit
    const rateCheck = checkLoginRateLimit(ip)
    if (!rateCheck.allowed) {
      logger.warn('Rate limit excedido en login', { ip })
      return NextResponse.json<ApiResponse>({
        success: false,
        error: rateLimitConfigs.auth.message,
        details: { retryAfter: `${rateCheck.retryAfter} segundos` },
      }, { 
        status: 429,
        headers: { 'Retry-After': String(rateCheck.retryAfter) },
      })
    }

    // Parsear y validar body
    const body = await request.json()
    const validation = validateBody(loginSchema, body)
    
    if (!validation.success) {
      return validation.error
    }

    const { email, password } = validation.data

    // Autenticar usuario
    const result = await authenticateUser(email, password)

    if (!result) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Credenciales inválidas',
      }, { status: 401 })
    }

    // Obtener negocio si existe
    let business: Business | undefined
    if (result.businessId) {
      const businessData = await db.business.findUnique({
        where: { id: result.businessId },
        include: { category: true },
      })
      business = businessData as Business
    }

    logger.info('Login exitoso', { 
      email: result.user.email, 
      role: result.user.role,
      duration: `${Date.now() - startTime}ms`
    })

    return NextResponse.json<ApiResponse<{
      user: User
      token: string
      business?: Business
    }>>({
      success: true,
      data: {
        user: result.user,
        token: result.token,
        business,
      },
      message: 'Inicio de sesión exitoso',
    })

  } catch (error) {
    logger.error('Error en login', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 })
  }
}
