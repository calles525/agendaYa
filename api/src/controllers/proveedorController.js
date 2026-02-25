// src/controllers/proveedorController.js
const { Proveedor, Especialidad, Especialista, EspecialistaEspecialidad, ProductoAlquiler, Usuario } = require('../models');
const { Op } = require('sequelize');
const telegramService = require('../config/telegram');
const multer = require('multer');
const path = require('path');

// Configuración de multer para subir fotos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/especialistas/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'esp-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten imágenes'));
    }
}).single('foto');

const proveedorController = {


    // CRUD Especialistas
    async getEspecialistas(req, res, next) {
        try {
            const proveedor = await Proveedor.findOne({
                where: { usuario_id: req.usuario.id }
            });

            if (!proveedor) {
                return res.status(404).json({ error: 'Proveedor no encontrado' });
            }

            const especialistas = await Especialista.findAll({
                where: {
                    proveedor_id: proveedor.id,
                    activo: true
                },
                include: [{
                    model: Especialidad,
                    as: 'especialidades',
                    through: { attributes: [] }
                }],
                order: [['nombre', 'ASC']]
            });

            res.json(especialistas);
        } catch (error) {
            next(error);
        }
    },

    async createEspecialista(req, res, next) {
        try {
            console.log('Body recibido:', req.body);
            console.log('File recibido:', req.file);

            const proveedor = await Proveedor.findOne({
                where: { usuario_id: req.usuario.id }
            });

            if (!proveedor) {
                return res.status(404).json({ error: 'Proveedor no encontrado' });
            }

            const { nombre, email, telefono, descripcion, especialidades } = req.body;

            // Parsear especialidades - manejar diferentes formatos
            let especialidadesArray = [];
            if (especialidades) {
                try {
                    // Si viene como string "[2]"
                    if (typeof especialidades === 'string' && especialidades.startsWith('[')) {
                        especialidadesArray = JSON.parse(especialidades);
                    }
                    // Si viene como string "2"
                    else if (typeof especialidades === 'string' && !isNaN(especialidades)) {
                        especialidadesArray = [parseInt(especialidades)];
                    }
                    // Si ya es array
                    else if (Array.isArray(especialidades)) {
                        especialidadesArray = especialidades;
                    }
                } catch (e) {
                    console.error('Error parseando especialidades:', e);
                    // Si falla el parseo, intentar dividir por comas
                    if (typeof especialidades === 'string' && especialidades.includes(',')) {
                        especialidadesArray = especialidades.split(',').map(id => parseInt(id.trim()));
                    }
                }
            }

            console.log('Especialidades parseadas:', especialidadesArray);

            // Validar que especialidadesArray sea un array de números
            especialidadesArray = especialidadesArray.filter(id => !isNaN(parseInt(id))).map(id => parseInt(id));

            // Crear especialista
            const especialista = await Especialista.create({
                proveedor_id: proveedor.id,
                nombre,
                email,
                telefono,
                descripcion,
                foto: req.file ? `/uploads/especialistas/${req.file.filename}` : null,
                activo: true
            });

            // Asociar especialidades
            if (especialidadesArray && especialidadesArray.length > 0) {
                await especialista.setEspecialidades(especialidadesArray);
            }

            // Obtener el especialista con sus relaciones
            const especialistaCompleto = await Especialista.findByPk(especialista.id, {
                include: [{
                    model: Especialidad,
                    as: 'especialidades'
                }]
            });

            res.status(201).json(especialistaCompleto);
        } catch (error) {
            console.error('Error en createEspecialista:', error);
            next(error);
        }
    },

    async updateEspecialista(req, res, next) {
        try {
            const { id } = req.params;

            const especialista = await Especialista.findByPk(id);

            if (!especialista) {
                return res.status(404).json({ error: 'Especialista no encontrado' });
            }

            // Verificar que el especialista pertenece al proveedor
            const proveedor = await Proveedor.findOne({
                where: { usuario_id: req.usuario.id }
            });

            if (especialista.proveedor_id !== proveedor.id) {
                return res.status(403).json({ error: 'No autorizado' });
            }

            const { nombre, email, telefono, descripcion, especialidades } = req.body;

            // Parsear especialidades igual que en create
            let especialidadesArray = [];
            if (especialidades) {
                try {
                    if (typeof especialidades === 'string' && especialidades.startsWith('[')) {
                        especialidadesArray = JSON.parse(especialidades);
                    } else if (typeof especialidades === 'string' && !isNaN(especialidades)) {
                        especialidadesArray = [parseInt(especialidades)];
                    } else if (Array.isArray(especialidades)) {
                        especialidadesArray = especialidades;
                    }
                } catch (e) {
                    console.error('Error parseando especialidades:', e);
                }
            }

            especialidadesArray = especialidadesArray.filter(id => !isNaN(parseInt(id))).map(id => parseInt(id));

            // Preparar datos para actualizar
            const updateData = {
                nombre: nombre || especialista.nombre,
                email: email !== undefined ? email : especialista.email,
                telefono: telefono !== undefined ? telefono : especialista.telefono,
                descripcion: descripcion !== undefined ? descripcion : especialista.descripcion
            };

            // Si hay nueva foto
            if (req.file) {
                updateData.foto = `/uploads/especialistas/${req.file.filename}`;
            }

            await especialista.update(updateData);

            // Actualizar especialidades
            if (especialidadesArray.length > 0) {
                await especialista.setEspecialidades(especialidadesArray);
            }

            // Obtener el especialista actualizado
            const especialistaActualizado = await Especialista.findByPk(id, {
                include: [{
                    model: Especialidad,
                    as: 'especialidades'
                }]
            });

            res.json(especialistaActualizado);
        } catch (error) {
            console.error('Error en updateEspecialista:', error);
            next(error);
        }
    },

    async deleteEspecialista(req, res, next) {
        try {
            const { id } = req.params;

            const especialista = await Especialista.findByPk(id);

            if (!especialista) {
                return res.status(404).json({ error: 'Especialista no encontrado' });
            }

            // Verificar que el especialista pertenece al proveedor
            const proveedor = await Proveedor.findOne({
                where: { usuario_id: req.usuario.id }
            });

            if (especialista.proveedor_id !== proveedor.id) {
                return res.status(403).json({ error: 'No autorizado' });
            }

            // Soft delete
            await especialista.update({ activo: false });

            res.json({ message: 'Especialista eliminado correctamente' });
        } catch (error) {
            next(error);
        }
    },
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
    },
    // CRUD Especialidades
    async getEspecialidades(req, res, next) {
        try {
            const proveedor = await Proveedor.findOne({
                where: { usuario_id: req.usuario.id }
            });

            if (!proveedor) {
                return res.status(404).json({ error: 'Proveedor no encontrado' });
            }

            const especialidades = await Especialidad.findAll({
                where: {
                    proveedor_id: proveedor.id,
                    activo: true
                },
                order: [['nombre', 'ASC']]
            });

            res.json(especialidades);
        } catch (error) {
            next(error);
        }
    },

    async createEspecialidad(req, res, next) {
        try {
            const proveedor = await Proveedor.findOne({
                where: { usuario_id: req.usuario.id }
            });

            if (!proveedor) {
                return res.status(404).json({ error: 'Proveedor no encontrado' });
            }

            const { nombre, descripcion, icono } = req.body;

            const especialidad = await Especialidad.create({
                proveedor_id: proveedor.id,
                nombre,
                descripcion,
                icono: icono || '🔧',
                activo: true
            });

            res.status(201).json(especialidad);
        } catch (error) {
            next(error);
        }
    },

    async updateEspecialidad(req, res, next) {
        try {
            const { id } = req.params;

            const especialidad = await Especialidad.findByPk(id);

            if (!especialidad) {
                return res.status(404).json({ error: 'Especialidad no encontrada' });
            }

            // Verificar que la especialidad pertenece al proveedor
            const proveedor = await Proveedor.findOne({
                where: { usuario_id: req.usuario.id }
            });

            if (especialidad.proveedor_id !== proveedor.id) {
                return res.status(403).json({ error: 'No autorizado' });
            }

            const { nombre, descripcion, icono } = req.body;

            await especialidad.update({
                nombre: nombre || especialidad.nombre,
                descripcion: descripcion !== undefined ? descripcion : especialidad.descripcion,
                icono: icono || especialidad.icono
            });

            res.json(especialidad);
        } catch (error) {
            next(error);
        }
    },

    async deleteEspecialidad(req, res, next) {
        try {
            const { id } = req.params;

            const especialidad = await Especialidad.findByPk(id);

            if (!especialidad) {
                return res.status(404).json({ error: 'Especialidad no encontrada' });
            }

            // Verificar que la especialidad pertenece al proveedor
            const proveedor = await Proveedor.findOne({
                where: { usuario_id: req.usuario.id }
            });

            if (especialidad.proveedor_id !== proveedor.id) {
                return res.status(403).json({ error: 'No autorizado' });
            }

            // Soft delete
            await especialidad.update({ activo: false });

            res.json({ message: 'Especialidad eliminada correctamente' });
        } catch (error) {
            next(error);
        }
    },
    // CRUD Productos - FALTABAN ESTOS MÉTODOS
    async getProductos(req, res, next) {
        try {
            const proveedor = await Proveedor.findOne({
                where: { usuario_id: req.usuario.id }
            });

            if (!proveedor) {
                return res.status(404).json({ error: 'Proveedor no encontrado' });
            }

            const productos = await ProductoAlquiler.findAll({
                where: {
                    proveedor_id: proveedor.id,
                    activo: true
                },
                include: [{
                    model: CategoriaAlquiler,
                    as: 'categoria',
                    attributes: ['id', 'nombre']
                }],
                order: [['nombre', 'ASC']]
            });

            res.json(productos);
        } catch (error) {
            next(error);
        }
    },

    async createProducto(req, res, next) {
        try {
            const proveedor = await Proveedor.findOne({
                where: { usuario_id: req.usuario.id }
            });

            if (!proveedor) {
                return res.status(404).json({ error: 'Proveedor no encontrado' });
            }

            const {
                nombre,
                descripcion,
                precio_hora,
                duracion_minima,
                cantidad_disponible,
                categoria_id,
                dimensiones,
                peso,
                condiciones_uso
            } = req.body;

            // Procesar fotos si se subieron
            let fotos = [];
            if (req.files && req.files.length > 0) {
                fotos = req.files.map(file => `/uploads/productos/${file.filename}`);
            }

            const producto = await ProductoAlquiler.create({
                proveedor_id: proveedor.id,
                categoria_id,
                nombre,
                descripcion,
                precio_hora,
                duracion_minima: duracion_minima || 1,
                cantidad_disponible: cantidad_disponible || 1,
                foto_principal: fotos.length > 0 ? fotos[0] : null,
                fotos_adicionales: fotos,
                dimensiones,
                peso,
                condiciones_uso,
                activo: true
            });

            res.status(201).json(producto);
        } catch (error) {
            next(error);
        }
    },

    async updateProducto(req, res, next) {
        try {
            const { id } = req.params;

            const producto = await ProductoAlquiler.findByPk(id);

            if (!producto) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            // Verificar que el producto pertenece al proveedor
            const proveedor = await Proveedor.findOne({
                where: { usuario_id: req.usuario.id }
            });

            if (producto.proveedor_id !== proveedor.id) {
                return res.status(403).json({ error: 'No autorizado' });
            }

            const {
                nombre,
                descripcion,
                precio_hora,
                duracion_minima,
                cantidad_disponible,
                categoria_id,
                dimensiones,
                peso,
                condiciones_uso
            } = req.body;

            // Procesar nuevas fotos si se subieron
            let fotos = producto.fotos_adicionales || [];
            if (req.files && req.files.length > 0) {
                const nuevasFotos = req.files.map(file => `/uploads/productos/${file.filename}`);
                fotos = [...nuevasFotos, ...fotos].slice(0, 5); // Máximo 5 fotos
            }

            await producto.update({
                categoria_id: categoria_id || producto.categoria_id,
                nombre: nombre || producto.nombre,
                descripcion: descripcion !== undefined ? descripcion : producto.descripcion,
                precio_hora: precio_hora || producto.precio_hora,
                duracion_minima: duracion_minima || producto.duracion_minima,
                cantidad_disponible: cantidad_disponible || producto.cantidad_disponible,
                foto_principal: fotos.length > 0 ? fotos[0] : producto.foto_principal,
                fotos_adicionales: fotos,
                dimensiones: dimensiones !== undefined ? dimensiones : producto.dimensiones,
                peso: peso !== undefined ? peso : producto.peso,
                condiciones_uso: condiciones_uso !== undefined ? condiciones_uso : producto.condiciones_uso
            });

            res.json(producto);
        } catch (error) {
            next(error);
        }
    },

    async deleteProducto(req, res, next) {
        try {
            const { id } = req.params;

            const producto = await ProductoAlquiler.findByPk(id);

            if (!producto) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            // Verificar que el producto pertenece al proveedor
            const proveedor = await Proveedor.findOne({
                where: { usuario_id: req.usuario.id }
            });

            if (producto.proveedor_id !== proveedor.id) {
                return res.status(403).json({ error: 'No autorizado' });
            }

            // Soft delete
            await producto.update({ activo: false });

            res.json({ message: 'Producto eliminado correctamente' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = proveedorController;