-- Script completo para crear todas las tablas
-- Ejecutar en orden

-- 1. Crear base de datos
CREATE DATABASE IF NOT EXISTS booking_saas 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE booking_saas;

-- 2. Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100),
    telefono VARCHAR(20),
    ubicacion TEXT,
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    rol ENUM('admin', 'cliente', 'proveedor') DEFAULT 'cliente',
    tipo_proveedor ENUM('negocio', 'individual') NULL,
    foto_perfil VARCHAR(500),
    verificado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_rol (rol)
);

-- 3. Tabla de proveedores
CREATE TABLE IF NOT EXISTS proveedores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT UNIQUE NOT NULL,
    nombre_negocio VARCHAR(200),
    descripcion TEXT,
    direccion TEXT,
    ciudad VARCHAR(100),
    pais VARCHAR(50) DEFAULT 'México',
    codigo_postal VARCHAR(10),
    sitio_web VARCHAR(255),
    telefono_contacto VARCHAR(20),
    horario_atencion JSON,
    configuracion JSON,
    telegram_chat_id VARCHAR(100),
    notificaciones_telegram BOOLEAN DEFAULT TRUE,
    comision_plataforma DECIMAL(5,2) DEFAULT 10.00,
    fecha_aprobacion TIMESTAMP NULL,
    aprobado_por INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (aprobado_por) REFERENCES usuarios(id),
    INDEX idx_ciudad (ciudad)
);

-- 4. Tabla de especialidades
CREATE TABLE IF NOT EXISTS especialidades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    proveedor_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE CASCADE,
    INDEX idx_proveedor (proveedor_id)
);

-- 5. Tabla de especialistas
CREATE TABLE IF NOT EXISTS especialistas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    proveedor_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    foto VARCHAR(500),
    descripcion TEXT,
    email VARCHAR(255),
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE CASCADE,
    INDEX idx_proveedor (proveedor_id)
);

-- 6. Tabla de relación especialista-especialidad
CREATE TABLE IF NOT EXISTS especialista_especialidad (
    id INT PRIMARY KEY AUTO_INCREMENT,
    especialista_id INT NOT NULL,
    especialidad_id INT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    duracion_minutos INT DEFAULT 60,
    horario_json JSON NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (especialista_id) REFERENCES especialistas(id) ON DELETE CASCADE,
    FOREIGN KEY (especialidad_id) REFERENCES especialidades(id) ON DELETE CASCADE,
    UNIQUE KEY unique_especialista_especialidad (especialista_id, especialidad_id),
    INDEX idx_busqueda (especialista_id, especialidad_id)
);

-- 7. Tabla de categorías de alquiler
CREATE TABLE IF NOT EXISTS categorias_alquiler (
    id INT PRIMARY KEY AUTO_INCREMENT,
    proveedor_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    imagen VARCHAR(500),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE CASCADE,
    INDEX idx_proveedor (proveedor_id)
);

-- 8. Tabla de productos de alquiler
CREATE TABLE IF NOT EXISTS productos_alquiler (
    id INT PRIMARY KEY AUTO_INCREMENT,
    categoria_id INT NOT NULL,
    proveedor_id INT NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    foto_principal VARCHAR(500),
    fotos_adicionales JSON,
    precio_hora DECIMAL(10,2) NOT NULL,
    duracion_minima INT DEFAULT 1,
    cantidad_disponible INT DEFAULT 1,
    dimensiones VARCHAR(100),
    peso DECIMAL(10,2),
    condiciones_uso TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias_alquiler(id) ON DELETE CASCADE,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE CASCADE,
    INDEX idx_busqueda (proveedor_id, activo),
    FULLTEXT INDEX idx_busqueda_texto (nombre, descripcion)
);

-- 9. Tabla de disponibilidad de productos
CREATE TABLE IF NOT EXISTS disponibilidad_productos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    cantidad_disponible INT DEFAULT 1,
    cantidad_reservada INT DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos_alquiler(id) ON DELETE CASCADE,
    UNIQUE KEY unique_disponibilidad (producto_id, fecha, hora_inicio),
    INDEX idx_fecha (fecha, producto_id)
);

-- 10. Tabla de reservas
CREATE TABLE IF NOT EXISTS reservas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo_reserva VARCHAR(20) UNIQUE NOT NULL,
    cliente_id INT NOT NULL,
    proveedor_id INT NOT NULL,
    tipo ENUM('cita', 'alquiler') NOT NULL,
    estado ENUM('pendiente', 'confirmada', 'completada', 'cancelada', 'rechazada') DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_reserva DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    duracion_horas DECIMAL(5,2),
    subtotal DECIMAL(10,2) NOT NULL,
    costo_delivery DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    notas_cliente TEXT,
    notas_proveedor TEXT,
    direccion_entrega TEXT,
    latitud_entrega DECIMAL(10, 8),
    longitud_entrega DECIMAL(11, 8),
    fecha_confirmacion TIMESTAMP NULL,
    fecha_completado TIMESTAMP NULL,
    motivo_cancelacion TEXT,
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
    INDEX idx_cliente (cliente_id),
    INDEX idx_proveedor (proveedor_id),
    INDEX idx_fecha (fecha_reserva),
    INDEX idx_estado (estado),
    INDEX idx_codigo (codigo_reserva)
);

