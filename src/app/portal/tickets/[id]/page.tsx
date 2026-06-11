import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft, Pencil, PackageCheck, CheckCircle2, RotateCcw } from "lucide-react";
import { Status } from "@prisma/client";

import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { CATEGORY_FIELDS } from "@/src/lib/ticket-categories";
import { effectivePriority, dueInfo } from "@/src/lib/ticket-priority";
import { MaybeLink } from "@/src/components/maybe-link";
import { ReviewActions } from "./review-actions";

const STATUS_BADGE: Record<Status, string> = {
  DRAFT: "bg-slate-100 text-slate-600 border-slate-300",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  REVIEW: "bg-purple-50 text-purple-700 border-purple-200",
  REVISION: "bg-orange-50 text-orange-700 border-orange-200",
  DONE: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default async function ClientTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  // Hanya boleh lihat tiket milik sendiri
  const ticket = session?.user?.id
    ? await prisma.ticket.findFirst({
        where: { id, clientId: session.user.id },
        include: { category: { select: { id: true, name: true } }, detail: true },
      })
    : null;

  if (!ticket) notFound();

  const fieldLabels = Object.fromEntries(
    (CATEGORY_FIELDS[ticket.category.id] ?? []).map((f) => [f.name, f.label])
  );
  const customFields = (ticket.detail?.customFields as Record<string, string> | null) ?? null;
  const outputLinks = ticket.detail?.outputLinks ?? [];
  const canEdit = ticket.status === "DRAFT" || ticket.status === "PENDING";
  const priority = effectivePriority(ticket.priority, ticket.dueDate);
  const due = dueInfo(ticket.dueDate);
  const dueLabel = due
    ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(due.date)
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/portal/tickets">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-slate-900 rounded-full bg-slate-100 hover:bg-slate-200">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{ticket.title}</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {ticket.category.name} • Priority {priority}
            {dueLabel && (
              <span className={due?.overdue ? "text-red-600 font-medium" : ""}> • Due {dueLabel}{due?.overdue ? " (lewat)" : ""}</span>
            )}
          </p>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase border ${STATUS_BADGE[ticket.status]}`}>
          {ticket.status.replace("_", " ")}
        </span>
        {canEdit && (
          <Link href={`/portal/tickets/${ticket.id}/edit`}>
            <Button variant="outline" className="h-9 px-4 font-semibold border-slate-300 bg-white hover:bg-slate-100 text-slate-900 rounded-lg">
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </Button>
          </Link>
        )}
      </div>

      {/* Description */}
      <Card className="border-slate-200 shadow-sm bg-white rounded-xl">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900">Description</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 whitespace-pre-wrap">
          {ticket.detail?.description || <span className="text-slate-400 italic">Belum diisi (draft)</span>}
        </CardContent>
      </Card>

      {/* Detail kategori — link otomatis clickable */}
      {customFields && Object.keys(customFields).length > 0 && (
        <Card className="border-slate-200 shadow-sm bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">Detail Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
              {Object.entries(customFields).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-slate-500">{fieldLabels[key] || key}</dt>
                  <dd className="font-semibold text-slate-900 whitespace-pre-wrap">
                    <MaybeLink value={value} />
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Reference links */}
      {ticket.detail?.referenceLinks && ticket.detail.referenceLinks.length > 0 && (
        <Card className="border-slate-200 shadow-sm bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">Reference Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ticket.detail.referenceLinks.map((url) => (
              <div key={url}><MaybeLink value={url} /></div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* OUTPUT dari tim (#7 tampil di portal kalau sudah ada) */}
      {outputLinks.length > 0 && (
        <Card className="border-emerald-200 shadow-sm bg-emerald-50/40 rounded-xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-emerald-600" /> Hasil Pekerjaan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {outputLinks.map((url) => (
              <div key={url}><MaybeLink value={url} /></div>
            ))}

            {/* #8: Approve / Revision hanya saat status REVIEW */}
            {ticket.status === "REVIEW" && (
              <div className="pt-4 mt-2 border-t border-emerald-200">
                <ReviewActions ticketId={ticket.id} />
              </div>
            )}

            {ticket.status === "DONE" && (
              <div className="pt-3 mt-2 border-t border-emerald-200 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> Anda sudah menyetujui hasil ini.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Catatan revisi yang sedang diminta */}
      {ticket.status === "REVISION" && ticket.detail?.revisionNote && (
        <Card className="border-orange-200 shadow-sm bg-orange-50/40 rounded-xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-orange-600" /> Revisi Diminta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-slate-700 whitespace-pre-wrap">{ticket.detail.revisionNote}</p>
            {ticket.detail.revisionAsset && (
              <div>
                <span className="text-slate-500">Supporting Asset: </span>
                <MaybeLink value={ticket.detail.revisionAsset} />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
