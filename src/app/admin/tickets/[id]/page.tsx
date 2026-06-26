import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft, PackageCheck, RotateCcw, Send } from "lucide-react";
import { Status } from "@prisma/client";

import { authOptions } from "@/src/lib/auth";
import { lockedCategoriesForRole } from "@/src/lib/role-access";
import { prisma } from "@/src/lib/prisma";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { CATEGORY_FIELDS } from "@/src/lib/ticket-categories";
import { effectivePriority, dueInfo } from "@/src/lib/ticket-priority";
import { MaybeLink } from "@/src/components/maybe-link";
import { submitTicketOutput } from "../actions";

const STATUS_BADGE: Record<Status, string> = {
  DRAFT: "bg-slate-100 text-slate-600 border-slate-300",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  REVIEW: "bg-purple-50 text-purple-700 border-purple-200",
  REVISION: "bg-orange-50 text-orange-700 border-orange-200",
  DONE: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      client: { select: { name: true, companyName: true, email: true } },
      category: { select: { id: true, name: true } },
      detail: true,
    },
  });

  if (!ticket) notFound();

  // Role yang dikunci kategori (mis. DEVELOPER, DESIGNER) tidak boleh buka tiket
  // di luar jatah kategorinya — walau nebak URL-nya. Perlakukan seperti tidak ada.
  const session = await getServerSession(authOptions);
  const lockedCategories = lockedCategoriesForRole(session?.user?.role);
  if (lockedCategories && !lockedCategories.includes(ticket.categoryId)) notFound();

  const fieldLabels = Object.fromEntries(
    (CATEGORY_FIELDS[ticket.category.id] ?? []).map((f) => [f.name, f.label])
  );
  const customFields = (ticket.detail?.customFields as Record<string, string> | null) ?? null;
  const outputLinks = ticket.detail?.outputLinks ?? [];
  const priority = effectivePriority(ticket.priority, ticket.dueDate);
  const due = dueInfo(ticket.dueDate);
  const dueLabel = due
    ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(due.date)
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <Link href="/admin/tickets">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-slate-900 rounded-full bg-slate-100 hover:bg-slate-200">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 break-words">{ticket.title}</h1>
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
      </div>

      <Card className="border-slate-200 shadow-sm bg-white rounded-xl">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900">Client</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700">
          <div className="font-semibold text-slate-900">{ticket.client.name}</div>
          <div>{ticket.client.companyName || "-"}</div>
          <div className="text-slate-500">{ticket.client.email}</div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm bg-white rounded-xl">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900">Description</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 whitespace-pre-wrap">
          {ticket.detail?.description || <span className="text-slate-400 italic">Belum diisi (draft)</span>}
        </CardContent>
      </Card>

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

      {/* Catatan revisi dari client */}
      {ticket.status === "REVISION" && ticket.detail?.revisionNote && (
        <Card className="border-orange-200 shadow-sm bg-orange-50/40 rounded-xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-orange-600" /> Revisi dari Client
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

      {/* #7: Form output link kerjaan -> submit jadi status REVIEW */}
      <Card className="border-slate-200 shadow-sm bg-white rounded-xl">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-emerald-600" /> Hasil Pekerjaan (Output)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {outputLinks.length > 0 && (
            <div className="space-y-2 rounded-lg bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Output saat ini</p>
              {outputLinks.map((url) => (
                <div key={url}><MaybeLink value={url} /></div>
              ))}
            </div>
          )}

          {ticket.status !== "DONE" ? (
            <form action={submitTicketOutput} className="space-y-3">
              <input type="hidden" name="id" value={ticket.id} />
              <div className="space-y-2">
                <Label htmlFor="outputLinks" className="text-sm font-bold text-slate-900">
                  Link Output <span className="font-normal text-slate-400">(upload ke Drive, 1 URL per baris)</span>
                </Label>
                <textarea
                  id="outputLinks"
                  name="outputLinks"
                  rows={3}
                  defaultValue={outputLinks.join("\n")}
                  placeholder={"https://drive.google.com/..."}
                  className="flex w-full rounded-md border border-slate-300 bg-slate-50 text-slate-950 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 resize-y"
                />
              </div>
              <Button type="submit" className="h-10 px-6 font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                <Send className="h-4 w-4 mr-2" /> Submit untuk Review
              </Button>
            </form>
          ) : (
            <p className="text-sm font-semibold text-emerald-700">✓ Tiket sudah di-approve client (DONE).</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
