'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Users,
  ArrowLeft,
  Star,
  Check,
  Loader2,
  Store
} from 'lucide-react'
import { useAuth } from '@/hooks/use-api'
import type { Business, Service, Specialist, PaymentMethod } from '@/types'

interface BusinessDetail extends Business {
  services: Service[]
  specialists: (Specialist & { schedules?: { dayOfWeek: number; startTime: string; endTime: string }[] })[]
  paymentMethods: PaymentMethod[]
  _count?: {
    specialists: number
    services: number
  }
}

const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado']

export default function BusinessDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { user, token, isAuthenticated } = useAuth()
  
  const [business, setBusiness] = useState<BusinessDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    fetchBusiness()
  }, [slug])

  const fetchBusiness = async () => {
    try {
      const response = await fetch(`/api/businesses/${slug}`)
      const data = await response.json()
      if (data.success) {
        setBusiness(data.data)
      }
    } catch (error) {
      console.error('Error fetching business:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateTimeSlots = (schedules: { dayOfWeek: number; startTime: string; endTime: string; breakStart?: string; breakEnd?: string }[]) => {
    if (!schedules || schedules.length === 0) return []
    
    const today = new Date()
    const dayOfWeek = today.getDay()
    const schedule = schedules.find(s => s.dayOfWeek === dayOfWeek)
    
    if (!schedule) return []
    
    const slots: string[] = []
    const [startH, startM] = schedule.startTime.split(':').map(Number)
    const [endH, endM] = schedule.endTime.split(':').map(Number)
    
    let currentH = startH
    let currentM = startM
    
    while (currentH < endH || (currentH === endH && currentM < endM)) {
      const time = `${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`
      
      if (schedule.breakStart && schedule.breakEnd) {
        if (time >= schedule.breakStart && time < schedule.breakEnd) {
          currentM += 30
          if (currentM >= 60) {
            currentH++
            currentM = 0
          }
          continue
        }
      }
      
      slots.push(time)
      currentM += 30
      if (currentM >= 60) {
        currentH++
        currentM = 0
      }
    }
    
    return slots
  }

  const handleBook = async () => {
    if (!isAuthenticated) {
      window.location.href = '/auth?mode=login'
      return
    }

    if (!selectedService || !selectedSpecialist || !selectedDate || !selectedTime || !token) {
      return
    }

    setBookingLoading(true)
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          businessId: business?.id,
          specialistId: selectedSpecialist.id,
          serviceId: selectedService.id,
          date: selectedDate,
          time: selectedTime
        })
      })

      const data = await response.json()
      if (data.success) {
        alert('Cita creada exitosamente! Ahora sube tu comprobante de pago.')
        window.location.href = '/my-appointments'
      } else {
        alert(data.error || 'Error al crear la cita')
      }
    } catch (error) {
      console.error('Error booking:', error)
      alert('Error al reservar')
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Store className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Negocio no encontrado</h2>
          <Link href="/explore">
            <Button>Volver a Explorar</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/explore">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-orange-400 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">AgendaYa</span>
            </div>
          </div>
        </div>
      </header>

      <div className="h-48 md:h-64 bg-gradient-to-br from-rose-400 to-orange-300 relative">
        {business.coverImage && (
          <img 
            src={business.coverImage} 
            alt={business.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 pb-12">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-24 h-24 bg-white rounded-xl border shadow-lg flex items-center justify-center -mt-16 md:mt-0">
                {business.logo ? (
                  <img src={business.logo} alt={business.name} className="w-20 h-20 object-cover rounded-lg" />
                ) : (
                  <Store className="w-12 h-12 text-rose-300" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{business.name}</h1>
                  <Badge className="bg-green-100 text-green-700">Verificado</Badge>
                  {business.category && (
                    <Badge variant="secondary">{business.category.name}</Badge>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{business.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  {business.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {business.city}, {business.state}
                    </span>
                  )}
                  {business.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {business.phone}
                    </span>
                  )}
                  {business.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {business.email}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-yellow-500">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-bold">4.8</span>
                <span className="text-gray-400 text-sm">(128 reviews)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="services">Servicios</TabsTrigger>
            <TabsTrigger value="specialists">Especialistas</TabsTrigger>
            <TabsTrigger value="payment">Metodos de Pago</TabsTrigger>
          </TabsList>

          <TabsContent value="services">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {business.services.map((service) => (
                <Card 
                  key={service.id} 
                  className={`cursor-pointer transition-all ${
                    selectedService?.id === service.id 
                      ? 'ring-2 ring-rose-500' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedService(service)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        {service.specialty && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {service.specialty.name}
                          </Badge>
                        )}
                      </div>
                      {selectedService?.id === service.id && (
                        <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {service.duration} min
                      </span>
                      <span className="text-lg font-bold text-rose-600">
                        ${(service.price / 100).toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="specialists">
            <div className="grid md:grid-cols-2 gap-4">
              {business.specialists.map((specialist) => (
                <Card 
                  key={specialist.id}
                  className={`cursor-pointer transition-all ${
                    selectedSpecialist?.id === specialist.id 
                      ? 'ring-2 ring-rose-500' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedSpecialist(specialist)}
                >
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-rose-100 rounded-xl flex items-center justify-center">
                        {specialist.photo ? (
                          <img src={specialist.photo} alt={specialist.user?.name} className="w-14 h-14 object-cover rounded-lg" />
                        ) : (
                          <Users className="w-8 h-8 text-rose-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {specialist.title} {specialist.user?.name}
                          </h3>
                          {selectedSpecialist?.id === specialist.id && (
                            <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        {specialist.specialty && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {specialist.specialty.name}
                          </Badge>
                        )}
                        <p className="text-sm text-gray-600 mt-1">{specialist.bio}</p>
                      </div>
                    </div>
                    
                    {specialist.schedules && specialist.schedules.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-gray-500 mb-2">Horario disponible:</p>
                        <div className="flex flex-wrap gap-1">
                          {specialist.schedules.map((s) => (
                            <Badge key={s.dayOfWeek} variant="outline" className="text-xs">
                              {dayNames[s.dayOfWeek].slice(0, 3)}: {s.startTime}-{s.endTime}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="payment">
            <div className="grid md:grid-cols-2 gap-4">
              {business.paymentMethods.map((method) => (
                <Card key={method.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{method.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {method.instructions && (
                      <p className="text-sm text-gray-600 mb-3">{method.instructions}</p>
                    )}
                    {method.details && (
                      <div className="bg-gray-50 p-3 rounded-lg text-sm">
                        <pre className="whitespace-pre-wrap font-mono text-xs">
                          {JSON.stringify(JSON.parse(method.details), null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {selectedService && selectedSpecialist && (
          <Card className="mt-8 border-2 border-rose-200 bg-rose-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-rose-500" />
                Reservar Cita
              </CardTitle>
              <CardDescription>
                Selecciona fecha y hora para tu cita
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Fecha</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Hora</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="">Seleccionar hora</option>
                    {generateTimeSlots(selectedSpecialist.schedules || []).map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{selectedService.name}</p>
                  <p className="text-sm text-gray-500">
                    con {selectedSpecialist.title} {selectedSpecialist.user?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-rose-600">
                    ${(selectedService.price / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">{selectedService.duration} minutos</p>
                </div>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-rose-500 to-orange-400"
                onClick={handleBook}
                disabled={!selectedDate || !selectedTime || bookingLoading}
              >
                {bookingLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {isAuthenticated ? 'Reservar Cita' : 'Inicia sesion para reservar'}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
