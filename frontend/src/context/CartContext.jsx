import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext({});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [proveedorId, setProveedorId] = useState(null);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const { items, proveedorId } = JSON.parse(savedCart);
      setItems(items);
      setProveedorId(proveedorId);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify({ items, proveedorId }));
  }, [items, proveedorId]);

  const addItem = (item, nuevoProveedorId) => {
    if (proveedorId && proveedorId !== nuevoProveedorId) {
      toast.error('Solo puedes reservar de un proveedor a la vez');
      return false;
    }

    setProveedorId(nuevoProveedorId);
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id && i.tipo === item.tipo);
      if (existing) {
        return prev.map(i => 
          i.id === item.id ? { ...i, cantidad: i.cantidad + (item.cantidad || 1) } : i
        );
      }
      return [...prev, { ...item, cantidad: item.cantidad || 1 }];
    });
    
    toast.success('Producto agregado al carrito');
    return true;
  };

  const removeItem = (id) => {
    setItems(prev => {
      const newItems = prev.filter(item => item.id !== id);
      if (newItems.length === 0) {
        setProveedorId(null);
      }
      return newItems;
    });
    toast.success('Producto eliminado');
  };

  const updateQuantity = (id, cantidad) => {
    if (cantidad < 1) return;
    setItems(prev =>
      prev.map(item => item.id === id ? { ...item, cantidad } : item)
    );
  };

  const clearCart = () => {
    setItems([]);
    setProveedorId(null);
    toast.success('Carrito vaciado');
  };

  const total = items.reduce((sum, item) => {
    if (item.tipo === 'producto') {
      return sum + (item.precio_hora * item.cantidad);
    }
    return sum + (item.precio * item.cantidad);
  }, 0);

  return (
    <CartContext.Provider value={{
      items,
      proveedorId,
      total,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount: items.length
    }}>
      {children}
    </CartContext.Provider>
  );
};