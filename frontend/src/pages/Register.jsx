import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiUser, FiMail, FiLock, FiPhone } from 'react-icons/fi'

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
    // Aquí iría la lógica de registro
    setLoading(false)
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
            </div>

            <div>
              <label className="input-label">Tipo de cuenta</label>
              <select
                value={formData.rol}
                onChange={(e) => setFormData({...formData, rol: e.target.value})}
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
              {loading ? 'Creando cuenta...' : 'Registrarse'}
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