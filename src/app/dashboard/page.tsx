'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Users, 
  Store, 
  Settings, 
  LogOut,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  ArrowRight,
  CreditCard,
  User,
  Briefcase,
  LayoutDashboard
} from 'lucide-react'
import { useAuth } from '@/hooks/use-api'
import type { User, Business } from '@/types'

export default function DashboardPage() {
  const { user, token, business, isAuthenticated, loading, signOut } = useAuth()
  const [stats, setStats] = useState({
    pendingAppointments: 0,
    confirmedToday: 0,
    completedThisMonth: 0,
    totalClients: 0
  })
  const [recentAppointments, setRecentAppointments] = useState<unknown[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (user && token) {
      fetchDashboardData()
    }
  }, [user, token])

  const fetchDashboardData = async () => {
    if (!token) {
      setLoadingData(false)
      return
    }
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      const response = await fetch('/api/appointments', {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        const appointments = data.data || []
        setRecentAppointments(appointments)
        
        const pending = appointments.filter((a: { status: string }) => 
          ['PENDING', 'PAYMENT_PENDING'].includes(a.status)
        ).length
        
        setStats({
          pendingAppointments: pending,
          confirmedToday: appointments.filter((a: { status: string, date: string }) => 
            a.status === 'CONFIRMED' && new Date(a.date).toDateString() === new Date().toDateString()
          ).length,
          completedThisMonth: appointments.filter((a: { status: string }) => 
            a.status === 'COMPLETED'
          ).length,
          totalClients: new Set(appointments.map((a: { clientId: string }) => a.clientId)).size
        })
      }
    } catch (error) {
      // Silenciar errores de red - mostrar dashboard vacío
      if (error instanceof Error && error.name !== 'AbortError') {
        console.warn('Could not fetch dashboard data:', error.message)
      }
    } finally {
      setLoadingData(false)
    }
  }

  // Mostrar loading mientras carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto mb-4" />
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, mostrar opción de login
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">AgendaYa</CardTitle>
            <CardDescription>Inicia sesion para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth?mode=login">
              <Button className="w-full bg-gradient-to-r from-rose-500 to-orange-400">
                Iniciar Sesion
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Dashboard para Cliente
  if (user.role === 'CLIENT') {
    return <ClientDashboard user={user} token={token!} signOut={signOut} />
  }

  // Dashboard para Business Owner
  if (user.role === 'BUSINESS_OWNER' && business) {
    return (
      <BusinessDashboard 
        user={user} 
        business={business} 
        token={token!}
        signOut={signOut}
        stats={stats}
        recentAppointments={recentAppointments}
        loadingData={loadingData}
      />
    )
  }

  // Dashboard para Specialist
  if (user.role === 'SPECIALIST') {
    return <SpecialistDashboard user={user} signOut={signOut} />
  }

  // Dashboard para Super Admin
  if (user.role === 'SUPER_ADMIN') {
    return <SuperAdminDashboard user={user} signOut={signOut} />
  }

  // Sin negocio registrado - Business Owner sin negocio
  // Mostrar opciones para crear negocio o explorar
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-orange-400 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">AgendaYa</span>
          </div>
          <Button variant="ghost" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesion
          </Button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Bienvenido a AgendaYa, {user.name}!</CardTitle>
              <CardDescription className="text-lg mt-2">
                Comienza a gestionar tus citas y servicios. Crea tu negocio para ofrecer tus servicios.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <Link href="/business/create" className="block">
                <Button className="w-full bg-gradient-to-r from-rose-500 to-orange-400 h-12 text-lg">
                  <Store className="w-5 h-5 mr-2" />
                  Crear Mi Negocio
                </Button>
              </Link>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">o</span>
                </div>
              </div>
              <Link href="/explore" className="block">
                <Button variant="outline" className="w-full h-12">
                  <Store className="w-4 h-4 mr-2" />
                  Explorar Negocios
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Beneficios de tener negocio */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="font-semibold">Gestiona Citas</h3>
                <p className="text-sm text-gray-500 mt-1">Organiza tu agenda automaticamente</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold">Equipo de Trabajo</h3>
                <p className="text-sm text-gray-500 mt-1">Agrega especialistas y servicios</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Pagos Digitales</h3>
                <p className="text-sm text-gray-500 mt-1">Recibe pagos por transferencia</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

