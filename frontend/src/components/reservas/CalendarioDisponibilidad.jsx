import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isSameDay, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

const CalendarioDisponibilidad = ({ onDateSelect, horariosOcupados = [] }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  const isDateDisabled = (date) => {
    // No permitir fechas pasadas
    if (isBefore(date, startOfDay(new Date()))) {
      return true;
    }

    // Verificar si el día está completamente ocupado
    const dateStr = format(date, 'yyyy-MM-dd');
    const ocupadosEseDia = horariosOcupados.filter(h => h.fecha === dateStr);
    
    // Si hay 8 o más horas ocupadas, probablemente está lleno
    return ocupadosEseDia.length >= 8;
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    onDateSelect(format(date, 'yyyy-MM-dd'));
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = format(date, 'yyyy-MM-dd');
      const ocupados = horariosOcupados.filter(h => h.fecha === dateStr);
      
      if (ocupados.length > 0) {
        return ocupados.length >= 8 ? 'bg-red-100' : 'bg-yellow-100';
      }
    }
    return null;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-soft">
      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        locale="es"
        tileDisabled={({ date }) => isDateDisabled(date)}
        tileClassName={tileClassName}
        className="w-full border-none"
      />
      <div className="flex items-center justify-center space-x-4 mt-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-100 rounded-full mr-1" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-100 rounded-full mr-1" />
          <span>Poca disponibilidad</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-100 rounded-full mr-1" />
          <span>Completo</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarioDisponibilidad;