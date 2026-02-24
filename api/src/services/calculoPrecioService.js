// src/services/calculoPrecioService.js
const { ProductoAlquiler } = require('../models');

class CalculoPrecioService {
    
    /**
     * Calcula precio para alquiler de productos
     */
    async calcularPrecioAlquiler(productos, horas, ubicacionCliente, proveedorId) {
        try {
            let subtotal = 0;
            const detalles = [];

            for (const item of productos) {
                const producto = await ProductoAlquiler.findByPk(item.producto_id);
                
                if (!producto || !producto.activo) {
                    throw new Error(`Producto ${item.producto_id} no válido`);
                }

                const subtotalItem = producto.precio_hora * horas * item.cantidad;
                subtotal += subtotalItem;

                detalles.push({
                    producto_id: producto.id,
                    nombre: producto.nombre,
                    cantidad: item.cantidad,
                    precio_hora: producto.precio_hora,
                    horas,
                    subtotal: subtotalItem
                });
            }

            // Calcular delivery
            const costoDelivery = await this.calcularDelivery(ubicacionCliente, proveedorId);

            // Aplicar descuentos si existen
            const descuento = await this.calcularDescuentos(proveedorId, subtotal);

            const total = subtotal + costoDelivery - descuento;

            return {
                subtotal,
                costo_delivery: costoDelivery,
                descuento,
                total,
                detalles
            };
        } catch (error) {
            console.error('Error calculando precio:', error);
            throw error;
        }
    }

    /**
     * Calcula costo de delivery basado en distancia
     */
    async calcularDelivery(ubicacionCliente, proveedorId) {
        // Aquí iría integración con Google Maps o similar
        // Por ahora, cálculo simulado
        const distancia = Math.random() * 20; // 0-20 km
        const tarifaBase = 50;
        const tarifaPorKm = 10;

        return tarifaBase + (distancia * tarifaPorKm);
    }

    /**
     * Calcula descuentos aplicables
     */
    async calcularDescuentos(proveedorId, subtotal) {
        // Aquí iría lógica de descuentos
        // Por ahora, 0
        return 0;
    }

    /**
     * Calcula precio para cita
     */
    calcularPrecioCita(precioBase, duracion, extras = {}) {
        let total = precioBase * (duracion / 60); // duración en minutos

        if (extras.consulta_domicilio) {
            total += 200; // recargo por domicilio
        }

        if (extras.urgente) {
            total *= 1.5; // 50% más por urgencia
        }

        return total;
    }

    /**
     * Formatea precio a moneda local
     */
    formatearPrecio(precio, moneda = 'MXN') {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: moneda
        }).format(precio);
    }
}

module.exports = new CalculoPrecioService();