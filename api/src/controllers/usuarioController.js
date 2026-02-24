// src/controllers/usuarioController.js
const { Usuario, Favorito, Notificacion, HistorialCliente } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const usuarioController = {
    // Obtener perfil
    async getPerfil(req, res, next) {
        try {
            const usuario = await Usuario.findByPk(req.usuario.id, {
                attributes: { exclude: ['password_hash'] },
                include: [
                    {
                        model: Favorito,
                        as: 'favoritos',
                        include: ['proveedor', 'especialista', 'producto'],
                        required: false
                    }
                ]
            });

            res.json(usuario);
        } catch (error) {
            next(error);
        }
    },

    // Actualizar perfil
    async updatePerfil(req, res, next) {
        try {
            const { nombre, apellidos, telefono, ubicacion } = req.body;

            const usuario = await Usuario.findByPk(req.usuario.id);
            await usuario.update({
                nombre,
                apellidos,
                telefono,
                ubicacion
            });

            res.json({
                message: 'Perfil actualizado',
                usuario: usuario.toJSON()
            });
        } catch (error) {
            next(error);
        }
    },

    // Subir foto de perfil
    async uploadFoto(req, res, next) {
        try {
            // Aquí iría la lógica de subida de archivos
            // Por ahora simulamos
            const fotoUrl = `/uploads/perfil/${req.usuario.id}.jpg`;

            const usuario = await Usuario.findByPk(req.usuario.id);
            await usuario.update({ foto_perfil: fotoUrl });

            res.json({
                message: 'Foto actualizada',
                foto_url: fotoUrl
            });
        } catch (error) {
            next(error);
        }
    },

    // Actualizar ubicación
    async updateUbicacion(req, res, next) {
        try {
            const { latitud, longitud, direccion } = req.body;

            const usuario = await Usuario.findByPk(req.usuario.id);
            await usuario.update({
                latitud,
                longitud,
                ubicacion: direccion
            });

            res.json({
                message: 'Ubicación actualizada'
            });
        } catch (error) {
            next(error);
        }
    },

    // Favoritos
    async getFavoritos(req, res, next) {
        try {
            const favoritos = await Favorito.findAll({
                where: { cliente_id: req.usuario.id },
                include: [
                    {
                        model: Proveedor,
                        as: 'proveedor',
                        include: ['usuario'],
                        required: false
                    },
                    {
                        model: Especialista,
                        as: 'especialista',
                        required: false
                    },
                    {
                        model: ProductoAlquiler,
                        as: 'producto',
                        required: false
                    }
                ]
            });

            res.json(favoritos);
        } catch (error) {
            next(error);
        }
    },

    async agregarFavorito(req, res, next) {
        try {
            const { proveedor_id, especialista_id, producto_id } = req.body;

            const favorito = await Favorito.create({
                cliente_id: req.usuario.id,
                proveedor_id,
                especialista_id,
                producto_id
            });

            res.status(201).json(favorito);
        } catch (error) {
            next(error);
        }
    },

    async eliminarFavorito(req, res, next) {
        try {
            const { id } = req.params;

            await Favorito.destroy({
                where: {
                    id,
                    cliente_id: req.usuario.id
                }
            });

            res.json({ message: 'Favorito eliminado' });
        } catch (error) {
            next(error);
        }
    },

    // Notificaciones
    async getNotificaciones(req, res, next) {
        try {
            const notificaciones = await Notificacion.findAll({
                where: { usuario_id: req.usuario.id },
                order: [['fecha_envio', 'DESC']],
                limit: 50
            });

            res.json(notificaciones);
        } catch (error) {
            next(error);
        }
    },

    async marcarNotificacionLeida(req, res, next) {
        try {
            const { id } = req.params;

            await Notificacion.update(
                { leida: true, fecha_lectura: new Date() },
                { where: { id, usuario_id: req.usuario.id } }
            );

            res.json({ message: 'Notificación marcada como leída' });
        } catch (error) {
            next(error);
        }
    },

    // Historial
    async getHistorial(req, res, next) {
        try {
            const historial = await HistorialCliente.findAll({
                where: { 
                    cliente_id: req.usuario.id,
                    visible_cliente: true
                },
                include: [
                    {
                        model: Proveedor,
                        as: 'proveedor',
                        include: ['usuario']
                    },
                    {
                        model: Especialista,
                        as: 'especialista'
                    },
                    {
                        model: Reserva,
                        as: 'reserva'
                    }
                ],
                order: [['fecha_creacion', 'DESC']]
            });

            res.json(historial);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = usuarioController;