const express = require('express');
const router = express.Router();
const horarioController = require('../../controllers/horarioController');
const { authenticate } = require('../../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// ===========================================
// HORARIOS DE ESPECIALISTAS
// ===========================================
router.get('/especialista/:especialista_id', horarioController.getHorariosEspecialista);
router.post('/especialista/:especialista_id/especialidad/:especialidad_id', horarioController.configurarHorario);

// ===========================================
// DISPONIBILIDAD
// ===========================================
router.get('/disponibilidad/cita', horarioController.generarDisponibilidadCita);
router.post('/disponibilidad/producto/verificar', horarioController.verificarDisponibilidadProducto);

// ===========================================
// RESERVAR/LIBERAR HORARIOS (uso interno)
// ===========================================
router.post('/reservar', horarioController.reservarHorario);
router.put('/liberar/:reserva_id', horarioController.liberarHorario);

module.exports = router;
