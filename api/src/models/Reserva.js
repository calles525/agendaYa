// src/models/Reserva.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Reserva = sequelize.define('Reserva', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    codigo_reserva: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false
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
        allowNull: false,
        references: {
            model: 'proveedores',
            key: 'id'
        }
    },
    tipo: {
        type: DataTypes.ENUM('cita', 'alquiler'),
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM('pendiente', 'confirmada', 'completada', 'cancelada', 'rechazada'),
        defaultValue: 'pendiente'
    },
    fecha_reserva: {
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
    duracion_horas: {
        type: DataTypes.DECIMAL(5, 2)
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    costo_delivery: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    notas_cliente: {
        type: DataTypes.TEXT
    },
    notas_proveedor: {
        type: DataTypes.TEXT
    },
    direccion_entrega: {
        type: DataTypes.TEXT
    },
    latitud_entrega: {
        type: DataTypes.DECIMAL(10, 8)
    },
    longitud_entrega: {
        type: DataTypes.DECIMAL(11, 8)
    },
    fecha_confirmacion: {
        type: DataTypes.DATE
    },
    fecha_completado: {
        type: DataTypes.DATE
    },
    motivo_cancelacion: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'reservas',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: false,
    hooks: {
        beforeCreate: async (reserva) => {
            if (!reserva.codigo_reserva) {
                reserva.codigo_reserva = await generarCodigoUnico();
            }
        }
    }
});

// Función para generar código único
async function generarCodigoUnico() {
    const prefix = 'BK';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    const codigo = `${prefix}${timestamp}${random}`;
    
    // Verificar que no exista
    const existente = await Reserva.findOne({ where: { codigo_reserva: codigo } });
    if (existente) {
        return generarCodigoUnico();
    }
    
    return codigo.substring(0, 12);
}

module.exports = Reserva;