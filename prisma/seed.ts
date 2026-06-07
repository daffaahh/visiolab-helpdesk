import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Setup Connection Pool
const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

// Inject adapter ke PrismaClient
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Start seeding data untuk Visiolab Helpdesk...')

  // 1. Seed Categories (Kategori Jasa Visiolab)
  const categories = [
    { id: 1, name: 'Graphic Design' },
    { id: 2, name: 'Video Editing' },
    { id: 3, name: 'UI/UX Design' },
    { id: 4, name: 'Web Development' },
    { id: 5, name: '3D & Animation' },
    { id: 6, name: 'Flyer Event' }
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: {
        id: cat.id,
        name: cat.name,
      },
    })
  }
  console.log('✅ Categories (Services) seeded')

  // 2. Hash Password Default untuk Seeder
  const defaultPassword = await bcrypt.hash('password123', 10)

  // 3. Seed Bos Puy (ADMIN)
  await prisma.user.upsert({
    where: { email: 'puy@visiolab.id' },
    update: {},
    create: {
      email: 'puy@visiolab.id',
      name: 'Dapuy (Bos)',
      companyName: 'Visiolab',
      role: 'ADMIN',
      password: defaultPassword,
    },
  })
  
  // 4. Seed Tim Visiolab (STAFF)
  await prisma.user.upsert({
    where: { email: 'staff@visiolab.id' },
    update: {},
    create: {
      email: 'staff@visiolab.id',
      name: 'Tim Eksekutor',
      companyName: 'Visiolab',
      role: 'STAFF',
      password: defaultPassword,
    },
  })

  // 5. Seed 1 Client Test (buat login cepat: client@test.com / password123)
  const testActiveUntil = new Date()
  testActiveUntil.setFullYear(testActiveUntil.getFullYear() + 1)

  await prisma.user.upsert({
    where: { email: 'client@test.com' },
    update: {},
    create: {
      email: 'client@test.com',
      name: 'Client Test',
      companyName: 'Test Company',
      role: 'CLIENT',
      password: defaultPassword,
      phone: '+62 812 0000 0000',
      activeUntil: testActiveUntil,
    },
  })
  console.log('✅ Test client (client@test.com) seeded')

  // 6. Mass Generate 20 Dummy Clients untuk Bataave Group
  const dummyNames = [
    "Andi Saputra", "Budi Santoso", "Citra Lestari", "Dewi Maharani", "Eka Pratama",
    "Faisal Akbar", "Gita Gutawa", "Hadi Wijaya", "Indah Permatasari", "Joko Susilo",
    "Kiki Amalia", "Lukman Hakim", "Maya Septha", "Nanda Putra", "Oki Setiana",
    "Putra Dirgantara", "Qori Asyari", "Rina Nose", "Surya Saputra", "Tari Utama"
  ]

  console.log('⏳ Generating 20 dummy clients for Bataave Group...')

  for (const name of dummyNames) {
    // Generate email dinamis: andi.saputra@bataave.com
    const email = `${name.toLowerCase().replace(/\s+/g, '.')}@bataave.com`
    
    // Generate nomor HP ngacak: +62 812 xxxx xxxx
    const phone = `+62 812 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`

    // Logic Fortress: Generate tanggal expired ngacak (antara 6 bulan ke belakang sampai 1 tahun ke depan)
    // Biar di UI tabel keliatan mana yang "Active" dan "Expired"
    const randomDays = Math.floor(Math.random() * 547) - 182 // -182 hari sampai +365 hari
    const activeUntil = new Date()
    activeUntil.setDate(activeUntil.getDate() + randomDays)

    await prisma.user.upsert({
      where: { email },
      update: {}, // Biarin kosong, kalau email udah ada dia ga bakal nimpa
      create: {
        email,
        name,
        companyName: 'Bataave Group',
        role: 'CLIENT',
        password: defaultPassword,
        phone,
        activeUntil,
      },
    })
  }

  console.log('✅ 20 Bataave Clients seeded successfully')

  // 7. Seed Tickets contoh (berbagai kategori & status)
  console.log('⏳ Seeding sample tickets...')

  const testClient = await prisma.user.findUnique({ where: { email: 'client@test.com' } })
  const andi = await prisma.user.findUnique({ where: { email: 'andi.saputra@bataave.com' } })
  const budi = await prisma.user.findUnique({ where: { email: 'budi.santoso@bataave.com' } })

  const driveLink = 'https://drive.google.com/drive/folders/1CEWQV5_4Hl5GFWch70s861Ju6iAhV6A0'

  const sampleTickets = [
    {
      id: '11111111-1111-4111-8111-111111111111',
      clientId: testClient?.id,
      categoryId: 1,
      title: 'Konten Feed Promo Ramadan',
      status: 'PENDING' as const,
      priority: 'MEDIUM',
      description: 'Desain feed Instagram untuk campaign promo Ramadan.',
      referenceLinks: ['https://www.pinterest.com/ramadan-ref'],
      customFields: { platform: 'Instagram Feed', supportingAsset: driveLink },
    },
    {
      id: '22222222-2222-4222-8222-222222222222',
      clientId: testClient?.id,
      categoryId: 2,
      title: 'Video TikTok Product Launch',
      status: 'IN_PROGRESS' as const,
      priority: 'HIGH',
      description: 'Edit video teaser produk untuk TikTok, durasi 60 detik.',
      referenceLinks: [],
      customFields: { duration: '60', platform: 'TikTok', supportingAsset: driveLink },
    },
    {
      id: '33333333-3333-4333-8333-333333333333',
      clientId: testClient?.id,
      categoryId: 6,
      title: 'Flyer Event OUTBREAK',
      status: 'REVIEW' as const,
      priority: 'URGENT',
      description: 'Flyer untuk event OUTBREAK by BATAAVE.',
      referenceLinks: [],
      customFields: {
        eventDate: '09 June 2026',
        venue: 'FYNE JAKARTA',
        presentBy: 'BATAAVE',
        theme: 'OUTBREAK',
        rsvpNumber: '0895400163862',
        outputNeeds: 'flyer jpg story, flyer jpg feed, flyer motion feed, flyer motion story',
        venueLogoLink: driveLink,
        supportingAsset: driveLink,
      },
      outputLinks: ['https://drive.google.com/drive/folders/output-flyer-outbreak'],
    },
    {
      id: '44444444-4444-4444-8444-444444444444',
      clientId: testClient?.id,
      categoryId: 3,
      title: 'Draft Redesign Landing Page',
      status: 'DRAFT' as const,
      priority: 'LOW',
      description: '',
      referenceLinks: [],
      customFields: { platform: 'Web' },
    },
    {
      id: '55555555-5555-4555-8555-555555555555',
      clientId: andi?.id,
      categoryId: 4,
      title: 'Company Profile Website',
      status: 'REVISION' as const,
      priority: 'MEDIUM',
      description: 'Website company profile 5 halaman.',
      referenceLinks: [],
      customFields: { techStack: 'Next.js, Tailwind', pages: '5', supportingAsset: driveLink },
      outputLinks: ['https://staging.example.com'],
      revisionNote: 'Tolong ganti warna header jadi lebih gelap & perbesar logo.',
      revisionAsset: driveLink,
    },
    {
      id: '66666666-6666-4666-8666-666666666666',
      clientId: andi?.id,
      categoryId: 5,
      title: 'Animasi Logo 3D',
      status: 'DONE' as const,
      priority: 'MEDIUM',
      description: 'Animasi intro logo 3D 30 detik.',
      referenceLinks: [],
      customFields: { duration: '30', supportingAsset: driveLink },
      outputLinks: ['https://drive.google.com/drive/folders/output-logo-3d'],
    },
    {
      id: '77777777-7777-4777-8777-777777777777',
      clientId: budi?.id,
      categoryId: 1,
      title: 'Poster Grand Opening',
      status: 'PENDING' as const,
      priority: 'HIGH',
      description: 'Poster A3 untuk grand opening cabang baru.',
      referenceLinks: [],
      customFields: { platform: 'Instagram Story', supportingAsset: driveLink },
    },
  ]

  for (const t of sampleTickets) {
    if (!t.clientId) continue // skip kalau user referensinya tidak ada
    const { id, clientId, categoryId, title, status, priority, description, referenceLinks, customFields, ...rest } = t
    const detailExtra = rest as { outputLinks?: string[]; revisionNote?: string; revisionAsset?: string }
    await prisma.ticket.upsert({
      where: { id },
      update: {},
      create: {
        id,
        title,
        status,
        priority,
        clientId,
        categoryId,
        detail: {
          create: {
            description,
            referenceLinks,
            customFields,
            outputLinks: detailExtra.outputLinks ?? [],
            revisionNote: detailExtra.revisionNote ?? null,
            revisionAsset: detailExtra.revisionAsset ?? null,
          },
        },
      },
    })
  }
  console.log(`✅ ${sampleTickets.length} sample tickets seeded`)

  console.log('🚀 Seeding finished successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })