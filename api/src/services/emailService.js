// src/services/emailService.js
const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    /**
     * Envía email de confirmación de reserva
     */
    async enviarConfirmacionReserva(reserva, cliente, proveedor) {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9fafb; }
                    .footer { text-align: center; padding: 20px; color: #6b7280; }
                    .button { 
                        background: #3b82f6; 
                        color: white; 
                        padding: 12px 24px; 
                        text-decoration: none; 
                        border-radius: 5px;
                        display: inline-block;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>¡Reserva Confirmada!</h1>
                    </div>
                    <div class="content">
                        <p>Hola <strong>${cliente.nombre}</strong>,</p>
                        <p>Tu reserva ha sido confirmada exitosamente.</p>
                        
                        <h3>Detalles de la reserva:</h3>
                        <ul>
                            <li><strong>Código:</strong> ${reserva.codigo_reserva}</li>
                            <li><strong>Fecha:</strong> ${reserva.fecha_reserva}</li>
                            <li><strong>Hora:</strong> ${reserva.hora_inicio} - ${reserva.hora_fin}</li>
                            <li><strong>Proveedor:</strong> ${proveedor.nombre_negocio || proveedor.usuario.nombre}</li>
                            <li><strong>Total:</strong> $${reserva.total}</li>
                        </ul>
                        
                        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${process.env.FRONTEND_URL}/reservas/${reserva.id}" class="button">
                                Ver detalles
                            </a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Booking SaaS. Todos los derechos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            await this.transporter.sendMail({
                from: '"Booking SaaS" <noreply@booking.com>',
                to: cliente.email,
                subject: `Reserva confirmada - ${reserva.codigo_reserva}`,
                html
            });
            return true;
        } catch (error) {
            console.error('Error enviando email:', error);
            return false;
        }
    }

    /**
     * Envía email de recordatorio
     */
    async enviarRecordatorio(reserva, cliente) {
        const html = `
            <div style="font-family: Arial, sans-serif;">
                <h2>Recordatorio de reserva</h2>
                <p>Hola ${cliente.nombre},</p>
                <p>Te recordamos que tienes una reserva mañana:</p>
                <p><strong>Fecha:</strong> ${reserva.fecha_reserva}</p>
                <p><strong>Hora:</strong> ${reserva.hora_inicio}</p>
                <p>¡Te esperamos!</p>
            </div>
        `;

        try {
            await this.transporter.sendMail({
                from: '"Booking SaaS" <noreply@booking.com>',
                to: cliente.email,
                subject: 'Recordatorio de reserva',
                html
            });
            return true;
        } catch (error) {
            console.error('Error enviando recordatorio:', error);
            return false;
        }
    }

    /**
     * Envía email de bienvenida
     */
    async enviarBienvenida(usuario) {
        const html = `
            <div style="font-family: Arial, sans-serif;">
                <h2>¡Bienvenido a Booking SaaS!</h2>
                <p>Hola ${usuario.nombre},</p>
                <p>Gracias por registrarte. Ya puedes comenzar a explorar y reservar servicios.</p>
                <a href="${process.env.FRONTEND_URL}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none;">
                    Comenzar
                </a>
            </div>
        `;

        try {
            await this.transporter.sendMail({
                from: '"Booking SaaS" <noreply@booking.com>',
                to: usuario.email,
                subject: '¡Bienvenido a Booking SaaS!',
                html
            });
            return true;
        } catch (error) {
            console.error('Error enviando bienvenida:', error);
            return false;
        }
    }
}

module.exports = new EmailService();