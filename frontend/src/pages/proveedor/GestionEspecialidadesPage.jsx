import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft } from 'react-icons/fi'
import { proveedorService } from '../../services/proveedorService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import toast from 'react-hot-toast'

const GestionEspecialidadesPage = () => {
  const navigate = useNavigate()
  const [especialidades, setEspecialidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [especialidadToDelete, setEspecialidadToDelete] = useState(null)
  const [editando, setEditando] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    icono: '🔧'
  })

  useEffect(() => {
    cargarEspecialidades()
  }, [])

  const cargarEspecialidades = async () => {
    try {
      setLoading(true)
      const { data } = await proveedorService.getEspecialidades()
      setEspecialidades(data || [])
    } catch (error) {
      console.error('Error cargando especialidades:', error)
      toast.error('Error al cargar especialidades')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    try {
      setLoading(true)
      if (editando) {
        // Actualizar
        await proveedorService.updateEspecialidad(editando.id, formData)
        toast.success('Especialidad actualizada')
      } else {
        // Crear nueva
        await proveedorService.createEspecialidad(formData)
        toast.success('Especialidad creada')
      }
      
      setShowModal(false)
      setEditando(null)
      setFormData({ nombre: '', descripcion: '', icono: '🔧' })
      cargarEspecialidades()
    } catch (error) {
      console.error('Error guardando especialidad:', error)
      toast.error('Error al guardar especialidad')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (especialidad) => {
    setEditando(especialidad)
    setFormData({
      nombre: especialidad.nombre,
      descripcion: especialidad.descripcion || '',
      icono: especialidad.icono || '🔧'
    })
    setShowModal(true)
  }

  const handleDelete = async () => {
    if (!especialidadToDelete) return
    
    try {
      setLoading(true)
      await proveedorService.deleteEspecialidad(especialidadToDelete.id)
      toast.success('Especialidad eliminada')
      cargarEspecialidades()
    } catch (error) {
      console.error('Error eliminando especialidad:', error)
      toast.error('Error al eliminar especialidad')
    } finally {
      setLoading(false)
      setShowDeleteConfirm(false)
      setEspecialidadToDelete(null)
    }
  }

  const iconos = ['🔧', '💇', '🏥', '📚', '🎨', '💪', '🧘', '🎵', '📝', '🔬', '⚕️', '👨‍🍳']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-soft">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/proveedor/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FiArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestionar Especialidades
              </h1>
              <p className="text-gray-600 mt-1">
                Administra los servicios que ofreces
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Botón agregar */}
        <div className="mb-6">
          <button
            onClick={() => {
              setEditando(null)
              setFormData({ nombre: '', descripcion: '', icono: '🔧' })
              setShowModal(true)
            }}
            className="btn-primary flex items-center"
          >
            <FiPlus className="mr-2" />
            Nueva Especialidad
          </button>
        </div>

        {/* Lista de especialidades */}
        {loading ? (
          <LoadingSpinner />
        ) : especialidades.length === 0 ? (
          <div className="bg-white rounded-xl shadow-soft p-12 text-center">
            <div className="text-6xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold mb-2">No hay especialidades</h3>
            <p className="text-gray-600 mb-6">
              Comienza agregando las especialidades que ofreces
            </p>
            <button
              onClick={() => {
                setEditando(null)
                setFormData({ nombre: '', descripcion: '', icono: '🔧' })
                setShowModal(true)
              }}
              className="btn-primary"
            >
              Agregar primera especialidad
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {especialidades.map((esp) => (
              <div key={esp.id} className="bg-white rounded-xl shadow-soft p-6 hover:shadow-hover transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{esp.icono || '🔧'}</div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(esp)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setEspecialidadToDelete(esp)
                        setShowDeleteConfirm(true)
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">{esp.nombre}</h3>
                <p className="text-gray-600 text-sm mb-4">{esp.descripcion}</p>
                <div className="text-sm text-gray-500">
                  Creada: {new Date(esp.fecha_creacion).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para crear/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {editando ? 'Editar Especialidad' : 'Nueva Especialidad'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Icono
                </label>
                <select
                  value={formData.icono}
                  onChange={(e) => setFormData({...formData, icono: e.target.value})}
                  className="input-field"
                >
                  {iconos.map(icono => (
                    <option key={icono} value={icono}>{icono}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Nombre de la especialidad *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="input-field"
                  placeholder="Ej: Odontología, Peluquería, etc."
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  className="input-field"
                  rows="3"
                  placeholder="Describe brevemente esta especialidad..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditando(null)
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : (editando ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmar eliminación */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setEspecialidadToDelete(null)
        }}
        onConfirm={handleDelete}
        title="Eliminar especialidad"
        message={`¿Estás seguro de eliminar "${especialidadToDelete?.nombre}"?`}
        confirmText="Eliminar"
        type="danger"
      />
    </div>
  )
}

export default GestionEspecialidadesPage
