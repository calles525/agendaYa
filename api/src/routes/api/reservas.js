// src/routes/api/reservas.js
const express = require('express');
const router = express.Router();
const reservaController = require('../../controllers/reservaController');
const { validateReservaCita, validateReservaAlquiler } = require('../../middleware/validator');

// Crear reservas
router.post('/cita', validateReservaCita, reservaController.crearReservaCita);
router.post('/alquiler', validateReservaAlquiler, reservaController.crearReservaAlquiler);

// Obtener reservas del usuario
router.get('/mis-reservas', reservaController.getMisReservas);

// Detalle y acciones sobre reservas específicas
router.get('/:id', reservaController.getReservaDetalle);
router.put('/:id/cancelar', reservaController.cancelarReserva);
router.post('/:id/calificar', reservaController.calificarReserva);

module.exports = router;