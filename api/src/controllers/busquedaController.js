// src/controllers/busquedaController.js
const { Op } = require('sequelize');
const { Usuario, Proveedor, Especialidad, Especialista, ProductoAlquiler, Calificacion } = require('../models');
const disponibilidadService = require('../services/disponibilidadService');

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
                fecha,
                hora,
                pagina = 1,
                limite = 20
            } = req.query;

            let resultados = [];

            if (tipo === 'proveedores' || !tipo) {
                resultados = await this.buscarProveedores({
                    q,
                    ubicacion,
                    categoria,
                    pagina,
                    limite
                });
            }

            if (tipo === 'productos' || !tipo) {
                const productos = await this.buscarProductos({
                    q,
                    ubicacion,
                    categoria,
                    precio_min,
                    precio_max,
                    fecha,
                    hora,
                    pagina,
                    limite
                });
                resultados = [...resultados, ...productos];
            }

            res.json({
                resultados,
                pagina: parseInt(pagina),
                total: resultados.length
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
                    model: Calificacion,
                    as: 'calificaciones',
                    attributes: ['puntuacion'],
                    required: false
                },
                {
                    model: Especialidad,
                    as: 'especialidades',
                    where: categoria ? { id: categoria } : {},
                    required: !!categoria
                }
            ],
            limit: parseInt(limite),
            offset: (pagina - 1) * parseInt(limite)
        });

        // Calcular promedio de calificaciones
        const resultados = proveedores.rows.map(prov => {
            const calificaciones = prov.calificaciones || [];
            const promedio = calificaciones.length > 0
                ? calificaciones.reduce((sum, c) => sum + c.puntuacion, 0) / calificaciones.length
                : 0;

            return {
                ...prov.toJSON(),
                calificacion_promedio: promedio,
                total_resenas: calificaciones.length
            };
        });

        return {
            tipo: 'proveedores',
            items: resultados,
            total: proveedores.count
        };
    },

    // Buscar productos
    async buscarProductos(filtros) {
        const { q, ubicacion, categoria, precio_min, precio_max, fecha, hora, pagina, limite } = filtros;

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
                    include: ['usuario']
                },
                {
                    model: Calificacion,
                    as: 'calificaciones',
                    attributes: ['puntuacion'],
                    required: false
                }
            ],
            limit: parseInt(limite),
            offset: (pagina - 1) * parseInt(limite)
        });

        // Verificar disponibilidad si se proporciona fecha y hora
        let resultados = [];
        for (const producto of productos.rows) {
            let disponible = true;

            if (fecha && hora) {
                disponible = await disponibilidadService.verificarDisponibilidadProducto(
                    producto.id,
                    fecha,
                    hora,
                    1, // duración mínima para verificar
                    1
                );
            }

            const calificaciones = producto.calificaciones || [];
            const promedio = calificaciones.length > 0
                ? calificaciones.reduce((sum, c) => sum + c.puntuacion, 0) / calificaciones.length
                : 0;

            resultados.push({
                ...producto.toJSON(),
                disponible,
                calificacion_promedio: promedio,
                total_resenas: calificaciones.length
            });
        }

        return {
            tipo: 'productos',
            items: resultados,
            total: productos.count
        };
    },

    // Obtener disponibilidad de especialista
    async getDisponibilidadEspecialista(req, res, next) {
        try {
            const { especialista_id, especialidad_id, fecha } = req.query;

            const disponibilidad = await disponibilidadService.obtenerHorariosDisponibles(
                especialista_id,
                especialidad_id,
                fecha
            );

            res.json({
                especialista_id,
                especialidad_id,
                fecha,
                horarios_disponibles: disponibilidad
            });

        } catch (error) {
            next(error);
        }
    },

    // Obtener disponibilidad de producto
    async getDisponibilidadProducto(req, res, next) {
        try {
            const { producto_id, fecha, hora_inicio, duracion } = req.query;

            const disponible = await disponibilidadService.verificarDisponibilidadProducto(
                producto_id,
                fecha,
                hora_inicio,
                duracion,
                1
            );

            res.json({
                producto_id,
                fecha,
                hora_inicio,
                duracion,
                disponible
            });

        } catch (error) {
            next(error);
        }
    },

    // Obtener categorías/populares
    async getCategoriasPopulares(req, res, next) {
        try {
            const [especialidadesPopulares, categoriasPopulares] = await Promise.all([
                // Especialidades más reservadas
                sequelize.query(`
                    SELECT e.nombre, COUNT(rc.id) as total_reservas
                    FROM especialidades e
                    JOIN reserva_citas rc ON e.id = rc.especialidad_id
                    GROUP BY e.id
                    ORDER BY total_reservas DESC
                    LIMIT 10
                `, { type: sequelize.QueryTypes.SELECT }),

                // Categorías de productos más alquiladas
                sequelize.query(`
                    SELECT ca.nombre, COUNT(ra.id) as total_alquileres
                    FROM categorias_alquiler ca
                    JOIN productos_alquiler pa ON ca.id = pa.categoria_id
                    JOIN reserva_alquileres ra ON pa.id = ra.producto_id
                    GROUP BY ca.id
                    ORDER BY total_alquileres DESC
                    LIMIT 10
                `, { type: sequelize.QueryTypes.SELECT })
            ]);

            res.json({
                especialidades: especialidadesPopulares,
                categorias: categoriasPopulares
            });

        } catch (error) {
            next(error);
        }
    }
};

module.exports = busquedaController;