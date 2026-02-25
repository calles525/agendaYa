import { createContext, useState, useContext, useEffect } from 'react'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      loadUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const loadUser = async () => {
    try {
      const { data } = await authService.verify()
      setUser(data.usuario)
    } catch (error) {
      localStorage.removeItem('token')
      setToken(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const { data } = await authService.login(email, password)
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.usuario)
      toast.success('¡Bienvenido!')
      return { success: true }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al iniciar sesión')
      return { success: false, error: error.response?.data?.error }
    }
  }

  const register = async (userData) => {
    try {
      const { data } = await authService.register(userData)
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.usuario)
      toast.success('¡Registro exitoso!')
      return { success: true }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al registrarse')
      return { success: false, error: error.response?.data?.error }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    toast.success('Sesión cerrada')
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isCliente: user?.rol === 'cliente',
    isProveedor: user?.rol === 'proveedor',
    isAdmin: user?.rol === 'admin',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}