// Client Dashboard Component
function ClientDashboard({ user, token, signOut }: { user: User; token: string; signOut: () => void }) {
  const [appointments, setAppointments] = useState<unknown[]>([])
  const [loadingAppointments, setLoadingAppointments] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoadingAppointments(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-orange-400 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">AgendaYa</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Hola, {user.name}</span>
            <Button variant="ghost" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Acciones Rapidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/explore" className="block">
                <Button className="w-full bg-gradient-to-r from-rose-500 to-orange-400">
                  <Store className="w-4 h-4 mr-2" />
                  Explorar Negocios
                </Button>
              </Link>
              <Link href="/my-appointments" className="block">
                <Button variant="outline" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Mis Citas
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Mis Citas Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAppointments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No tienes citas aun</p>
                  <Link href="/explore">
                    <Button variant="link" className="mt-2">
                      Explorar negocios
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.slice(0, 5).map((apt: unknown) => {
                    const appointment = apt as { id: string; date: string; time: string; status: string; business?: { name: string }; service?: { name: string; price: number } }
                    return (
                      <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{appointment.service?.name}</p>
                          <p className="text-sm text-gray-500">{appointment.business?.name}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(appointment.date).toLocaleDateString()} - {appointment.time}
                          </p>
                        </div>
                        <Badge variant={appointment.status === 'CONFIRMED' ? 'default' : 'outline'}>
                          {appointment.status}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

// Business Dashboard Component
function BusinessDashboard({ 
  user, 
  business, 
  token,
  signOut, 
  stats, 
  recentAppointments,
  loadingData 
}: { 
  user: User; 
  business: Business;
  token: string;
  signOut: () => void;
  stats: { pendingAppointments: number; confirmedToday: number; completedThisMonth: number; totalClients: number };
  recentAppointments: unknown[];
  loadingData: boolean;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-orange-400 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">AgendaYa</span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="font-medium text-gray-700">{business.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Hola, {user.name}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden md:block w-64 bg-white border-r min-h-[calc(100vh-65px)] p-4">
          <nav className="space-y-2">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start bg-rose-50 text-rose-600">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/appointments">
              <Button variant="ghost" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Citas
              </Button>
            </Link>
            <Link href="/dashboard/specialists">
              <Button variant="ghost" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Especialistas
              </Button>
            </Link>
            <Link href="/dashboard/services">
              <Button variant="ghost" className="w-full justify-start">
                <Briefcase className="w-4 h-4 mr-2" />
                Servicios
              </Button>
            </Link>
            <Link href="/dashboard/payments">
              <Button variant="ghost" className="w-full justify-start">
                <CreditCard className="w-4 h-4 mr-2" />
                Pagos
              </Button>
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.pendingAppointments}</p>
                    <p className="text-sm text-gray-500">Pendientes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.confirmedToday}</p>
                    <p className="text-sm text-gray-500">Confirmadas Hoy</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.completedThisMonth}</p>
                    <p className="text-sm text-gray-500">Completadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalClients}</p>
                    <p className="text-sm text-gray-500">Clientes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Link href="/dashboard/specialists">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Agregar Especialista</p>
                    <p className="text-sm text-gray-500">Gestiona tu equipo</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/services">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Crear Servicio</p>
                    <p className="text-sm text-gray-500">Define precios</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/payments">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Validar Pagos</p>
                    <p className="text-sm text-gray-500">Revisa comprobantes</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
                </CardContent>
              </Card>
            </Link>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Citas Recientes</CardTitle>
                <CardDescription>Las ultimas solicitudes de reserva</CardDescription>
              </div>
              <Link href="/dashboard/appointments">
                <Button variant="outline" size="sm">Ver Todas</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : recentAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay citas aun</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAppointments.slice(0, 5).map((apt: unknown) => {
                    const appointment = apt as { 
                      id: string; 
                      date: string; 
                      time: string; 
                      status: string; 
                      client?: { name: string };
                      service?: { name: string };
                      specialist?: { user?: { name: string } };
                      payment?: { status: string; amount: number };
                    }
                    return (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-rose-600" />
                          </div>
                          <div>
                            <p className="font-medium">{appointment.client?.name}</p>
                            <p className="text-sm text-gray-500">{appointment.service?.name}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(appointment.date).toLocaleDateString()} - {appointment.time}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={appointment.status === 'CONFIRMED' ? 'default' : 'outline'}>
                            {appointment.status}
                          </Badge>
                          <p className="text-sm font-medium mt-1">
                            ${(appointment.payment?.amount || 0) / 100}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

// Specialist Dashboard
function SpecialistDashboard({ user, signOut }: { user: User; signOut: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-orange-400 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">AgendaYa</span>
            <Badge variant="secondary" className="ml-2">Especialista</Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Hola, {user.name}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Mi Agenda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No tienes citas programadas</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

// Super Admin Dashboard
function SuperAdminDashboard({ user, signOut }: { user: User; signOut: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-orange-400 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">AgendaYa</span>
            <Badge className="ml-2 bg-gradient-to-r from-rose-500 to-orange-400">Super Admin</Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.name}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Panel de Administracion</h1>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Store className="w-8 h-8 text-rose-500 mb-4" />
              <h3 className="font-semibold text-lg">Negocios</h3>
              <p className="text-sm text-gray-500">Gestionar todos los negocios</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Users className="w-8 h-8 text-orange-500 mb-4" />
              <h3 className="font-semibold text-lg">Usuarios</h3>
              <p className="text-sm text-gray-500">Ver todos los usuarios</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Settings className="w-8 h-8 text-green-500 mb-4" />
              <h3 className="font-semibold text-lg">Configuracion</h3>
              <p className="text-sm text-gray-500">Ajustes de la plataforma</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
