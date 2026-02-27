import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateAuth, canAccessBusiness } from '@/lib/auth'
import type { ApiResponse, Appointment } from '@/types'

// POST /api/appointments/[id]/cancel - Cancelar cita
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization')
    const authResult = await validateAuth(authHeader)

    if (!authResult.success || !authResult.user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No autorizado',
      }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { reason } = body

    const appointment = await db.appointment.findUnique({
      where: { id },
    })

    if (!appointment) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Cita no encontrada',
      }, { status: 404 })
    }

    // Verificar permisos (cliente dueño o negocio dueño)
    const isClient = appointment.clientId === authResult.user.userId
    const isBusinessOwner = canAccessBusiness(authResult.user, appointment.businessId)

    if (!isClient && !isBusinessOwner) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No tienes permisos para cancelar esta cita',
      }, { status: 403 })
    }

    // Verificar que la cita se puede cancelar
    if (['COMPLETED', 'CANCELLED', 'REJECTED', 'EXPIRED'].includes(appointment.status)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Esta cita no puede ser cancelada',
      }, { status: 400 })
    }

    const updatedAppointment = await db.appointment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason || 'Cancelado por el usuario',
      },
    })

    return NextResponse.json<ApiResponse<Appointment>>({
      success: true,
      data: updatedAppointment as Appointment,
      message: 'Cita cancelada exitosamente',
    })

  } catch (error) {
    console.error('Error cancelando cita:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 })
  }
}
