import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, phone, role, companyName, activeUntil } = body;

    // Logic Fortress: Validasi absolute
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Cek apakah email udah dipake
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // Enkripsi Password (Salt 10 rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Format activeUntil jadi format Date yang bener buat Prisma (kalau ada isinya)
    const contractEndDate = activeUntil ? new Date(activeUntil) : null;

    // Inject ke DB
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword, // Simpen yang udah di-hash
        phone: phone || null,
        role,
        // LOGIC FORTRESS: Kalau CLIENT pake inputan, kalau ADMIN otomatis "Visiolab"
        companyName: role === "CLIENT" ? companyName : "Visiolab",
        activeUntil: role === "CLIENT" ? contractEndDate : null,
      }
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}