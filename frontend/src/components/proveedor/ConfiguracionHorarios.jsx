import { useState, useEffect } from 'react';
import { FiClock, FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';
import { proveedorService } from '../../services/proveedorService';
import { horarioService } from '../../services/horarioService';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

const ConfiguracionHorarios = ({ especialistaId, especialistaNombre, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [especialidades, setEspecialidades] = useState([]);
  const [selectedEspecialidad, setSelectedEspecialidad] = useState('');
  const [horarios, setHorarios] = useState([]);
  const [horariosExistentes, setHorariosExistentes] = useState([]);

  const diasSemana = [
    { id: 'lunes', nombre: 'Lunes' },
    { id: 'martes', nombre: 'Martes' },
    { id: 'miercoles', nombre: 'Miércoles' },
    { id: 'jueves', nombre: 'Jueves' },
    { id: 'viernes', nombre: 'Viernes' },
    { id: 'sabado', nombre: 'Sábado' },
    { id: 'domingo', nombre: 'Domingo' }
  ];

  // Generar horas en formato AM/PM (de 1:00 AM a 12:00 PM)
  const horas = [];
  
  // Horas AM (1:00 AM a 11:00 AM)
  for (let i = 1; i <= 11; i++) {
    horas.push({
      value: `${i.toString().padStart(2, '0')}:00`,
      label: `${i}:00 AM`
    });
    horas.push({
      value: `${i.toString().padStart(2, '0')}:30`,
      label: `${i}:30 AM`
    });
  }
  
  // 12:00 PM (mediodía)
  horas.push({ value: '12:00', label: '12:00 PM' });
  horas.push({ value: '12:30', label: '12:30 PM' });
  
  // Horas PM (1:00 PM a 11:00 PM)
  for (let i = 1; i <= 11; i++) {
    horas.push({
      value: `${(i + 12).toString().padStart(2, '0')}:00`,
      label: `${i}:00 PM`
    });
    horas.push({
      value: `${(i + 12).toString().padStart(2, '0')}:30`,
      label: `${i}:30 PM`
    });
  }

  useEffect(() => {
    cargarEspecialidades();
  }, []);

  useEffect(() => {
    if (selectedEspecialidad) {
      cargarHorarios();
    }
  }, [selectedEspecialidad]);

  const cargarEspecialidades = async () => {
    try {
      const { data } = await proveedorService.getEspecialidades();
      setEspecialidades(data);
      if (data.length > 0) {
        setSelectedEspecialidad(data[0].id);
      }
    } catch (error) {
      console.error('Error cargando especialidades:', error);
      toast.error('Error al cargar especialidades');
    }
  };

  const cargarHorarios = async () => {
    try {
      setLoading(true);
      const { data } = await horarioService.getHorariosEspecialista(especialistaId);
      setHorariosExistentes(data.filter(h => h.especialidad_id === parseInt(selectedEspecialidad)));
      
      // Inicializar horarios por día
      const nuevosHorarios = diasSemana.map(dia => {
        const existente = data.find(h => 
          h.dia_semana === dia.id && 
          h.especialidad_id === parseInt(selectedEspecialidad)
        );
        return {
          dia: dia.id,
          activo: existente ? true : false,
          hora_inicio: existente?.hora_inicio || '09:00',
          hora_fin: existente?.hora_fin || '18:00'
        };
      });
      setHorarios(nuevosHorarios);
    } catch (error) {
      console.error('Error cargando horarios:', error);
      toast.error('Error al cargar horarios');
    } finally {
      setLoading(false);
    }
  };

  const handleHorarioChange = (dia, campo, valor) => {
    setHorarios(prev =>
      prev.map(h =>
        h.dia === dia ? { ...h, [campo]: valor } : h
      )
    );
  };

  // Función para obtener la etiqueta AM/PM de una hora
  const getHoraLabel = (hora) => {
    const horaEncontrada = horas.find(h => h.value === hora);
    return horaEncontrada ? horaEncontrada.label : hora;
  };

  const handleGuardar = async () => {
    try {
      setLoading(true);
      
      // Filtrar solo días activos
      const horariosActivos = horarios
        .filter(h => h.activo)
        .map(h => ({
          dia_semana: h.dia,
          hora_inicio: h.hora_inicio,
          hora_fin: h.hora_fin
        }));

      await horarioService.configurarHorario(
        especialistaId,
        selectedEspecialidad,
        horariosActivos
      );

      toast.success('Horarios guardados correctamente');
      onClose();
    } catch (error) {
      console.error('Error guardando horarios:', error);
      toast.error('Error al guardar horarios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-2">
          Configurar Horarios
        </h2>
        <p className="text-gray-600 mb-6">
          Especialista: <span className="font-semibold">{especialistaNombre}</span>
        </p>

        {/* Selector de especialidad */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Especialidad
          </label>
          <select
            value={selectedEspecialidad}
            onChange={(e) => setSelectedEspecialidad(e.target.value)}
            className="input-field"
          >
            {especialidades.map(esp => (
              <option key={esp.id} value={esp.id}>
                {esp.icono} {esp.nombre}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Tabla de horarios */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left">Día</th>
                    <th className="px-4 py-3 text-left">Activo</th>
                    <th className="px-4 py-3 text-left">Hora Inicio</th>
                    <th className="px-4 py-3 text-left">Hora Fin</th>
                  </tr>
                </thead>
                <tbody>
                  {horarios.map((horario) => (
                    <tr key={horario.dia} className="border-b">
                      <td className="px-4 py-3 capitalize">
                        {diasSemana.find(d => d.id === horario.dia)?.nombre}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={horario.activo}
                          onChange={(e) => handleHorarioChange(horario.dia, 'activo', e.target.checked)}
                          className="w-5 h-5 text-primary-600"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={horario.hora_inicio}
                          onChange={(e) => handleHorarioChange(horario.dia, 'hora_inicio', e.target.value)}
                          disabled={!horario.activo}
                          className="input-field"
                        >
                          {horas.map(h => (
                            <option key={h.value} value={h.value}>
                              {h.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={horario.hora_fin}
                          onChange={(e) => handleHorarioChange(horario.dia, 'hora_fin', e.target.value)}
                          disabled={!horario.activo}
                          className="input-field"
                        >
                          {horas.map(h => (
                            <option key={h.value} value={h.value}>
                              {h.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Leyenda de horarios */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 flex items-center">
                <FiClock className="mr-2" />
                Los horarios se guardan en formato 24h pero se muestran en AM/PM para fácil lectura.
              </p>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={onClose}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                className="btn-primary flex items-center"
                disabled={loading}
              >
                <FiSave className="mr-2" />
                Guardar Horarios
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfiguracionHorarios;