// src/controllers/historialController.js
const { HistorialCliente, Usuario, Proveedor, Especialista, Reserva } = require('../models');
const { Op } = require('sequelize');

const historialController = {
    // Obtener historial de un cliente
    async getHistorialCliente(req, res, next) {
        try {
            const { cliente_id } = req.params;
            const { pagina = 1, limite = 20 } = req.query;

            // Verificar permisos
            if (req.usuario.rol !== 'admin' && 
                req.usuario.id !== parseInt(cliente_id) && 
                !req.usuario.proveedor) {
                return res.status(403).json({ error: 'No autorizado' });
            }

            const historial = await HistorialCliente.findAndCountAll({
                where: { 
                    cliente_id,
                    ...(req.usuario.rol !== 'admin' && req.usuario.rol !== 'proveedor' ? 
                        { visible_cliente: true } : {})
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
                order: [['fecha_creacion', 'DESC']],
                limit: parseInt(limite),
                offset: (pagina - 1) * parseInt(limite)
            });

            res.json({
                total: historial.count,
                pagina: parseInt(pagina),
                total_paginas: Math.ceil(historial.count / parseInt(limite)),
                historial: historial.rows
            });
        } catch (error) {
            next(error);
        }
    },

    // Agregar entrada al historial
    async agregarHistorial(req, res, next) {
        try {
            const { cliente_id, reserva_id, notas, archivos } = req.body;

            const reserva = await Reserva.findByPk(reserva_id, {
                include: ['proveedor']
            });

            if (!reserva) {
                return res.status(404).json({ error: 'Reserva no encontrada' });
            }

            // Verificar que el proveedor sea el dueño
            if (reserva.proveedor.usuario_id !== req.usuario.id && req.usuario.rol !== 'admin') {
                return res.status(403).json({ error: 'No autorizado' });
            }

            const historial = await HistorialCliente.create({
                cliente_id,
                proveedor_id: reserva.proveedor_id,
                especialista_id: reserva.tipo === 'cita' ? 
                    (await reserva.getReservaCita()).especialista_id : null,
                reserva_id,
                notas,
                archivos_adjuntos: archivos || []
            });

            res.status(201).json({
                message: 'Historial agregado exitosamente',
                historial
            });
        } catch (error) {
            next(error);
        }
    },

    // Actualizar entrada del historial
    async updateHistorial(req, res, next) {
        try {
            const { id } = req.params;
            const { notas, archivos, visible_cliente } = req.body;

            const historial = await HistorialCliente.findByPk(id, {
                include: [{
                    model: Proveedor,
                    as: 'proveedor'
                }]
            });

            if (!historial) {
                return res.status(404).json({ error: 'Historial no encontrado' });
            }

            // Verificar permisos
            if (historial.proveedor.usuario_id !== req.usuario.id && req.usuario.rol !== 'admin') {
                return res.status(403).json({ error: 'No autorizado' });
            }

            await historial.update({
                notas,
                archivos_adjuntos: archivos,
                visible_cliente
            });

            res.json({
                message: 'Historial actualizado',
                historial
            });
        } catch (error) {
            next(error);
        }
    },

    // Obtener historial completo de un cliente (para especialistas)
    async getHistorialCompletoCliente(req, res, next) {
        try {
            const { cliente_id } = req.params;

            // Verificar que el especialista tenga una cita con este cliente
            const tieneAcceso = await Reserva.findOne({
                where: {
                    cliente_id,
                    estado: 'completada'
                },
                include: [{
                    model: ReservaCita,
                    as: 'reservaCita',
                    where: {
                        especialista_id: req.usuario.especialista?.id
                    },
                    required: true
                }]
            });

            if (!tieneAcceso && req.usuario.rol !== 'admin') {
                return res.status(403).json({ error: 'No tiene acceso al historial de este cliente' });
            }

            const historial = await HistorialCliente.findAll({
                where: { cliente_id },
                include: [
                    {
                        model: Proveedor,
                        as: 'proveedor',
                        include: ['usuario']
                    },
                    {
                        model: Especialista,
                        as: 'especialista'
                    }
                ],
                order: [['fecha_creacion', 'ASC']]
            });

            res.json(historial);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = historialController;