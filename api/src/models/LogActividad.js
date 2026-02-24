// src/models/LogActividad.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LogActividad = sequelize.define('LogActividad', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },
    accion: {
        type: DataTypes.STRING(100)
    },
    entidad_tipo: {
        type: DataTypes.STRING(50)
    },
    entidad_id: {
        type: DataTypes.INTEGER
    },
    detalles: {
        type: DataTypes.JSON
    },
    ip_address: {
        type: DataTypes.STRING(45)
    },
    user_agent: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'logs_actividad',
    timestamps: true,
    createdAt: 'fecha',
    updatedAt: false
});

module.exports = LogActividad;