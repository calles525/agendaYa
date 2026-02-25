import { FiCalendar, FiClock, FiMapPin, FiUser } from 'react-icons/fi';
import { formatters } from '../../utils/formatters';

const ResumenReserva = ({ reserva, tipo, onConfirm }) => {
  return (
    <div className="bg-white rounded-lg shadow-soft p-6">
      <h3 className="text-lg font-semibold mb-4">Resumen de tu reserva</h3>
      
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <FiCalendar className="text-primary-600 mt-1" />
          <div>
            <p className="text-sm text-gray-600">Fecha</p>
            <p className="font-medium">
              {formatters.formatDate(reserva.fecha_reserva)}
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <FiClock className="text-primary-600 mt-1" />
          <div>
            <p className="text-sm text-gray-600">Horario</p>
            <p className="font-medium">
              {reserva.hora_inicio} - {reserva.hora_fin}
            </p>
            <p className="text-sm text-gray-600">
              Duración: {reserva.duracion_horas} horas
            </p>
          </div>
        </div>

        {tipo === 'alquiler' && reserva.direccion_entrega && (
          <div className="flex items-start space-x-3">
            <FiMapPin className="text-primary-600 mt-1" />
            <div>
              <p className="text-sm text-gray-600">Dirección de entrega</p>
              <p className="font-medium">{reserva.direccion_entrega}</p>
            </div>
          </div>
        )}

        {tipo === 'cita' && reserva.especialista && (
          <div className="flex items-start space-x-3">
            <FiUser className="text-primary-600 mt-1" />
            <div>
              <p className="text-sm text-gray-600">Especialista</p>
              <p className="font-medium">{reserva.especialista.nombre}</p>
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">${reserva.subtotal}</span>
          </div>
          {reserva.costo_delivery > 0 && (
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Costo de envío</span>
              <span className="font-medium">${reserva.costo_delivery}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary-600">${reserva.total}</span>
          </div>
        </div>

        <button
          onClick={onConfirm}
          className="btn-primary w-full mt-4"
        >
          Confirmar reserva
        </button>
      </div>
    </div>
  );
};

export default ResumenReserva;