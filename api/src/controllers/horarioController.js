const { HorarioEspecialista, Disponibilidad, Especialista, Especialidad, ProductoAlquiler } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

const horarioController = {
    // ===========================================
    // HORARIOS DE ESPECIALISTAS
    // ===========================================
    
    // Obtener horarios de un especialista
    async getHorariosEspecialista(req, res, next) {
        try {
            const { especialista_id } = req.params;
            
            const horarios = await HorarioEspecialista.findAll({
                where: { 
                    especialista_id,
                    activo: true 
                },
                include: [{
                    model: Especialidad,
                    as: 'especialidad',
                    attributes: ['id', 'nombre', 'icono']
                }],
                order: [
                    ['dia_semana', 'ASC'],
                    ['hora_inicio', 'ASC']
                ]
            });

            res.json(horarios);
        } catch (error) {
            next(error);
        }
    },

    // Configurar horario para especialista
    async configurarHorario(req, res, next) {
        try {
            const { especialista_id, especialidad_id } = req.params;
            const { horarios } = req.body; // Array de horarios

            // Validar que el especialista existe
            const especialista = await Especialista.findByPk(especialista_id);
            if (!especialista) {
                return res.status(404).json({ error: 'Especialista no encontrado' });
            }

            // Eliminar horarios anteriores
            await HorarioEspecialista.destroy({
                where: { 
                    especialista_id,
                    especialidad_id 
                }
            });

            // Crear nuevos horarios
            const nuevosHorarios = await Promise.all(
                horarios.map(async (h) => {
                    return await HorarioEspecialista.create({
                        especialista_id,
                        especialidad_id,
                        dia_semana: h.dia_semana,
                        hora_inicio: h.hora_inicio,
                        hora_fin: h.hora_fin,
                        activo: true
                    });
                })
            );

            res.status(201).json(nuevosHorarios);
        } catch (error) {
            next(error);
        }
    },

    // ===========================================
    // DISPONIBILIDAD PARA CITAS
    // ===========================================
    
    // Generar disponibilidad para una fecha específica
    async generarDisponibilidadCita(req, res, next) {
        try {
            const { especialista_id, fecha } = req.query;
            
            const fechaObj = moment(fecha);
            const diaSemana = fechaObj.format('dddd').toLowerCase();
            
            // Obtener horarios del especialista para ese día
            const horarios = await HorarioEspecialista.findAll({
                where: {
                    especialista_id,
                    dia_semana: diaSemana,
                    activo: true
                }
            });

            if (horarios.length === 0) {
                return res.json([]);
            }

            // Obtener reservas existentes para esa fecha
            const reservas = await Disponibilidad.findAll({
                where: {
                    especialista_id,
                    fecha,
                    disponible: false
                }
            });

            // Generar slots de 30 minutos
            const slots = [];
            for (const horario of horarios) {
                let inicio = moment(horario.hora_inicio, 'HH:mm');
                const fin = moment(horario.hora_fin, 'HH:mm');
                
                while (inicio.isBefore(fin)) {
                    const horaInicio = inicio.format('HH:mm');
                    const horaFin = inicio.add(30, 'minutes').format('HH:mm');
                    
                    // Verificar si está reservado
                    const reservado = reservas.some(r => 
                        r.hora_inicio === horaInicio
                    );
                    
                    slots.push({
                        hora_inicio: horaInicio,
                        hora_fin: horaFin,
                        disponible: !reservado
                    });
                }
            }

            res.json(slots);
        } catch (error) {
            next(error);
        }
    },

    // ===========================================
    // DISPONIBILIDAD PARA PRODUCTOS
    // ===========================================
    
    // Verificar disponibilidad de producto
    async verificarDisponibilidadProducto(req, res, next) {
        try {
            const { producto_id, fecha, hora_inicio, duracion_horas } = req.body;
            
            const fechaObj = moment(fecha);
            const horaInicio = moment(hora_inicio, 'HH:mm');
            const horaFin = moment(horaInicio, 'HH:mm').add(duracion_horas, 'hours');
            
            // Buscar reservas que se crucen
            const reservas = await Disponibilidad.findAll({
                where: {
                    producto_id,
                    fecha,
                    disponible: false,
                    [Op.or]: [
                        {
                            hora_inicio: {
                                [Op.lt]: horaFin.format('HH:mm'),
                                [Op.gte]: horaInicio.format('HH:mm')
                            }
                        },
                        {
                            hora_fin: {
                                [Op.gt]: horaInicio.format('HH:mm'),
                                [Op.lte]: horaFin.format('HH:mm')
                            }
                        }
                    ]
                }
            });

            const disponible = reservas.length === 0;
            
            res.json({
                disponible,
                mensaje: disponible ? 'Disponible' : 'No disponible en ese horario'
            });
        } catch (error) {
            next(error);
        }
    },

    // ===========================================
    // RESERVAR HORARIO (CREAR DISPONIBILIDAD OCUPADA)
    // ===========================================
    
    async reservarHorario(req, res, next) {
        try {
            const { 
                tipo, // 'cita' o 'alquiler'
                id, // especialista_id o producto_id
                fecha,
                hora_inicio,
                hora_fin,
                reserva_id 
            } = req.body;

            const data = {
                fecha,
                hora_inicio,
                hora_fin,
                disponible: false,
                reserva_id
            };

            if (tipo === 'cita') {
                data.especialista_id = id;
            } else {
                data.producto_id = id;
            }

            const disponibilidad = await Disponibilidad.create(data);
            
            res.status(201).json(disponibilidad);
        } catch (error) {
            next(error);
        }
    },

    // Liberar horario (cuando se cancela reserva)
    async liberarHorario(req, res, next) {
        try {
            const { reserva_id } = req.params;
            
            await Disponibilidad.update(
                { disponible: true },
                { where: { reserva_id } }
            );

            res.json({ message: 'Horario liberado' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = horarioController;
