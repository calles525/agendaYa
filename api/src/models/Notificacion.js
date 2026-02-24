// src/models/Notificacion.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notificacion = sequelize.define('Notificacion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },
    tipo: {
        type: DataTypes.ENUM('email', 'telegram', 'web'),
        allowNull: false
    },
    titulo: {
        type: DataTypes.STRING(200)
    },
    mensaje: {
        type: DataTypes.TEXT
    },
    leida: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    fecha_lectura: {
        type: DataTypes.DATE
    },
    metadata: {
        type: DataTypes.JSON
    }
}, {
    tableName: 'notificaciones',
    timestamps: true,
    createdAt: 'fecha_envio',
    updatedAt: false
});

module.exports = Notificacion;