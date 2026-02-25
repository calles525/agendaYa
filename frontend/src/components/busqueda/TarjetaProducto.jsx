import { Link } from 'react-router-dom';
import { FiClock } from 'react-icons/fi';
import Rating from '../common/Rating';

const TarjetaProducto = ({ producto }) => {
  return (
    <Link to={`/producto/${producto.id}`} className="card block p-4 hover:shadow-hover transition-all">
      <div className="flex space-x-4">
        <img
          src={producto.foto_principal || '/default-product.png'}
          alt={producto.nombre}
          className="w-24 h-24 rounded-lg object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{producto.nombre}</h3>
          
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {producto.descripcion}
          </p>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-primary-600 font-bold text-lg">
                ${producto.precio_hora}
              </span>
              <span className="text-gray-600 text-sm"> / hora</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <FiClock className="text-gray-400" />
              <span className="text-sm text-gray-600">
                Mín. {producto.duracion_minima} hora(s)
              </span>
            </div>
          </div>
          
          {producto.calificacion_promedio > 0 && (
            <div className="flex items-center mt-2">
              <Rating value={producto.calificacion_promedio} readonly size="sm" />
              <span className="text-xs text-gray-500 ml-1">
                ({producto.total_resenas})
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default TarjetaProducto;