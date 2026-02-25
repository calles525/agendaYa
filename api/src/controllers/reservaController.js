// src/controllers/reservaController.js
const { Reserva, Usuario, Proveedor, Especialista, ProductoAlquiler, HistorialCliente, Calificacion, ReservaCita, ReservaAlquiler } = require('../models');
const { Op } = require('sequelize');
const telegramService = require('../services/telegramService');
const disponibilidadService = require('../services/disponibilidadService');

const reservaController = {
    // Obtener reservas pendientes del proveedor
    async getReservasPendientes(req, res, next) {
        try {
            const proveedor = await Proveedor.findOne({
                where: { usuario_id: req.usuario.id }
            });

            if (!proveedor) {
                return res.status(404).json({ error: 'Proveedor no encontrado' });
            }

            const reservas = await Reserva.findAll({
                where: {
                    proveedor_id: proveedor.id,
                    estado: 'pendiente'
                },
                include: [
                    {
                        model: Usuario,
                        as: 'cliente',
                        attributes: ['id', 'nombre', 'apellidos', 'email', 'telefono']
                    }
                ],
                order: [['fecha_creacion', 'DESC']]
            });

            res.json(reservas);
        } catch (error) {
            next(error);
        }
    },

    // Obtener historial de un cliente
    async getHistorialCliente(req, res, next) {
        try {
            const { cliente_id } = req.params;
            
            const proveedor = await Proveedor.findOne({
                where: { usuario_id: req.usuario.id }
            });

            if (!proveedor) {
                return res.status(404).json({ error: 'Proveedor no encontrado' });
            }

            const historial = await HistorialCliente.findAll({
                where: {
                    cliente_id,
                    proveedor_id: proveedor.id
                },
                include: [
                    {
                        model: Usuario,
                        as: 'cliente',
                        attributes: ['id', 'nombre', 'apellidos']
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
    },

    // Crear reserva de cita
    async crearReservaCita(req, res, next) {
        try {
            const {
                proveedor_id,
                especialidad_id,
                especialista_id,
                fecha,
                hora_inicio,
                duracion,
                notas
            } = req.body;

            // Validar disponibilidad
            const disponible = await disponibilidadService.verificarDisponibilidadCita(
                especialista_id,
                especialidad_id,
                fecha,
                hora_inicio,
                duracion
            );

            if (!disponible) {
                return res.status(400).json({ 
                    error: 'El horario seleccionado no está disponible' 
                });
            }

            // Calcular hora fin
            const horaFin = disponibilidadService.calcularHoraFin(hora_inicio, duracion);

            // Obtener precio
            const EspecialistaEspecialidad = require('../models/EspecialistaEspecialidad');
            const especialistaEsp = await EspecialistaEspecialidad.findOne({
                where: {
                    especialista_id,
                    especialidad_id
                }
            });

            // Crear reserva
            const reserva = await Reserva.create({
                cliente_id: req.usuario.id,
                proveedor_id,
                tipo: 'cita',
                fecha_reserva: fecha,
                hora_inicio,
                hora_fin: horaFin,
                duracion_horas: duracion,
                subtotal: especialistaEsp.precio,
                total: especialistaEsp.precio,
                notas_cliente: notas
            });

            // Crear detalle de cita
            await ReservaCita.create({
                reserva_id: reserva.id,
                especialidad_id,
                especialista_id,
                especialista_especialidad_id: especialistaEsp.id
            });

            // Enviar notificaciones
            await reservaController.enviarNotificacionesNuevaReserva(reserva);

            res.status(201).json({
                message: 'Reserva creada exitosamente',
                reserva
            });

        } catch (error) {
            next(error);
        }
    },

    // Crear reserva de alquiler
    async crearReservaAlquiler(req, res, next) {
        const sequelize = require('../config/database').sequelize;
        const transaction = await sequelize.transaction();

        try {
            const {
                proveedor_id,
                productos,
                fecha,
                hora_inicio,
                duracion,
                direccion_entrega,
                latitud_entrega,
                longitud_entrega,
                notas
            } = req.body;

            let subtotal = 0;
            const itemsReserva = [];

            // Validar cada producto
            for (const item of productos) {
                const producto = await ProductoAlquiler.findByPk(item.producto_id);

                if (!producto || !producto.activo) {
                    throw new Error(`Producto ${item.producto_id} no disponible`);
                }

                // Verificar disponibilidad
                const disponible = await disponibilidadService.verificarDisponibilidadProducto(
                    item.producto_id,
                    fecha,
                    hora_inicio,
                    duracion,
                    item.cantidad
                );

                if (!disponible) {
                    throw new Error(`Producto ${producto.nombre} no disponible para las fechas seleccionadas`);
                }

                const subtotalItem = parseFloat(producto.precio_hora) * duracion * item.cantidad;
                subtotal += subtotalItem;

                itemsReserva.push({
                    producto_id: producto.id,
                    cantidad: item.cantidad,
                    precio_unitario: producto.precio_hora,
                    subtotal: subtotalItem
                });
            }

            // Calcular delivery
            const costoDelivery = 50; // Valor fijo por ahora

            // Calcular hora fin
            const horaFin = disponibilidadService.calcularHoraFin(hora_inicio, duracion);

            // Crear reserva
            const reserva = await Reserva.create({
                cliente_id: req.usuario.id,
                proveedor_id,
                tipo: 'alquiler',
                fecha_reserva: fecha,
                hora_inicio,
                hora_fin: horaFin,
                duracion_horas: duracion,
                subtotal,
                costo_delivery: costoDelivery,
                total: subtotal + costoDelivery,
                direccion_entrega,
                latitud_entrega,
                longitud_entrega,
                notas_cliente: notas
            }, { transaction });

            // Crear detalles de alquiler
            for (const item of itemsReserva) {
                await ReservaAlquiler.create({
                    reserva_id: reserva.id,
                    ...item
                }, { transaction });
            }

            await transaction.commit();

            // Enviar notificaciones
            await reservaController.enviarNotificacionesNuevaReserva(reserva);

            res.status(201).json({
                message: 'Reserva creada exitosamente',
                reserva
            });

        } catch (error) {
            await transaction.rollback();
            next(error);
        }
    },

    // Obtener mis reservas
    async getMisReservas(req, res, next) {
        try {
            const { estado, pagina = 1, limite = 10 } = req.query;

            const whereClause = {
                cliente_id: req.usuario.id
            };

            if (estado) {
                whereClause.estado = estado;
            }

            const reservas = await Reserva.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: Proveedor,
                        as: 'proveedor',
                        include: [{
                            model: Usuario,
                            as: 'usuario',
                            attributes: ['id', 'nombre', 'foto_perfil']
                        }]
                    }
                ],
                order: [['fecha_creacion', 'DESC']],
                limit: parseInt(limite),
                offset: (pagina - 1) * parseInt(limite)
            });

            res.json({
                total: reservas.count,
                pagina: parseInt(pagina),
                total_paginas: Math.ceil(reservas.count / parseInt(limite)),
                reservas: reservas.rows
            });

        } catch (error) {
            next(error);
        }
    },

    // Obtener detalle de reserva
    async getReservaDetalle(req, res, next) {
        try {
            const { id } = req.params;

            const reserva = await Reserva.findByPk(id, {
                include: [
                    {
                        model: Usuario,
                        as: 'cliente',
                        attributes: ['id', 'nombre', 'apellidos', 'email', 'telefono', 'foto_perfil']
                    },
                    {
                        model: Proveedor,
                        as: 'proveedor',
                        include: [{
                            model: Usuario,
                            as: 'usuario',
                            attributes: ['id', 'nombre', 'foto_perfil']
                        }]
                    }
                ]
            });

            if (!reserva) {
                return res.status(404).json({ error: 'Reserva no encontrada' });
            }

            // Incluir detalles específicos según tipo
            if (reserva.tipo === 'cita') {
                const detalle = await ReservaCita.findOne({
                    where: { reserva_id: reserva.id },
                    include: [
                        {
                            model: require('../models/Especialidad'),
                            as: 'especialidad'
                        },
                        {
                            model: require('../models/Especialista'),
                            as: 'especialista'
                        }
                    ]
                });
                reserva.dataValues.detalle = detalle;
            } else {
                const detalles = await ReservaAlquiler.findAll({
                    where: { reserva_id: reserva.id },
                    include: [{
                        model: ProductoAlquiler,
                        as: 'producto'
                    }]
                });
                reserva.dataValues.detalles = detalles;
            }

            res.json(reserva);

        } catch (error) {
            next(error);
        }
    },

    // Cancelar reserva
    async cancelarReserva(req, res, next) {
        try {
            const { id } = req.params;
            const { motivo } = req.body;

            const reserva = await Reserva.findByPk(id, {
                include: [{
                    model: Proveedor,
                    as: 'proveedor',
                    include: ['usuario']
                }]
            });

            if (!reserva) {
                return res.status(404).json({ error: 'Reserva no encontrada' });
            }

            // Verificar que el cliente sea el dueño
            if (reserva.cliente_id !== req.usuario.id && req.usuario.rol !== 'admin') {
                return res.status(403).json({ error: 'No autorizado' });
            }

            if (!['pendiente', 'confirmada'].includes(reserva.estado)) {
                return res.status(400).json({ 
                    error: `No se puede cancelar una reserva en estado ${reserva.estado}` 
                });
            }

            await reserva.update({
                estado: 'cancelada',
                motivo_cancelacion: motivo || 'Cancelada por el cliente'
            });

            // Notificar al proveedor
            if (reserva.proveedor?.telegram_chat_id) {
                const cliente = await Usuario.findByPk(reserva.cliente_id);
                await telegramService.sendMessage(
                    reserva.proveedor.telegram_chat_id,
                    telegramService.formatCancellationMessage(reserva, cliente)
                );
            }

            res.json({
                message: 'Reserva cancelada exitosamente',
                reserva
            });

        } catch (error) {
            next(error);
        }
    },

    // Confirmar reserva
    async confirmarReserva(req, res, next) {
        try {
            const { id } = req.params;

            const reserva = await Reserva.findByPk(id, {
                include: [{
                    model: Proveedor,
                    as: 'proveedor',
                    include: ['usuario']
                }]
            });

            if (!reserva) {
                return res.status(404).json({ error: 'Reserva no encontrada' });
            }

            // Verificar que el proveedor sea el dueño
            if (reserva.proveedor.usuario_id !== req.usuario.id && req.usuario.rol !== 'admin') {
                return res.status(403).json({ error: 'No autorizado' });
            }

            if (reserva.estado !== 'pendiente') {
                return res.status(400).json({ 
                    error: `No se puede confirmar una reserva en estado ${reserva.estado}` 
                });
            }

            await reserva.update({
                estado: 'confirmada',
                fecha_confirmacion: new Date()
            });

            res.json({
                message: 'Reserva confirmada exitosamente',
                reserva
            });

        } catch (error) {
            next(error);
        }
    },

    // Rechazar reserva
    async rechazarReserva(req, res, next) {
        try {
            const { id } = req.params;
            const { motivo } = req.body;

            const reserva = await Reserva.findByPk(id, {
                include: [{
                    model: Proveedor,
                    as: 'proveedor',
                    include: ['usuario']
                }]
            });

            if (!reserva) {
                return res.status(404).json({ error: 'Reserva no encontrada' });
            }

            // Verificar que el proveedor sea el dueño
            if (reserva.proveedor.usuario_id !== req.usuario.id && req.usuario.rol !== 'admin') {
                return res.status(403).json({ error: 'No autorizado' });
            }

            if (reserva.estado !== 'pendiente') {
                return res.status(400).json({ 
                    error: `No se puede rechazar una reserva en estado ${reserva.estado}` 
                });
            }

            await reserva.update({
                estado: 'rechazada',
                motivo_cancelacion: motivo || 'Rechazada por el proveedor'
            });

            res.json({
                message: 'Reserva rechazada',
                reserva
            });

        } catch (error) {
            next(error);
        }
    },

    // Completar reserva
    async completarReserva(req, res, next) {
        try {
            const { id } = req.params;
            const { notas } = req.body;

            const reserva = await Reserva.findByPk(id, {
                include: [{
                    model: Proveedor,
                    as: 'proveedor',
                    include: ['usuario']
                }]
            });

            if (!reserva) {
                return res.status(404).json({ error: 'Reserva no encontrada' });
            }

            // Verificar que el proveedor sea el dueño
            if (reserva.proveedor.usuario_id !== req.usuario.id && req.usuario.rol !== 'admin') {
                return res.status(403).json({ error: 'No autorizado' });
            }

            if (reserva.estado !== 'confirmada') {
                return res.status(400).json({ 
                    error: `No se puede completar una reserva en estado ${reserva.estado}` 
                });
            }

            await reserva.update({
                estado: 'completada',
                fecha_completado: new Date(),
                notas_proveedor: notas
            });

            res.json({
                message: 'Reserva completada exitosamente',
                reserva
            });

        } catch (error) {
            next(error);
        }
    },

    // Agregar notas al historial
    async agregarNotasHistorial(req, res, next) {
        try {
            const { reserva_id, notas, archivos } = req.body;

            const reserva = await Reserva.findByPk(reserva_id, {
                include: [{
                    model: Proveedor,
                    as: 'proveedor',
                    include: ['usuario']
                }]
            });

            if (!reserva) {
                return res.status(404).json({ error: 'Reserva no encontrada' });
            }

            // Verificar que el proveedor sea el dueño
            if (reserva.proveedor.usuario_id !== req.usuario.id && req.usuario.rol !== 'admin') {
                return res.status(403).json({ error: 'No autorizado' });
            }

            const historial = await HistorialCliente.create({
                cliente_id: reserva.cliente_id,
                proveedor_id: reserva.proveedor_id,
                reserva_id: reserva.id,
                notas,
                archivos_adjuntos: archivos || []
            });

            res.status(201).json({
                message: 'Notas agregadas al historial',
                historial
            });

        } catch (error) {
            next(error);
        }
    },

    // Calificar reserva
    async calificarReserva(req, res, next) {
        try {
            const { id } = req.params;
            const { puntuacion, comentario } = req.body;

            const reserva = await Reserva.findByPk(id);

            if (!reserva) {
                return res.status(404).json({ error: 'Reserva no encontrada' });
            }

            // Verificar que el cliente sea el dueño
            if (reserva.cliente_id !== req.usuario.id) {
                return res.status(403).json({ error: 'No autorizado' });
            }

            if (reserva.estado !== 'completada') {
                return res.status(400).json({ 
                    error: 'Solo se pueden calificar reservas completadas' 
                });
            }

            // Verificar que no haya calificación previa
            const calificacionExistente = await Calificacion.findOne({
                where: { reserva_id: id }
            });

            if (calificacionExistente) {
                return res.status(400).json({ 
                    error: 'Esta reserva ya ha sido calificada' 
                });
            }

            const calificacion = await Calificacion.create({
                reserva_id: id,
                cliente_id: req.usuario.id,
                proveedor_id: reserva.proveedor_id,
                puntuacion,
                comentario
            });

            res.status(201).json({
                message: 'Calificación agregada',
                calificacion
            });

        } catch (error) {
            next(error);
        }
    },

    // Función auxiliar para enviar notificaciones
    async enviarNotificacionesNuevaReserva(reserva) {
        try {
            const proveedor = await Proveedor.findByPk(reserva.proveedor_id, {
                include: [{
                    model: Usuario,
                    as: 'usuario'
                }]
            });

            const cliente = await Usuario.findByPk(reserva.cliente_id);

            // Notificación por Telegram
            if (proveedor?.telegram_chat_id && proveedor.notificaciones_telegram) {
                await telegramService.notificarNuevaReserva(reserva, cliente, proveedor);
            }

        } catch (error) {
            console.error('Error enviando notificaciones:', error);
        }
    }
};

module.exports = reservaController;