// src/models/DisponibilidadProducto.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DisponibilidadProducto = sequelize.define('DisponibilidadProducto', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'productos_alquiler',
            key: 'id'
        }
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    hora_inicio: {
        type: DataTypes.TIME,
        allowNull: false
    },
    hora_fin: {
        type: DataTypes.TIME,
        allowNull: false
    },
    cantidad_disponible: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    cantidad_reservada: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'disponibilidad_productos',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: false,
    indexes: [
        {
            unique: true,
            fields: ['producto_id', 'fecha', 'hora_inicio']
        }
    ]
});

module.exports = DisponibilidadProducto;