import api from './api';

export const clienteService = {
  // Perfil
  getPerfil: () => api.get('/usuarios/perfil'),
  updatePerfil: (data) => api.put('/usuarios/perfil', data),
  updateUbicacion: (data) => api.put('/usuarios/ubicacion', data),
  
  // Favoritos
  getFavoritos: () => api.get('/usuarios/favoritos'),
  addFavorito: (data) => api.post('/usuarios/favoritos', data),
  removeFavorito: (id) => api.delete(`/usuarios/favoritos/${id}`),
  
  // Historial médico
  getHistorial: () => api.get('/usuarios/historial'),
  
  // Notificaciones
  getNotificaciones: () => api.get('/usuarios/notificaciones'),
  marcarNotificacionLeida: (id) => api.put(`/usuarios/notificaciones/${id}/leer`),
};