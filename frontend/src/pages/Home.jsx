import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { busquedaService } from '../services/busquedaService';
import TarjetaProveedor from '../components/busqueda/TarjetaProveedor';
import TarjetaProducto from '../components/busqueda/TarjetaProducto';
import LoadingSpinner from '../components/common/LoadingSpinner';
import 'swiper/css';
import 'swiper/css/pagination';

const Home = () => {
  const [populares, setPopulares] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPopulares();
  }, []);

  const loadPopulares = async () => {
    try {
      const { data } = await busquedaService.getPopulares();
      setPopulares(data);
    } catch (error) {
      console.error('Error cargando populares:', error);
    } finally {
      setLoading(false);
    }
  };

  const categorias = [
    { id: 1, nombre: 'Salud y bienestar', icon: '🏥', color: 'bg-blue-100' },
    { id: 2, nombre: 'Belleza', icon: '💇', color: 'bg-pink-100' },
    { id: 3, nombre: 'Eventos', icon: '🎉', color: 'bg-purple-100' },
    { id: 4, nombre: 'Educación', icon: '📚', color: 'bg-green-100' },
    { id: 5, nombre: 'Hogar', icon: '🏠', color: 'bg-yellow-100' },
    { id: 6, nombre: 'Deportes', icon: '⚽', color: 'bg-orange-100' },
  ];

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="gradient-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in">
            Encuentra los mejores servicios y productos
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Reserva citas con profesionales o alquila productos por hora de manera fácil y segura
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/busqueda" className="btn-secondary text-lg">
              Comenzar a buscar
            </Link>
            <Link to="/register?rol=proveedor" className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Quiero ser proveedor
            </Link>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Explora por categorías
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categorias.map((cat) => (
              <Link
                key={cat.id}
                to={`/busqueda?categoria=${cat.id}`}
                className="card p-6 text-center hover:scale-105 transition-transform"
              >
                <div className={`text-4xl mb-3 ${cat.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto`}>
                  {cat.icon}
                </div>
                <h3 className="font-medium">{cat.nombre}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Proveedores destacados */}
      {populares?.proveedores?.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Proveedores destacados
            </h2>
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={20}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 }
              }}
              autoplay={{ delay: 3000 }}
              pagination={{ clickable: true }}
            >
              {populares.proveedores.map((proveedor) => (
                <SwiperSlide key={proveedor.id}>
                  <TarjetaProveedor proveedor={proveedor} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      )}

      {/* Productos populares */}
      {populares?.productos?.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Productos más alquilados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {populares.productos.map((producto) => (
                <TarjetaProducto key={producto.id} producto={producto} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-primary-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Tienes un negocio o ofreces servicios?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Únete a nuestra plataforma y llega a miles de clientes potenciales
          </p>
          <Link
            to="/register?rol=proveedor"
            className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition inline-block"
          >
            Comienza a vender hoy
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;