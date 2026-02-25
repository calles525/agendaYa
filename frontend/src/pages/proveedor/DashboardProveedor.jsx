import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  FiCalendar, 
  FiPackage, 
  FiUsers, 
  FiClock,
  FiDollarSign,
  FiTrendingUp,
  FiSettings,
  FiUserPlus,
  FiList,
  FiStar,
  FiBell
} from 'react-icons/fi'
import { proveedorService } from '../../services/proveedorService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const DashboardProveedor = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    reservas_hoy: 0,
    reservas_pendientes: 0,
    ingresos_mes: 0,
    total_clientes: 0
  })
  const [proximasReservas, setProximasReservas] = useState([])

  useEffect(() => {
    cargarDashboard()
  }, [])

  const cargarDashboard = async () => {
    try {
      setLoading(true)
      const { data } = await proveedorService.getDashboard()
      setStats(data.resumen)
      setProximasReservas(data.proximas_reservas || [])
    } catch (error) {
      console.error('Error cargando dashboard:', error)
      toast.error('Error al cargar el dashboard')
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      title: 'Reservas hoy',
      value: stats.reservas_hoy,
      icon: FiCalendar,
      color: 'bg-blue-500',
      link: '/proveedor/reservas?fecha=hoy'
    },
    {
      title: 'Pendientes',
      value: stats.reservas_pendientes,
      icon: FiClock,
      color: 'bg-yellow-500',
      link: '/proveedor/reservas?estado=pendiente'
    },
    {
      title: 'Ingresos del mes',
      value: `$${stats.ingresos_mes.toLocaleString()}`,
      icon: FiDollarSign,
      color: 'bg-green-500',
      link: '/proveedor/reportes'
    },
    {
      title: 'Clientes totales',
      value: stats.total_clientes,
      icon: FiUsers,
      color: 'bg-purple-500',
      link: '/proveedor/clientes'
    }
  ]

  const menuItems = [
    {
      title: 'Gestionar Reservas',
      description: 'Ver y administrar todas tus reservas',
      icon: FiCalendar,
      color: 'bg-blue-100 text-blue-600',
      link: '/proveedor/reservas'
    },
    {
      title: 'Mis Productos',
      description: 'Administrar productos en alquiler',
      icon: FiPackage,
      color: 'bg-green-100 text-green-600',
      link: '/proveedor/productos'
    },
    {
      title: 'Especialidades',
      description: 'Configurar servicios que ofreces',
      icon: FiList,
      color: 'bg-purple-100 text-purple-600',
      link: '/proveedor/especialidades'  // ← Debe ser esta ruta
    },
    {
      title: 'Especialistas',
      description: 'Gestionar tu equipo',
      icon: FiUsers,
      color: 'bg-pink-100 text-pink-600',
      link: '/proveedor/especialistas'
    },
    {
      title: 'Horarios',
      description: 'Configurar disponibilidad',
      icon: FiClock,
      color: 'bg-orange-100 text-orange-600',
      link: '/proveedor/horarios'
    },
    {
      title: 'Reportes',
      description: 'Ver estadísticas y análisis',
      icon: FiTrendingUp,
      color: 'bg-indigo-100 text-indigo-600',
      link: '/proveedor/reportes'
    },
    {
      title: 'Clientes',
      description: 'Historial de clientes',
      icon: FiStar,
      color: 'bg-yellow-100 text-yellow-600',
      link: '/proveedor/clientes'
    },
    {
      title: 'Configuración',
      description: 'Ajustes de tu negocio',
      icon: FiSettings,
      color: 'bg-gray-100 text-gray-600',
      link: '/proveedor/configuracion'
    }
  ]

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-soft">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ¡Bienvenido, {user?.nombre}!
              </h1>
              <p className="text-gray-600 mt-1">
                Panel de control de proveedor
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-primary-600 relative">
                <FiBell size={24} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <Link
                to="/proveedor/configuracion"
                className="p-2 text-gray-600 hover:text-primary-600"
              >
                <FiSettings size={24} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <Link
              key={index}
              to={stat.link}
              className="bg-white rounded-xl shadow-soft p-6 hover:shadow-hover transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Próximas Reservas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h2 className="text-xl font-semibold mb-4">Próximas Reservas</h2>
              
              {proximasReservas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiCalendar className="mx-auto text-4xl mb-2" />
                  <p>No tienes reservas próximas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {proximasReservas.map((reserva) => (
                    <div key={reserva.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{reserva.cliente?.nombre}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(reserva.fecha_reserva).toLocaleDateString()} - {reserva.hora_inicio}
                          </p>
                          <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                            reserva.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                            reserva.estado === 'confirmada' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {reserva.estado}
                          </span>
                        </div>
                        <Link
                          to={`/proveedor/reservas/${reserva.id}`}
                          className="text-primary-600 hover:underline text-sm"
                        >
                          Ver detalles
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
              <div className="space-y-3">
                <Link
                  to="/proveedor/productos/nuevo"
                  className="flex items-center p-3 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100"
                >
                  <FiPackage className="mr-3" />
                  <span>Agregar nuevo producto</span>
                </Link>
                <Link
                  to="/proveedor/especialidades/nueva"
                  className="flex items-center p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                >
                  <FiList className="mr-3" />
                  <span>Nueva especialidad</span>
                </Link>
                <Link
                  to="/proveedor/especialistas/nuevo"
                  className="flex items-center p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100"
                >
                  <FiUserPlus className="mr-3" />
                  <span>Agregar especialista</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Menú Principal */}
        <h2 className="text-2xl font-bold mb-6">Gestión del Negocio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="bg-white rounded-xl shadow-soft p-6 hover:shadow-hover transition-all group"
            >
              <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <item.icon size={24} />
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardProveedor
