// src/routes/index.js
const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./api/auth');
const usuarioRoutes = require('./api/usuarios');
const proveedorRoutes = require('./api/proveedores');
const reservaRoutes = require('./api/reservas');
const busquedaRoutes = require('./api/busqueda');
const adminRoutes = require('./api/admin');

// Middleware de autenticación
const { authenticate } = require('../middleware/auth');

// Rutas públicas
router.use('/auth', authRoutes);
router.use('/busqueda', busquedaRoutes);

// Rutas protegidas
router.use('/usuarios', authenticate, usuarioRoutes);
router.use('/proveedores', authenticate, proveedorRoutes);
router.use('/reservas', authenticate, reservaRoutes);
router.use('/admin', authenticate, adminRoutes);

// Ruta de prueba
router.get('/test', (req, res) => {
    res.json({ 
        message: 'API funcionando correctamente',
        timestamp: new Date(),
        version: '1.0.0'
    });
});

module.exports = router;