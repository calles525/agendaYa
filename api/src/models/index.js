// src/models/index.js
const Usuario = require('./Usuario');
const Proveedor = require('./Proveedor');
const Especialidad = require('./Especialidad');
const Especialista = require('./Especialista');
const EspecialistaEspecialidad = require('./EspecialistaEspecialidad');
const ProductoAlquiler = require('./ProductoAlquiler');
const Reserva = require('./Reserva');
const ReservaCita = require('./ReservaCita');
const ReservaAlquiler = require('./ReservaAlquiler');
const HistorialCliente = require('./HistorialCliente');
const Calificacion = require('./Calificacion');
const { sequelize } = require('../config/database');
const HorarioEspecialista = require('./HorarioEspecialista');
const Disponibilidad = require('./Disponibilidad');
// ===========================================
// RELACIONES USUARIO - PROVEEDOR
// ===========================================
Usuario.hasOne(Proveedor, { foreignKey: 'usuario_id', as: 'proveedor' });
Proveedor.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// ===========================================
// RELACIONES PROVEEDOR - ESPECIALIDADES
// ===========================================
Proveedor.hasMany(Especialidad, { foreignKey: 'proveedor_id', as: 'especialidades' });
Especialidad.belongsTo(Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' });

// ===========================================
// RELACIONES PROVEEDOR - ESPECIALISTAS
// ===========================================
Proveedor.hasMany(Especialista, { foreignKey: 'proveedor_id', as: 'especialistas' });
Especialista.belongsTo(Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' });

// ===========================================
// RELACIONES ESPECIALISTA - ESPECIALIDAD (MUCHOS A MUCHOS)
// ===========================================
// Relación desde Especialista hacia Especialidad
Especialista.belongsToMany(Especialidad, {
    through: EspecialistaEspecialidad,
    foreignKey: 'especialista_id',
    otherKey: 'especialidad_id',
    as: 'especialidades'
});

// RELACIÓN INVERSA - ¡ESTA FALTABA!
Especialidad.belongsToMany(Especialista, {
    through: EspecialistaEspecialidad,
    foreignKey: 'especialidad_id',
    otherKey: 'especialista_id',
    as: 'especialistas'
});

// Relaciones directas de la tabla intermedia
EspecialistaEspecialidad.belongsTo(Especialista, { foreignKey: 'especialista_id', as: 'especialista' });
EspecialistaEspecialidad.belongsTo(Especialidad, { foreignKey: 'especialidad_id', as: 'especialidad' });

// ===========================================
// RELACIONES PROVEEDOR - PRODUCTOS
// ===========================================
Proveedor.hasMany(ProductoAlquiler, { foreignKey: 'proveedor_id', as: 'productos' });
ProductoAlquiler.belongsTo(Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' });

// ===========================================
// RELACIONES RESERVAS - USUARIO/PROVEEDOR
// ===========================================
Usuario.hasMany(Reserva, { foreignKey: 'cliente_id', as: 'reservas' });
Reserva.belongsTo(Usuario, { foreignKey: 'cliente_id', as: 'cliente' });

Proveedor.hasMany(Reserva, { foreignKey: 'proveedor_id', as: 'reservas' });
Reserva.belongsTo(Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' });

// ===========================================
// RELACIONES RESERVA - DETALLES ESPECÍFICOS
// ===========================================
// Reserva de Cita
Reserva.hasOne(ReservaCita, { foreignKey: 'reserva_id', as: 'reservaCita' });
ReservaCita.belongsTo(Reserva, { foreignKey: 'reserva_id', as: 'reserva' });

// Relaciones adicionales de ReservaCita
ReservaCita.belongsTo(Especialidad, { foreignKey: 'especialidad_id', as: 'especialidad' });
ReservaCita.belongsTo(Especialista, { foreignKey: 'especialista_id', as: 'especialista' });
ReservaCita.belongsTo(EspecialistaEspecialidad, { 
    foreignKey: 'especialista_especialidad_id', 
    as: 'especialistaEspecialidad' 
});

// Reserva de Alquiler
Reserva.hasMany(ReservaAlquiler, { foreignKey: 'reserva_id', as: 'reservaAlquileres' });
ReservaAlquiler.belongsTo(Reserva, { foreignKey: 'reserva_id', as: 'reserva' });

ReservaAlquiler.belongsTo(ProductoAlquiler, { foreignKey: 'producto_id', as: 'producto' });

// ===========================================
// RELACIONES CALIFICACIONES
// ===========================================
Reserva.hasOne(Calificacion, { foreignKey: 'reserva_id', as: 'calificacion' });
Calificacion.belongsTo(Reserva, { foreignKey: 'reserva_id', as: 'reserva' });

Calificacion.belongsTo(Usuario, { foreignKey: 'cliente_id', as: 'cliente' });
Calificacion.belongsTo(Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' });
Calificacion.belongsTo(Especialista, { foreignKey: 'especialista_id', as: 'especialista' });
Calificacion.belongsTo(ProductoAlquiler, { foreignKey: 'producto_id', as: 'producto' });

// ===========================================
// RELACIONES HISTORIAL CLIENTE
// ===========================================
HistorialCliente.belongsTo(Usuario, { foreignKey: 'cliente_id', as: 'cliente' });
HistorialCliente.belongsTo(Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' });
HistorialCliente.belongsTo(Especialista, { foreignKey: 'especialista_id', as: 'especialista' });
HistorialCliente.belongsTo(Reserva, { foreignKey: 'reserva_id', as: 'reserva' });
// Relaciones de Horarios
HorarioEspecialista.belongsTo(Especialista, { foreignKey: 'especialista_id', as: 'especialista' });
HorarioEspecialista.belongsTo(Especialidad, { foreignKey: 'especialidad_id', as: 'especialidad' });

Especialista.hasMany(HorarioEspecialista, { foreignKey: 'especialista_id', as: 'horarios' });

// Relaciones de Disponibilidad
Disponibilidad.belongsTo(Especialista, { foreignKey: 'especialista_id', as: 'especialista' });
Disponibilidad.belongsTo(ProductoAlquiler, { foreignKey: 'producto_id', as: 'producto' });
Disponibilidad.belongsTo(Reserva, { foreignKey: 'reserva_id', as: 'reserva' });

Especialista.hasMany(Disponibilidad, { foreignKey: 'especialista_id', as: 'disponibilidad' });
ProductoAlquiler.hasMany(Disponibilidad, { foreignKey: 'producto_id', as: 'disponibilidad' });
Reserva.hasOne(Disponibilidad, { foreignKey: 'reserva_id', as: 'disponibilidad' });
// ===========================================
// EXPORTAR MODELOS
// ===========================================

module.exports = {
    Usuario,
    Proveedor,
    Especialidad,
    Especialista,
    EspecialistaEspecialidad,
    ProductoAlquiler,
    Reserva,
    ReservaCita,
    ReservaAlquiler,
    HistorialCliente,
    Calificacion,
    HorarioEspecialista,
    Disponibilidad,
    sequelize
};
