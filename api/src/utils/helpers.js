// src/utils/helpers.js
const moment = require('moment');
const crypto = require('crypto');

const helpers = {
    /**
     * Genera un código único para reservas
     */
    generarCodigoReserva() {
        const prefix = 'BK';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = crypto.randomBytes(3).toString('hex').toUpperCase();
        const codigo = `${prefix}${timestamp}${random}`;
        return codigo.substring(0, 12);
    },

    /**
     * Formatea fecha a string
     */
    formatearFecha(fecha, formato = 'YYYY-MM-DD') {
        return moment(fecha).format(formato);
    },

    /**
     * Formatea hora a string
     */
    formatearHora(hora, formato = 'HH:mm') {
        return moment(hora, 'HH:mm').format(formato);
    },

    /**
     * Calcula edad a partir de fecha de nacimiento
     */
    calcularEdad(fechaNacimiento) {
        return moment().diff(moment(fechaNacimiento), 'years');
    },

    /**
     * Valida email
     */
    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    /**
     * Valida teléfono mexicano
     */
    validarTelefono(telefono) {
        const regex = /^[0-9+\-\s]{10,15}$/;
        return regex.test(telefono);
    },

    /**
     * Sanitiza string (elimina espacios extras, tags html, etc)
     */
    sanitizarString(str) {
        if (!str) return '';
        return str
            .trim()
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ');
    },

    /**
     * Trunca texto a longitud específica
     */
    truncarTexto(texto, longitud = 100, sufijo = '...') {
        if (!texto || texto.length <= longitud) return texto;
        return texto.substring(0, longitud) + sufijo;
    },

    /**
     * Formatea precio a moneda local
     */
    formatearPrecio(precio, moneda = 'MXN') {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: moneda,
            minimumFractionDigits: 2
        }).format(precio);
    },

    /**
     * Calcula distancia entre dos puntos (fórmula de Haversine)
     */
    calcularDistancia(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radio de la Tierra en km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        const distancia = R * c;
        return Math.round(distancia * 10) / 10;
    },

    deg2rad(deg) {
        return deg * (Math.PI/180);
    },

    /**
     * Genera contraseña aleatoria
     */
    generarPassword(longitud = 10) {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let password = "";
        for (let i = 0; i < longitud; i++) {
            const randomIndex = crypto.randomInt(0, charset.length);
            password += charset[randomIndex];
        }
        return password;
    },

    /**
     * Agrupa array por propiedad
     */
    groupBy(array, propiedad) {
        return array.reduce((result, item) => {
            const key = item[propiedad];
            if (!result[key]) {
                result[key] = [];
            }
            result[key].push(item);
            return result;
        }, {});
    },

    /**
     * Ordena array por propiedad
     */
    sortBy(array, propiedad, orden = 'asc') {
        return [...array].sort((a, b) => {
            if (a[propiedad] < b[propiedad]) return orden === 'asc' ? -1 : 1;
            if (a[propiedad] > b[propiedad]) return orden === 'asc' ? 1 : -1;
            return 0;
        });
    },

    /**
     * Filtra objetos por texto en múltiples propiedades
     */
    filtrarPorTexto(array, texto, propiedades) {
        const textoLower = texto.toLowerCase();
        return array.filter(item => {
            return propiedades.some(prop => 
                item[prop] && item[prop].toLowerCase().includes(textoLower)
            );
        });
    },

    /**
     * Convierte objeto a query string
     */
    toQueryString(obj) {
        return Object.keys(obj)
            .filter(key => obj[key] !== undefined && obj[key] !== null)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
            .join('&');
    },

    /**
     * Extrae parámetros de query string
     */
    parseQueryString(queryString) {
        const params = new URLSearchParams(queryString);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },

    /**
     * Genera slug a partir de texto
     */
    generarSlug(texto) {
        return texto
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .trim();
    },

    /**
     * Verifica si un objeto está vacío
     */
    isEmpty(obj) {
        return Object.keys(obj).length === 0;
    },

    /**
     * Obtener diferencia en días entre dos fechas
     */
    diasEntreFechas(fecha1, fecha2) {
        const f1 = moment(fecha1);
        const f2 = moment(fecha2);
        return Math.abs(f1.diff(f2, 'days'));
    },

    /**
     * Suma horas a una hora dada
     */
    sumarHoras(hora, horas) {
        return moment(hora, 'HH:mm').add(horas, 'hours').format('HH:mm');
    },

    /**
     * Convierte minutos a formato horas:minutos
     */
    minutosAHora(minutos) {
        const h = Math.floor(minutos / 60);
        const m = minutos % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    },

    /**
     * Convierte hora a minutos
     */
    horaAMinutos(hora) {
        const [h, m] = hora.split(':').map(Number);
        return h * 60 + m;
    },

    /**
     * Obtener nombre del día de la semana
     */
    getDiaSemana(fecha) {
        const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const fechaObj = new Date(fecha);
        return dias[fechaObj.getDay()];
    },

    /**
     * Verifica si un horario está dentro de otro
     */
    horarioEnRango(horaInicio, horaFin, rangoInicio, rangoFin) {
        const hi = this.horaAMinutos(horaInicio);
        const hf = this.horaAMinutos(horaFin);
        const ri = this.horaAMinutos(rangoInicio);
        const rf = this.horaAMinutos(rangoFin);
        
        return hi >= ri && hf <= rf;
    },

    /**
     * Genera array de horas entre dos tiempos
     */
    generarRangoHoras(horaInicio, horaFin, intervaloMinutos = 60) {
        const horas = [];
        let inicio = this.horaAMinutos(horaInicio);
        const fin = this.horaAMinutos(horaFin);
        
        while (inicio + intervaloMinutos <= fin) {
            horas.push({
                hora_inicio: this.minutosAHora(inicio),
                hora_fin: this.minutosAHora(inicio + intervaloMinutos)
            });
            inicio += intervaloMinutos;
        }
        
        return horas;
    },

    /**
     * Enmascara email para privacidad
     */
    enmascararEmail(email) {
        const [nombre, dominio] = email.split('@');
        const nombreEnmascarado = nombre.substring(0, 3) + '***' + nombre.substring(nombre.length - 2);
        return `${nombreEnmascarado}@${dominio}`;
    },

    /**
     * Enmascara teléfono para privacidad
     */
    enmascararTelefono(telefono) {
        if (!telefono) return '';
        return telefono.substring(0, 4) + '***' + telefono.substring(telefono.length - 3);
    }
};

module.exports = helpers;