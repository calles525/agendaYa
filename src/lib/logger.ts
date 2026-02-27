// ==================== SISTEMA DE LOGGING ESTRUCTURADO ====================

import { APP_CONFIG } from './env'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  error?: {
    name: string
    message: string
    stack?: string
  }
  requestId?: string
  userId?: string
  businessId?: string
}

// Prioridad de niveles
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const currentLevel = LOG_LEVELS[APP_CONFIG.logLevel] ?? LOG_LEVELS.info

// Formatear timestamp ISO
function getTimestamp(): string {
  return new Date().toISOString()
}

// Colores para consola (solo desarrollo)
const COLORS = {
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m',  // green
  warn: '\x1b[33m',  // yellow
  error: '\x1b[31m', // red
  reset: '\x1b[0m',
}

// Formatear para consola (desarrollo)
function formatConsole(entry: LogEntry): string {
  const color = COLORS[entry.level]
  const reset = COLORS.reset
  const timestamp = entry.timestamp.split('T')[1].split('.')[0]
  
  let output = `${color}[${entry.level.toUpperCase().padEnd(5)}]${reset} ${timestamp} - ${entry.message}`
  
  if (entry.context && Object.keys(entry.context).length > 0) {
    output += `\n  Context: ${JSON.stringify(entry.context, null, 2)}`
  }
  
  if (entry.error) {
    output += `\n  Error: ${entry.error.name}: ${entry.error.message}`
    if (entry.error.stack && APP_CONFIG.isDev) {
      output += `\n  Stack: ${entry.error.stack.split('\n').slice(0, 3).join('\n  ')}`
    }
  }
  
  return output
}

// Formatear para JSON (producción)
function formatJson(entry: LogEntry): string {
  return JSON.stringify(entry)
}

// Logger principal
class Logger {
  private context: Record<string, unknown> = {}
  private requestId?: string
  private userId?: string
  private businessId?: string

  setContext(context: Record<string, unknown>): this {
    this.context = { ...this.context, ...context }
    return this
  }

  setRequestId(requestId: string): this {
    this.requestId = requestId
    return this
  }

  setUserId(userId: string): this {
    this.userId = userId
    return this
  }

  setBusinessId(businessId: string): this {
    this.businessId = businessId
    return this
  }

  clear(): this {
    this.context = {}
    this.requestId = undefined
    this.userId = undefined
    this.businessId = undefined
    return this
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
    if (LOG_LEVELS[level] < currentLevel) return

    const entry: LogEntry = {
      timestamp: getTimestamp(),
      level,
      message,
      context: { ...this.context, ...context },
      requestId: this.requestId,
      userId: this.userId,
      businessId: this.businessId,
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    }

    if (APP_CONFIG.isDev) {
      console.log(formatConsole(entry))
    } else {
      console.log(formatJson(entry))
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context)
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context)
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const err = error instanceof Error ? error : error ? new Error(String(error)) : undefined
    this.log('error', message, context, err)
  }

  // Métodos de conveniencia para eventos comunes
  request(method: string, path: string, context?: Record<string, unknown>): void {
    this.info(`--> ${method} ${path}`, context)
  }

  response(method: string, path: string, status: number, duration: number): void {
    const level = status >= 400 ? 'warn' : 'info'
    this.log(level, `<-- ${method} ${path} ${status} (${duration}ms)`)
  }

  auth(email: string, success: boolean, reason?: string): void {
    if (success) {
      this.info('Auth exitoso', { email })
    } else {
      this.warn('Auth fallido', { email, reason })
    }
  }

  db(operation: string, table: string, duration?: number): void {
    this.debug(`DB: ${operation} on ${table}`, duration ? { duration: `${duration}ms` } : undefined)
  }
}

// Exportar instancia singleton
export const logger = new Logger()

// Función helper para crear nuevo logger con contexto
export function createLogger(context?: Record<string, unknown>): Logger {
  const log = new Logger()
  if (context) {
    log.setContext(context)
  }
  return log
}

// Middleware para agregar requestId
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export function withRequestLogging(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const requestId = randomUUID()
    const startTime = Date.now()
    const { method } = request
    const path = new URL(request.url).pathname

    logger
      .setRequestId(requestId)
      .request(method, path, { query: Object.fromEntries(new URL(request.url).searchParams) })

    try {
      const response = await handler(request)
      const duration = Date.now() - startTime
      
      logger.response(method, path, response.status, duration)
      
      // Agregar header de request ID
      response.headers.set('X-Request-Id', requestId)
      
      return response
    } catch (error) {
      const duration = Date.now() - startTime
      logger
        .setRequestId(requestId)
        .error(`Error en ${method} ${path}`, error, { duration })
      
      throw error
    } finally {
      logger.clear()
    }
  }
}
