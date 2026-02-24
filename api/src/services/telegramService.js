// src/services/telegramService.js - Versión completa
const TelegramBot = require('node-telegram-bot-api');

class TelegramService {
    constructor() {
        this.token = process.env.TELEGRAM_BOT_TOKEN;
        this.bot = this.token ? new TelegramBot(this.token, { polling: false }) : null;
    }

    async sendMessage(chatId, message, options = {}) {
        if (!this.bot) {
            console.log('⚠️ Telegram bot no configurado');
            return false;
        }

        try {
            await this.bot.sendMessage(chatId, message, { 
                parse_mode: 'HTML',
                ...options 
            });
            return true;
        } catch (error) {
            console.error('Error enviando mensaje Telegram:', error);
            return false;
        }
    }

    /**
     * Envía notificación de nueva reserva
     */
    async notificarNuevaReserva(reserva, cliente, proveedor) {
        const mensaje = this.formatNuevaReserva(reserva, cliente);
        const inlineKeyboard = this.getReservaKeyboard(reserva.id);

        if (proveedor.telegram_chat_id) {
            await this.sendMessage(
                proveedor.telegram_chat_id,
                mensaje,
                { reply_markup: { inline_keyboard: inlineKeyboard } }
            );
        }
    }

    /**
     * Envía notificación de reserva cancelada
     */
    async notificarCancelacion(reserva, cliente, proveedor) {
        const mensaje = this.formatCancelacion(reserva, cliente);
        
        if (proveedor.telegram_chat_id) {
            await this.sendMessage(proveedor.telegram_chat_id, mensaje);
        }
    }

    /**
     * Envía notificación de confirmación al cliente (si tiene Telegram)
     */
    async notificarCliente(cliente, mensaje) {
        if (cliente.telegram_chat_id) {
            await this.sendMessage(cliente.telegram_chat_id, mensaje);
        }
    }

    /**
     * Formatea mensaje de nueva reserva
     */
    formatNuevaReserva(reserva, cliente) {
        const emoji = reserva.tipo === 'cita' ? '📅' : '📦';
        const tipoTexto = reserva.tipo === 'cita' ? 'Cita' : 'Alquiler';
        
        let detallesExtra = '';
        
        if (reserva.tipo === 'cita' && reserva.reservaCita) {
            detallesExtra = `
👨‍⚕️ <b>Especialista:</b> ${reserva.reservaCita.especialista?.nombre || 'N/A'}
🔬 <b>Especialidad:</b> ${reserva.reservaCita.especialidad?.nombre || 'N/A'}`;
        } else if (reserva.tipo === 'alquiler' && reserva.reservaAlquileres) {
            detallesExtra = `
📦 <b>Productos:</b>
${reserva.reservaAlquileres.map(item => `   • ${item.cantidad}x ${item.producto?.nombre}`).join('\n')}`;
        }

        return `
${emoji} <b>🔔 NUEVA ${tipoTexto.toUpperCase()}</b>
${'─'.repeat(30)}

👤 <b>Cliente:</b> ${cliente.nombre} ${cliente.apellidos || ''}
📞 <b>Teléfono:</b> ${cliente.telefono || 'No proporcionado'}
📧 <b>Email:</b> ${cliente.email}

📆 <b>Fecha:</b> ${new Date(reserva.fecha_reserva).toLocaleDateString('es-MX')}
⏰ <b>Hora:</b> ${reserva.hora_inicio} - ${reserva.hora_fin}
⏱️ <b>Duración:</b> ${reserva.duracion_horas} horas
${detallesExtra}
💰 <b>Total:</b> $${parseFloat(reserva.total).toFixed(2)}
🆔 <b>Código:</b> <code>${reserva.codigo_reserva}</code>

${'─'.repeat(30)}
<i>Acciones rápidas abajo ⬇️</i>`;
    }

    /**
     * Formatea mensaje de cancelación
     */
    formatCancelacion(reserva, cliente) {
        return `
❌ <b>RESERVA CANCELADA</b>
${'─'.repeat(30)}

👤 <b>Cliente:</b> ${cliente.nombre}
📆 <b>Fecha:</b> ${new Date(reserva.fecha_reserva).toLocaleDateString('es-MX')}
⏰ <b>Hora:</b> ${reserva.hora_inicio}
🆔 <b>Código:</b> <code>${reserva.codigo_reserva}</code>

<i>La reserva ha sido cancelada por el cliente.</i>`;
    }

    /**
     * Obtiene teclado inline para acciones rápidas
     */
    getReservaKeyboard(reservaId) {
        return [
            [
                { text: '✅ Confirmar', callback_data: `confirmar_${reservaId}` },
                { text: '❌ Rechazar', callback_data: `rechazar_${reservaId}` }
            ],
            [
                { text: '👤 Ver cliente', callback_data: `cliente_${reservaId}` },
                { text: '📅 Ver detalles', callback_data: `detalles_${reservaId}` }
            ]
        ];
    }

    /**
     * Envía notificación de pago recibido
     */
    async notificarPagoRecibido(reserva, cliente, proveedor) {
        const mensaje = `
💰 <b>PAGO RECIBIDO</b>
${'─'.repeat(30)}

✅ <b>Reserva:</b> ${reserva.codigo_reserva}
👤 <b>Cliente:</b> ${cliente.nombre}
💵 <b>Monto:</b> $${parseFloat(reserva.total).toFixed(2)}

<i>El pago ha sido confirmado. La reserva está lista para ser atendida.</i>`;

        if (proveedor.telegram_chat_id) {
            await this.sendMessage(proveedor.telegram_chat_id, mensaje);
        }
    }
}

module.exports = new TelegramService();