-- 11. Tabla de reservas de citas
CREATE TABLE IF NOT EXISTS reserva_citas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reserva_id INT UNIQUE NOT NULL,
    especialidad_id INT NOT NULL,
    especialista_id INT NOT NULL,
    especialista_especialidad_id INT NOT NULL,
    FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE CASCADE,
    FOREIGN KEY (especialidad_id) REFERENCES especialidades(id),
    FOREIGN KEY (especialista_id) REFERENCES especialistas(id),
    FOREIGN KEY (especialista_especialidad_id) REFERENCES especialista_especialidad(id),
    INDEX idx_reserva (reserva_id)
);

-- 12. Tabla de reservas de alquiler
CREATE TABLE IF NOT EXISTS reserva_alquileres (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reserva_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos_alquiler(id),
    INDEX idx_reserva (reserva_id),
    INDEX idx_producto (producto_id)
);

-- 13. Tabla de historial del cliente
CREATE TABLE IF NOT EXISTS historial_cliente (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    proveedor_id INT NOT NULL,
    especialista_id INT,
    reserva_id INT NOT NULL,
    notas TEXT NOT NULL,
    archivos_adjuntos JSON,
    visible_cliente BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
    FOREIGN KEY (especialista_id) REFERENCES especialistas(id),
    FOREIGN KEY (reserva_id) REFERENCES reservas(id),
    INDEX idx_cliente (cliente_id),
    INDEX idx_proveedor (proveedor_id)
);

-- 14. Tabla de calificaciones
CREATE TABLE IF NOT EXISTS calificaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reserva_id INT UNIQUE NOT NULL,
    cliente_id INT NOT NULL,
    proveedor_id INT NOT NULL,
    especialista_id INT NULL,
    producto_id INT NULL,
    puntuacion INT NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 5),
    comentario TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reserva_id) REFERENCES reservas(id),
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
    FOREIGN KEY (especialista_id) REFERENCES especialistas(id),
    FOREIGN KEY (producto_id) REFERENCES productos_alquiler(id),
    INDEX idx_proveedor (proveedor_id)
);

-- 15. Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tipo ENUM('email', 'telegram', 'web') NOT NULL,
    titulo VARCHAR(200),
    mensaje TEXT,
    leida BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura TIMESTAMP NULL,
    metadata JSON,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_usuario (usuario_id, leida),
    INDEX idx_fecha (fecha_envio)
);

-- 16. Tabla de logs de actividad
CREATE TABLE IF NOT EXISTS logs_actividad (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    accion VARCHAR(100),
    entidad_tipo VARCHAR(50),
    entidad_id INT,
    detalles JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_fecha (fecha),
    INDEX idx_usuario (usuario_id),
    INDEX idx_accion (accion)
);

-- 17. Tabla de plantillas de horario
CREATE TABLE IF NOT EXISTS plantillas_horario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    proveedor_id INT NOT NULL,
    nombre VARCHAR(100),
    tipo ENUM('especialista', 'producto') NOT NULL,
    horario_json JSON NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE CASCADE,
    INDEX idx_proveedor (proveedor_id)
);

-- 18. Tabla de favoritos
CREATE TABLE IF NOT EXISTS favoritos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    proveedor_id INT NULL,
    especialista_id INT NULL,
    producto_id INT NULL,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
    FOREIGN KEY (especialista_id) REFERENCES especialistas(id),
    FOREIGN KEY (producto_id) REFERENCES productos_alquiler(id),
    UNIQUE KEY unique_favorito (cliente_id, proveedor_id, especialista_id, producto_id),
    INDEX idx_cliente (cliente_id)
);

-- Insertar datos de prueba (opcional)
INSERT INTO usuarios (email, password_hash, nombre, rol, verificado) VALUES
('admin@booking.com', '$2a$10$XQqkFQs5KxqQqkFQs5KxqO', 'Admin', 'admin', true),
('cliente@test.com', '$2a$10$XQqkFQs5KxqQqkFQs5KxqO', 'Cliente Test', 'cliente', true),
('proveedor@test.com', '$2a$10$XQqkFQs5KxqQqkFQs5KxqO', 'Proveedor Test', 'proveedor', true);