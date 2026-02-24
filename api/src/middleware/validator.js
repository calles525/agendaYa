// src/middleware/validator.js
const { body, validationResult, param, query } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            errors: errors.array().map(err => ({
                campo: err.path,
                mensaje: err.msg
            }))
        });
    }
    next();
};

// Validaciones para registro de usuario
const validateRegistro = [
    body('email')
        .isEmail().withMessage('Email inválido')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una mayúscula')
        .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número'),
    body('nombre')
        .notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    body('telefono')
        .optional()
        .matches(/^[0-9+\-\s]{10,15}$/).withMessage('Teléfono inválido'),
    handleValidationErrors
];

// Validaciones para login
const validateLogin = [
    body('email')
        .isEmail().withMessage('Email inválido')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('La contraseña es requerida'),
    handleValidationErrors
];

// Validaciones para crear reserva de cita
const validateReservaCita = [
    body('proveedor_id')
        .isInt().withMessage('ID de proveedor inválido'),
    body('especialidad_id')
        .isInt().withMessage('ID de especialidad inválido'),
    body('especialista_id')
        .isInt().withMessage('ID de especialista inválido'),
    body('fecha')
        .isDate().withMessage('Fecha inválida')
        .custom(value => {
            const fecha = new Date(value);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            return fecha >= hoy;
        }).withMessage('La fecha no puede ser en el pasado'),
    body('hora_inicio')
        .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora inválida (formato HH:MM)'),
    handleValidationErrors
];

// Validaciones para crear reserva de alquiler
const validateReservaAlquiler = [
    body('proveedor_id')
        .isInt().withMessage('ID de proveedor inválido'),
    body('productos')
        .isArray({ min: 1 }).withMessage('Debe seleccionar al menos un producto'),
    body('productos.*.producto_id')
        .isInt().withMessage('ID de producto inválido'),
    body('productos.*.cantidad')
        .isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1'),
    body('fecha')
        .isDate().withMessage('Fecha inválida'),
    body('hora_inicio')
        .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora inválida'),
    body('duracion')
        .isInt({ min: 1 }).withMessage('La duración debe ser al menos 1 hora'),
    handleValidationErrors
];

// Validaciones para búsqueda
const validateBusqueda = [
    query('q')
        .optional()
        .isLength({ min: 2 }).withMessage('La búsqueda debe tener al menos 2 caracteres'),
    query('ubicacion')
        .optional()
        .isString(),
    query('categoria')
        .optional()
        .isInt().withMessage('Categoría inválida'),
    query('precio_min')
        .optional()
        .isFloat({ min: 0 }).withMessage('Precio mínimo inválido'),
    query('precio_max')
        .optional()
        .isFloat({ min: 0 }).withMessage('Precio máximo inválido'),
    handleValidationErrors
];

module.exports = {
    validateRegistro,
    validateLogin,
    validateReservaCita,
    validateReservaAlquiler,
    validateBusqueda,
    handleValidationErrors
};