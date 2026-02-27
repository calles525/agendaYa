import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateAuth } from '@/lib/auth'
import type { ApiResponse, Payment } from '@/types'

// GET /api/payments - Listar pagos
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const authResult = await validateAuth(authHeader)

    if (!authResult.success || !authResult.user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No autorizado',
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    const status = searchParams.get('status')

    if (!businessId && authResult.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'businessId es requerido',
      }, { status: 400 })
    }

    const where: Record<string, unknown> = {}
    if (businessId) where.businessId = businessId
    if (status) where.status = status

    const payments = await db.payment.findMany({
      where,
      include: {
        appointment: {
          include: {
            client: { select: { id: true, name: true, email: true } },
            service: true,
            specialist: {
              include: { user: { select: { name: true } } },
            },
          },
        },
        paymentMethod: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json<ApiResponse<Payment[]>>({
      success: true,
      data: payments as Payment[],
    })

  } catch (error) {
    console.error('Error listando pagos:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 })
  }
}

// POST /api/payments - Subir comprobante de pago
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const authResult = await validateAuth(authHeader)

    if (!authResult.success || !authResult.user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No autorizado',
      }, { status: 401 })
    }

    const body = await request.json()
    const { appointmentId, methodId, reference, receiptImage } = body

    if (!appointmentId || !methodId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'appointmentId y methodId son requeridos',
      }, { status: 400 })
    }

    // Verificar que la cita pertenece al cliente
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: { payment: true },
    })

    if (!appointment) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Cita no encontrada',
      }, { status: 404 })
    }

    if (appointment.clientId !== authResult.user.userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No tienes permiso para esta cita',
      }, { status: 403 })
    }

    if (appointment.status !== 'PENDING') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Esta cita ya no puede recibir pagos',
      }, { status: 400 })
    }

    // Actualizar pago y cita
    const payment = await db.payment.update({
      where: { appointmentId },
      data: {
        methodId,
        reference,
        receiptImage,
        status: 'UPLOADED',
      },
    })

    await db.appointment.update({
      where: { id: appointmentId },
      data: { status: 'PAYMENT_PENDING' },
    })

    return NextResponse.json<ApiResponse<Payment>>({
      success: true,
      data: payment as Payment,
      message: 'Comprobante enviado exitosamente',
    })

  } catch (error) {
    console.error('Error subiendo comprobante:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 })
  }
}
