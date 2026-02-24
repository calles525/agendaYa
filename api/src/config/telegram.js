// src/config/telegram.js
const TelegramBot = require('node-telegram-bot-api');

class TelegramService {
    constructor() {
        this.token = process.env.TELEGRAM_BOT_TOKEN;
        this.bot = this.token ? new TelegramBot(this.token, { polling: false }) : null;
    }

    async sendMessage(chatId, message) {
        if (!this.bot) {
            console.log('⚠️ Telegram bot no configurado');
            return false;
        }

        try {
            await this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
            return true;
        } catch (error) {
            console.error('Error enviando mensaje Telegram:', error);
            return false;
        }
    }

    formatReservationMessage(reserva, tipo, cliente) {
        const emoji = tipo === 'cita' ? '📅' : '📦';
        const tipoTexto = tipo === 'cita' ? 'Cita' : 'Alquiler';
        
        return `
${emoji} <b>NUEVA ${tipoTexto.toUpperCase()}</b>

👤 <b>Cliente:</b> ${cliente.nombre}
📞 <b>Teléfono:</b> ${cliente.telefono || 'No proporcionado'}
📧 <b>Email:</b> ${cliente.email}

📆 <b>Fecha:</b> ${reserva.fecha_reserva}
⏰ <b>Hora:</b> ${reserva.hora_inicio} - ${reserva.hora_fin}
💰 <b>Total:</b> $${reserva.total}

🆔 <b>Código:</b> ${reserva.codigo_reserva}

🔗 <b>Ver detalles:</b>
${process.env.FRONTEND_URL}/proveedor/reservas/${reserva.id}
        `;
    }

    formatCancellationMessage(reserva, cliente) {
        return `
❌ <b>RESERVA CANCELADA</b>

👤 <b>Cliente:</b> ${cliente.nombre}
📆 <b>Fecha:</b> ${reserva.fecha_reserva}
⏰ <b>Hora:</b> ${reserva.hora_inicio}
🆔 <b>Código:</b> ${reserva.codigo_reserva}

La reserva ha sido cancelada por el cliente.
        `;
    }
}

module.exports = new TelegramService();