// ==================== CONFIGURACIÓN DE VARIABLES DE ENTORNO ====================
// Validación estricta de variables de entorno requeridas

import { z } from 'zod'

const envSchema = z.object({
  // Base de datos
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es requerido'),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  
  // Rate Limiting
  RATE_LIMIT_MAX: z.string().default('100'),
  RATE_LIMIT_WINDOW: z.string().default('60000'), // 1 minuto
  
  // Logs
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
})

// Función para validar variables de entorno
function validateEnv() {
  const parsed = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW,
    LOG_LEVEL: process.env.LOG_LEVEL,
  })

  if (!parsed.success) {
    console.error('❌ Error de configuración:')
    parsed.error.issues.forEach((issue) => {
      console.error(`   - ${issue.path.join('.')}: ${issue.message}`)
    })
    
    // En desarrollo, permitir continuar con valores por defecto
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
    
    // Valores por defecto para desarrollo
    return {
      DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
      JWT_SECRET: process.env.JWT_SECRET || 'agendaya-dev-secret-key-minimum-32-chars!',
      JWT_EXPIRES_IN: '7d',
      NODE_ENV: 'development' as const,
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      RATE_LIMIT_MAX: '100',
      RATE_LIMIT_WINDOW: '60000',
      LOG_LEVEL: 'debug' as const,
    }
  }

  return parsed.data
}

export const env = validateEnv()
export type Env = z.infer<typeof envSchema>

// Constantes derivadas
export const APP_CONFIG = {
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  rateLimit: {
    max: parseInt(env.RATE_LIMIT_MAX),
    windowMs: parseInt(env.RATE_LIMIT_WINDOW),
  },
  isDev: env.NODE_ENV === 'development',
  isProd: env.NODE_ENV === 'production',
} as const
