const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">BookingSaaS</h3>
            <p className="text-gray-400">
              La plataforma más completa para gestión de citas y alquileres
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Enlaces rápidos</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/busqueda" className="hover:text-white">Buscar</a></li>
              <li><a href="/como-funciona" className="hover:text-white">Cómo funciona</a></li>
              <li><a href="/precios" className="hover:text-white">Precios</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Soporte</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/ayuda" className="hover:text-white">Centro de ayuda</a></li>
              <li><a href="/contacto" className="hover:text-white">Contacto</a></li>
              <li><a href="/terminos" className="hover:text-white">Términos</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Síguenos</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
              <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-white">Instagram</a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 BookingSaaS. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer