const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Especialista = sequelize.define('Especialista', {
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
    foto: {
        type: DataTypes.STRING(500)
    },
    descripcion: {
        type: DataTypes.TEXT
    },
    email: {
        type: DataTypes.STRING(255)
    },
    telefono: {
        type: DataTypes.STRING(20)
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'especialistas',
    timestamps: true,
    createdAt: 'fecha_registro',
    updatedAt: false
});

module.exports = Especialista;