// src/models/ReservaCita.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ReservaCita = sequelize.define('ReservaCita', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    reserva_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'reservas',
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
    especialista_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'especialistas',
            key: 'id'
        }
    },
    especialista_especialidad_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'especialista_especialidad',
            key: 'id'
        }
    }
}, {
    tableName: 'reserva_citas',
    timestamps: false
});

module.exports = ReservaCita;