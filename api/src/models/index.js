// src/models/index.js
const Usuario = require('./Usuario');
const Proveedor = require('./Proveedor');
const Especialidad = require('./Especialidad');
const Especialista = require('./Especialista');
const EspecialistaEspecialidad = require('./EspecialistaEspecialidad');
const ProductoAlquiler = require('./ProductoAlquiler');
const Reserva = require('./Reserva');
const HistorialCliente = require('./HistorialCliente');
const Calificacion = require('./Calificacion');
const { sequelize } = require('../config/database');

// Definir relaciones

// Usuario - Proveedor (1:1)
Usuario.hasOne(Proveedor, { foreignKey: 'usuario_id', as: 'proveedor' });
Proveedor.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// Proveedor - Especialidades (1:N)
Proveedor.hasMany(Especialidad, { foreignKey: 'proveedor_id', as: 'especialidades' });
Especialidad.belongsTo(Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' });

// Proveedor - Especialistas (1:N)
Proveedor.hasMany(Especialista, { foreignKey: 'proveedor_id', as: 'especialistas' });
Especialista.belongsTo(Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' });

// Especialista - Especialidad (N:M via EspecialistaEspecialidad)
Especialista.belongsToMany(Especialidad, {
    through: EspecialistaEspecialidad,
    foreignKey: 'especialista_id',
    otherKey: 'especialidad_id',
    as: 'especialidades'
});
Especialidad.belongsToMany(Especialista, {
    through: EspecialistaEspecialidad,
    foreignKey: 'especialidad_id',
    otherKey: 'especialista_id',
    as: 'especialistas'
});

// EspecialistaEspecialidad - relaciones directas
EspecialistaEspecialidad.belongsTo(Especialista, { foreignKey: 'especialista_id', as: 'especialista' });
EspecialistaEspecialidad.belongsTo(Especialidad, { foreignKey: 'especialidad_id', as: 'especialidad' });

// Proveedor - Productos (1:N)
Proveedor.hasMany(ProductoAlquiler, { foreignKey: 'proveedor_id', as: 'productos' });
ProductoAlquiler.belongsTo(Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' });

// Usuario - Reservas (1:N como cliente)
Usuario.hasMany(Reserva, { foreignKey: 'cliente_id', as: 'reservas_cliente' });
Reserva.belongsTo(Usuario, { foreignKey: 'cliente_id', as: 'cliente' });

// Proveedor - Reservas (1:N)
Proveedor.hasMany(Reserva, { foreignKey: 'proveedor_id', as: 'reservas' });
Reserva.belongsTo(Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' });

// Reserva - Calificacion (1:1)
Reserva.hasOne(Calificacion, { foreignKey: 'reserva_id', as: 'calificacion' });
Calificacion.belongsTo(Reserva, { foreignKey: 'reserva_id', as: 'reserva' });

// Usuario - Calificaciones (1:N)
Usuario.hasMany(Calificacion, { foreignKey: 'cliente_id', as: 'calificaciones' });
Calificacion.belongsTo(Usuario, { foreignKey: 'cliente_id', as: 'cliente' });

// HistorialCliente - relaciones
HistorialCliente.belongsTo(Usuario, { foreignKey: 'cliente_id', as: 'cliente' });
HistorialCliente.belongsTo(Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' });
HistorialCliente.belongsTo(Especialista, { foreignKey: 'especialista_id', as: 'especialista' });
HistorialCliente.belongsTo(Reserva, { foreignKey: 'reserva_id', as: 'reserva' });

module.exports = {
    Usuario,
    Proveedor,
    Especialidad,
    Especialista,
    EspecialistaEspecialidad,
    ProductoAlquiler,
    Reserva,
    HistorialCliente,
    Calificacion,
    sequelize
};