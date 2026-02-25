export const ROLES = {
  ADMIN: 'admin',
  CLIENTE: 'cliente',
  PROVEEDOR: 'proveedor'
};

export const TIPOS_PROVEEDOR = {
  NEGOCIO: 'negocio',
  INDIVIDUAL: 'individual'
};

export const ESTADOS_RESERVA = {
  PENDIENTE: 'pendiente',
  CONFIRMADA: 'confirmada',
  COMPLETADA: 'completada',
  CANCELADA: 'cancelada',
  RECHAZADA: 'rechazada'
};

export const TIPOS_RESERVA = {
  CITA: 'cita',
  ALQUILER: 'alquiler'
};

export const DIAS_SEMANA = {
  0: 'domingo',
  1: 'lunes',
  2: 'martes',
  3: 'miércoles',
  4: 'jueves',
  5: 'viernes',
  6: 'sábado'
};

export const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

export const COLORES_ESTADO = {
  [ESTADOS_RESERVA.PENDIENTE]: 'bg-yellow-100 text-yellow-800',
  [ESTADOS_RESERVA.CONFIRMADA]: 'bg-blue-100 text-blue-800',
  [ESTADOS_RESERVA.COMPLETADA]: 'bg-green-100 text-green-800',
  [ESTADOS_RESERVA.CANCELADA]: 'bg-red-100 text-red-800',
  [ESTADOS_RESERVA.RECHAZADA]: 'bg-gray-100 text-gray-800'
};

export const LIMITES = {
  MAX_ARCHIVO: 5 * 1024 * 1024, // 5MB
  MAX_FOTOS_PRODUCTO: 10,
  MIN_DURACION_ALQUILER: 1,
  MAX_DIAS_ANTICIPACION: 90,
  MIN_HORAS_ANTICIPACION: 24
};

export const CONFIG_DEFAULT = {
  idioma: 'es',
  moneda: 'MXN',
  zona_horaria: 'America/Mexico_City'
};