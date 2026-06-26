import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft, TicketPlus } from "lucide-react";

import { authOptions } from "@/src/lib/auth";
import { lockedCategoriesForRole } from "@/src/lib/role-access";
import { prisma } from "@/src/lib/prisma";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { TicketForm } from "./ticket-form";

export const dynamic = "force-dynamic";

export default async function NewTicketPage() {
  // Role yang dikunci kategori (mis. DEVELOPER, DESIGNER) cuma eksekutor —
  // tidak boleh bikin tiket. Tendang balik ke daftar tiket mereka.
  const session = await getServerSession(authOptions);
  if (lockedCategoriesForRole(session?.user?.role)) redirect("/admin/tickets");

  // Ambil opsi dropdown: client aktif + semua kategori (paralel biar ngebut)
  const [clients, categories] = await Promise.all([
    prisma.user.findMany({
      where: { role: "CLIENT" },
      select: { id: true, name: true, companyName: true },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({ orderBy: { id: "asc" } }),
  ]);

  const clientOptions = clients.map((c) => ({
    id: c.id,
    label: `${c.name}${c.companyName ? ` — ${c.companyName}` : ""}`,
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4 sm:gap-6 border-b border-slate-100 pb-6">
        <Link href="/admin/tickets">
          <Button variant="ghost" size="icon" className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 text-slate-500 hover:text-slate-900 rounded-full bg-slate-100 hover:bg-slate-200">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">New Ticket</h1>
          <p className="text-slate-600 mt-1">Buat permintaan pekerjaan baru atas nama klien.</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-xl overflow-hidden bg-white rounded-2xl">
        <CardHeader className="bg-slate-50/70 border-b border-slate-100 px-5 py-5 sm:px-8 sm:py-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100/60 p-3 rounded-full border border-blue-200">
              <TicketPlus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-950">Ticket Information</CardTitle>
              <CardDescription className="text-slate-600 mt-0.5">
                Field detail akan menyesuaikan kategori yang dipilih.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-8">
          <TicketForm clients={clientOptions} categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
