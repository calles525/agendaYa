import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { busquedaService } from '../services/busquedaService';
import Filtros from '../components/busqueda/Filtros';
import TarjetaProveedor from '../components/busqueda/TarjetaProveedor';
import TarjetaProducto from '../components/busqueda/TarjetaProducto';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import { FiSearch } from 'react-icons/fi';

const Busqueda = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [tipo, setTipo] = useState('todos');

  const query = searchParams.get('q') || '';

  useEffect(() => {
    buscar();
  }, [searchParams.toString(), pagina, tipo]);

  const buscar = async () => {
    setLoading(true);
    try {
      const params = {
        q: query,
        tipo: tipo !== 'todos' ? tipo : undefined,
        pagina,
        limite: 12,
        ...Object.fromEntries(searchParams)
      };
      
      const { data } = await busquedaService.buscar(params);
      setResultados(data.resultados || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filtros) => {
    const nuevosParams = new URLSearchParams(searchParams);
    Object.entries(filtros).forEach(([key, value]) => {
      if (value) {
        nuevosParams.set(key, value);
      } else {
        nuevosParams.delete(key);
      }
    });
    setSearchParams(nuevosParams);
    setPagina(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header de búsqueda */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {query ? `Resultados para "${query}"` : 'Explorar servicios'}
        </h1>
        
        {/* Tabs de tipo */}
        <div className="flex space-x-4 border-b">
          {['todos', 'proveedores', 'productos'].map((t) => (
            <button
              key={t}
              onClick={() => setTipo(t)}
              className={`pb-2 px-4 capitalize ${
                tipo === t
                  ? 'border-b-2 border-primary-600 text-primary-600 font-medium'
                  : 'text-gray-600'
              }`}
            >
              {t === 'todos' ? 'Todos' : t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filtros */}
        <div className="md:w-64 flex-shrink-0">
          <Filtros onFilterChange={handleFilterChange} />
        </div>

        {/* Resultados */}
        <div className="flex-1">
          {loading ? (
            <LoadingSpinner />
          ) : resultados.length === 0 ? (
            <div className="text-center py-12">
              <FiSearch className="mx-auto text-6xl text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No se encontraron resultados</h3>
              <p className="text-gray-600">
                Prueba con otros términos o ajusta los filtros
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-gray-600">
                {total} resultados encontrados
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {resultados.map((item) => {
                  if (item.tipo === 'proveedores') {
                    return item.items?.map(proveedor => (
                      <TarjetaProveedor key={`prov-${proveedor.id}`} proveedor={proveedor} />
                    ));
                  } else {
                    return item.items?.map(producto => (
                      <TarjetaProducto key={`prod-${producto.id}`} producto={producto} />
                    ));
                  }
                })}
              </div>

              {total > 12 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={pagina}
                    totalPages={Math.ceil(total / 12)}
                    onPageChange={setPagina}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Busqueda;