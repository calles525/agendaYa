const express = require('express');
const router = express.Router();
const proveedorController = require('../../controllers/proveedorController');
const reservaController = require('../../controllers/reservaController');
const { authorize } = require('../../middleware/auth');
const upload = require('../../middleware/upload'); // IMPORTAR UPLOAD

// Middleware específico para proveedores
router.use(authorize('proveedor', 'admin'));

// Perfil y dashboard
router.get('/perfil', proveedorController.getPerfil);
router.put('/perfil', proveedorController.updatePerfil);
router.get('/dashboard', proveedorController.getDashboard);

// CRUD Especialidades
router.get('/especialidades', proveedorController.getEspecialidades);
router.post('/especialidades', proveedorController.createEspecialidad);
router.put('/especialidades/:id', proveedorController.updateEspecialidad);
router.delete('/especialidades/:id', proveedorController.deleteEspecialidad);

// CRUD Especialistas - CON UPLOAD
router.get('/especialistas', proveedorController.getEspecialistas);
router.post('/especialistas', upload.single('foto'), proveedorController.createEspecialista);
router.put('/especialistas/:id', upload.single('foto'), proveedorController.updateEspecialista);
router.delete('/especialistas/:id', proveedorController.deleteEspecialista);

// Configurar horarios de especialistas
router.post('/especialistas/:especialista_id/especialidades/:especialidad_id/horario', 
    proveedorController.configurarHorarioEspecialista
);

// CRUD Productos - FALTABAN ESTAS RUTAS
router.get('/productos', proveedorController.getProductos); // ← ESTA FALTABA
router.post('/productos', upload.array('fotos', 5), proveedorController.createProducto);
router.put('/productos/:id', upload.array('fotos', 5), proveedorController.updateProducto);
router.delete('/productos/:id', proveedorController.deleteProducto);

// Gestión de reservas
router.get('/reservas/pendientes', reservaController.getReservasPendientes);
router.put('/reservas/:id/confirmar', reservaController.confirmarReserva);
router.put('/reservas/:id/rechazar', reservaController.rechazarReserva);
router.put('/reservas/:id/completar', reservaController.completarReserva);

// Historial de clientes
router.post('/historial/notas', reservaController.agregarNotasHistorial);
router.get('/historial/cliente/:cliente_id', reservaController.getHistorialCliente);

// Reportes
router.get('/reportes', proveedorController.getReportes);

module.exports = router;