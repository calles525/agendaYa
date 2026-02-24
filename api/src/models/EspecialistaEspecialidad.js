// src/models/EspecialistaEspecialidad.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EspecialistaEspecialidad = sequelize.define('EspecialistaEspecialidad', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    especialista_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'especialistas',
            key: 'id'
        }
    },
    especialidad_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'especialidades',
            key: 'id'
        }
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    duracion_minutos: {
        type: DataTypes.INTEGER,
        defaultValue: 60
    },
    horario_json: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {
            lunes: { activo: true, hora_inicio: "09:00", hora_fin: "18:00" },
            martes: { activo: true, hora_inicio: "09:00", hora_fin: "18:00" },
            miercoles: { activo: true, hora_inicio: "09:00", hora_fin: "18:00" },
            jueves: { activo: true, hora_inicio: "09:00", hora_fin: "18:00" },
            viernes: { activo: true, hora_inicio: "09:00", hora_fin: "18:00" },
            sabado: { activo: false, hora_inicio: "09:00", hora_fin: "14:00" },
            domingo: { activo: false, hora_inicio: "09:00", hora_fin: "14:00" }
        }
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'especialista_especialidad',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    indexes: [
        {
            unique: true,
            fields: ['especialista_id', 'especialidad_id']
        }
    ]
});

module.exports = EspecialistaEspecialidad;