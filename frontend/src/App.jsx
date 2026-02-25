import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'

// Layout
import Layout from './components/layout/Layout'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'

// Dashboard Pages
import DashboardProveedor from './pages/proveedor/DashboardProveedor'
import GestionEspecialidadesPage from './pages/proveedor/GestionEspecialidadesPage'
import GestionEspecialistasPage from './pages/proveedor/GestionEspecialistasPage'

// Componente para rutas protegidas
const ProtectedRoute = ({ children, rol }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (rol && user.rol !== rol) {
    return <Navigate to="/" />
  }

  return children
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rutas protegidas - Proveedor */}
            <Route
              path="/proveedor/dashboard"
              element={
                <ProtectedRoute rol="proveedor">
                  <DashboardProveedor />
                </ProtectedRoute>
              }
            />

            <Route
              path="/proveedor/especialidades"
              element={
                <ProtectedRoute rol="proveedor">
                  <GestionEspecialidadesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/proveedor/especialistas"
              element={
                <ProtectedRoute rol="proveedor">
                  <GestionEspecialistasPage />
                </ProtectedRoute>
              }
            />



            {/* Ruta por defecto */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  )
}

export default App