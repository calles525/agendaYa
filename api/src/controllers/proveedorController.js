// src/controllers/proveedorController.js
const { Proveedor, Especialidad, Especialista, EspecialistaEspecialidad, ProductoAlquiler, Usuario } = require('../models');
const { Op } = require('sequelize');
const telegramService = require('../config/telegram');

const proveedorController = {
    // Obtener perfil del proveedor
    async getPerfil(req, res, next) {
        try {
            const proveedorId = req.usuario.proveedor?.id || req.params.id;

            const proveedor = await Proveedor.findByPk(proveedorId, {
                include: [
                    {
                        model: Usuario,
                        as: 'usuario',
                        attributes: ['id', 'email', 'nombre', 'apellidos', 'telefono', 'foto_perfil']
                    },
                    {
                        model: Especialidad,
                        as: 'especialidades',
                        where: { activo: true },
                        required: false
                    },
                    {
                        model: Especialista,
                        as: 'especialistas',
                        where: { activo: true },
                        required: false
                    }
                ]
            });

            if (!proveedor) {
                return res.status(404).json({ error: 'Proveedor no encontrado' });
            }

            res.json(proveedor);

        } catch (error) {
            next(error);
        }
    },

    // Actualizar perfil
    async updatePerfil(req, res, next) {
        try {
            const proveedor = await Proveedor.findOne({
                where: { usuario_id: req.usuario.id }
            });

            if (!proveedor) {
                return res.status(404).json({ error: 'Proveedor no encontrado' });
            }

            const camposActualizables = [
                'nombre_negocio', 'descripcion', 'direccion', 'ciudad',
                'codigo_postal', 'sitio_web', 'telefono_contacto',
                'horario_atencion', 'configuracion', 'telegram_chat_id',
                'notificaciones_telegram'
            ];

            const datosActualizados = {};
            camposActualizables.forEach(campo => {
                if (req.body[campo] !== undefined) {
                    datosActualizados[campo] = req.body[campo];
                }
            });

            await proveedor.update(datosActualizados);

            // Si se actualizó el chat_id de Telegram, enviar mensaje de prueba
            if (req.body.telegram_chat_id && proveedor.notificaciones_telegram) {
                await telegramService.sendMessage(
                    req.body.telegram_chat_id,
                    '✅ Configuración de Telegram exitosa. Recibirás notificaciones de tus reservas aquí.'
                );
            }

            res.json({
                message: 'Perfil actualizado exitosamente',
                proveedor
            });

        } catch (error) {
            next(error);
        }
    },

    // Obtener dashboard del proveedor
    async getDashboard(req, res, next) {
        try {
            const proveedor = await Proveedor.findOne({
                where: { usuario_id: req.usuario.id }
            });

            if (!proveedor) {
                return res.status(404).json({ error: 'Proveedor no encontrado' });
            }

            // Obtener estadísticas
            const hoy = new Date();
            const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
            const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

            const [reservasHoy, reservasPendientes, ingresosMes, totalClientes] = await Promise.all([
                // Reservas de hoy
                proveedor.countReservas({
                    where: {
                        fecha_reserva: hoy.toISOString().split('T')[0],
                        estado: { [Op.in]: ['confirmada', 'pendiente'] }
                    }
                }),
                // Reservas pendientes
                proveedor.countReservas({
                    where: { estado: 'pendiente' }
                }),
                // Ingresos del mes
                proveedor.getReservas({
                    where: {
                        estado: 'completada',
                        fecha_creacion: { [Op.between]: [inicioMes, finMes] }
                    }
                }).then(reservas => 
                    reservas.reduce((total, r) => total + parseFloat(r.total), 0)
                ),
                // Total de clientes únicos
                proveedor.getReservas({
                    attributes: ['cliente_id'],
                    group: ['cliente_id']
                }).then(reservas => reservas.length)
            ]);

            res.json({
                resumen: {
                    reservas_hoy: reservasHoy,
                    reservas_pendientes: reservasPendientes,
                    ingresos_mes: ingresosMes,
                    total_clientes: totalClientes
                },
                proximas_reservas: await proveedor.getReservas({
                    where: {
                        fecha_reserva: { [Op.gte]: hoy },
                        estado: { [Op.in]: ['confirmada', 'pendiente'] }
                    },
                    limit: 5,
                    order: [['fecha_reserva', 'ASC'], ['hora_inicio', 'ASC']],
                    include: ['cliente']
                })
            });

        } catch (error) {
            next(error);
        }
    },

    // CRUD Especialidades
    async createEspecialidad(req, res, next) {
        try {
            const proveedor = await Proveedor.findOne({
                where: { usuario_id: req.usuario.id }
            });

            const especialidad = await Especialidad.create({
                proveedor_id: proveedor.id,
                ...req.body
            });

            res.status(201).json(especialidad);

        } catch (error) {
            next(error);
        }
    },

    async updateEspecialidad(req, res, next) {
        try {
            const especialidad = req.recurso; // Viene del middleware checkProveedorOwnership
            await especialidad.update(req.body);
            res.json(especialidad);
        } catch (error) {
            next(error);
        }
    },

    async deleteEspecialidad(req, res, next) {
        try {
            const especialidad = req.recurso;
            await especialidad.update({ activo: false });
            res.json({ message: 'Especialidad eliminada exitosamente' });
        } catch (error) {
            next(error);
        }
    },

    // CRUD Especialistas
    async createEspecialista(req, res, next) {
        try {
            const proveedor = await Proveedor.findOne({
                where: { usuario_id: req.usuario.id }
            });

            const especialista = await Especialista.create({
                proveedor_id: proveedor.id,
                ...req.body
            });

            // Si se enviaron especialidades asociadas
            if (req.body.especialidades) {
                for (const esp of req.body.especialidades) {
                    await EspecialistaEspecialidad.create({
                        especialista_id: especialista.id,
                        especialidad_id: esp.especialidad_id,
                        precio: esp.precio,
                        duracion_minutos: esp.duracion_minutos || 60,
                        horario_json: esp.horario_json
                    });
                }
            }

            res.status(201).json(especialista);

        } catch (error) {
            next(error);
        }
    },

    async updateEspecialista(req, res, next) {
        try {
            const especialista = req.recurso;
            await especialista.update(req.body);
            res.json(especialista);
        } catch (error) {
            next(error);
        }
    },

    async deleteEspecialista(req, res, next) {
        try {
            const especialista = req.recurso;
            await especialista.update({ activo: false });
            res.json({ message: 'Especialista eliminado exitosamente' });
        } catch (error) {
            next(error);
        }
    },

    // Configurar horario de especialista para especialidad
    async configurarHorarioEspecialista(req, res, next) {
        try {
            const { especialista_id, especialidad_id } = req.params;
            const { precio, duracion_minutos, horario_json } = req.body;

            const [config, created] = await EspecialistaEspecialidad.upsert({
                especialista_id,
                especialidad_id,
                precio,
                duracion_minutos,
                horario_json
            });

            res.json({
                message: created ? 'Horario creado' : 'Horario actualizado',
                config
            });

        } catch (error) {
            next(error);
        }
    },

    // CRUD Productos
    async createProducto(req, res, next) {
        try {
            const proveedor = await Proveedor.findOne({
                where: { usuario_id: req.usuario.id }
            });

            const producto = await ProductoAlquiler.create({
                proveedor_id: proveedor.id,
                ...req.body
            });

            res.status(201).json(producto);

        } catch (error) {
            next(error);
        }
    },

    async updateProducto(req, res, next) {
        try {
            const producto = req.recurso;
            await producto.update(req.body);
            res.json(producto);
        } catch (error) {
            next(error);
        }
    },

    async deleteProducto(req, res, next) {
        try {
            const producto = req.recurso;
            await producto.update({ activo: false });
            res.json({ message: 'Producto eliminado exitosamente' });
        } catch (error) {
            next(error);
        }
    },

    // Obtener estadísticas y reportes
    async getReportes(req, res, next) {
        try {
            const proveedor = await Proveedor.findOne({
                where: { usuario_id: req.usuario.id }
            });

            const { fecha_inicio, fecha_fin, tipo } = req.query;

            const whereClause = {
                proveedor_id: proveedor.id,
                ...(fecha_inicio && fecha_fin && {
                    fecha_creacion: {
                        [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
                    }
                })
            };

            let resultados;

            switch (tipo) {
                case 'reservas-mensuales':
                    resultados = await proveedor.getReservas({
                        where: whereClause,
                        attributes: [
                            [sequelize.fn('DATE_FORMAT', sequelize.col('fecha_reserva'), '%Y-%m'), 'mes'],
                            [sequelize.fn('COUNT', sequelize.col('id')), 'total_reservas'],
                            [sequelize.fn('SUM', sequelize.col('total')), 'ingresos']
                        ],
                        group: ['mes'],
                        order: [[sequelize.col('mes'), 'DESC']]
                    });
                    break;

                case 'productos-populares':
                    resultados = await sequelize.query(`
                        SELECT p.nombre, COUNT(ra.id) as veces_alquilado
                        FROM reserva_alquileres ra
                        JOIN productos_alquiler p ON ra.producto_id = p.id
                        JOIN reservas r ON ra.reserva_id = r.id
                        WHERE r.proveedor_id = :proveedor_id
                        GROUP BY p.id
                        ORDER BY veces_alquilado DESC
                        LIMIT 10
                    `, {
                        replacements: { proveedor_id: proveedor.id },
                        type: sequelize.QueryTypes.SELECT
                    });
                    break;

                case 'clientes-frecuentes':
                    resultados = await sequelize.query(`
                        SELECT u.nombre, u.email, COUNT(r.id) as total_reservas
                        FROM reservas r
                        JOIN usuarios u ON r.cliente_id = u.id
                        WHERE r.proveedor_id = :proveedor_id
                        GROUP BY u.id
                        ORDER BY total_reservas DESC
                        LIMIT 10
                    `, {
                        replacements: { proveedor_id: proveedor.id },
                        type: sequelize.QueryTypes.SELECT
                    });
                    break;

                default:
                    return res.status(400).json({ error: 'Tipo de reporte no válido' });
            }

            res.json(resultados);

        } catch (error) {
            next(error);
        }
    }
};

module.exports = proveedorController;