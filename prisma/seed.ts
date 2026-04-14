import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

// Setup Connection Pool
const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

// Inject adapter ke PrismaClient
const prisma = new PrismaClient({ adapter })
async function main() {
  console.log('🌱 Start seeding data untuk Visiolab Helpdesk...')

  // 1. Seed Categories (Kategori Jasa Visiolab)
  // Kita pake upsert biar kalau script di-run 2x, datanya ga double
  const categories = [
    { id: 1, name: 'Graphic Design' },
    { id: 2, name: 'Video Editing' },
    { id: 3, name: 'UI/UX Design' },
    { id: 4, name: 'Web Development' },
    { id: 5, name: '3D & Animation' }
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

  // 2. Seed Users
  // Bos Puy sebagai ADMIN
  await prisma.user.upsert({
    where: { email: 'puy@visiolab.id' },
    update: {},
    create: {
      email: 'puy@visiolab.id',
      name: 'Dapuy (Bos)',
      companyName: 'Visiolab',
      role: 'ADMIN',
    },
  })

  // Dummy Client B2B
  await prisma.user.upsert({
    where: { email: 'client@bataave.com' },
    update: {},
    create: {
      email: 'client@bataave.com',
      name: 'Bataave Group',
      companyName: 'Bataave Group',
      role: 'CLIENT',
    },
  })
  
  console.log('✅ Users seeded (Admin & Client)')
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