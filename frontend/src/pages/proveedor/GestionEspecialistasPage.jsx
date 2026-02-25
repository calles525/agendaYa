import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FiPlus, FiEdit2, FiTrash2, FiArrowLeft, 
  FiUser, FiMail, FiPhone, FiClock, FiDollarSign 
} from 'react-icons/fi'
import { proveedorService } from '../../services/proveedorService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import toast from 'react-hot-toast'
import ConfiguracionHorarios from '../../components/proveedor/ConfiguracionHorarios'

const GestionEspecialistasPage = () => {
  const [showHorariosModal, setShowHorariosModal] = useState(false)
  const [especialistaParaHorarios, setEspecialistaParaHorarios] = useState(null)
  const navigate = useNavigate()
  const [especialistas, setEspecialistas] = useState([])
  const [especialidades, setEspecialidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [especialistaToDelete, setEspecialistaToDelete] = useState(null)
  const [editando, setEditando] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    descripcion: '',
    foto: null,
    especialidades: []
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [especialistasRes, especialidadesRes] = await Promise.all([
        proveedorService.getEspecialistas(),
        proveedorService.getEspecialidades()
      ])
      setEspecialistas(especialistasRes.data || [])
      setEspecialidades(especialidadesRes.data || [])
    } catch (error) {
      console.error('Error cargando datos:', error)
      toast.error('Error al cargar los datos')
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

  if (formData.especialidades.length === 0) {
    toast.error('Debe seleccionar al menos una especialidad')
    return
  }

  try {
    setLoading(true)
    
    // Crear FormData para enviar archivos
    const submitData = new FormData()
    submitData.append('nombre', formData.nombre)
    submitData.append('email', formData.email || '')
    submitData.append('telefono', formData.telefono || '')
    submitData.append('descripcion', formData.descripcion || '')
    // Enviar especialidades como array JSON
    submitData.append('especialidades', JSON.stringify(formData.especialidades))
    
    if (formData.foto && formData.foto instanceof File) {
      submitData.append('foto', formData.foto)
    }

    if (editando) {
      // Actualizar
      await proveedorService.updateEspecialista(editando.id, submitData)
      toast.success('Especialista actualizado')
    } else {
      // Crear nuevo
      await proveedorService.createEspecialista(submitData)
      toast.success('Especialista creado')
    }
    
    setShowModal(false)
    setEditando(null)
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      descripcion: '',
      foto: null,
      especialidades: []
    })
    cargarDatos()
  } catch (error) {
    console.error('Error guardando especialista:', error)
    toast.error(error.response?.data?.error || 'Error al guardar especialista')
  } finally {
    setLoading(false)
  }
}

  const handleEdit = (especialista) => {
    setEditando(especialista)
    setFormData({
      nombre: especialista.nombre,
      email: especialista.email || '',
      telefono: especialista.telefono || '',
      descripcion: especialista.descripcion || '',
      foto: null,
      especialidades: especialista.especialidades?.map(e => e.id) || []
    })
    setShowModal(true)
  }

  const handleDelete = async () => {
    if (!especialistaToDelete) return
    
    try {
      setLoading(true)
      await proveedorService.deleteEspecialista(especialistaToDelete.id)
      toast.success('Especialista eliminado')
      cargarDatos()
    } catch (error) {
      console.error('Error eliminando especialista:', error)
      toast.error('Error al eliminar especialista')
    } finally {
      setLoading(false)
      setShowDeleteConfirm(false)
      setEspecialistaToDelete(null)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 5MB')
        return
      }
      setFormData({...formData, foto: file})
    }
  }

  const toggleEspecialidad = (especialidadId) => {
    setFormData(prev => ({
      ...prev,
      especialidades: prev.especialidades.includes(especialidadId)
        ? prev.especialidades.filter(id => id !== especialidadId)
        : [...prev.especialidades, especialidadId]
    }))
  }

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
                Gestionar Especialistas
              </h1>
              <p className="text-gray-600 mt-1">
                Administra los profesionales que trabajan contigo
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
              setFormData({
                nombre: '',
                email: '',
                telefono: '',
                descripcion: '',
                foto: null,
                especialidades: []
              })
              setShowModal(true)
            }}
            className="btn-primary flex items-center"
          >
            <FiPlus className="mr-2" />
            Nuevo Especialista
          </button>
        </div>

        {/* Lista de especialistas */}
        {loading ? (
          <LoadingSpinner />
        ) : especialistas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-soft p-12 text-center">
            <div className="text-6xl mb-4">👤</div>
            <h3 className="text-xl font-semibold mb-2">No hay especialistas</h3>
            <p className="text-gray-600 mb-6">
              Agrega los profesionales que ofrecen servicios
            </p>
            <button
              onClick={() => {
                setEditando(null)
                setFormData({
                  nombre: '',
                  email: '',
                  telefono: '',
                  descripcion: '',
                  foto: null,
                  especialidades: []
                })
                setShowModal(true)
              }}
              className="btn-primary"
            >
              Agregar primer especialista
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {especialistas.map((esp) => (
              <div key={esp.id} className="bg-white rounded-xl shadow-soft p-6 hover:shadow-hover transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={esp.foto || '/default-avatar.png'}
                      alt={esp.nombre}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{esp.nombre}</h3>
                      <p className="text-sm text-gray-600">
                        {esp.especialidades?.length || 0} especialidades
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {/* ===== NUEVO BOTÓN DE HORARIOS (VERDE) ===== */}
                    <button
                      onClick={() => {
                        setEspecialistaParaHorarios(esp)
                        setShowHorariosModal(true)
                      }}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Configurar horarios"
                    >
                      <FiClock size={18} />
                    </button>
                    
                    <button
                      onClick={() => handleEdit(esp)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setEspecialistaToDelete(esp)
                        setShowDeleteConfirm(true)
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>

                {esp.email && (
                  <p className="text-sm text-gray-600 flex items-center mb-2">
                    <FiMail className="mr-2" size={14} />
                    {esp.email}
                  </p>
                )}
                
                {esp.telefono && (
                  <p className="text-sm text-gray-600 flex items-center mb-3">
                    <FiPhone className="mr-2" size={14} />
                    {esp.telefono}
                  </p>
                )}

                <div className="border-t pt-3">
                  <p className="text-sm font-medium mb-2">Especialidades:</p>
                  <div className="flex flex-wrap gap-2">
                    {esp.especialidades?.map(esp => (
                      <span
                        key={esp.id}
                        className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                      >
                        {esp.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para crear/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editando ? 'Editar Especialista' : 'Nuevo Especialista'}
            </h2>
            
        
              {/* Foto */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Foto del especialista
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {formData.foto ? (
                      <img
                        src={URL.createObjectURL(formData.foto)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : editando?.foto ? (
                      <img
                        src={editando.foto}
                        alt={editando.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiUser size={30} className="text-gray-400" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Nombre */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="input-field"
                  placeholder="Ej: Dr. Juan Pérez"
                  required
                />
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="input-field"
                  placeholder="juan@example.com"
                />
              </div>

              {/* Teléfono */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  className="input-field"
                  placeholder="5512345678"
                />
              </div>

              {/* Descripción */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Descripción / Biografía
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  className="input-field"
                  rows="3"
                  placeholder="Breve descripción del especialista..."
                />
              </div>

              {/* Especialidades */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Especialidades que atiende *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {especialidades.map(esp => (
                    <label
                      key={esp.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                        formData.especialidades.includes(esp.id)
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.especialidades.includes(esp.id)}
                        onChange={() => toggleEspecialidad(esp.id)}
                        className="sr-only"
                      />
                      <span className="text-2xl mr-2">{esp.icono || '🔧'}</span>
                      <span className="text-sm">{esp.nombre}</span>
                    </label>
                  ))}
                </div>
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
                  onClick={handleSubmit}
                >
                  {loading ? 'Guardando...' : (editando ? 'Actualizar' : 'Crear')}
                </button>
              </div>
   
          </div>
        </div>
      )}

      {/* Modal de configuración de horarios */}
      {showHorariosModal && (
        <ConfiguracionHorarios
          especialistaId={especialistaParaHorarios.id}
          especialistaNombre={especialistaParaHorarios.nombre}
          onClose={() => {
            setShowHorariosModal(false);
            setEspecialistaParaHorarios(null);
          }}
        />
      )}

      {/* Confirmar eliminación */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setEspecialistaToDelete(null)
        }}
        onConfirm={handleDelete}
        title="Eliminar especialista"
        message={`¿Estás seguro de eliminar a "${especialistaToDelete?.nombre}"?`}
        confirmText="Eliminar"
        type="danger"
      />
    </div>
  )
}

export default GestionEspecialistasPage