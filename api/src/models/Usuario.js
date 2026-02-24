// src/models/Usuario.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Usuario = sequelize.define('Usuario', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    apellidos: {
        type: DataTypes.STRING(100)
    },
    telefono: {
        type: DataTypes.STRING(20)
    },
    ubicacion: {
        type: DataTypes.TEXT
    },
    latitud: {
        type: DataTypes.DECIMAL(10, 8)
    },
    longitud: {
        type: DataTypes.DECIMAL(11, 8)
    },
    rol: {
        type: DataTypes.ENUM('admin', 'cliente', 'proveedor'),
        defaultValue: 'cliente'
    },
    tipo_proveedor: {
        type: DataTypes.ENUM('negocio', 'individual'),
        allowNull: true
    },
    foto_perfil: {
        type: DataTypes.STRING(500)
    },
    verificado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    fecha_registro: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    ultimo_acceso: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'usuarios',
    timestamps: false,
    hooks: {
        beforeCreate: async (usuario) => {
            // Aquí podrías agregar lógica antes de crear
        }
    }
});

// Métodos personalizados
Usuario.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password_hash;
    return values;
};

Usuario.prototype.getNombreCompleto = function() {
    return `${this.nombre} ${this.apellidos || ''}`.trim();
};

module.exports = Usuario;