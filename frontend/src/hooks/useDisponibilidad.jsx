import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { busquedaService } from '../services/busquedaService';

export const useDisponibilidad = () => {
  const [fecha, setFecha] = useState(null);
  const [especialistaId, setEspecialistaId] = useState(null);
  const [productoId, setProductoId] = useState(null);

  // Disponibilidad de citas
  const { data: horarios, isLoading: loadingHorarios } = useQuery({
    queryKey: ['disponibilidad-citas', especialistaId, fecha],
    queryFn: () => busquedaService.getDisponibilidadCita(especialistaId, fecha),
    enabled: !!especialistaId && !!fecha,
  });

  // Disponibilidad de productos
  const { data: disponibilidadProducto, isLoading: loadingProducto } = useQuery({
    queryKey: ['disponibilidad-producto', productoId, fecha],
    queryFn: () => busquedaService.getDisponibilidadProducto(productoId, fecha),
    enabled: !!productoId && !!fecha,
  });

  const verificarDisponibilidad = async (tipo, id, fechaSeleccionada, hora) => {
    try {
      if (tipo === 'cita') {
        return await busquedaService.verificarDisponibilidadCita(id, fechaSeleccionada, hora);
      } else {
        return await busquedaService.verificarDisponibilidadProducto(id, fechaSeleccionada, hora);
      }
    } catch (error) {
      console.error('Error verificando disponibilidad:', error);
      return false;
    }
  };

  return {
    horarios: horarios?.data || [],
    disponibilidadProducto: disponibilidadProducto?.data,
    loading: loadingHorarios || loadingProducto,
    setFecha,
    setEspecialistaId,
    setProductoId,
    verificarDisponibilidad,
  };
};