// ==================== RATE LIMITING ====================
// Sistema de limitación de peticiones para proteger contra ataques

import { NextRequest, NextResponse } from 'next/server'
import type { ApiResponse } from '@/types'
import { APP_CONFIG } from './env'

// Almacén en memoria para rate limiting
// En producción, usar Redis o similar
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Limpiar entradas expiradas cada minuto
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }, 60000)
}

// Configuraciones por tipo de endpoint
export const rateLimitConfigs = {
  // Login: más restrictivo (previene fuerza bruta)
  auth: {
    max: 5, // 5 intentos
    windowMs: 60 * 1000, // por minuto
    message: 'Demasiados intentos. Intenta de nuevo en 1 minuto.',
  },
  // API general
  api: {
    max: APP_CONFIG.rateLimit.max,
    windowMs: APP_CONFIG.rateLimit.windowMs,
    message: 'Demasiadas peticiones. Intenta de nuevo más tarde.',
  },
  // Creación de recursos
  write: {
    max: 30,
    windowMs: 60 * 1000,
    message: 'Demasiadas operaciones de escritura. Espera un momento.',
  },
  // Búsqueda
  search: {
    max: 20,
    windowMs: 60 * 1000,
    message: 'Demasiadas búsquedas. Espera un momento.',
  },
} as const

type RateLimitType = keyof typeof rateLimitConfigs

// Obtener IP del cliente
function getClientIp(request: NextRequest): string {
  // Intentar obtener IP de headers (proxy, load balancer, etc.)
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  
  // Fallback para desarrollo
  return '127.0.0.1'
}

// Generar key único para el rate limit
function getRateLimitKey(
  request: NextRequest,
  type: RateLimitType,
  identifier?: string
): string {
  const ip = getClientIp(request)
  return `${type}:${ip}:${identifier || ''}`
}

// Middleware de rate limiting
export function rateLimit(
  type: RateLimitType = 'api',
  identifier?: string
) {
  return async (
    request: NextRequest
  ): Promise<NextResponse<ApiResponse> | null> => {
    const config = rateLimitConfigs[type]
    const key = getRateLimitKey(request, type, identifier)
    const now = Date.now()
    
    const entry = rateLimitStore.get(key)
    
    if (!entry || now > entry.resetTime) {
      // Primera petición o ventana expirada
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      })
      return null // Permitir
    }
    
    if (entry.count >= config.max) {
      // Límite excedido
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
      
      return NextResponse.json<ApiResponse>({
        success: false,
        error: config.message,
        details: {
          retryAfter: `${retryAfter} segundos`,
          limit: config.max,
          window: `${config.windowMs / 1000} segundos`,
        },
      }, { 
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(config.max),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(entry.resetTime / 1000)),
        },
      })
    }
    
    // Incrementar contador
    entry.count++
    rateLimitStore.set(key, entry)
    
    return null // Permitir
  }
}

// Decorador para aplicar rate limit a handlers
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  type: RateLimitType = 'api'
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const limiter = rateLimit(type)
    const limitResult = await limiter(request)
    
    if (limitResult) {
      return limitResult
    }
    
    return handler(request)
  }
}

// Función para obtener estado actual del rate limit
export function getRateLimitStatus(
  request: NextRequest,
  type: RateLimitType = 'api'
): {
  remaining: number
  reset: number
  limit: number
} {
  const config = rateLimitConfigs[type]
  const key = getRateLimitKey(request, type)
  const entry = rateLimitStore.get(key)
  
  return {
    remaining: entry ? Math.max(0, config.max - entry.count) : config.max,
    reset: entry ? entry.resetTime : Date.now() + config.windowMs,
    limit: config.max,
  }
}
