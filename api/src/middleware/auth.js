// src/middleware/auth.js
const { verifyToken } = require('../config/auth');
const { Usuario } = require('../models');

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new Error();
        }

        const decoded = verifyToken(token);
        
        if (!decoded) {
            throw new Error();
        }

        const usuario = await Usuario.findByPk(decoded.id, {
            attributes: { exclude: ['password_hash'] }
        });

        if (!usuario || !usuario.activo) {
            throw new Error();
        }

        req.usuario = usuario;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Por favor, autentíquese' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({ error: 'No autenticado' });
        }

        if (!roles.includes(req.usuario.rol)) {
            return res.status(403).json({ 
                error: 'No tiene permisos para acceder a este recurso' 
            });
        }

        next();
    };
};

const checkProveedorOwnership = (model) => {
    return async (req, res, next) => {
        try {
            const id = req.params.id;
            const proveedorId = req.usuario.proveedor?.id || req.usuario.id;

            const item = await model.findByPk(id);
            
            if (!item) {
                return res.status(404).json({ error: 'Recurso no encontrado' });
            }

            if (item.proveedor_id !== proveedorId && req.usuario.rol !== 'admin') {
                return res.status(403).json({ 
                    error: 'No tiene permisos para modificar este recurso' 
                });
            }

            req.recurso = item;
            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    authenticate,
    authorize,
    checkProveedorOwnership
};