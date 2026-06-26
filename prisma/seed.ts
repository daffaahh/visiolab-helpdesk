import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// SSL ditangani manual (Supabase pakai cert self-signed di chain).
// sslmode dibuang dari URL biar tidak override; verifikasi cert dimatikan
// khusus host remote, local tetap tanpa SSL.
const connectionString = `${process.env.DATABASE_URL}`
  .replace(/([?&])sslmode=[^&]*&?/i, '$1')
  .replace(/[?&]$/, '')
const isRemote = !/localhost|127\.0\.0\.1/.test(connectionString)

const pool = new Pool({
  connectionString,
  ...(isRemote ? { ssl: { rejectUnauthorized: false } } : {}),
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Start seeding data untuk Visiolab Helpdesk...')

  // 1. Categories (service catalog) — WAJIB ada biar fitur tiket & dashboard jalan
  const categories = [
    { id: 1, name: 'Graphic Design' },
    { id: 2, name: 'Video Editing' },
    { id: 3, name: 'UI/UX Design' },
    { id: 4, name: 'Web Development' },
    { id: 5, name: '3D & Animation' },
    { id: 6, name: 'Flyer Event' },
  ]
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: cat,
    })
  }
  console.log('✅ Categories seeded')

  // 2. Password default
  const defaultPassword = await bcrypt.hash('password123', 10)

  // 3. Admin
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
  console.log('✅ Admin seeded (puy@visiolab.id)')

  // 4. Staff
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
  console.log('✅ Staff seeded (staff@visiolab.id)')

  // 5. Developer — role internal yang di-scope ke kategori Web Development
  await prisma.user.upsert({
    where: { email: 'dev@visiolab.id' },
    update: {},
    create: {
      email: 'dev@visiolab.id',
      name: 'Tim Developer',
      companyName: 'Visiolab',
      role: 'DEVELOPER',
      password: defaultPassword,
    },
  })
  console.log('✅ Developer seeded (dev@visiolab.id)')

  // 6. Designer — role internal yang di-scope ke Graphic Design, UI/UX,
  //    3D & Animation, dan Flyer Event
  await prisma.user.upsert({
    where: { email: 'designer@visiolab.id' },
    update: {},
    create: {
      email: 'designer@visiolab.id',
      name: 'Tim Designer',
      companyName: 'Visiolab',
      role: 'DESIGNER',
      password: defaultPassword,
    },
  })
  console.log('✅ Designer seeded (designer@visiolab.id)')

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
