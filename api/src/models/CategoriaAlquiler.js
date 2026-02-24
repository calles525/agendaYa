// src/models/CategoriaAlquiler.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CategoriaAlquiler = sequelize.define('CategoriaAlquiler', {
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
        type: DataTypes.STRING(100),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT
    },
    imagen: {
        type: DataTypes.STRING(500)
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'categorias_alquiler',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
});

// Relaciones
CategoriaAlquiler.hasMany(ProductoAlquiler, { foreignKey: 'categoria_id', as: 'productos' });
ProductoAlquiler.belongsTo(CategoriaAlquiler, { foreignKey: 'categoria_id', as: 'categoria' });

module.exports = CategoriaAlquiler;