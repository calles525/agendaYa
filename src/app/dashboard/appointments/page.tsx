'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, Loader2, Check, X, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/use-api'
import type { Appointment } from '@/types'

export default function AppointmentsManagementPage() {
  const { user, business, token, isAuthenticated, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth?mode=login')
    }
    if (!authLoading && user && user.role === 'CLIENT') {
      router.push('/dashboard')
    }
  }, [authLoading, isAuthenticated, user, router])

  useEffect(() => {
    if (business && token) {
      fetchAppointments()
    }
  }, [business, token])

  const fetchAppointments = async () => {
    if (!token || !business) return

    try {
      const response = await fetch(`/api/appointments?businessId=${business.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setAppointments(data.data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleValidatePayment = async (paymentId: string, action: 'approve' | 'reject') => {
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
        fetchAppointments()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleComplete = async (appointmentId: string) => {
    if (!token) return

    try {
      const response = await fetch(`/api/appointments/${appointmentId}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        fetchAppointments()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

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
            <span className="font-bold">Gestion de Citas</span>
          </div>
          <Button variant="ghost" onClick={signOut}>Cerrar Sesion</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {appointments.filter(a => a.status === 'PENDING').length}
              </div>
              <p className="text-sm text-gray-500">Pendientes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {appointments.filter(a => a.status === 'PAYMENT_PENDING').length}
              </div>
              <p className="text-sm text-gray-500">Pago Pendiente</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {appointments.filter(a => a.status === 'CONFIRMED').length}
              </div>
              <p className="text-sm text-gray-500">Confirmadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {appointments.filter(a => a.status === 'COMPLETED').length}
              </div>
              <p className="text-sm text-gray-500">Completadas</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Todas las Citas</CardTitle>
            <CardDescription>Gestiona las citas de tu negocio</CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay citas registradas
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((apt) => (
                  <div key={apt.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg gap-4">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-rose-600" />
                      </div>
                      <div>
                        <p className="font-medium">{apt.client?.name}</p>
                        <p className="text-sm text-gray-500">{apt.service?.name}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(apt.date).toLocaleDateString()} - {apt.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        apt.status === 'CONFIRMED' ? 'default' :
                        apt.status === 'COMPLETED' ? 'secondary' :
                        apt.status === 'PAYMENT_PENDING' ? 'outline' : 'outline'
                      }>
                        {apt.status}
                      </Badge>
                      {apt.payment && (
                        <span className="font-bold">${(apt.payment.amount / 100).toFixed(2)}</span>
                      )}

                      {apt.status === 'PAYMENT_PENDING' && apt.payment && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => handleValidatePayment(apt.payment!.id, 'approve')}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleValidatePayment(apt.payment!.id, 'reject')}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}

                      {apt.status === 'CONFIRMED' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleComplete(apt.id)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Completar
                        </Button>
                      )}
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
