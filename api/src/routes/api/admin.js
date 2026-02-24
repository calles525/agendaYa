// src/routes/api/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/adminController');
const { authorize } = require('../../middleware/auth');

// Todas las rutas de admin requieren rol de administrador
router.use(authorize('admin'));

// Gestión de usuarios
router.get('/usuarios', adminController.getUsuarios);
router.get('/usuarios/:id', adminController.getUsuarioDetalle);
router.put('/usuarios/:id', adminController.updateUsuario);

// Aprobación de proveedores
router.get('/proveedores/pendientes', adminController.getProveedoresPendientes);
router.post('/proveedores/:id/aprobar', adminController.aprobarProveedor);
router.post('/proveedores/:id/rechazar', adminController.rechazarProveedor);

// Estadísticas
router.get('/estadisticas', adminController.getEstadisticasGlobales);

// Configuración de la plataforma
router.get('/configuracion', adminController.getConfiguracion);
router.put('/configuracion', adminController.updateConfiguracion);

module.exports = router;