// src/routes/api/proveedores.js
const express = require('express');
const router = express.Router();
const proveedorController = require('../../controllers/proveedorController');
const reservaController = require('../../controllers/reservaController');
const { authorize, checkProveedorOwnership } = require('../../middleware/auth');
const { Especialidad, Especialista, ProductoAlquiler } = require('../../models');

// Middleware específico para proveedores
router.use(authorize('proveedor', 'admin'));

// Perfil y dashboard
router.get('/perfil', proveedorController.getPerfil);
router.put('/perfil', proveedorController.updatePerfil);
router.get('/dashboard', proveedorController.getDashboard);

// CRUD Especialidades
router.post('/especialidades', proveedorController.createEspecialidad);
router.put('/especialidades/:id', 
    checkProveedorOwnership(Especialidad), 
    proveedorController.updateEspecialidad
);
router.delete('/especialidades/:id', 
    checkProveedorOwnership(Especialidad), 
    proveedorController.deleteEspecialidad
);

// CRUD Especialistas
router.post('/especialistas', proveedorController.createEspecialista);
router.put('/especialistas/:id', 
    checkProveedorOwnership(Especialista), 
    proveedorController.updateEspecialista
);
router.delete('/especialistas/:id', 
    checkProveedorOwnership(Especialista), 
    proveedorController.deleteEspecialista
);

// Configurar horarios de especialistas
router.post('/especialistas/:especialista_id/especialidades/:especialidad_id/horario', 
    proveedorController.configurarHorarioEspecialista
);

// CRUD Productos
router.post('/productos', proveedorController.createProducto);
router.put('/productos/:id', 
    checkProveedorOwnership(ProductoAlquiler), 
    proveedorController.updateProducto
);
router.delete('/productos/:id', 
    checkProveedorOwnership(ProductoAlquiler), 
    proveedorController.deleteProducto
);

// Gestión de reservas
router.get('/reservas/pendientes', reservaController.getReservasPendientes);
router.put('/reservas/:id/confirmar', reservaController.confirmarReserva);
router.put('/reservas/:id/rechazar', reservaController.rechazarReserva);
router.put('/reservas/:id/completar', reservaController.completarReserva);

// Historial de clientes
router.post('/historial/notas', reservaController.agregarNotasHistorial);
router.get('/historial/cliente/:cliente_id', reservaController.getHistorialCliente);

// Reportes
router.get('/reportes', proveedorController.getReportes);

module.exports = router;