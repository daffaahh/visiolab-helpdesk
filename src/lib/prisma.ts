import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// 1. Setup Connection Pool (Standard SOP Prisma 7 + PG)
// SSL ditangani manual: Supabase butuh TLS tapi pakai cert chain self-signed,
// jadi sslmode di URL dibuang (biar tidak override) & verifikasi cert dimatikan
// khusus host remote. Local (localhost) tetap tanpa SSL.
const connectionString = `${process.env.DATABASE_URL}`
  .replace(/([?&])sslmode=[^&]*&?/i, "$1")
  .replace(/[?&]$/, "");
const isRemote = !/localhost|127\.0\.0\.1/.test(connectionString);

// 2. Deklarasi global biar ga kena redeclare pas hot reload
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 3. Logic Fortress: Pakai yang sudah ada atau bikin baru
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(
      new Pool({
        connectionString,
        ...(isRemote ? { ssl: { rejectUnauthorized: false } } : {}),
      })
    ),
  });

// 4. Save ke global kalau bukan di production
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;