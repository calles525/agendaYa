// src/controllers/adminController.js
const { Usuario, Proveedor, Reserva, Calificacion } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const adminController = {
    // Gestión de usuarios
    async getUsuarios(req, res, next) {
        try {
            const { rol, verificado, pagina = 1, limite = 20 } = req.query;

            const whereClause = {};
            if (rol) whereClause.rol = rol;
            if (verificado !== undefined) whereClause.verificado = verificado === 'true';

            const usuarios = await Usuario.findAndCountAll({
                where: whereClause,
                attributes: { exclude: ['password_hash'] },
                limit: parseInt(limite),
                offset: (pagina - 1) * parseInt(limite),
                order: [['fecha_registro', 'DESC']]
            });

            res.json({
                total: usuarios.count,
                pagina: parseInt(pagina),
                total_paginas: Math.ceil(usuarios.count / parseInt(limite)),
                usuarios: usuarios.rows
            });
        } catch (error) {
            next(error);
        }
    },

    async getUsuarioDetalle(req, res, next) {
        try {
            const { id } = req.params;
            const usuario = await Usuario.findByPk(id, {
                attributes: { exclude: ['password_hash'] },
                include: [
                    {
                        model: Proveedor,
                        as: 'proveedor',
                        required: false
                    },
                    {
                        model: Reserva,
                        as: 'reservas_cliente',
                        limit: 10,
                        order: [['fecha_creacion', 'DESC']]
                    }
                ]
            });

            if (!usuario) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json(usuario);
        } catch (error) {
            next(error);
        }
    },

    async updateUsuario(req, res, next) {
        try {
            const { id } = req.params;
            const { nombre, email, telefono, rol, verificado, activo } = req.body;

            const usuario = await Usuario.findByPk(id);
            if (!usuario) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            await usuario.update({
                nombre,
                email,
                telefono,
                rol,
                verificado,
                activo
            });

            res.json({
                message: 'Usuario actualizado exitosamente',
                usuario: usuario.toJSON()
            });
        } catch (error) {
            next(error);
        }
    },

    // Aprobación de proveedores
    async getProveedoresPendientes(req, res, next) {
        try {
            const proveedores = await Proveedor.findAll({
                where: {
                    fecha_aprobacion: null
                },
                include: [
                    {
                        model: Usuario,
                        as: 'usuario',
                        attributes: ['id', 'nombre', 'email', 'telefono', 'fecha_registro']
                    }
                ],
                order: [['fecha_creacion', 'ASC']]
            });

            res.json(proveedores);
        } catch (error) {
            next(error);
        }
    },

    async aprobarProveedor(req, res, next) {
        try {
            const { id } = req.params;
            const { comision } = req.body;

            const proveedor = await Proveedor.findByPk(id, {
                include: ['usuario']
            });

            if (!proveedor) {
                return res.status(404).json({ error: 'Proveedor no encontrado' });
            }

            await proveedor.update({
                fecha_aprobacion: new Date(),
                aprobado_por: req.usuario.id,
                comision_plataforma: comision || proveedor.comision_plataforma
            });

            await proveedor.usuario.update({ verificado: true });

            // Aquí enviar notificación al proveedor
            // ...

            res.json({
                message: 'Proveedor aprobado exitosamente',
                proveedor
            });
        } catch (error) {
            next(error);
        }
    },

    async rechazarProveedor(req, res, next) {
        try {
            const { id } = req.params;
            const { motivo } = req.body;

            const proveedor = await Proveedor.findByPk(id, {
                include: ['usuario']
            });

            if (!proveedor) {
                return res.status(404).json({ error: 'Proveedor no encontrado' });
            }

            // Opcional: eliminar o desactivar
            await proveedor.usuario.update({ activo: false });

            // Aquí enviar notificación con motivo
            // ...

            res.json({
                message: 'Proveedor rechazado',
                motivo
            });
        } catch (error) {
            next(error);
        }
    },

    // Estadísticas globales
    async getEstadisticasGlobales(req, res, next) {
        try {
            const hoy = new Date();
            const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
            const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

            const [
                totalUsuarios,
                totalProveedores,
                totalReservas,
                ingresosMes,
                reservasPorEstado,
                proveedoresPopulares
            ] = await Promise.all([
                Usuario.count(),
                Proveedor.count(),
                Reserva.count(),
                Reserva.sum('total', {
                    where: {
                        estado: 'completada',
                        fecha_creacion: { [Op.between]: [inicioMes, finMes] }
                    }
                }),
                Reserva.findAll({
                    attributes: [
                        'estado',
                        [sequelize.fn('COUNT', sequelize.col('id')), 'total']
                    ],
                    group: ['estado']
                }),
                Proveedor.findAll({
                    attributes: [
                        'id',
                        'nombre_negocio',
                        [sequelize.fn('COUNT', sequelize.col('reservas.id')), 'total_reservas']
                    ],
                    include: [{
                        model: Reserva,
                        as: 'reservas',
                        attributes: []
                    }],
                    group: ['Proveedor.id'],
                    order: [[sequelize.literal('total_reservas'), 'DESC']],
                    limit: 5
                })
            ]);

            res.json({
                totales: {
                    usuarios: totalUsuarios,
                    proveedores: totalProveedores,
                    reservas: totalReservas,
                    ingresos_mes: ingresosMes || 0
                },
                reservas_por_estado: reservasPorEstado,
                proveedores_populares: proveedoresPopulares
            });
        } catch (error) {
            next(error);
        }
    },

    // Configuración de la plataforma
    async getConfiguracion(req, res, next) {
        try {
            // Aquí obtener de una tabla de configuración
            const config = {
                comision_default: 10,
                tiempo_minimo_anticipacion: 24, // horas
                maximo_dias_anticipacion: 90,
                politicas_cancelacion: "24 horas antes sin cargo",
                moneda: "MXN",
                idiomas: ["es", "en"],
                zonas_horarias: ["America/Mexico_City"]
            };

            res.json(config);
        } catch (error) {
            next(error);
        }
    },

    async updateConfiguracion(req, res, next) {
        try {
            const configuracion = req.body;
            // Aquí guardar en base de datos
            res.json({
                message: 'Configuración actualizada',
                configuracion
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = adminController;