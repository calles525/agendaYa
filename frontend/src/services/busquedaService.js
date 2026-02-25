import api from './api';

export const busquedaService = {
  // Búsqueda principal
  buscar: (params) => api.get('/busqueda', { params }),
  
  // Búsqueda de proveedores
  getProveedores: (filtros) => api.get('/busqueda/proveedores', { params: filtros }),
  
  // Búsqueda de productos
  getProductos: (filtros) => api.get('/busqueda/productos', { params: filtros }),
  
  // Detalles
  getProveedor: (id) => api.get(`/busqueda/proveedor/${id}`),
  getProducto: (id) => api.get(`/busqueda/producto/${id}`),
  getEspecialista: (id) => api.get(`/busqueda/especialista/${id}`),
  
  // Disponibilidad
  getDisponibilidadCita: (especialistaId, fecha) => 
    api.get('/busqueda/disponibilidad/cita', { params: { especialista_id: especialistaId, fecha } }),
  
  getDisponibilidadProducto: (productoId, fecha) => 
    api.get('/busqueda/disponibilidad/producto', { params: { producto_id: productoId, fecha } }),
  
  verificarDisponibilidadCita: (especialistaId, fecha, hora) =>
    api.post('/busqueda/verificar/cita', { especialista_id: especialistaId, fecha, hora }),
  
  verificarDisponibilidadProducto: (productoId, fecha, hora) =>
    api.post('/busqueda/verificar/producto', { producto_id: productoId, fecha, hora }),
  
  // Categorías populares
  getPopulares: () => api.get('/busqueda/populares'),
};