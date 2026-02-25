const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Disponibilidad = sequelize.define('Disponibilidad', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    especialista_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'especialistas',
            key: 'id'
        }
    },
    producto_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
    disponible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    reserva_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'reservas',
            key: 'id'
        }
    }
}, {
    tableName: 'disponibilidad',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: false
});

module.exports = Disponibilidad;

