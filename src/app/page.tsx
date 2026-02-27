'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Users, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Menu,
  X,
  Sparkles,
  Heart,
  Dumbbell,
  Briefcase,
  GraduationCap,
  Scale,
  Laptop,
  Home as HomeIcon,
  Store,
  Loader2
} from 'lucide-react'
import { useAuth } from '@/hooks/use-api'
import type { Category } from '@/types'

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

export default function LandingPage() {
  const { isAuthenticated, loading, signOut } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success) setCategories(data.data)
      })
  }, [])

  const handleLogout = () => {
    signOut()
    window.location.reload()
  }

  const features = [
    {
      icon: Calendar,
      title: 'Gestion de Citas',
      description: 'Sistema completo para agendar y gestionar citas con validacion de pagos.'
    },
    {
      icon: Users,
      title: 'Multi-Especialista',
      description: 'Administra multiples especialistas con horarios personalizados.'
    },
    {
      icon: CreditCard,
      title: 'Control de Pagos',
      description: 'Validacion manual de comprobantes y multiples metodos de pago.'
    },
    {
      icon: Clock,
      title: 'Horarios Flexibles',
      description: 'Define horarios laborales con descansos y disponibilidad.'
    }
  ]

  const plans = [
    {
      name: 'Gratuito',
      price: '$0',
      period: '/mes',
      description: 'Para emprendedores que inician',
      features: ['1 Especialista', 'Citas ilimitadas', '1 metodo de pago'],
      popular: false
    },
    {
      name: 'Basico',
      price: '$299',
      period: '/mes',
      description: 'Para negocios en crecimiento',
      features: ['5 Especialistas', 'Citas ilimitadas', 'Metodos de pago ilimitados', 'Soporte prioritario'],
      popular: true
    },
    {
      name: 'Pro',
      price: '$599',
      period: '/mes',
      description: 'Para negocios establecidos',
      features: ['15 Especialistas', 'Todo incluido', 'Reportes avanzados', 'API access'],
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-400 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-rose-600 to-orange-500 bg-clip-text text-transparent">
                AgendaYa
              </span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Caracteristicas
              </a>
              <a href="#categories" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Categorias
              </a>
              <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Precios
              </a>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
              ) : isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost">Mi Dashboard</Button>
                  </Link>
                  <Button variant="outline" onClick={handleLogout}>Cerrar Sesion</Button>
                </>
              ) : (
                <>
                  <Link href="/auth?mode=login">
                    <Button variant="ghost">Iniciar Sesion</Button>
                  </Link>
                  <Link href="/auth?mode=register">
                    <Button className="bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-600 hover:to-orange-500">
                      Registrarse
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b px-4 py-4 space-y-4">
            <a href="#features" className="block text-gray-600">Caracteristicas</a>
            <a href="#categories" className="block text-gray-600">Categorias</a>
            <a href="#pricing" className="block text-gray-600">Precios</a>
            <div className="flex flex-col gap-2 pt-2 border-t">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button className="w-full" variant="outline">Mi Dashboard</Button>
                  </Link>
                  <Button variant="ghost" onClick={handleLogout}>Cerrar Sesion</Button>
                </>
              ) : (
                <>
                  <Link href="/auth?mode=login">
                    <Button className="w-full" variant="outline">Iniciar Sesion</Button>
                  </Link>
                  <Link href="/auth?mode=register">
                    <Button className="w-full bg-gradient-to-r from-rose-500 to-orange-400">
                      Registrarse
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-rose-100 text-rose-700 hover:bg-rose-100">
              Plataforma SaaS Multi-Tenant
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Gestiona tu negocio de{' '}
              <span className="bg-gradient-to-r from-rose-500 to-orange-400 bg-clip-text text-transparent">
                citas y servicios
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              La plataforma completa para que tu negocio gestione especialistas, servicios y reservas. 
              Validacion de pagos, horarios flexibles y mas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth?mode=register">
                <Button size="lg" className="bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-600 hover:to-orange-500 text-lg px-8">
                  Comenzar Gratis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/explore">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  <Store className="mr-2 w-5 h-5" />
                  Explorar Negocios
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Una solucion completa para gestionar tu negocio de servicios
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-orange-100 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-rose-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Categorias de Negocios
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              AgendaYa funciona para cualquier tipo de negocio de servicios
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => {
              const IconComponent = iconMap[category.icon || 'Sparkles'] || Sparkles
              return (
                <a key={category.id} href={`/explore?category=${category.id}`}>
                  <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div 
                        className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}15` }}
                      >
                        <IconComponent 
                          className="w-8 h-8" 
                          style={{ color: category.color }} 
                        />
                      </div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    </CardContent>
                  </Card>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Como funciona?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Registra tu Negocio',
                description: 'Crea tu cuenta y configura tu negocio con servicios, especialistas y horarios.'
              },
              {
                step: '02',
                title: 'Recibe Reservas',
                description: 'Los clientes exploran tus servicios y solicitan citas en los horarios disponibles.'
              },
              {
                step: '03',
                title: 'Valida y Gestiona',
                description: 'Valida los comprobantes de pago y gestiona tu agenda de manera eficiente.'
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-rose-100 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Planes y Precios
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Elige el plan que mejor se adapte a tu negocio
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative border-0 shadow-lg ${
                  plan.popular ? 'ring-2 ring-rose-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-rose-500 to-orange-400">
                      Mas Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth?mode=register" className="block mt-6">
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-600 hover:to-orange-500'
                          : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      Comenzar
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-rose-500 to-orange-400">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Listo para transformar tu negocio?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Unete a cientos de negocios que ya estan usando AgendaYa
          </p>
          <Link href="/auth?mode=register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Crear Cuenta Gratis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-400 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">AgendaYa</span>
              </div>
              <p className="text-gray-400">
                La plataforma SaaS para gestion de citas y servicios multi-tenant.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Caracteristicas</a></li>
                <li><a href="#pricing" className="hover:text-white">Precios</a></li>
                <li><a href="#categories" className="hover:text-white">Categorias</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Terminos</a></li>
                <li><a href="#" className="hover:text-white">Privacidad</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} AgendaYa. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
