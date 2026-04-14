import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// 1. Setup Connection Pool (Standard SOP Prisma 7 + PG)
const connectionString = `${process.env.DATABASE_URL}`;

// 2. Deklarasi global biar ga kena redeclare pas hot reload
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 3. Logic Fortress: Pakai yang sudah ada atau bikin baru
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(new Pool({ connectionString })),
  });

// 4. Save ke global kalau bukan di production
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;