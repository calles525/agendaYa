import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateAuth, canAccessBusiness } from '@/lib/auth'
import type { ApiResponse, Appointment } from '@/types'

// POST /api/appointments/[id]/complete - Marcar cita como completada
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
    const { notes } = body

    const appointment = await db.appointment.findUnique({
      where: { id },
      include: { specialist: true },
    })

    if (!appointment) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Cita no encontrada',
      }, { status: 404 })
    }

    // Verificar permisos (specialist asignado o business owner)
    let canComplete = false
    if (authResult.user.role === 'SPECIALIST') {
      const specialist = await db.specialist.findUnique({
        where: { userId: authResult.user.userId },
      })
      canComplete = specialist?.id === appointment.specialistId
    } else if (authResult.user.role === 'BUSINESS_OWNER' || authResult.user.role === 'SUPER_ADMIN') {
      canComplete = canAccessBusiness(authResult.user, appointment.businessId)
    }

    if (!canComplete) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No tienes permisos para completar esta cita',
      }, { status: 403 })
    }

    // Verificar que la cita esté confirmada
    if (appointment.status !== 'CONFIRMED') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Solo citas confirmadas pueden ser completadas',
      }, { status: 400 })
    }

    const updatedAppointment = await db.appointment.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        attendedAt: new Date(),
        attendanceNotes: notes,
      },
    })

    return NextResponse.json<ApiResponse<Appointment>>({
      success: true,
      data: updatedAppointment as Appointment,
      message: 'Cita marcada como completada',
    })

  } catch (error) {
    console.error('Error completando cita:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 })
  }
}
