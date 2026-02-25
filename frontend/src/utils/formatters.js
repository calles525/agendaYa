import { format, formatDistance, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatters = {
  formatDate: (date) => {
    if (!date) return '';
    return format(parseISO(date), 'dd/MM/yyyy', { locale: es });
  },

  formatDateTime: (date) => {
    if (!date) return '';
    return format(parseISO(date), "dd/MM/yyyy HH:mm", { locale: es });
  },

  formatTime: (time) => {
    if (!time) return '';
    return time.substring(0, 5);
  },

  formatCurrency: (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(amount);
  },

  formatPhone: (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}`;
    }
    return phone;
  },

  formatDistanceToNow: (date) => {
    if (!date) return '';
    return formatDistance(parseISO(date), new Date(), {
      addSuffix: true,
      locale: es
    });
  },

  formatRelativeTime: (date) => {
    if (!date) return '';
    const diff = new Date() - parseISO(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'ahora mismo';
    if (minutes < 60) return `hace ${minutes} minutos`;
    if (hours < 24) return `hace ${hours} horas`;
    if (days < 7) return `hace ${days} días`;
    return format(parseISO(date), 'dd/MM/yyyy');
  },

  truncate: (text, length = 100) => {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  },

  capitalize: (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  formatAddress: (address) => {
    if (!address) return '';
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.zip) parts.push(`CP ${address.zip}`);
    return parts.join(', ');
  }
};