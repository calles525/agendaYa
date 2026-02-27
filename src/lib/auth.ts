// ==================== AUTENTICACIÓN JWT ====================

import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { db } from './db'
import { APP_CONFIG } from './env'
import { logger } from './logger'
import type { User, JwtPayload, UserRole } from '@/types'

// === HASHEO DE CONTRASEÑAS ===

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// === GENERACIÓN DE TOKENS ===

export function generateToken(payload: {
  userId: string
  email: string
  role: UserRole
  businessId?: string
}): string {
  return jwt.sign(payload, APP_CONFIG.jwt.secret, { 
    expiresIn: APP_CONFIG.jwt.expiresIn,
    issuer: 'agendaya',
    audience: 'agendaya-api',
  })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, APP_CONFIG.jwt.secret, {
      issuer: 'agendaya',
      audience: 'agendaya-api',
    }) as JwtPayload
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.debug('Token expirado', { expiredAt: error.expiredAt })
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Token inválido', { reason: error.message })
    }
    return null
  }
}

// === EXTRACCIÓN DE TOKEN ===

export function extractToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.slice(7)
}

// === AUTENTICACIÓN DE USUARIO ===

export async function authenticateUser(email: string, password: string): Promise<{
  user: User
  token: string
  businessId?: string
} | null> {
  const startTime = Date.now()
  
  try {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        ownedBusinesses: { select: { id: true } },
        specialistProfile: { select: { businessId: true } },
      },
    })

    if (!user) {
      logger.auth(email, false, 'Usuario no encontrado')
      return null
    }

    if (!user.isActive) {
      logger.auth(email, false, 'Usuario inactivo')
      return null
    }

    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      logger.auth(email, false, 'Contraseña incorrecta')
      return null
    }

    // Obtener businessId si el usuario es BUSINESS_OWNER o SPECIALIST
    let businessId: string | undefined
    if (user.role === 'BUSINESS_OWNER' && user.ownedBusinesses.length > 0) {
      businessId = user.ownedBusinesses[0].id
    } else if (user.role === 'SPECIALIST' && user.specialistProfile) {
      businessId = user.specialistProfile.businessId
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      businessId,
    })

    const { password: _, ...userWithoutPassword } = user
    
    logger.auth(email, true)
    logger.db('SELECT', 'User', Date.now() - startTime)

    return {
      user: userWithoutPassword as User,
      token,
      businessId,
    }
  } catch (error) {
    logger.error('Error en autenticación', error, { email })
    return null
  }
}

// === VERIFICACIÓN DE USUARIO ===

export async function getUserFromToken(token: string): Promise<User | null> {
  const payload = verifyToken(token)
  if (!payload) return null

  try {
    const user = await db.user.findUnique({
      where: { id: payload.userId },
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

    if (!user || !user.isActive) {
      return null
    }

    return user as User
  } catch (error) {
    logger.error('Error obteniendo usuario desde token', error)
    return null
  }
}

// === VERIFICACIÓN DE PERMISOS ===

export function hasPermission(
  userRole: UserRole,
  requiredRoles: UserRole[]
): boolean {
  return requiredRoles.includes(userRole)
}

export function canAccessBusiness(
  user: JwtPayload,
  businessId: string
): boolean {
  // Super Admin puede acceder a cualquier negocio
  if (user.role === 'SUPER_ADMIN') return true
  
  // Business Owner solo puede acceder a su propio negocio
  if (user.role === 'BUSINESS_OWNER') {
    return user.businessId === businessId
  }
  
  // Specialist solo puede acceder al negocio donde trabaja
  if (user.role === 'SPECIALIST') {
    return user.businessId === businessId
  }
  
  return false
}

// === MIDDLEWARE HELPER ===

export interface AuthResult {
  success: boolean
  user?: JwtPayload
  error?: string
}

export async function validateAuth(authHeader: string | null): Promise<AuthResult> {
  const token = extractToken(authHeader)
  
  if (!token) {
    return { success: false, error: 'Token no proporcionado' }
  }
  
  const payload = verifyToken(token)
  
  if (!payload) {
    return { success: false, error: 'Token inválido o expirado' }
  }
  
  // Verificar que el usuario sigue activo
  const user = await getUserFromToken(token)
  if (!user) {
    return { success: false, error: 'Usuario no encontrado o inactivo' }
  }
  
  return { success: true, user: payload }
}

// === SEED SUPER ADMIN ===

export async function createSuperAdmin(
  email: string,
  password: string,
  name: string
): Promise<User> {
  const hashedPassword = await hashPassword(password)
  
  const user = await db.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  })
  
  logger.info('Super Admin creado', { email })
  
  return user as User
}

// === UTILIDADES ADICIONALES ===

// Verificar fortaleza de contraseña
export function validatePasswordStrength(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una letra mayúscula')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una letra minúscula')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Debe contener al menos un número')
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

// Generar token de recuperación de contraseña
export function generatePasswordResetToken(userId: string): string {
  return jwt.sign(
    { userId, type: 'password_reset' },
    APP_CONFIG.jwt.secret,
    { expiresIn: '1h' }
  )
}

// Verificar token de recuperación
export function verifyPasswordResetToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, APP_CONFIG.jwt.secret) as { userId: string; type: string }
    if (payload.type !== 'password_reset') return null
    return payload.userId
  } catch {
    return null
  }
}
