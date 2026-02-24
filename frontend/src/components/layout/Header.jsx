import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FiSearch, FiUser, FiLogOut } from 'react-icons/fi'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="bg-white shadow-soft">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary-600">
            BookingSaaS
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar servicios o productos..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/busqueda?q=${e.target.value}`)
                  }
                }}
              />
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to={`/${user.rol}/dashboard`} className="nav-link">
                  <FiUser className="inline mr-1" />
                  {user.nombre}
                </Link>
                <button onClick={logout} className="nav-link">
                  <FiLogOut />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Iniciar Sesión</Link>
                <Link to="/register" className="btn-primary">Registrarse</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header