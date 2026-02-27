'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Clock, Plus, Loader2, ArrowLeft, Settings } from 'lucide-react'
import { useAuth } from '@/hooks/use-api'
import type { Service, Specialty } from '@/types'

export default function ServicesManagementPage() {
  const { user, business, token, isAuthenticated, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '30',
    price: '',
    specialtyId: ''
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth?mode=login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (business && token) {
      fetchData()
    }
  }, [business, token])

  const fetchData = async () => {
    if (!token || !business) return

    try {
      const [servicesData, businessData] = await Promise.all([
        fetch(`/api/services?businessId=${business.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json()),
        fetch(`/api/businesses/${business.slug}`).then(r => r.json())
      ])

      if (servicesData.success) setServices(servicesData.data)
      if (businessData.success && businessData.data.specialties) {
        setSpecialties(businessData.data.specialties)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !business) return

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          businessId: business.id,
          name: formData.name,
          description: formData.description,
          duration: parseInt(formData.duration),
          price: Math.round(parseFloat(formData.price) * 100),
          specialtyId: formData.specialtyId || null
        })
      })

      if (response.ok) {
        setShowForm(false)
        setFormData({ name: '', description: '', duration: '30', price: '', specialtyId: '' })
        fetchData()
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
            <span className="font-bold">Servicios</span>
          </div>
          <Button variant="ghost" onClick={signOut}>Cerrar Sesion</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Servicios</h1>
            <p className="text-gray-500">{services.length} servicios registrados</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-rose-500 to-orange-400"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Nuevo Servicio</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre del servicio</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Precio ($)</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Duracion (minutos)</Label>
                  <Input 
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Especialidad</Label>
                  <select 
                    className="w-full p-2 border rounded-lg"
                    value={formData.specialtyId}
                    onChange={(e) => setFormData({...formData, specialtyId: e.target.value})}
                  >
                    <option value="">Sin especialidad</option>
                    {specialties.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Label>Descripcion</Label>
                  <Input 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <Button type="submit" className="bg-gradient-to-r from-rose-500 to-orange-400">
                    Guardar
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <Card key={service.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{service.name}</h3>
                    {service.specialty && (
                      <Badge variant="secondary" className="mt-1">{service.specialty.name}</Badge>
                    )}
                  </div>
                  <span className="text-xl font-bold text-rose-600">
                    ${(service.price / 100).toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">{service.description}</p>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {service.duration} minutos
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {services.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Settings className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No hay servicios registrados</p>
              <Button 
                onClick={() => setShowForm(true)}
                className="mt-4 bg-gradient-to-r from-rose-500 to-orange-400"
              >
                Agregar Servicio
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
