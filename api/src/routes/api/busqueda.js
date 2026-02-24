// src/routes/api/busqueda.js
const express = require('express');
const router = express.Router();
const busquedaController = require('../../controllers/busquedaController');
const { validateBusqueda } = require('../../middleware/validator');

// Búsqueda principal
router.get('/', validateBusqueda, busquedaController.buscar);

// Disponibilidad
router.get('/disponibilidad/especialista', busquedaController.getDisponibilidadEspecialista);
router.get('/disponibilidad/producto', busquedaController.getDisponibilidadProducto);

// Categorías populares
router.get('/populares', busquedaController.getCategoriasPopulares);

// Obtener detalles específicos
router.get('/proveedor/:id', busquedaController.getProveedorDetalle);
router.get('/producto/:id', busquedaController.getProductoDetalle);

module.exports = router;