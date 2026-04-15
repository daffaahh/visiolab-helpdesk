import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";

// LOGIC FORTRESS: Endpoint buat Extend Contract (UPDATE)
export async function PATCH(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { name, email, password, phone, role, companyName, activeUntil } = body;
    const { id } = await params; 

    // Bikin object penampung data yang mau di-update
    const updateData: any = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone || null;
    
    // Logic Role & Company
    if (role) {
      updateData.role = role;
      updateData.companyName = role === "CLIENT" ? companyName : "Visiolab";
      if (role !== "CLIENT") updateData.activeUntil = null;
    }

    // Logic Date Contract
    if (activeUntil !== undefined) {
      updateData.activeUntil = activeUntil ? new Date(activeUntil) : null;
    }

    // Logic Password (Cuma di-update kalau user ngisi form passwordnya)
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: updateData,
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// LOGIC FORTRESS: Endpoint buat Hapus User (DELETE)
export async function DELETE(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } // <-- Update Tipe Data
) {
  try {
    // Unpack (buka) promise params-nya pakai await
    const { id } = await params;

    await prisma.user.delete({
      where: { id: id }, // <-- Sekarang ID-nya ada isinya
    });

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}