import Link from "next/link";
import { ArrowLeft, TicketPlus } from "lucide-react";

import { prisma } from "@/src/lib/prisma";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { ClientTicketForm } from "./client-ticket-form";
import { createClientTicket } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewClientTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  const categories = await prisma.category.findMany({ orderBy: { id: "asc" } });

  // Kategori dari kartu yang diklik di dashboard; fallback ke kategori pertama
  const defaultCategoryId = Number(sp.category) || categories[0]?.id || 1;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4 sm:gap-6 border-b border-slate-100 pb-6">
        <Link href="/portal/dashboard">
          <Button variant="ghost" size="icon" className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 text-slate-500 hover:text-slate-900 rounded-full bg-slate-100 hover:bg-slate-200">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">Ajukan Tiket Baru</h1>
          <p className="text-slate-600 mt-1">Lengkapi detail permintaan pekerjaan Anda.</p>
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
          <ClientTicketForm
            categories={categories}
            defaultCategoryId={defaultCategoryId}
            action={createClientTicket}
            allowDraft
            cancelHref="/portal/dashboard"
          />
        </CardContent>
      </Card>
    </div>
  );
}
