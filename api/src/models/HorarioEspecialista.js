const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HorarioEspecialista = sequelize.define('HorarioEspecialista', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    especialista_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'especialistas',
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
    dia_semana: {
        type: DataTypes.ENUM('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'),
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
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'horarios_especialista',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
});

module.exports = HorarioEspecialista;

