import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft, Pencil } from "lucide-react";

import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { ClientTicketForm } from "../../new/client-ticket-form";
import { updateClientTicket } from "../../actions";

export default async function EditClientTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const [ticket, categories] = await Promise.all([
    session?.user?.id
      ? prisma.ticket.findFirst({
          where: { id, clientId: session.user.id },
          include: { detail: true },
        })
      : null,
    prisma.category.findMany({ orderBy: { id: "asc" } }),
  ]);

  if (!ticket) notFound();

  // Hanya draft/pending yang boleh diedit
  if (ticket.status !== "DRAFT" && ticket.status !== "PENDING") {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-slate-600">Tiket ini sudah dikerjakan dan tidak bisa diedit lagi.</p>
        <Link href={`/portal/tickets/${ticket.id}`}>
          <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">Kembali ke detail</Button>
        </Link>
      </div>
    );
  }

  const isDraft = ticket.status === "DRAFT";

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-6 border-b border-slate-100 pb-6">
        <Link href={`/portal/tickets/${ticket.id}`}>
          <Button variant="ghost" size="icon" className="h-12 w-12 text-slate-500 hover:text-slate-900 rounded-full bg-slate-100 hover:bg-slate-200">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Edit Tiket</h1>
          <p className="text-slate-600 mt-1">Perbarui detail permintaan Anda.</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-xl overflow-hidden bg-white rounded-2xl">
        <CardHeader className="bg-slate-50/70 border-b border-slate-100 px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100/60 p-3 rounded-full border border-blue-200">
              <Pencil className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-950">Ticket Information</CardTitle>
              <CardDescription className="text-slate-600 mt-0.5">
                {isDraft ? "Simpan sebagai draft atau submit untuk dikerjakan tim." : "Simpan perubahan tiket."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <ClientTicketForm
            categories={categories}
            defaultCategoryId={ticket.categoryId}
            action={updateClientTicket}
            allowDraft={isDraft}
            submitLabel={isDraft ? "Submit Ticket" : "Save Changes"}
            cancelHref={`/portal/tickets/${ticket.id}`}
            initial={{
              id: ticket.id,
              title: ticket.title,
              priority: ticket.priority,
              dueDate: ticket.dueDate ? new Date(ticket.dueDate).toISOString().split("T")[0] : "",
              description: ticket.detail?.description ?? "",
              referenceLinks: ticket.detail?.referenceLinks ?? [],
              customFields: (ticket.detail?.customFields as Record<string, string> | null) ?? {},
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
