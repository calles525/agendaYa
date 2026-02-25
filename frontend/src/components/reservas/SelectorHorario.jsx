import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { horarioService } from '../../services/horarioService';
import { FiClock } from 'react-icons/fi';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const SelectorHorario = ({ especialistaId, onSelectHorario }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHorario, setSelectedHorario] = useState(null);

  useEffect(() => {
    if (selectedDate) {
      cargarDisponibilidad();
    }
  }, [selectedDate]);

  const cargarDisponibilidad = async () => {
    try {
      setLoading(true);
      const fechaStr = format(selectedDate, 'yyyy-MM-dd');
      const { data } = await horarioService.getDisponibilidadCita(especialistaId, fechaStr);
      setHorarios(data);
    } catch (error) {
      console.error('Error cargando disponibilidad:', error);
      toast.error('Error al cargar horarios disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedHorario(null);
  };

  const handleSelectHorario = (horario) => {
    setSelectedHorario(horario);
    onSelectHorario({
      fecha: format(selectedDate, 'yyyy-MM-dd'),
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin
    });
  };

  const isDateDisabled = (date) => {
    return isBefore(date, startOfDay(new Date()));
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const fechaStr = format(date, 'yyyy-MM-dd');
      // Aquí podrías marcar días con disponibilidad
      return null;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <h3 className="text-lg font-semibold mb-4">Selecciona fecha y hora</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendario */}
        <div>
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            locale="es"
            tileDisabled={({ date }) => isDateDisabled(date)}
            tileClassName={tileClassName}
            className="w-full border-none"
            minDate={new Date()}
            maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 días
          />
        </div>

        {/* Horarios */}
        <div>
          {!selectedDate ? (
            <div className="text-center py-8 text-gray-500">
              <FiClock className="mx-auto text-4xl mb-2" />
              <p>Selecciona una fecha</p>
            </div>
          ) : loading ? (
            <LoadingSpinner />
          ) : horarios.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay horarios disponibles para esta fecha</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                {horarios.map((horario, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectHorario(horario)}
                    disabled={!horario.disponible}
                    className={`
                      p-3 rounded-lg text-center transition-all
                      ${selectedHorario?.hora_inicio === horario.hora_inicio
                        ? 'bg-primary-600 text-white'
                        : horario.disponible
                          ? 'bg-white border border-gray-200 hover:border-primary-500 hover:bg-primary-50'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className="font-medium">{horario.hora_inicio}</div>
                    <div className="text-xs">
                      {horario.disponible ? 'Disponible' : 'Ocupado'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectorHorario;
