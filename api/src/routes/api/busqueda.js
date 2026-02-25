const express = require('express');
const router = express.Router();
const busquedaController = require('../../controllers/busquedaController');

// Búsqueda principal
router.get('/', busquedaController.buscar);

// Disponibilidad
router.get('/disponibilidad/cita', busquedaController.getDisponibilidadCita);
router.get('/disponibilidad/producto', busquedaController.getDisponibilidadProducto);

// Verificar disponibilidad (POST)
router.post('/verificar/cita', busquedaController.verificarDisponibilidadCita);
router.post('/verificar/producto', busquedaController.verificarDisponibilidadProducto);

// Detalles específicos
router.get('/proveedor/:id', busquedaController.getProveedorDetalle);
router.get('/producto/:id', busquedaController.getProductoDetalle);
router.get('/especialista/:id', busquedaController.getEspecialistaDetalle);

// Categorías populares
router.get('/populares', busquedaController.getPopulares);

module.exports = router;