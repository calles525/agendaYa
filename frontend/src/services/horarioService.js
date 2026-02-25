import api from './api';

export const horarioService = {
    // Obtener horarios de un especialista
    getHorariosEspecialista: (especialistaId) => 
        api.get(`/horarios/especialista/${especialistaId}`),

    // Configurar horarios
    configurarHorario: (especialistaId, especialidadId, horarios) => 
        api.post(`/horarios/especialista/${especialistaId}/especialidad/${especialidadId}`, { horarios }),

    // Obtener disponibilidad para una fecha
    getDisponibilidadCita: (especialistaId, fecha) => 
        api.get('/horarios/disponibilidad/cita', { 
            params: { especialista_id: especialistaId, fecha } 
        }),

    // Verificar disponibilidad de producto
    verificarDisponibilidadProducto: (productoId, fecha, horaInicio, duracionHoras) => 
        api.post('/horarios/disponibilidad/producto/verificar', {
            producto_id: productoId,
            fecha,
            hora_inicio: horaInicio,
            duracion_horas: duracionHoras
        }),

    // Reservar horario (uso interno al crear reserva)
    reservarHorario: (data) => api.post('/horarios/reservar', data),

    // Liberar horario (al cancelar reserva)
    liberarHorario: (reservaId) => api.put(`/horarios/liberar/${reservaId}`)
};
