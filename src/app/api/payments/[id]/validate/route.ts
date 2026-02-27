import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateAuth, canAccessBusiness } from '@/lib/auth'
import type { ApiResponse, Payment } from '@/types'

// POST /api/payments/[id]/validate - Validar o rechazar pago
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
    const { action, rejectionReason } = body // action: 'approve' | 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'action debe ser "approve" o "reject"',
      }, { status: 400 })
    }

    // Obtener pago con información de la cita
    const payment = await db.payment.findUnique({
      where: { id },
      include: { appointment: true },
    })

    if (!payment) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Pago no encontrado',
      }, { status: 404 })
    }

    // Verificar permisos
    if (!canAccessBusiness(authResult.user, payment.appointment.businessId)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No tienes permisos para validar este pago',
      }, { status: 403 })
    }

    if (payment.status !== 'UPLOADED') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Este pago ya fue procesado',
      }, { status: 400 })
    }

    if (action === 'approve') {
      // Aprobar pago y confirmar cita
      const updatedPayment = await db.payment.update({
        where: { id },
        data: {
          status: 'VALIDATED',
          validatedAt: new Date(),
          validatedById: authResult.user.userId,
        },
      })

      await db.appointment.update({
        where: { id: payment.appointmentId },
        data: { status: 'CONFIRMED' },
      })

      return NextResponse.json<ApiResponse<Payment>>({
        success: true,
        data: updatedPayment as Payment,
        message: 'Pago validado y cita confirmada',
      })

    } else {
      // Rechazar pago
      if (!rejectionReason) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Debe proporcionar una razón de rechazo',
        }, { status: 400 })
      }

      const updatedPayment = await db.payment.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectionReason,
          validatedAt: new Date(),
          validatedById: authResult.user.userId,
        },
      })

      await db.appointment.update({
        where: { id: payment.appointmentId },
        data: { status: 'REJECTED' },
      })

      return NextResponse.json<ApiResponse<Payment>>({
        success: true,
        data: updatedPayment as Payment,
        message: 'Pago rechazado',
      })
    }

  } catch (error) {
    console.error('Error validando pago:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 })
  }
}
