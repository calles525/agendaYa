import { createContext, useState, useContext, useEffect } from 'react'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const { data } = await authService.verify()
        setUser(data.usuario)
      } catch (error) {
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }

  const login = async (email, password) => {
    try {
      const { data } = await authService.login(email, password)
      localStorage.setItem('token', data.token)
      setUser(data.usuario)
      toast.success('¡Bienvenido!')
      return true
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al iniciar sesión')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    toast.success('Sesión cerrada')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}