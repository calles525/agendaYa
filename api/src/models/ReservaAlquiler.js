const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ReservaAlquiler = sequelize.define('ReservaAlquiler', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    reserva_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'reservas',
            key: 'id'
        }
    },
    producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'productos_alquiler',
            key: 'id'
        }
    },
    cantidad: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    precio_unitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    tableName: 'reserva_alquileres',
    timestamps: false
});

module.exports = ReservaAlquiler;