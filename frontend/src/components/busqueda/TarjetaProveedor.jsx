import { Link } from 'react-router-dom';
import { FiMapPin, FiStar } from 'react-icons/fi';
import Rating from '../common/Rating';

const TarjetaProveedor = ({ proveedor }) => {
  return (
    <Link to={`/proveedor/${proveedor.id}`} className="card block p-4 hover:shadow-hover transition-all">
      <div className="flex items-start space-x-4">
        <img
          src={proveedor.usuario?.foto_perfil || '/default-avatar.png'}
          alt={proveedor.nombre_negocio || proveedor.usuario?.nombre}
          className="w-20 h-20 rounded-lg object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">
            {proveedor.nombre_negocio || proveedor.usuario?.nombre}
          </h3>
          
          {proveedor.ciudad && (
            <p className="text-gray-600 text-sm flex items-center mb-2">
              <FiMapPin className="mr-1" />
              {proveedor.ciudad}
            </p>
          )}
          
          <div className="flex items-center space-x-2 mb-2">
            <Rating value={proveedor.calificacion_promedio || 0} readonly size="sm" />
            <span className="text-sm text-gray-600">
              ({proveedor.total_resenas || 0} reseñas)
            </span>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2">
            {proveedor.descripcion}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default TarjetaProveedor;