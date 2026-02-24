// src/middleware/errorHandler.js
const { ERRORES, HTTP } = require('../utils/constants');

const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Error de validación de Sequelize
    if (err.name === 'SequelizeValidationError') {
        return res.status(HTTP.BAD_REQUEST).json({
            error: ERRORES.VALIDACION,
            detalles: err.errors.map(e => ({
                campo: e.path,
                mensaje: e.message
            }))
        });
    }

    // Error de llave duplicada
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(HTTP.CONFLICTO).json({
            error: 'Registro duplicado',
            detalles: err.errors.map(e => ({
                campo: e.path,
                mensaje: 'Ya existe un registro con este valor'
            }))
        });
    }

    // Error de llave foránea
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(HTTP.BAD_REQUEST).json({
            error: 'Error de referencia',
            mensaje: 'El registro relacionado no existe'
        });
    }

    // Error de JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(HTTP.NO_AUTORIZADO).json({
            error: 'Token inválido'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(HTTP.NO_AUTORIZADO).json({
            error: 'Token expirado'
        });
    }

    // Error de archivo
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(HTTP.BAD_REQUEST).json({
            error: 'Archivo demasiado grande',
            maximo: '5MB'
        });
    }

    // Error personalizado con status
    if (err.status) {
        return res.status(err.status).json({
            error: err.message
        });
    }

    // Error por defecto
    res.status(HTTP.ERROR_SERVIDOR).json({
        error: ERRORES.SERVIDOR,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;