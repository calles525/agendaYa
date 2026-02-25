import api from './api';

export const adminService = {
  // Usuarios
  getUsuarios: (params) => api.get('/admin/usuarios', { params }),
  getUsuario: (id) => api.get(`/admin/usuarios/${id}`),
  updateUsuario: (id, data) => api.put(`/admin/usuarios/${id}`, data),
  
  // Proveedores pendientes
  getProveedoresPendientes: () => api.get('/admin/proveedores/pendientes'),
  aprobarProveedor: (id, comision) => api.post(`/admin/proveedores/${id}/aprobar`, { comision }),
  rechazarProveedor: (id, motivo) => api.post(`/admin/proveedores/${id}/rechazar`, { motivo }),
  
  // Estadísticas
  getEstadisticas: () => api.get('/admin/estadisticas'),
  
  // Configuración
  getConfiguracion: () => api.get('/admin/configuracion'),
  updateConfiguracion: (data) => api.put('/admin/configuracion', data),
};