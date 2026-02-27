import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, Business, UserRole } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  business: Business | null
  isAuthenticated: boolean
  _hasHydrated: boolean
  
  // Actions
  setHasHydrated: (state: boolean) => void
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setBusiness: (business: Business | null) => void
  login: (user: User, token: string, business?: Business) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  
  // Helpers
  hasRole: (roles: UserRole[]) => boolean
}

// Safe localStorage wrapper
const safeLocalStorage = {
  getItem: (name: string): string | null => {
    try {
      if (typeof window === 'undefined') return null
      return localStorage.getItem(name)
    } catch {
      console.warn('localStorage not available for getItem')
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      if (typeof window === 'undefined') return
      localStorage.setItem(name, value)
    } catch {
      console.warn('localStorage not available for setItem')
    }
  },
  removeItem: (name: string): void => {
    try {
      if (typeof window === 'undefined') return
      localStorage.removeItem(name)
    } catch {
      console.warn('localStorage not available for removeItem')
    }
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      business: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setBusiness: (business) => set({ business }),

      login: (user, token, business) => set({
        user,
        token,
        business: business || null,
        isAuthenticated: true,
      }),

      logout: () => set({
        user: null,
        token: null,
        business: null,
        isAuthenticated: false,
      }),

      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null,
      })),

      hasRole: (roles) => {
        const { user } = get()
        return user ? roles.includes(user.role) : false
      },
    }),
    {
      name: 'agendaya-auth',
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        business: state.business,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

// Hook para hacer fetch autenticado
export function useAuthFetch() {
  const { token, logout } = useAuthStore()

  const authFetch = async (url: string, options: RequestInit = {}) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (response.status === 401) {
        logout()
        return null
      }

      return response.json()
    } catch (error) {
      console.warn('Auth fetch error:', error)
      return null
    }
  }

  return authFetch
}
