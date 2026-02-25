import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservaService } from '../services/reservaService';
import toast from 'react-hot-toast';

export const useReservas = (filtros = {}) => {
  const queryClient = useQueryClient();

  // Obtener reservas del usuario
  const { data: reservas, isLoading, error } = useQuery({
    queryKey: ['reservas', filtros],
    queryFn: () => reservaService.getMisReservas(filtros),
  });

  // Crear reserva de cita
  const createCita = useMutation({
    mutationFn: (data) => reservaService.createCita(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['reservas']);
      toast.success('Reserva creada exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al crear reserva');
    },
  });

  // Crear reserva de alquiler
  const createAlquiler = useMutation({
    mutationFn: (data) => reservaService.createAlquiler(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['reservas']);
      toast.success('Reserva creada exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al crear reserva');
    },
  });

  // Cancelar reserva
  const cancelar = useMutation({
    mutationFn: ({ id, motivo }) => reservaService.cancelarReserva(id, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries(['reservas']);
      toast.success('Reserva cancelada');
    },
  });

  return {
    reservas: reservas?.data || [],
    total: reservas?.total || 0,
    isLoading,
    error,
    createCita: createCita.mutateAsync,
    createAlquiler: createAlquiler.mutateAsync,
    cancelarReserva: cancelar.mutateAsync,
    isCreating: createCita.isLoading || createAlquiler.isLoading,
  };
};