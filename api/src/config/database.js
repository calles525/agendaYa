// src/config/database.js
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        define: {
            timestamps: true,
            underscored: true,
            createdAt: 'fecha_creacion',
            updatedAt: 'fecha_actualizacion'
        },
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a MySQL establecida correctamente');
    } catch (error) {
        console.error('❌ Error conectando a MySQL:', error);
        throw error;
    }
};

module.exports = {
    sequelize,
    testConnection
};