'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/store/auth'
import type { User, Business } from '@/types'

export function useAuth() {
  const { 
    user, 
    token, 
    business, 
    isAuthenticated, 
    _hasHydrated,
    login, 
    logout, 
    setUser, 
    setBusiness 
  } = useAuthStore()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Verificar autenticación al cargar
  const checkAuth = useCallback(async () => {
    if (!_hasHydrated) {
      return
    }
    
    if (!token) {
      setLoading(false)
      return
    }

    try {
      setError(null)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.data.user)
          setBusiness(data.data.business)
        } else {
          // Token inválido - limpiar sesión
          logout()
        }
      } else if (response.status === 401) {
        // No autorizado - limpiar sesión
        logout()
      } else {
        // Otro error del servidor - mantener sesión local
        console.warn('Auth check failed with status:', response.status)
      }
    } catch (err) {
      // Error de red - mantener sesión local si hay token
      if (err instanceof Error && err.name === 'AbortError') {
        console.warn('Auth check timed out')
      } else {
        console.warn('Auth check network error:', err)
      }
      // No hacer logout en errores de red - mantener sesión local
    } finally {
      setLoading(false)
    }
  }, [token, setUser, setBusiness, logout, _hasHydrated])

  useEffect(() => {
    if (_hasHydrated) {
      checkAuth()
    } else {
      // Si no ha hidratado, esperar
      setLoading(true)
    }
  }, [_hasHydrated, checkAuth])

  // Cuando hidrata pero no hay token, dejar de cargar
  useEffect(() => {
    if (_hasHydrated && !token) {
      setLoading(false)
    }
  }, [_hasHydrated, token])

  // Función de login
  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        login(data.data.user, data.data.token, data.data.business)
        return { success: true }
      }

      setError(data.error || 'Error al iniciar sesion')
      return { success: false, error: data.error || 'Error al iniciar sesion' }
    } catch (err) {
      const errorMsg = 'Error de conexion. Por favor intenta de nuevo.'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }

  // Función de registro
  const signUp = async (userData: { email: string; password: string; name: string; phone?: string }) => {
    try {
      setError(null)
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (data.success) {
        login(data.data.user, data.data.token)
        return { success: true }
      }

      setError(data.error || 'Error al registrar')
      return { success: false, error: data.error || 'Error al registrar' }
    } catch (err) {
      const errorMsg = 'Error de conexion. Por favor intenta de nuevo.'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }

  // Función de logout
  const signOut = () => {
    logout()
    setError(null)
  }

  return {
    user,
    token,
    business,
    isAuthenticated,
    loading: loading || !_hasHydrated,
    error,
    signIn,
    signUp,
    signOut,
    checkAuth,
  }
}
