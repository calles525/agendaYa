// src/models/PlantillaHorario.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PlantillaHorario = sequelize.define('PlantillaHorario', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    proveedor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'proveedores',
            key: 'id'
        }
    },
    nombre: {
        type: DataTypes.STRING(100)
    },
    tipo: {
        type: DataTypes.ENUM('especialista', 'producto'),
        allowNull: false
    },
    horario_json: {
        type: DataTypes.JSON,
        allowNull: false
    }
}, {
    tableName: 'plantillas_horario',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: false
});

module.exports = PlantillaHorario;