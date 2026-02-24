// src/models/ProductoAlquiler.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductoAlquiler = sequelize.define('ProductoAlquiler', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    categoria_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'categorias_alquiler',
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
    nombre: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT
    },
    foto_principal: {
        type: DataTypes.STRING(500)
    },
    fotos_adicionales: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    precio_hora: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    duracion_minima: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    cantidad_disponible: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    dimensiones: {
        type: DataTypes.STRING(100)
    },
    peso: {
        type: DataTypes.DECIMAL(10, 2)
    },
    condiciones_uso: {
        type: DataTypes.TEXT
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'productos_alquiler',
    timestamps: true,
    createdAt: 'fecha_registro',
    updatedAt: 'fecha_actualizacion'
});

module.exports = ProductoAlquiler;