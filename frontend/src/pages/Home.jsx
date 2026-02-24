import { Link } from 'react-router-dom'
import { FiCalendar, FiPackage, FiUsers, FiStar } from 'react-icons/fi'

const Home = () => {
  const features = [
    {
      icon: <FiCalendar className="w-8 h-8" />,
      title: "Citas profesionales",
      desc: "Agenda con los mejores especialistas"
    },
    {
      icon: <FiPackage className="w-8 h-8" />,
      title: "Alquiler de productos",
      desc: "Renta por hora lo que necesites"
    },
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: "Profesionales verificados",
      desc: "Todos nuestros proveedores son verificados"
    },
    {
      icon: <FiStar className="w-8 h-8" />,
      title: "Calificaciones reales",
      desc: "Opiniones de clientes como tú"
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="gradient-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Gestiona tus citas y alquileres
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            La plataforma más completa para encontrar profesionales y rentar productos por hora
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/busqueda" className="btn-secondary">
              Comenzar a buscar
            </Link>
            <Link to="/register?rol=proveedor" className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Quiero ser proveedor
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 text-center">
                <div className="text-primary-600 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl mb-8">
            Únete a miles de usuarios que ya usan nuestra plataforma
          </p>
          <Link to="/register" className="btn-primary text-lg">
            Regístrate gratis
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home