import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiUser, FiMail, FiLock, FiPhone } from 'react-icons/fi'
import toast from 'react-hot-toast'

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    rol: 'cliente',
    tipo_proveedor: null
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Validaciones básicas
    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    if (formData.rol === 'proveedor' && !formData.tipo_proveedor) {
      toast.error('Selecciona el tipo de proveedor')
      setLoading(false)
      return
    }

    try {
      // Llamar al servicio de registro
      const result = await register(formData)
      
      if (result.success) {
        toast.success('Registro exitoso!')
        // Redirigir según el rol
        if (formData.rol === 'cliente') {
          navigate('/cliente/dashboard')
        } else if (formData.rol === 'proveedor') {
          navigate('/proveedor/dashboard')
        } else {
          navigate('/')
        }
      }
    } catch (error) {
      console.error('Error en registro:', error)
      toast.error(error.response?.data?.error || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Crear cuenta</h2>
          <p className="text-gray-600 mt-2">Comienza a usar BookingSaaS</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Nombre completo</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="input-field pl-10"
                  placeholder="Juan Pérez"
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="input-field pl-10"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label">Teléfono</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  className="input-field pl-10"
                  placeholder="5512345678"
                />
              </div>
            </div>

            <div>
              <label className="input-label">Contraseña</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Mínimo 6 caracteres, una mayúscula y un número
              </p>
            </div>

            <div>
              <label className="input-label">Tipo de cuenta</label>
              <select
                value={formData.rol}
                onChange={(e) => {
                  setFormData({
                    ...formData, 
                    rol: e.target.value,
                    tipo_proveedor: e.target.value === 'cliente' ? null : formData.tipo_proveedor
                  })
                }}
                className="input-field"
              >
                <option value="cliente">Cliente (quiero reservar)</option>
                <option value="proveedor">Proveedor (quiero ofrecer servicios)</option>
              </select>
            </div>

            {formData.rol === 'proveedor' && (
              <div>
                <label className="input-label">Tipo de proveedor</label>
                <select
                  value={formData.tipo_proveedor || ''}
                  onChange={(e) => setFormData({...formData, tipo_proveedor: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Selecciona una opción</option>
                  <option value="individual">Persona individual (freelancer)</option>
                  <option value="negocio">Negocio (con empleados)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando cuenta...
                </span>
              ) : 'Registrarse'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-primary-600 hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register