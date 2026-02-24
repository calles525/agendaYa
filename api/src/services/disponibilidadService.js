// src/services/disponibilidadService.js
const { Reserva, EspecialistaEspecialidad, DisponibilidadProducto } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

class DisponibilidadService {
    
    /**
     * Obtiene los horarios disponibles para un especialista en una fecha específica
     */
    async obtenerHorariosDisponibles(especialistaId, especialidadId, fecha) {
        try {
            // 1. Obtener configuración de horario
            const config = await EspecialistaEspecialidad.findOne({
                where: {
                    especialista_id: especialistaId,
                    especialidad_id: especialidadId,
                    activo: true
                }
            });

            if (!config) {
                return [];
            }

            // 2. Determinar día de la semana
            const diaSemana = this.obtenerDiaSemana(fecha);
            const horarioDia = config.horario_json[diaSemana];

            if (!horarioDia || !horarioDia.activo) {
                return [];
            }

            // 3. Generar slots de tiempo
            const slots = this.generarSlotsTiempo(
                horarioDia.hora_inicio,
                horarioDia.hora_fin,
                config.duracion_minutos
            );

            // 4. Obtener reservas existentes
            const reservasExistentes = await Reserva.findAll({
                where: {
                    fecha_reserva: fecha,
                    estado: { [Op.in]: ['confirmada', 'pendiente'] }
                },
                include: [{
                    model: ReservaCita,
                    as: 'reservaCita',
                    where: {
                        especialista_id: especialistaId
                    },
                    required: true
                }]
            });

            // 5. Filtrar slots ocupados
            const slotsDisponibles = this.filtrarSlotsOcupados(slots, reservasExistentes);

            return slotsDisponibles;

        } catch (error) {
            console.error('Error obteniendo disponibilidad:', error);
            throw error;
        }
    }

    /**
     * Verifica disponibilidad para una cita específica
     */
    async verificarDisponibilidadCita(especialistaId, especialidadId, fecha, horaInicio, duracionHoras) {
        try {
            const horaFin = this.calcularHoraFin(horaInicio, duracionHoras);

            const reservaConflicto = await Reserva.findOne({
                where: {
                    fecha_reserva: fecha,
                    estado: { [Op.in]: ['confirmada', 'pendiente'] }
                },
                include: [{
                    model: ReservaCita,
                    as: 'reservaCita',
                    where: {
                        especialista_id: especialistaId
                    },
                    required: true
                }],
                where: {
                    [Op.and]: [
                        { fecha_reserva: fecha },
                        {
                            [Op.or]: [
                                {
                                    hora_inicio: {
                                        [Op.lt]: horaFin,
                                        [Op.gte]: horaInicio
                                    }
                                },
                                {
                                    hora_fin: {
                                        [Op.gt]: horaInicio,
                                        [Op.lte]: horaFin
                                    }
                                }
                            ]
                        }
                    ]
                }
            });

            return !reservaConflicto;

        } catch (error) {
            console.error('Error verificando disponibilidad:', error);
            throw error;
        }
    }

    /**
     * Verifica disponibilidad de producto
     */
    async verificarDisponibilidadProducto(productoId, fecha, horaInicio, duracionHoras, cantidad) {
        try {
            const horaFin = this.calcularHoraFin(horaInicio, duracionHoras);

            // Buscar reservas en ese rango
            const reservasConflicto = await Reserva.findAll({
                where: {
                    fecha_reserva: fecha,
                    estado: { [Op.in]: ['confirmada', 'pendiente'] }
                },
                include: [{
                    model: ReservaAlquiler,
                    as: 'reservaAlquileres',
                    where: {
                        producto_id: productoId
                    },
                    required: true
                }],
                where: {
                    [Op.and]: [
                        { fecha_reserva: fecha },
                        {
                            [Op.or]: [
                                {
                                    hora_inicio: {
                                        [Op.lt]: horaFin,
                                        [Op.gte]: horaInicio
                                    }
                                },
                                {
                                    hora_fin: {
                                        [Op.gt]: horaInicio,
                                        [Op.lte]: horaFin
                                    }
                                }
                            ]
                        }
                    ]
                }
            });

            // Calcular cantidad total reservada
            let cantidadReservada = 0;
            for (const reserva of reservasConflicto) {
                for (const detalle of reserva.reservaAlquileres) {
                    cantidadReservada += detalle.cantidad;
                }
            }

            // Obtener información del producto
            const producto = await ProductoAlquiler.findByPk(productoId);
            
            return cantidadReservada + cantidad <= producto.cantidad_disponible;

        } catch (error) {
            console.error('Error verificando disponibilidad producto:', error);
            throw error;
        }
    }

    /**
     * Calcula hora fin basada en hora inicio y duración
     */
    calcularHoraFin(horaInicio, duracionHoras) {
        const [horas, minutos] = horaInicio.split(':').map(Number);
        const fecha = new Date();
        fecha.setHours(horas, minutos, 0);
        fecha.setHours(fecha.getHours() + duracionHoras);
        
        return `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`;
    }

    /**
     * Genera slots de tiempo basados en horario y duración
     */
    generarSlotsTiempo(horaInicio, horaFin, duracionMinutos) {
        const slots = [];
        let inicio = this.convertirHoraAMinutos(horaInicio);
        const fin = this.convertirHoraAMinutos(horaFin);
        
        while (inicio + duracionMinutos <= fin) {
            slots.push({
                hora_inicio: this.convertirMinutosAHora(inicio),
                hora_fin: this.convertirMinutosAHora(inicio + duracionMinutos),
                disponible: true
            });
            inicio += duracionMinutos;
        }
        
        return slots;
    }

    /**
     * Filtra slots ocupados por reservas existentes
     */
    filtrarSlotsOcupados(slots, reservas) {
        return slots.map(slot => {
            const ocupado = reservas.some(reserva => {
                const reservaInicio = this.convertirHoraAMinutos(reserva.hora_inicio);
                const reservaFin = this.convertirHoraAMinutos(reserva.hora_fin);
                const slotInicio = this.convertirHoraAMinutos(slot.hora_inicio);
                const slotFin = this.convertirHoraAMinutos(slot.hora_fin);
                
                return (slotInicio < reservaFin && slotFin > reservaInicio);
            });
            
            return {
                ...slot,
                disponible: !ocupado
            };
        });
    }

    /**
     * Convierte hora string a minutos
     */
    convertirHoraAMinutos(hora) {
        const [h, m] = hora.split(':').map(Number);
        return h * 60 + m;
    }

    /**
     * Convierte minutos a hora string
     */
    convertirMinutosAHora(minutos) {
        const h = Math.floor(minutos / 60);
        const m = minutos % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }

    /**
     * Obtiene nombre del día de la semana
     */
    obtenerDiaSemana(fecha) {
        const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const fechaObj = new Date(fecha);
        return dias[fechaObj.getDay()];
    }

    /**
     * Calcula costo de delivery basado en distancia
     */
    async calcularDelivery(ubicacionCliente, proveedorId) {
        // Aquí iría la lógica real de cálculo de distancia
        // Por ahora, retornamos un valor fijo
        return 50;
    }
}

module.exports = new DisponibilidadService();