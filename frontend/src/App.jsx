import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'

// Layout
import Layout from './components/layout/Layout'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Layout>
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  )
}

export default App