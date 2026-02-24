// src/routes/api/usuarios.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../../controllers/usuarioController');
const { authenticate } = require('../../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Perfil
router.get('/perfil', usuarioController.getPerfil);
router.put('/perfil', usuarioController.updatePerfil);
router.post('/perfil/foto', usuarioController.uploadFoto);

// Ubicación
router.put('/ubicacion', usuarioController.updateUbicacion);

// Favoritos
router.get('/favoritos', usuarioController.getFavoritos);
router.post('/favoritos', usuarioController.agregarFavorito);
router.delete('/favoritos/:id', usuarioController.eliminarFavorito);

// Historial
router.get('/historial', usuarioController.getHistorial);

// Notificaciones
router.get('/notificaciones', usuarioController.getNotificaciones);
router.put('/notificaciones/:id/leer', usuarioController.marcarNotificacionLeida);

module.exports = router;