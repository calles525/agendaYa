// src/models/Favorito.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Favorito = sequelize.define('Favorito', {
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
    }
}, {
    tableName: 'favoritos',
    timestamps: true,
    createdAt: 'fecha_agregado',
    updatedAt: false,
    indexes: [
        {
            unique: true,
            fields: ['cliente_id', 'proveedor_id', 'especialista_id', 'producto_id']
        }
    ]
});

module.exports = Favorito;