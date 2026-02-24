// src/controllers/authController.js
const { Usuario, Proveedor } = require('../models');
const { generateToken, hashPassword, comparePassword } = require('../config/auth');
const telegramService = require('../config/telegram');

const authController = {
    // Registro de usuario
    async registro(req, res, next) {
        try {
            const { email, password, nombre, apellidos, telefono, rol, tipo_proveedor } = req.body;

            // Verificar si el usuario ya existe
            const usuarioExistente = await Usuario.findOne({ where: { email } });
            if (usuarioExistente) {
                return res.status(400).json({ error: 'El email ya está registrado' });
            }

            // Hash de contraseña
            const passwordHash = await hashPassword(password);

            // Crear usuario
            const usuario = await Usuario.create({
                email,
                password_hash: passwordHash,
                nombre,
                apellidos,
                telefono,
                rol: rol || 'cliente',
                tipo_proveedor: rol === 'proveedor' ? tipo_proveedor : null,
                verificado: rol === 'admin' ? true : false
            });

            // Si es proveedor, crear registro en tabla proveedores
            if (rol === 'proveedor') {
                await Proveedor.create({
                    usuario_id: usuario.id,
                    nombre_negocio: tipo_proveedor === 'negocio' ? nombre : null,
                    telefono_contacto: telefono
                });
            }

            // Generar token
            const token = generateToken(usuario);

            res.status(201).json({
                message: 'Usuario registrado exitosamente',
                usuario: usuario.toJSON(),
                token
            });

        } catch (error) {
            next(error);
        }
    },

    // Login
    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            // Buscar usuario
            const usuario = await Usuario.findOne({ 
                where: { email, activo: true },
                include: rol === 'proveedor' ? [{
                    model: Proveedor,
                    as: 'proveedor',
                    required: false
                }] : []
            });

            if (!usuario) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            // Verificar contraseña
            const passwordValida = await comparePassword(password, usuario.password_hash);
            if (!passwordValida) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            // Actualizar último acceso
            await usuario.update({ ultimo_acceso: new Date() });

            // Generar token
            const token = generateToken(usuario);

            res.json({
                message: 'Login exitoso',
                usuario: usuario.toJSON(),
                token
            });

        } catch (error) {
            next(error);
        }
    },

    // Verificar token
    async verificarToken(req, res) {
        res.json({
            valido: true,
            usuario: req.usuario
        });
    },

    // Recuperar contraseña
    async recuperarPassword(req, res, next) {
        try {
            const { email } = req.body;

            const usuario = await Usuario.findOne({ where: { email } });
            if (!usuario) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            // Aquí iría la lógica para enviar email de recuperación
            // Por ahora solo simulamos

            res.json({ 
                message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña' 
            });

        } catch (error) {
            next(error);
        }
    },

    // Cambiar contraseña
    async cambiarPassword(req, res, next) {
        try {
            const { password_actual, password_nueva } = req.body;
            const usuario = await Usuario.findByPk(req.usuario.id);

            // Verificar contraseña actual
            const passwordValida = await comparePassword(password_actual, usuario.password_hash);
            if (!passwordValida) {
                return res.status(401).json({ error: 'Contraseña actual incorrecta' });
            }

            // Actualizar contraseña
            const passwordHash = await hashPassword(password_nueva);
            await usuario.update({ password_hash: passwordHash });

            res.json({ message: 'Contraseña actualizada exitosamente' });

        } catch (error) {
            next(error);
        }
    }
};

module.exports = authController;