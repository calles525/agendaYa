'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, ArrowLeft, Loader2, Clock } from 'lucide-react'
import { useAuth } from '@/hooks/use-api'
import type { Appointment } from '@/types'

export default function MyAppointmentsPage() {
  const { user, token, isAuthenticated, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth?mode=login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (user && token) {
      fetchAppointments()
    }
  }, [user, token])

  const fetchAppointments = async () => {
    if (!token) return

    try {
      const response = await fetch('/api/appointments', {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'outline'
      case 'PAYMENT_PENDING': return 'secondary'
      case 'CONFIRMED': return 'default'
      case 'COMPLETED': return 'default'
      case 'CANCELLED': return 'destructive'
      case 'REJECTED': return 'destructive'
      default: return 'outline'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendiente'
      case 'PAYMENT_PENDING': return 'Pago Pendiente'
      case 'CONFIRMED': return 'Confirmada'
      case 'COMPLETED': return 'Completada'
      case 'CANCELLED': return 'Cancelada'
      case 'REJECTED': return 'Rechazada'
      default: return status
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
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-orange-400 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold">Mis Citas</span>
            </div>
          </div>
          <Button variant="ghost" onClick={signOut}>Cerrar Sesion</Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Mis Citas</h1>

        {appointments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No tienes citas aun</p>
              <Link href="/explore">
                <Button className="bg-gradient-to-r from-rose-500 to-orange-400">
                  Explorar Negocios
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <Card key={apt.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-rose-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{apt.service?.name}</h3>
                        <p className="text-sm text-gray-500">{apt.business?.name}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(apt.date).toLocaleDateString()} - {apt.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusColor(apt.status) as "outline" | "default" | "secondary" | "destructive"}>
                        {getStatusText(apt.status)}
                      </Badge>
                      {apt.payment && (
                        <span className="text-lg font-bold">${(apt.payment.amount / 100).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
