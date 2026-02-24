// src/models/Calificacion.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Calificacion = sequelize.define('Calificacion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    reserva_id: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
        references: {
            model: 'reservas',
            key: 'id'
        }
    },
    cliente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },
    proveedor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'proveedores',
            key: 'id'
        }
    },
    especialista_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'especialistas',
            key: 'id'
        }
    },
    producto_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'productos_alquiler',
            key: 'id'
        }
    },
    puntuacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    comentario: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'calificaciones',
    timestamps: true,
    createdAt: 'fecha',
    updatedAt: false
});

module.exports = Calificacion;