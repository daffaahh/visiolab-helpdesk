"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Status } from "@prisma/client";

import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { getCategoryFields, type TicketActionState } from "@/src/lib/ticket-categories";

// Guard: hanya internal (ADMIN/STAFF) yang boleh kelola tiket dari panel admin.
async function requireInternal() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role === "CLIENT") {
    return null;
  }
  return session;
}

// CREATE: bikin Ticket (header) + TicketDetail (konten) sekaligus via nested write.
export async function createTicket(
  _prevState: TicketActionState,
  formData: FormData
): Promise<TicketActionState> {
  const session = await requireInternal();
  if (!session) return { error: "Tidak punya akses untuk membuat tiket." };

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const priority = (formData.get("priority") as string) || "MEDIUM";
  const clientId = formData.get("clientId") as string;
  const categoryId = Number(formData.get("categoryId"));

  if (!title || !description || !clientId || !categoryId) {
    return { error: "Title, client, category, dan description wajib diisi." };
  }

  // Reference links: 1 URL per baris -> array
  const referenceLinks = ((formData.get("referenceLinks") as string) || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  // Bangun customFields JSON sesuai kategori yang dipilih
  const customFields: Record<string, string> = {};
  for (const field of getCategoryFields(categoryId)) {
    const value = (formData.get(`cf_${field.name}`) as string)?.trim();
    if (value) customFields[field.name] = value;
  }

  try {
    await prisma.ticket.create({
      data: {
        title,
        priority,
        clientId,
        categoryId,
        detail: {
          create: {
            description,
            referenceLinks,
            customFields: Object.keys(customFields).length ? customFields : undefined,
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to create ticket:", error);
    return { error: "Gagal menyimpan tiket. Coba lagi." };
  }

  revalidatePath("/admin/tickets");
  redirect("/admin/tickets");
}

// UPDATE STATUS: dipanggil dari dropdown di list.
export async function updateTicketStatus(formData: FormData) {
  const session = await requireInternal();
  if (!session) return;

  const id = formData.get("id") as string;
  const status = formData.get("status") as Status;
  if (!id || !status) return;

  await prisma.ticket.update({ where: { id }, data: { status } });
  revalidatePath("/admin/tickets");
}

// SUBMIT OUTPUT: tim memasukkan link hasil kerjaan -> status jadi REVIEW.
export async function submitTicketOutput(formData: FormData) {
  const session = await requireInternal();
  if (!session) return;

  const id = formData.get("id") as string;
  if (!id) return;

  const outputLinks = ((formData.get("outputLinks") as string) || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  if (outputLinks.length === 0) return;

  await prisma.ticket.update({
    where: { id },
    data: {
      status: "REVIEW",
      detail: { update: { outputLinks } },
    },
  });
  revalidatePath(`/admin/tickets/${id}`);
  revalidatePath("/admin/tickets");
}

// DELETE: hapus tiket (detail & asset ikut terhapus via onDelete: Cascade).
export async function deleteTicket(formData: FormData) {
  const session = await requireInternal();
  if (!session) return;

  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.ticket.delete({ where: { id } });
  revalidatePath("/admin/tickets");
}
