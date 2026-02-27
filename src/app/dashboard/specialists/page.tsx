'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, Plus, Loader2, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/use-api'
import type { Specialist, Specialty } from '@/types'

export default function SpecialistsManagementPage() {
  const { user, business, token, isAuthenticated, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [specialists, setSpecialists] = useState<Specialist[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialtyId: '',
    title: '',
    bio: ''
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
      const [specRes, businessData] = await Promise.all([
        fetch(`/api/specialists?businessId=${business.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json()),
        fetch(`/api/businesses/${business.slug}`).then(r => r.json())
      ])

      if (specRes.success) setSpecialists(specRes.data)
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
      const response = await fetch('/api/specialists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          businessId: business.id,
          ...formData
        })
      })

      if (response.ok) {
        setShowForm(false)
        setFormData({ name: '', email: '', password: '', specialtyId: '', title: '', bio: '' })
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
            <span className="font-bold">Especialistas</span>
          </div>
          <Button variant="ghost" onClick={signOut}>Cerrar Sesion</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Especialistas</h1>
            <p className="text-gray-500">{specialists.length} especialistas registrados</p>
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
              <CardTitle>Nuevo Especialista</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre completo</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Contrasena</Label>
                  <Input 
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Especialidad</Label>
                  <select 
                    className="w-full p-2 border rounded-lg"
                    value={formData.specialtyId}
                    onChange={(e) => setFormData({...formData, specialtyId: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar</option>
                    {specialties.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Titulo (Dr., Lic., etc.)</Label>
                  <Input 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Biografia</Label>
                  <Input 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
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
          {specialists.map((spec) => (
            <Card key={spec.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-rose-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{spec.title} {spec.user?.name}</h3>
                    {spec.specialty && (
                      <Badge variant="secondary" className="mt-1">{spec.specialty.name}</Badge>
                    )}
                    <p className="text-sm text-gray-500 mt-1">{spec.bio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {specialists.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No hay especialistas registrados</p>
              <Button 
                onClick={() => setShowForm(true)}
                className="mt-4 bg-gradient-to-r from-rose-500 to-orange-400"
              >
                Agregar Especialista
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
