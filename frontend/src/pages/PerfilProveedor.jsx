import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { busquedaService } from '../services/busquedaService';
import { FiMapPin, FiPhone, FiGlobe, FiClock, FiStar } from 'react-icons/fi';
import Rating from '../components/common/Rating';
import CalendarioDisponibilidad from '../components/reservas/CalendarioDisponibilidad';
import SelectorHorario from '../components/reservas/SelectorHorario';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TarjetaProducto from '../components/busqueda/TarjetaProducto';
import { formatters } from '../utils/formatters';

const PerfilProveedor = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [proveedor, setProveedor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEspecialista, setSelectedEspecialista] = useState(null);
  const [selectedEspecialidad, setSelectedEspecialidad] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [activeTab, setActiveTab] = useState('servicios');

  useEffect(() => {
    loadProveedor();
  }, [id]);

  const loadProveedor = async () => {
    try {
      const { data } = await busquedaService.getProveedor(id);
      setProveedor(data);
      if (data.especialistas?.length > 0) {
        setSelectedEspecialista(data.especialistas[0]);
        if (data.especialistas[0].especialidades?.length > 0) {
          setSelectedEspecialidad(data.especialistas[0].especialidades[0]);
        }
      }
    } catch (error) {
      console.error('Error cargando proveedor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = async (fecha) => {
    setSelectedDate(fecha);
    if (selectedEspecialista && selectedEspecialidad) {
      try {
        const { data } = await busquedaService.getDisponibilidadCita(
          selectedEspecialista.id,
          fecha
        );
        setHorarios(data.horarios_disponibles || []);
      } catch (error) {
        console.error('Error cargando horarios:', error);
      }
    }
  };

  const handleReservarCita = (horario) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const reservaData = {
      proveedor_id: proveedor.id,
      especialista_id: selectedEspecialista.id,
      especialidad_id: selectedEspecialidad.id,
      fecha: selectedDate,
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin,
      duracion: 1 // o la duración de la especialidad
    };

    // Guardar en contexto o redirigir a checkout
    window.location.href = `/cliente/checkout/cita/${JSON.stringify(reservaData)}`;
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!proveedor) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Proveedor no encontrado</h2>
        <Link to="/" className="text-primary-600 hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cabecera del proveedor */}
      <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <img
            src={proveedor.usuario?.foto_perfil || '/default-avatar.png'}
            alt={proveedor.nombre_negocio || proveedor.usuario?.nombre}
            className="w-24 h-24 rounded-full object-cover"
          />
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {proveedor.nombre_negocio || proveedor.usuario?.nombre}
            </h1>
            
            <div className="flex flex-wrap gap-4 text-gray-600">
              {proveedor.ciudad && (
                <span className="flex items-center">
                  <FiMapPin className="mr-1" />
                  {proveedor.ciudad}
                </span>
              )}
              {proveedor.telefono_contacto && (
                <span className="flex items-center">
                  <FiPhone className="mr-1" />
                  {proveedor.telefono_contacto}
                </span>
              )}
              {proveedor.sitio_web && (
                <a
                  href={proveedor.sitio_web}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-primary-600 hover:underline"
                >
                  <FiGlobe className="mr-1" />
                  Sitio web
                </a>
              )}
            </div>
            
            <div className="flex items-center mt-2">
              <Rating value={proveedor.calificacion_promedio || 0} readonly />
              <span className="ml-2 text-gray-600">
                ({proveedor.total_resenas || 0} reseñas)
              </span>
            </div>
          </div>
          
          {proveedor.horario_atencion && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium flex items-center mb-2">
                <FiClock className="mr-2" />
                Horario de atención
              </h3>
              <div className="text-sm space-y-1">
                {Object.entries(proveedor.horario_atencion).map(([dia, horario]) => (
                  horario.activo && (
                    <div key={dia} className="flex justify-between">
                      <span className="capitalize">{dia}:</span>
                      <span>{horario.hora_inicio} - {horario.hora_fin}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
        
        {proveedor.descripcion && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Acerca de</h3>
            <p className="text-gray-600">{proveedor.descripcion}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b mb-6">
        <button
          onClick={() => setActiveTab('servicios')}
          className={`pb-2 px-4 ${
            activeTab === 'servicios'
              ? 'border-b-2 border-primary-600 text-primary-600 font-medium'
              : 'text-gray-600'
          }`}
        >
          Servicios
        </button>
        <button
          onClick={() => setActiveTab('productos')}
          className={`pb-2 px-4 ${
            activeTab === 'productos'
              ? 'border-b-2 border-primary-600 text-primary-600 font-medium'
              : 'text-gray-600'
          }`}
        >
          Productos en alquiler
        </button>
        <button
          onClick={() => setActiveTab('reseñas')}
          className={`pb-2 px-4 ${
            activeTab === 'reseñas'
              ? 'border-b-2 border-primary-600 text-primary-600 font-medium'
              : 'text-gray-600'
          }`}
        >
          Reseñas
        </button>
      </div>

      {/* Contenido de tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {activeTab === 'servicios' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Nuestros especialistas</h2>
              
              {/* Selector de especialista */}
              <div className="grid grid-cols-2 gap-4">
                {proveedor.especialistas?.map(esp => (
                  <button
                    key={esp.id}
                    onClick={() => {
                      setSelectedEspecialista(esp);
                      setSelectedEspecialidad(esp.especialidades?.[0]);
                      setSelectedDate(null);
                    }}
                    className={`card p-4 text-left ${
                      selectedEspecialista?.id === esp.id
                        ? 'border-2 border-primary-600'
                        : ''
                    }`}
                  >
                    <img
                      src={esp.foto || '/default-avatar.png'}
                      alt={esp.nombre}
                      className="w-16 h-16 rounded-full mb-2"
                    />
                    <h3 className="font-medium">{esp.nombre}</h3>
                    <p className="text-sm text-gray-600">
                      {esp.especialidades?.map(e => e.nombre).join(', ')}
                    </p>
                  </button>
                ))}
              </div>

              {/* Selector de especialidad */}
              {selectedEspecialista && (
                <div>
                  <h3 className="font-semibold mb-3">Selecciona el servicio</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedEspecialista.especialidades?.map(esp => (
                      <button
                        key={esp.id}
                        onClick={() => setSelectedEspecialidad(esp)}
                        className={`card p-4 ${
                          selectedEspecialidad?.id === esp.id
                            ? 'border-2 border-primary-600'
                            : ''
                        }`}
                      >
                        <h4 className="font-medium">{esp.nombre}</h4>
                        <p className="text-primary-600 font-bold mt-2">
                          ${esp.EspecialistaEspecialidad?.precio}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Calendario de disponibilidad */}
              {selectedEspecialidad && (
                <div className="mt-8">
                  <h3 className="font-semibold mb-4">Selecciona fecha y hora</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CalendarioDisponibilidad
                      onDateSelect={handleDateSelect}
                      horariosOcupados={horarios}
                    />
                    <SelectorHorario
                      horarios={horarios}
                      onSelect={handleReservarCita}
                      fecha={selectedDate}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'productos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {proveedor.productos?.map(producto => (
                <TarjetaProducto key={producto.id} producto={producto} />
              ))}
            </div>
          )}

          {activeTab === 'reseñas' && (
            <div className="space-y-4">
              {proveedor.reseñas?.map(reseña => (
                <div key={reseña.id} className="card p-4">
                  <div className="flex items-start space-x-3">
                    <img
                      src={reseña.cliente?.foto_perfil || '/default-avatar.png'}
                      alt={reseña.cliente?.nombre}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{reseña.cliente?.nombre}</h4>
                        <span className="text-sm text-gray-500">
                          {formatters.formatDate(reseña.fecha)}
                        </span>
                      </div>
                      <Rating value={reseña.puntuacion} readonly size="sm" />
                      <p className="text-gray-600 mt-2">{reseña.comentario}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar con información */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-semibold mb-4">Información de contacto</h3>
            <div className="space-y-3">
              <p className="flex items-center text-gray-600">
                <FiMapPin className="mr-2" />
                {proveedor.direccion || 'Dirección no especificada'}
              </p>
              <p className="flex items-center text-gray-600">
                <FiPhone className="mr-2" />
                {proveedor.telefono_contacto || 'Teléfono no especificado'}
              </p>
              <p className="flex items-center text-gray-600">
                <FiClock className="mr-2" />
                Registrado desde {formatters.formatDate(proveedor.fecha_creacion)}
              </p>
            </div>
          </div>

          {proveedor.ubicacion && (
            <div className="card p-6">
              <h3 className="font-semibold mb-4">Ubicación</h3>
              <div className="bg-gray-200 h-48 rounded-lg">
                {/* Aquí iría un mapa con Leaflet */}
                <div className="flex items-center justify-center h-full text-gray-500">
                  Mapa de ubicación
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerfilProveedor;