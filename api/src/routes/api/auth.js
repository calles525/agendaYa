// src/routes/api/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const { validateRegistro, validateLogin } = require('../../middleware/validator');
const { authenticate } = require('../../middleware/auth');

router.post('/registro', validateRegistro, authController.registro);
router.post('/login', validateLogin, authController.login);
router.get('/verificar', authenticate, authController.verificarToken);
router.post('/recuperar-password', authController.recuperarPassword);
router.post('/cambiar-password', authenticate, authController.cambiarPassword);

module.exports = router;