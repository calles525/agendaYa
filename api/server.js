// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');

// Configuración de variables de entorno
dotenv.config();

// Importar configuración de base de datos
const { sequelize, testConnection } = require('./src/config/database');

// Importar rutas
const apiRoutes = require('./src/routes');

// Inicializar app
const app = express();

// Middlewares
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas API
app.use('/api', apiRoutes);

// Ruta de prueba
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor funcionando correctamente',
        timestamp: new Date(),
        environment: process.env.NODE_ENV
    });
});

// Manejo de errores 404
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Ruta no encontrada',
        message: `No se encontró la ruta ${req.originalUrl}`
    });
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    const status = err.status || 500;
    const message = err.message || 'Error interno del servidor';
    
    res.status(status).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Puerto
const PORT = process.env.PORT || 5000;

// Iniciar servidor
const startServer = async () => {
    try {
        // Probar conexión a base de datos
        await testConnection();
        
        // Sincronizar modelos (solo en desarrollo)
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            console.log('✅ Modelos sincronizados');
        }
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
            console.log(`📝 Entorno: ${process.env.NODE_ENV}`);
            console.log(`🔌 API disponible en http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar servidor:', error);
        process.exit(1);
    }
};

startServer();