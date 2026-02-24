// src/utils/constants.js

module.exports = {
    // Roles de usuario
    ROLES: {
        ADMIN: 'admin',
        CLIENTE: 'cliente',
        PROVEEDOR: 'proveedor'
    },

    // Tipos de proveedor
    TIPOS_PROVEEDOR: {
        NEGOCIO: 'negocio',
        INDIVIDUAL: 'individual'
    },

    // Estados de reserva
    ESTADOS_RESERVA: {
        PENDIENTE: 'pendiente',
        CONFIRMADA: 'confirmada',
        COMPLETADA: 'completada',
        CANCELADA: 'cancelada',
        RECHAZADA: 'rechazada'
    },

    // Tipos de reserva
    TIPOS_RESERVA: {
        CITA: 'cita',
        ALQUILER: 'alquiler'
    },

    // Días de la semana
    DIAS_SEMANA: {
        0: 'domingo',
        1: 'lunes',
        2: 'martes',
        3: 'miercoles',
        4: 'jueves',
        5: 'viernes',
        6: 'sabado'
    },

    // Días de la semana en orden
    DIAS_SEMANA_ARRAY: [
        'lunes',
        'martes',
        'miercoles',
        'jueves',
        'viernes',
        'sabado',
        'domingo'
    ],

    // Mensajes de error comunes
    ERRORES: {
        NO_AUTORIZADO: 'No autorizado para realizar esta acción',
        NO_AUTENTICADO: 'Por favor, inicie sesión',
        RECURSO_NO_ENCONTRADO: 'Recurso no encontrado',
        VALIDACION: 'Error de validación',
        SERVIDOR: 'Error interno del servidor',
        EMAIL_EXISTE: 'El email ya está registrado',
        CREDENCIALES_INVALIDAS: 'Credenciales inválidas',
        HORARIO_NO_DISPONIBLE: 'El horario seleccionado no está disponible',
        PRODUCTO_NO_DISPONIBLE: 'El producto no está disponible para las fechas seleccionadas'
    },

    // Mensajes de éxito
    EXITOS: {
        REGISTRO: 'Usuario registrado exitosamente',
        LOGIN: 'Login exitoso',
        RESERVA_CREADA: 'Reserva creada exitosamente',
        RESERVA_CONFIRMADA: 'Reserva confirmada',
        RESERVA_CANCELADA: 'Reserva cancelada',
        PERFIL_ACTUALIZADO: 'Perfil actualizado',
        NOTAS_AGREGADAS: 'Notas agregadas al historial'
    },

    // Límites y configuraciones
    LIMITES: {
        MAX_ARCHIVO: 5 * 1024 * 1024, // 5MB
        MAX_FOTOS_PRODUCTO: 10,
        MIN_DURACION_ALQUILER: 1, // hora
        MAX_DIAS_ANTICIPACION: 90, // días
        MIN_HORAS_ANTICIPACION: 24, // horas
        MAX_DISTANCIA_DELIVERY: 50, // km
        TARIFA_BASE_DELIVERY: 50,
        TARIFA_POR_KM: 10
    },

    // Configuración de paginación
    PAGINACION: {
        LIMITE_DEFAULT: 20,
        LIMITE_MAXIMO: 100,
        PAGINA_DEFAULT: 1
    },

    // Horarios por defecto
    HORARIO_DEFAULT: {
        lunes: { activo: true, hora_inicio: "09:00", hora_fin: "18:00" },
        martes: { activo: true, hora_inicio: "09:00", hora_fin: "18:00" },
        miercoles: { activo: true, hora_inicio: "09:00", hora_fin: "18:00" },
        jueves: { activo: true, hora_inicio: "09:00", hora_fin: "18:00" },
        viernes: { activo: true, hora_inicio: "09:00", hora_fin: "18:00" },
        sabado: { activo: false, hora_inicio: "09:00", hora_fin: "14:00" },
        domingo: { activo: false, hora_inicio: "09:00", hora_fin: "14:00" }
    },

    // Configuración de notificaciones
    NOTIFICACIONES: {
        TIPOS: {
            EMAIL: 'email',
            TELEGRAM: 'telegram',
            WEB: 'web'
        },
        EVENTOS: {
            NUEVA_RESERVA: 'nueva_reserva',
            RESERVA_CONFIRMADA: 'reserva_confirmada',
            RESERVA_CANCELADA: 'reserva_cancelada',
            RECORDATORIO: 'recordatorio',
            PAGO_RECIBIDO: 'pago_recibido'
        }
    },

    // Códigos de respuesta HTTP
    HTTP: {
        OK: 200,
        CREADO: 201,
        ACEPTADO: 202,
        SIN_CONTENIDO: 204,
        BAD_REQUEST: 400,
        NO_AUTORIZADO: 401,
        PROHIBIDO: 403,
        NO_ENCONTRADO: 404,
        CONFLICTO: 409,
        ERROR_SERVIDOR: 500
    },

    // Monedas soportadas
    MONEDAS: {
        MXN: { codigo: 'MXN', simbolo: '$', nombre: 'Peso Mexicano' },
        USD: { codigo: 'USD', simbolo: 'US$', nombre: 'Dólar Americano' }
    },

    // Formatos de fecha/hora
    FORMATOS: {
        FECHA: 'YYYY-MM-DD',
        HORA: 'HH:mm',
        FECHA_HORA: 'YYYY-MM-DD HH:mm',
        FECHA_LARGA: 'DD [de] MMMM [de] YYYY',
        HORA_CORTA: 'h:mm a'
    }
};