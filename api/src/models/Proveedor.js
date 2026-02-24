// src/models/Proveedor.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Proveedor = sequelize.define('Proveedor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },
    nombre_negocio: {
        type: DataTypes.STRING(200)
    },
    descripcion: {
        type: DataTypes.TEXT
    },
    direccion: {
        type: DataTypes.TEXT
    },
    ciudad: {
        type: DataTypes.STRING(100)
    },
    pais: {
        type: DataTypes.STRING(50),
        defaultValue: 'México'
    },
    codigo_postal: {
        type: DataTypes.STRING(10)
    },
    sitio_web: {
        type: DataTypes.STRING(255)
    },
    telefono_contacto: {
        type: DataTypes.STRING(20)
    },
    horario_atencion: {
        type: DataTypes.JSON,
        defaultValue: {
            lunes: { activo: true, hora_inicio: "09:00", hora_fin: "18:00" },
            martes: { activo: true, hora_inicio: "09:00", hora_fin: "18:00" },
            miercoles: { activo: true, hora_inicio: "09:00", hora_fin: "18:00" },
            jueves: { activo: true, hora_inicio: "09:00", hora_fin: "18:00" },
            viernes: { activo: true, hora_inicio: "09:00", hora_fin: "18:00" },
            sabado: { activo: false, hora_inicio: "09:00", hora_fin: "14:00" },
            domingo: { activo: false, hora_inicio: "09:00", hora_fin: "14:00" }
        }
    },
    configuracion: {
        type: DataTypes.JSON,
        defaultValue: {
            notificaciones: {
                email: true,
                telegram: true
            },
            politicas: {
                cancelacion: "24 horas antes sin cargo",
                deposito: false
            }
        }
    },
    telegram_chat_id: {
        type: DataTypes.STRING(100)
    },
    notificaciones_telegram: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    comision_plataforma: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 10.00
    },
    fecha_aprobacion: {
        type: DataTypes.DATE
    },
    aprobado_por: {
        type: DataTypes.INTEGER,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    }
}, {
    tableName: 'proveedores',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
});

module.exports = Proveedor;