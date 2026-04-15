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

  // 5. Mass Generate 40 Dummy Clients untuk Bataave Group
  const dummyNames = [
    "Andi Saputra", "Budi Santoso", "Citra Lestari", "Dewi Maharani", "Eka Pratama",
    "Faisal Akbar", "Gita Gutawa", "Hadi Wijaya", "Indah Permatasari", "Joko Susilo",
    "Kiki Amalia", "Lukman Hakim", "Maya Septha", "Nanda Putra", "Oki Setiana",
    "Putra Dirgantara", "Qori Asyari", "Rina Nose", "Surya Saputra", "Tari Utama",
    "Umar Said", "Vina Panduwinata", "Wawan Kurniawan", "Xena Xaveria", "Yudi Pratama",
    "Zaki Mubarak", "Ayu Ting Ting", "Bagus Kahfi", "Caca Handika", "Deni Cagur",
    "Euis Darliah", "Fikri Haikal", "Gilang Dirga", "Hesti Purwadinata", "Irfan Hakim",
    "Jordi Onsu", "Kaesang Pangarep", "Lesti Kejora", "Melaney Ricardo", "Nunung Srimulat"
  ]

  console.log('⏳ Generating 40 dummy clients for Bataave Group...')

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

  console.log('✅ 40 Bataave Clients seeded successfully')
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