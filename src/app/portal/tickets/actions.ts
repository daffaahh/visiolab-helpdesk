"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { getCategoryFields, type TicketActionState } from "@/src/lib/ticket-categories";

// Parse field umum + customFields dari FormData (dipakai create & update)
function parseTicketForm(formData: FormData) {
  const title = (formData.get("title") as string)?.trim() || "";
  const description = (formData.get("description") as string)?.trim() || "";
  const priority = (formData.get("priority") as string) || "MEDIUM";
  const categoryId = Number(formData.get("categoryId"));

  const referenceLinks = ((formData.get("referenceLinks") as string) || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const customFields: Record<string, string> = {};
  for (const field of getCategoryFields(categoryId)) {
    const value = (formData.get(`cf_${field.name}`) as string)?.trim();
    if (value) customFields[field.name] = value;
  }

  const intent = (formData.get("intent") as string) || "submit";
  return { title, description, priority, categoryId, referenceLinks, customFields, intent };
}

async function getClientId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  if (!id) return null;
  const exists = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  return exists ? id : null;
}

// CREATE: bisa "submit" (PENDING) atau "draft" (DRAFT, validasi longgar)
export async function createClientTicket(
  _prevState: TicketActionState,
  formData: FormData
): Promise<TicketActionState> {
  const clientId = await getClientId();
  if (!clientId) return { error: "Sesi kedaluwarsa. Silakan logout lalu login lagi." };

  const data = parseTicketForm(formData);
  const isDraft = data.intent === "draft";

  if (!data.categoryId) return { error: "Category wajib dipilih." };
  if (!isDraft && (!data.title || !data.description)) {
    return { error: "Title & description wajib diisi untuk submit. Atau simpan sebagai draft." };
  }

  const title = data.title || "Untitled Draft";

  try {
    await prisma.ticket.create({
      data: {
        title,
        priority: data.priority,
        clientId,
        categoryId: data.categoryId,
        status: isDraft ? "DRAFT" : "PENDING",
        detail: {
          create: {
            description: data.description,
            referenceLinks: data.referenceLinks,
            customFields: Object.keys(data.customFields).length ? data.customFields : undefined,
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to create client ticket:", error);
    return { error: "Gagal menyimpan tiket. Coba lagi." };
  }

  revalidatePath("/portal/tickets");
  redirect("/portal/tickets");
}

// UPDATE: edit tiket milik sendiri (hanya saat DRAFT / PENDING)
export async function updateClientTicket(
  _prevState: TicketActionState,
  formData: FormData
): Promise<TicketActionState> {
  const clientId = await getClientId();
  if (!clientId) return { error: "Sesi kedaluwarsa. Silakan logout lalu login lagi." };

  const id = formData.get("id") as string;
  if (!id) return { error: "Tiket tidak valid." };

  const existing = await prisma.ticket.findFirst({
    where: { id, clientId },
    select: { status: true },
  });
  if (!existing) return { error: "Tiket tidak ditemukan." };
  if (existing.status !== "DRAFT" && existing.status !== "PENDING") {
    return { error: "Tiket sudah dikerjakan, tidak bisa diedit lagi." };
  }

  const data = parseTicketForm(formData);
  const isDraft = data.intent === "draft";

  if (!data.categoryId) return { error: "Category wajib dipilih." };
  if (!isDraft && (!data.title || !data.description)) {
    return { error: "Title & description wajib diisi untuk submit." };
  }

  try {
    await prisma.ticket.update({
      where: { id },
      data: {
        title: data.title || "Untitled Draft",
        priority: data.priority,
        categoryId: data.categoryId,
        status: isDraft ? "DRAFT" : "PENDING",
        detail: {
          update: {
            description: data.description,
            referenceLinks: data.referenceLinks,
            customFields: Object.keys(data.customFields).length ? data.customFields : undefined,
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to update client ticket:", error);
    return { error: "Gagal menyimpan perubahan. Coba lagi." };
  }

  revalidatePath(`/portal/tickets/${id}`);
  revalidatePath("/portal/tickets");
  redirect(`/portal/tickets/${id}`);
}

// APPROVE: client menyetujui hasil -> status DONE
export async function approveTicket(formData: FormData) {
  const clientId = await getClientId();
  if (!clientId) return;

  const id = formData.get("id") as string;
  const ticket = await prisma.ticket.findFirst({ where: { id, clientId }, select: { id: true } });
  if (!ticket) return;

  await prisma.ticket.update({ where: { id }, data: { status: "DONE" } });
  revalidatePath(`/portal/tickets/${id}`);
  revalidatePath("/portal/tickets");
}

// REVISION: client minta revisi -> status REVISION + simpan catatan & aset
export async function requestRevision(formData: FormData) {
  const clientId = await getClientId();
  if (!clientId) return;

  const id = formData.get("id") as string;
  const revisionNote = (formData.get("revisionNote") as string)?.trim() || "";
  const revisionAsset = (formData.get("revisionAsset") as string)?.trim() || null;

  const ticket = await prisma.ticket.findFirst({ where: { id, clientId }, select: { id: true } });
  if (!ticket || !revisionNote) return;

  await prisma.ticket.update({
    where: { id },
    data: {
      status: "REVISION",
      detail: { update: { revisionNote, revisionAsset } },
    },
  });
  revalidatePath(`/portal/tickets/${id}`);
  revalidatePath("/portal/tickets");
}
