import api from './api'

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/registro', userData),
  verify: () => api.get('/auth/verificar'),
  logout: () => {
    localStorage.removeItem('token')
  }
}