import api from './api'

export const authService = {
  // Login de usuario
  login: (email, password) => api.post('/auth/login', { email, password }),
  
  // Registro de usuario
  register: (userData) => api.post('/auth/registro', userData),
  
  // Verificar token
  verify: () => api.get('/auth/verificar'),
  
  // Cerrar sesión
  logout: () => {
    localStorage.removeItem('token')
  },
  
  // Cambiar contraseña
  changePassword: (currentPassword, newPassword) => 
    api.post('/auth/cambiar-password', { currentPassword, newPassword }),
  
  // Recuperar contraseña
  recoverPassword: (email) => 
    api.post('/auth/recuperar-password', { email })
}