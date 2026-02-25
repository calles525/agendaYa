export const validators = {
  email: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  phone: (phone) => {
    const regex = /^[0-9+\-\s]{10,15}$/;
    return regex.test(phone);
  },

  password: (password) => {
    const errors = [];
    if (password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Debe contener al menos una mayúscula');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Debe contener al menos un número');
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  required: (value, fieldName) => {
    if (!value || value.trim() === '') {
      return `${fieldName} es requerido`;
    }
    return null;
  },

  minLength: (value, min, fieldName) => {
    if (value && value.length < min) {
      return `${fieldName} debe tener al menos ${min} caracteres`;
    }
    return null;
  },

  maxLength: (value, max, fieldName) => {
    if (value && value.length > max) {
      return `${fieldName} no debe exceder ${max} caracteres`;
    }
    return null;
  },

  numeric: (value, fieldName) => {
    if (value && isNaN(value)) {
      return `${fieldName} debe ser un número`;
    }
    return null;
  },

  positive: (value, fieldName) => {
    if (value && parseFloat(value) <= 0) {
      return `${fieldName} debe ser mayor a 0`;
    }
    return null;
  },

  url: (url) => {
    const regex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    return regex.test(url);
  },

  date: (date) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(date);
  },

  time: (time) => {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return regex.test(time);
  }
};