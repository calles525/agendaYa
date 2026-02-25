import { useState } from 'react';
import { FiFilter, FiX } from 'react-icons/fi';

const Filtros = ({ onFilterChange, categorias = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    categoria: '',
    precio_min: '',
    precio_max: '',
    ciudad: '',
    calificacion: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nuevosFiltros = { ...filtros, [name]: value };
    setFiltros(nuevosFiltros);
    onFilterChange(nuevosFiltros);
  };

  const limpiarFiltros = () => {
    const filtrosVacios = {
      categoria: '',
      precio_min: '',
      precio_max: '',
      ciudad: '',
      calificacion: ''
    };
    setFiltros(filtrosVacios);
    onFilterChange(filtrosVacios);
  };

  return (
    <>
      {/* Botón móvil */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-4 right-4 bg-primary-600 text-white p-4 rounded-full shadow-lg z-40"
      >
        <FiFilter size={24} />
      </button>

      {/* Sidebar de filtros */}
      <div className={`
        fixed md:static inset-y-0 left-0 transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-transform duration-300
        w-64 bg-white md:bg-transparent shadow-lg md:shadow-none
        z-50 md:z-auto overflow-y-auto
      `}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4 md:hidden">
            <h3 className="font-semibold">Filtros</h3>
            <button onClick={() => setIsOpen(false)}>
              <FiX size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Categoría</label>
              <select
                name="categoria"
                value={filtros.categoria}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Todas</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Precio por hora</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="precio_min"
                  placeholder="Mín"
                  value={filtros.precio_min}
                  onChange={handleChange}
                  className="input-field"
                />
                <input
                  type="number"
                  name="precio_max"
                  placeholder="Máx"
                  value={filtros.precio_max}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ciudad</label>
              <input
                type="text"
                name="ciudad"
                placeholder="Ej: Ciudad de México"
                value={filtros.ciudad}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Calificación mínima</label>
              <select
                name="calificacion"
                value={filtros.calificacion}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Cualquiera</option>
                <option value="4">4+ estrellas</option>
                <option value="3">3+ estrellas</option>
                <option value="2">2+ estrellas</option>
              </select>
            </div>

            <button
              onClick={limpiarFiltros}
              className="text-primary-600 text-sm hover:underline w-full text-center"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Filtros;