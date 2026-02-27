import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import type { ApiResponse } from '@/types'

// POST /api/seed - Poblar base de datos con datos de prueba
export async function POST() {
  try {
    // Verificar si ya hay datos
    const existingCategories = await db.category.count()
    if (existingCategories > 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'La base de datos ya tiene datos',
      }, { status: 400 })
    }

    // Crear categorías
    const categories = await db.category.createMany({
      data: [
        { name: 'Salud y Bienestar', slug: 'salud-bienestar', icon: 'Heart', color: '#ef4444', sortOrder: 1 },
        { name: 'Belleza y Estética', slug: 'belleza-estetica', icon: 'Sparkles', color: '#ec4899', sortOrder: 2 },
        { name: 'Fitness y Deportes', slug: 'fitness-deportes', icon: 'Dumbbell', color: '#f97316', sortOrder: 3 },
        { name: 'Consultoría', slug: 'consultoria', icon: 'Briefcase', color: '#3b82f6', sortOrder: 4 },
        { name: 'Educación', slug: 'educacion', icon: 'GraduationCap', color: '#8b5cf6', sortOrder: 5 },
        { name: 'Legal', slug: 'legal', icon: 'Scale', color: '#6366f1', sortOrder: 6 },
        { name: 'Tecnología', slug: 'tecnologia', icon: 'Laptop', color: '#14b8a6', sortOrder: 7 },
        { name: 'Hogar y Reparaciones', slug: 'hogar-reparaciones', icon: 'Home', color: '#84cc16', sortOrder: 8 },
      ],
    })

    // Crear Super Admin
    const superAdminPassword = await hashPassword('admin123')
    const superAdmin = await db.user.create({
      data: {
        email: 'admin@agendaya.com',
        password: superAdminPassword,
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    })

    // Crear usuario Business Owner de prueba
    const ownerPassword = await hashPassword('owner123')
    const owner = await db.user.create({
      data: {
        email: 'owner@demo.com',
        password: ownerPassword,
        name: 'María García',
        phone: '+52 55 1234 5678',
        role: 'BUSINESS_OWNER',
        isActive: true,
      },
    })

    // Crear negocio de demostración
    const business = await db.business.create({
      data: {
        name: 'Spa Relax & Wellness',
        slug: 'spa-relax-wellness',
        description: 'Centro de bienestar y relajación con los mejores tratamientos de spa, masajes y terapias holísticas.',
        phone: '+52 55 1234 5678',
        email: 'contacto@sparelax.com',
        address: 'Av. Reforma 222, Col. Juárez',
        city: 'Ciudad de México',
        state: 'CDMX',
        country: 'México',
        zipCode: '06600',
        categoryId: (await db.category.findFirst({ where: { slug: 'salud-bienestar' } }))!.id,
        ownerId: owner.id,
        isVerified: true,
        subscription: {
          create: {
            plan: 'PRO',
            status: 'ACTIVE',
            maxSpecialists: 15,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
    })

    // Crear especialidades
    const specialty1 = await db.specialty.create({
      data: {
        businessId: business.id,
        name: 'Masajes',
        description: 'Terapias de relajación y descontracturantes',
        color: '#ec4899',
      },
    })

    const specialty2 = await db.specialty.create({
      data: {
        businessId: business.id,
        name: 'Faciales',
        description: 'Tratamientos faciales y rejuvenecimiento',
        color: '#8b5cf6',
      },
    })

    // Crear cliente de prueba
    const clientPassword = await hashPassword('cliente123')
    const client = await db.user.create({
      data: {
        email: 'cliente@demo.com',
        password: clientPassword,
        name: 'Juan Pérez',
        phone: '+52 55 9876 5432',
        role: 'CLIENT',
        isActive: true,
      },
    })

    // Crear especialista
    const specialistPassword = await hashPassword('spec123')
    const specialistUser = await db.user.create({
      data: {
        email: 'specialist@demo.com',
        password: specialistPassword,
        name: 'Ana López',
        phone: '+52 55 5555 4444',
        role: 'SPECIALIST',
        isActive: true,
      },
    })

    const specialist = await db.specialist.create({
      data: {
        businessId: business.id,
        userId: specialistUser.id,
        specialtyId: specialty1.id,
        title: 'Lic.',
        bio: 'Especialista en masajes terapéuticos con 5 años de experiencia.',
        isActive: true,
        schedules: {
          createMany: {
            data: [
              { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
              { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
              { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
              { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
              { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
              { dayOfWeek: 6, startTime: '10:00', endTime: '15:00' },
            ],
          },
        },
      },
    })

    // Crear servicios
    await db.service.createMany({
      data: [
        {
          businessId: business.id,
          specialtyId: specialty1.id,
          name: 'Masaje Relajante',
          description: 'Masaje suave para liberar tensiones y estrés.',
          duration: 60,
          price: 50000, // $500.00
          sortOrder: 1,
        },
        {
          businessId: business.id,
          specialtyId: specialty1.id,
          name: 'Masaje Descontracturante',
          description: 'Masaje profundo para aliviar contracturas musculares.',
          duration: 90,
          price: 75000, // $750.00
          sortOrder: 2,
        },
        {
          businessId: business.id,
          specialtyId: specialty2.id,
          name: 'Limpieza Facial Profunda',
          description: 'Limpieza completa con extracción y mascarilla.',
          duration: 60,
          price: 65000, // $650.00
          sortOrder: 3,
        },
        {
          businessId: business.id,
          specialtyId: specialty2.id,
          name: 'Tratamiento Anti-edad',
          description: 'Terapia facial con tecnología avanzada para rejuvenecer la piel.',
          duration: 75,
          price: 95000, // $950.00
          sortOrder: 4,
        },
      ],
    })

    // Crear métodos de pago
    await db.paymentMethod.createMany({
      data: [
        {
          businessId: business.id,
          name: 'Transferencia Bancaria',
          type: 'BANK_TRANSFER',
          details: JSON.stringify({
            bank: 'BBVA',
            account: '0123456789',
            holder: 'Spa Relax & Wellness S.A. de C.V.',
            clabe: '012345678901234567',
          }),
          instructions: 'Realiza la transferencia y envía el comprobante de pago.',
        },
        {
          businessId: business.id,
          name: 'Efectivo',
          type: 'CASH',
          instructions: 'Pago en efectivo al llegar a la cita.',
        },
      ],
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Base de datos poblada exitosamente',
      data: {
        superAdmin: { email: 'admin@agendaya.com', password: 'admin123' },
        owner: { email: 'owner@demo.com', password: 'owner123' },
        specialist: { email: 'specialist@demo.com', password: 'spec123' },
        client: { email: 'cliente@demo.com', password: 'cliente123' },
      },
    }, { status: 201 })

  } catch (error) {
    console.error('Error poblando base de datos:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 })
  }
}

// GET /api/seed - Verificar estado del seed
export async function GET() {
  try {
    const categoriesCount = await db.category.count()
    const usersCount = await db.user.count()
    const businessesCount = await db.business.count()

    return NextResponse.json({
      success: true,
      data: {
        isSeeded: categoriesCount > 0,
        stats: {
          categories: categoriesCount,
          users: usersCount,
          businesses: businessesCount,
        },
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Error verificando seed',
    }, { status: 500 })
  }
}
