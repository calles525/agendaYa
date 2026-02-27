'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  MapPin, 
  Star, 
  Users, 
  Calendar,
  Store,
  Heart,
  Sparkles,
  Dumbbell,
  Briefcase,
  GraduationCap,
  Scale,
  Laptop,
  Home as HomeIcon,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import { useAuth } from '@/hooks/use-api'
import type { Category, Business } from '@/types'

const iconMap: Record<string, React.ElementType> = {
  Heart,
  Sparkles,
  Dumbbell,
  Briefcase,
  GraduationCap,
  Scale,
  Laptop,
  HomeIcon,
}

function ExploreContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || ''
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchBusinesses()
  }, [selectedCategory, selectedCity])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchBusinesses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedCity) params.append('city', selectedCity)
      if (searchQuery) params.append('search', searchQuery)

      const response = await fetch(`/api/businesses?${params.toString()}`)
      const data = await response.json()
      if (data.success) {
        setBusinesses(data.data)
      }
    } catch (error) {
      console.error('Error fetching businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchBusinesses()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Inicio
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-orange-400 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">AgendaYa</span>
              </div>
            </div>
            {!isAuthenticated ? (
              <Link href="/auth?mode=login">
                <Button variant="outline" size="sm">Iniciar Sesión</Button>
              </Link>
            ) : (
              <Link href="/dashboard">
                <Button variant="outline" size="sm">Mi Dashboard</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="bg-gradient-to-r from-rose-500 to-orange-400 rounded-2xl p-6 md:p-8 mb-8 text-white">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Explorar Negocios</h1>
          <p className="text-white/90 mb-6">Encuentra el servicio perfecto para ti</p>
          
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar negocios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48 bg-white">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" variant="secondary">
              Buscar
            </Button>
          </form>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <Button
            variant={!selectedCategory ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('')}
            className={!selectedCategory ? 'bg-gradient-to-r from-rose-500 to-orange-400' : ''}
          >
            Todas
          </Button>
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon || 'Sparkles'] || Sparkles
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? 'bg-gradient-to-r from-rose-500 to-orange-400' : ''}
              >
                <IconComponent className="w-4 h-4 mr-1" />
                {category.name}
              </Button>
            )
          })}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-12">
            <Store className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay negocios</h3>
            <p className="text-gray-500">
              No encontramos negocios con esos criterios. Prueba con otra búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <Link key={business.id} href={`/business/${business.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center">
                    {business.logo ? (
                      <img 
                        src={business.logo} 
                        alt={business.name}
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                    ) : (
                      <Store className="w-16 h-16 text-rose-300" />
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{business.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {business.city || 'Sin ubicación'}
                        </CardDescription>
                      </div>
                      {business.category && (
                        <Badge variant="secondary" className="text-xs">
                          {business.category.name}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {business.description || 'Sin descripción'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {(business as Business & { _count?: { specialists: number } })._count?.specialists || 0} especialistas
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        4.8
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    }>
      <ExploreContent />
    </Suspense>
  )
}
