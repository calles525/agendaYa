import api from './api';

export const reservaService = {
  // Crear reservas
  createCita: (data) => api.post('/reservas/cita', data),
  createAlquiler: (data) => api.post('/reservas/alquiler', data),
  
  // Obtener reservas del usuario
  getMisReservas: (params) => api.get('/reservas/mis-reservas', { params }),
  
  // Detalle de reserva
  getReserva: (id) => api.get(`/reservas/${id}`),
  
  // Acciones sobre reservas
  cancelarReserva: (id, motivo) => api.put(`/reservas/${id}/cancelar`, { motivo }),
  calificarReserva: (id, data) => api.post(`/reservas/${id}/calificar`, data),
  
  // Para proveedores
  getReservasProveedor: (params) => api.get('/proveedores/reservas', { params }),
  confirmarReserva: (id) => api.put(`/proveedores/reservas/${id}/confirmar`),
  rechazarReserva: (id, motivo) => api.put(`/proveedores/reservas/${id}/rechazar`, { motivo }),
  completarReserva: (id, notas) => api.put(`/proveedores/reservas/${id}/completar`, { notas }),
  
  // Historial
  agregarNotasHistorial: (data) => api.post('/proveedores/historial/notas', data),
  getHistorialCliente: (clienteId) => api.get(`/proveedores/historial/cliente/${clienteId}`),
};