// src/models/HistorialCliente.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HistorialCliente = sequelize.define('HistorialCliente', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
    reserva_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'reservas',
            key: 'id'
        }
    },
    notas: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    archivos_adjuntos: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    visible_cliente: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'historial_cliente',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: false
});

module.exports = HistorialCliente;