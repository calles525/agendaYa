'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Check, X, Loader2, ArrowLeft, DollarSign } from 'lucide-react'
import { useAuth } from '@/hooks/use-api'
import type { Payment } from '@/types'

export default function PaymentsManagementPage() {
  const { user, business, token, isAuthenticated, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth?mode=login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (business && token) {
      fetchPayments()
    }
  }, [business, token])

  const fetchPayments = async () => {
    if (!token || !business) return

    try {
      const response = await fetch(`/api/payments?businessId=${business.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setPayments(data.data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = async (paymentId: string, action: 'approve' | 'reject') => {
    if (!token) return

    try {
      const response = await fetch(`/api/payments/${paymentId}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        fetchPayments()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline">Pendiente</Badge>
      case 'UPLOADED':
        return <Badge variant="secondary">Comprobante Subido</Badge>
      case 'VALIDATED':
        return <Badge className="bg-green-500">Validado</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Rechazado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const pendingPayments = payments.filter(p => p.status === 'UPLOADED')

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <span className="font-bold">Pagos</span>
          </div>
          <Button variant="ghost" onClick={signOut}>Cerrar Sesion</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{pendingPayments.length}</div>
                  <p className="text-sm text-gray-500">Pendientes de Validar</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    ${payments.filter(p => p.status === 'VALIDATED').reduce((acc, p) => acc + p.amount / 100, 0).toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-500">Total Validado</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{payments.length}</div>
                  <p className="text-sm text-gray-500">Total Pagos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {pendingPayments.length > 0 && (
          <Card className="mb-6 border-amber-200 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-600" />
                Pagos Pendientes de Validacion
              </CardTitle>
              <CardDescription>Revisa y valida los comprobantes de pago</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingPayments.map((payment) => (
                  <div key={payment.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white rounded-lg gap-4">
                    <div>
                      <p className="font-medium">{payment.appointment?.client?.name}</p>
                      <p className="text-sm text-gray-500">{payment.appointment?.service?.name}</p>
                      {payment.reference && (
                        <p className="text-xs text-gray-400">Ref: {payment.reference}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold">${(payment.amount / 100).toFixed(2)}</span>
                      <Button 
                        size="sm" 
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => handleValidate(payment.id, 'approve')}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Validar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleValidate(payment.id, 'reject')}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Historial de Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay pagos registrados
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{payment.appointment?.client?.name}</p>
                      <p className="text-sm text-gray-500">{payment.appointment?.service?.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(payment.status)}
                      <span className="font-bold">${(payment.amount / 100).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
