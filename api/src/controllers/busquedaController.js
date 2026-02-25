// src/controllers/busquedaController.js
const { Op } = require('sequelize');
const { Usuario, Proveedor, Especialidad, Especialista, ProductoAlquiler, Calificacion, EspecialistaEspecialidad } = require('../models');

const busquedaController = {
    // Búsqueda principal
    async buscar(req, res, next) {
        try {
            const {
                q,
                tipo,
                ubicacion,
                categoria,
                precio_min,
                precio_max,
                pagina = 1,
                limite = 20
            } = req.query;

            let resultados = [];

            if (tipo === 'proveedores' || !tipo) {
                const proveedores = await busquedaController.buscarProveedores({
                    q,
                    ubicacion,
                    categoria,
                    pagina,
                    limite
                });
                if (proveedores.items.length > 0) {
                    resultados.push({
                        tipo: 'proveedores',
                        items: proveedores.items,
                        total: proveedores.total
                    });
                }
            }

            if (tipo === 'productos' || !tipo) {
                const productos = await busquedaController.buscarProductos({
                    q,
                    ubicacion,
                    categoria,
                    precio_min,
                    precio_max,
                    pagina,
                    limite
                });
                if (productos.items.length > 0) {
                    resultados.push({
                        tipo: 'productos',
                        items: productos.items,
                        total: productos.total
                    });
                }
            }

            res.json({
                resultados,
                pagina: parseInt(pagina),
                total: resultados.reduce((acc, r) => acc + r.total, 0)
            });

        } catch (error) {
            next(error);
        }
    },

    // Buscar proveedores
    async buscarProveedores(filtros) {
        const { q, ubicacion, categoria, pagina, limite } = filtros;

        const whereClause = {};

        if (q) {
            whereClause[Op.or] = [
                { nombre_negocio: { [Op.like]: `%${q}%` } },
                { descripcion: { [Op.like]: `%${q}%` } }
            ];
        }

        if (ubicacion) {
            whereClause.ciudad = { [Op.like]: `%${ubicacion}%` };
        }

        const proveedores = await Proveedor.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Usuario,
                    as: 'usuario',
                    attributes: ['id', 'nombre', 'foto_perfil']
                },
                {
                    model: Especialidad,
                    as: 'especialidades',
                    where: categoria ? { id: categoria } : {},
                    required: !!categoria,
                    attributes: ['id', 'nombre']
                }
            ],
            limit: parseInt(limite),
            offset: (pagina - 1) * parseInt(limite),
            distinct: true
        });

        // Calcular promedio de calificaciones
        const items = await Promise.all(proveedores.rows.map(async (prov) => {
            const calificaciones = await Calificacion.findAll({
                where: { proveedor_id: prov.id },
                attributes: ['puntuacion']
            });
            
            const promedio = calificaciones.length > 0
                ? calificaciones.reduce((sum, c) => sum + c.puntuacion, 0) / calificaciones.length
                : 0;

            return {
                ...prov.toJSON(),
                calificacion_promedio: promedio,
                total_resenas: calificaciones.length
            };
        }));

        return {
            items,
            total: proveedores.count
        };
    },

    // Buscar productos
    async buscarProductos(filtros) {
        const { q, ubicacion, categoria, precio_min, precio_max, pagina, limite } = filtros;

        const whereClause = {
            activo: true
        };

        if (q) {
            whereClause[Op.or] = [
                { nombre: { [Op.like]: `%${q}%` } },
                { descripcion: { [Op.like]: `%${q}%` } }
            ];
        }

        if (precio_min) {
            whereClause.precio_hora = { [Op.gte]: precio_min };
        }

        if (precio_max) {
            whereClause.precio_hora = { 
                ...whereClause.precio_hora,
                [Op.lte]: precio_max 
            };
        }

        const productos = await ProductoAlquiler.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Proveedor,
                    as: 'proveedor',
                    where: ubicacion ? { ciudad: { [Op.like]: `%${ubicacion}%` } } : {},
                    include: [{
                        model: Usuario,
                        as: 'usuario',
                        attributes: ['id', 'nombre', 'foto_perfil']
                    }]
                }
            ],
            limit: parseInt(limite),
            offset: (pagina - 1) * parseInt(limite),
            distinct: true
        });

        // Calcular calificaciones
        const items = await Promise.all(productos.rows.map(async (producto) => {
            const calificaciones = await Calificacion.findAll({
                where: { producto_id: producto.id },
                attributes: ['puntuacion']
            });

            const promedio = calificaciones.length > 0
                ? calificaciones.reduce((sum, c) => sum + c.puntuacion, 0) / calificaciones.length
                : 0;

            return {
                ...producto.toJSON(),
                calificacion_promedio: promedio,
                total_resenas: calificaciones.length
            };
        }));

        return {
            items,
            total: productos.count
        };
    },

    // Obtener disponibilidad de cita
    async getDisponibilidadCita(req, res, next) {
        try {
            const { especialista_id, fecha } = req.query;

            // Aquí iría la lógica real de disponibilidad
            // Por ahora retornamos horarios de ejemplo
            const horarios = [
                { hora_inicio: '09:00', hora_fin: '10:00', disponible: true },
                { hora_inicio: '10:00', hora_fin: '11:00', disponible: true },
                { hora_inicio: '11:00', hora_fin: '12:00', disponible: false },
                { hora_inicio: '12:00', hora_fin: '13:00', disponible: true },
                { hora_inicio: '14:00', hora_fin: '15:00', disponible: true },
                { hora_inicio: '15:00', hora_fin: '16:00', disponible: true },
                { hora_inicio: '16:00', hora_fin: '17:00', disponible: false },
                { hora_inicio: '17:00', hora_fin: '18:00', disponible: true }
            ];

            res.json({
                especialista_id,
                fecha,
                horarios_disponibles: horarios
            });

        } catch (error) {
            next(error);
        }
    },

    // Obtener disponibilidad de producto
    async getDisponibilidadProducto(req, res, next) {
        try {
            const { producto_id, fecha } = req.query;

            res.json({
                producto_id,
                fecha,
                disponible: true,
                cantidad_disponible: 5
            });

        } catch (error) {
            next(error);
        }
    },

    // Obtener proveedor por ID
    async getProveedorDetalle(req, res, next) {
        try {
            const { id } = req.params;

            const proveedor = await Proveedor.findByPk(id, {
                include: [
                    {
                        model: Usuario,
                        as: 'usuario',
                        attributes: ['id', 'nombre', 'apellidos', 'email', 'telefono', 'foto_perfil']
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
                        required: false,
                        include: [{
                            model: Especialidad,
                            as: 'especialidades',
                            through: { attributes: ['precio', 'duracion_minutos'] }
                        }]
                    },
                    {
                        model: ProductoAlquiler,
                        as: 'productos',
                        where: { activo: true },
                        required: false
                    }
                ]
            });

            if (!proveedor) {
                return res.status(404).json({ error: 'Proveedor no encontrado' });
            }

            // Obtener calificaciones
            const calificaciones = await Calificacion.findAll({
                where: { proveedor_id: id },
                include: [{
                    model: Usuario,
                    as: 'cliente',
                    attributes: ['id', 'nombre', 'foto_perfil']
                }],
                order: [['fecha', 'DESC']],
                limit: 10
            });

            const promedio = calificaciones.length > 0
                ? calificaciones.reduce((sum, c) => sum + c.puntuacion, 0) / calificaciones.length
                : 0;

            const proveedorData = proveedor.toJSON();
            proveedorData.calificacion_promedio = promedio;
            proveedorData.total_resenas = calificaciones.length;
            proveedorData.reseñas = calificaciones;

            res.json(proveedorData);

        } catch (error) {
            next(error);
        }
    },

    // Obtener producto por ID
    async getProductoDetalle(req, res, next) {
        try {
            const { id } = req.params;

            const producto = await ProductoAlquiler.findByPk(id, {
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
                ]
            });

            if (!producto) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            // Obtener calificaciones
            const calificaciones = await Calificacion.findAll({
                where: { producto_id: id },
                include: [{
                    model: Usuario,
                    as: 'cliente',
                    attributes: ['id', 'nombre', 'foto_perfil']
                }],
                order: [['fecha', 'DESC']],
                limit: 10
            });

            const promedio = calificaciones.length > 0
                ? calificaciones.reduce((sum, c) => sum + c.puntuacion, 0) / calificaciones.length
                : 0;

            const productoData = producto.toJSON();
            productoData.calificacion_promedio = promedio;
            productoData.total_resenas = calificaciones.length;
            productoData.reseñas = calificaciones;

            res.json(productoData);

        } catch (error) {
            next(error);
        }
    },

    // Obtener especialista por ID
    async getEspecialistaDetalle(req, res, next) {
        try {
            const { id } = req.params;

            const especialista = await Especialista.findByPk(id, {
                include: [
                    {
                        model: Proveedor,
                        as: 'proveedor',
                        include: [{
                            model: Usuario,
                            as: 'usuario',
                            attributes: ['id', 'nombre', 'foto_perfil']
                        }]
                    },
                    {
                        model: Especialidad,
                        as: 'especialidades',
                        through: { attributes: ['precio', 'duracion_minutos'] }
                    }
                ]
            });

            if (!especialista) {
                return res.status(404).json({ error: 'Especialista no encontrado' });
            }

            // Obtener calificaciones
            const calificaciones = await Calificacion.findAll({
                where: { especialista_id: id },
                include: [{
                    model: Usuario,
                    as: 'cliente',
                    attributes: ['id', 'nombre', 'foto_perfil']
                }],
                order: [['fecha', 'DESC']],
                limit: 10
            });

            const promedio = calificaciones.length > 0
                ? calificaciones.reduce((sum, c) => sum + c.puntuacion, 0) / calificaciones.length
                : 0;

            const especialistaData = especialista.toJSON();
            especialistaData.calificacion_promedio = promedio;
            especialistaData.total_resenas = calificaciones.length;
            especialistaData.reseñas = calificaciones;

            res.json(especialistaData);

        } catch (error) {
            next(error);
        }
    },

    // Verificar disponibilidad de cita
    async verificarDisponibilidadCita(req, res, next) {
        try {
            const { especialista_id, fecha, hora } = req.body;

            // Aquí iría la lógica real de verificación
            res.json({
                disponible: true,
                message: 'Horario disponible'
            });

        } catch (error) {
            next(error);
        }
    },

    // Verificar disponibilidad de producto
    async verificarDisponibilidadProducto(req, res, next) {
        try {
            const { producto_id, fecha, hora } = req.body;

            res.json({
                disponible: true,
                message: 'Producto disponible'
            });

        } catch (error) {
            next(error);
        }
    },

    // Obtener categorías populares
    async getPopulares(req, res, next) {
        try {
            // Obtener proveedores destacados
            const proveedores = await Proveedor.findAll({
                limit: 8,
                include: [
                    {
                        model: Usuario,
                        as: 'usuario',
                        attributes: ['id', 'nombre', 'foto_perfil']
                    }
                ],
                order: [['fecha_creacion', 'DESC']]
            });

            // Obtener productos populares
            const productos = await ProductoAlquiler.findAll({
                where: { activo: true },
                limit: 6,
                order: [['fecha_registro', 'DESC']],
                include: [{
                    model: Proveedor,
                    as: 'proveedor',
                    include: [{
                        model: Usuario,
                        as: 'usuario',
                        attributes: ['id', 'nombre']
                    }]
                }]
            });

            res.json({
                proveedores,
                productos
            });

        } catch (error) {
            next(error);
        }
    }
};

module.exports = busquedaController;