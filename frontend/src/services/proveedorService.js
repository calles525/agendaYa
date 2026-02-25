import api from './api';

export const proveedorService = {
    // Perfil
    getPerfil: () => api.get('/proveedores/perfil'),
    updatePerfil: (data) => api.put('/proveedores/perfil', data),
    getDashboard: () => api.get('/proveedores/dashboard'),

    // Especialidades
    getEspecialidades: () => api.get('/proveedores/especialidades'),
    createEspecialidad: (data) => api.post('/proveedores/especialidades', data),
    updateEspecialidad: (id, data) => api.put(`/proveedores/especialidades/${id}`, data),
    deleteEspecialidad: (id) => api.delete(`/proveedores/especialidades/${id}`),

    // Especialistas - CORREGIDO para manejar FormData
    getEspecialistas: () => api.get('/proveedores/especialistas'),
    
    createEspecialista: (data) => {
        // Si es FormData, no establecer Content-Type (axios lo hace automático)
        if (data instanceof FormData) {
            return api.post('/proveedores/especialistas', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        // Si es JSON normal
        return api.post('/proveedores/especialistas', data);
    },
    
    updateEspecialista: (id, data) => {
        if (data instanceof FormData) {
            return api.put(`/proveedores/especialistas/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.put(`/proveedores/especialistas/${id}`, data);
    },
    
    deleteEspecialista: (id) => api.delete(`/proveedores/especialistas/${id}`),
    
    configurarHorario: (especialistaId, especialidadId, data) =>
        api.post(`/proveedores/especialistas/${especialistaId}/especialidades/${especialidadId}/horario`, data),

    // Productos - También podrían necesitar fotos
    getProductos: () => api.get('/proveedores/productos'),
    createProducto: (data) => {
        if (data instanceof FormData) {
            return api.post('/proveedores/productos', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.post('/proveedores/productos', data);
    },
    updateProducto: (id, data) => {
        if (data instanceof FormData) {
            return api.put(`/proveedores/productos/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.put(`/proveedores/productos/${id}`, data);
    },
    deleteProducto: (id) => api.delete(`/proveedores/productos/${id}`),

    // Reportes
    getReportes: (params) => api.get('/proveedores/reportes', { params }),
};