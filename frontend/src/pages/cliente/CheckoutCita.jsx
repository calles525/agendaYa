import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { busquedaService } from '../../services/busquedaService';
import { reservaService } from '../../services/reservaService';
import { horarioService } from '../../services/horarioService';
import SelectorHorario from '../../components/reservas/SelectorHorario';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiUser, FiCalendar, FiClock, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CheckoutCita = () => {
  const { especialistaId, especialidadId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [creando, setCreando] = useState(false);
  const [especialista, setEspecialista] = useState(null);
  const [especialidad, setEspecialidad] = useState(null);
  const [proveedor, setProveedor] = useState(null);
  const [selectedHorario, setSelectedHorario] = useState(null);
  const [precio, setPrecio] = useState(0);

  useEffect(() => {
    cargarDatos();
  }, [especialistaId, especialidadId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar especialista
      const espRes = await busquedaService.getEspecialista(especialistaId);
      setEspecialista(espRes.data);
      
      // Cargar especialidad y precio
      const espData = espRes.data;
      const especialidadData = espData.especialidades?.find(e => e.id === parseInt(especialidadId));
      setEspecialidad(especialidadData);
      
      if (especialidadData?.EspecialistaEspecialidad?.precio) {
        setPrecio(especialidadData.EspecialistaEspecialidad.precio);
      }
      
      // Cargar proveedor
      if (espData.proveedor) {
        setProveedor(espData.proveedor);
      }
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHorario = (horario) => {
    setSelectedHorario(horario);
  };

  const handleConfirmarReserva = async () => {
    if (!selectedHorario) {
      toast.error('Selecciona una fecha y hora');
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setCreando(true);

      const reservaData = {
        proveedor_id: proveedor.id,
        especialidad_id: parseInt(especialidadId),
        especialista_id: parseInt(especialistaId),
        fecha: selectedHorario.fecha,
        hora_inicio: selectedHorario.hora_inicio,
        duracion: 1, // duración en horas (la obtendrías de la especialidad)
        notas: ''
      };

      const { data } = await reservaService.createCita(reservaData);
      
      toast.success('¡Reserva creada exitosamente!');
      navigate('/cliente/reservas');
      
    } catch (error) {
      console.error('Error creando reserva:', error);
      toast.error(error.response?.data?.error || 'Error al crear la reserva');
    } finally {
      setCreando(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Confirmar reserva</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal - Selector de horario */}
          <div className="lg:col-span-2">
            <SelectorHorario
              especialistaId={especialistaId}
              onSelectHorario={handleSelectHorario}
            />
          </div>

          {/* Columna lateral - Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-soft p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Resumen de la cita</h2>
              
              {/* Especialista */}
              <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <img
                  src={especialista?.foto || '/default-avatar.png'}
                  alt={especialista?.nombre}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{especialista?.nombre}</p>
                  <p className="text-sm text-gray-600">{especialidad?.nombre}</p>
                </div>
              </div>

              {/* Proveedor */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Proveedor</p>
                <p className="font-medium">{proveedor?.nombre_negocio || proveedor?.usuario?.nombre}</p>
              </div>

              {/* Horario seleccionado */}
              {selectedHorario ? (
                <div className="mb-4 p-3 bg-primary-50 rounded-lg">
                  <p className="text-sm text-primary-600">Horario seleccionado</p>
                  <p className="font-medium">
                    {new Date(selectedHorario.fecha).toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    {selectedHorario.hora_inicio} - {selectedHorario.hora_fin}
                  </p>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg text-center text-gray-500">
                  <FiCalendar className="mx-auto mb-1" />
                  <p className="text-sm">Selecciona una fecha y hora</p>
                </div>
              )}

              {/* Precio */}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Precio</span>
                  <span className="text-2xl font-bold text-primary-600">
                    ${precio}
                  </span>
                </div>

                <button
                  onClick={handleConfirmarReserva}
                  disabled={!selectedHorario || creando}
                  className="btn-primary w-full"
                >
                  {creando ? 'Creando reserva...' : 'Confirmar reserva'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCita;
