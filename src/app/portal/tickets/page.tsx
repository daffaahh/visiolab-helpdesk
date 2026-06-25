import Link from "next/link";
import { getServerSession } from "next-auth";
import { Plus, Inbox, ChevronLeft, ChevronRight } from "lucide-react";

import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { ClientTicketRow } from "./ticket-row";
import { effectivePriority, dueInfo } from "@/src/lib/ticket-priority";

export default async function MyTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const sp = await searchParams;
  const currentPage = Number(sp.page) || 1;
  const itemsPerPage = 10;

  const session = await getServerSession(authOptions);
  const clientId = session?.user?.id;

  const where = { clientId: clientId ?? "__none__" };

  const [totalTickets, tickets] = await Promise.all([
    prisma.ticket.count({ where }),
    prisma.ticket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: itemsPerPage,
      skip: (currentPage - 1) * itemsPerPage,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        category: { select: { name: true } },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalTickets / itemsPerPage);
  const dateFmt = new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Tickets</h1>
          <p className="text-slate-500 mt-1">Daftar tiket yang sudah Anda ajukan.</p>
        </div>
        <Link href="/portal/dashboard">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-lg transition-all h-10 px-4">
            <Plus className="mr-2 h-4 w-4" /> Ajukan Tiket
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-xl">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Ticket</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((ticket) => {
                const due = dueInfo(ticket.dueDate);
                return (
                  <ClientTicketRow
                    key={ticket.id}
                    ticket={{
                      id: ticket.id,
                      title: ticket.title,
                      status: ticket.status,
                      priority: effectivePriority(ticket.priority, ticket.dueDate),
                      dateLabel: dateFmt.format(new Date(ticket.createdAt)),
                      dueLabel: due ? dateFmt.format(due.date) : null,
                      dueOverdue: due?.overdue ?? false,
                      categoryName: ticket.category.name,
                    }}
                  />
                );
              })}

              {tickets.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-slate-500">
                    <Inbox className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                    Belum ada tiket. Klik <span className="font-semibold">Ajukan Tiket</span> untuk membuat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="text-sm text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, totalTickets)}</span> of{" "}
              <span className="font-bold text-slate-900">{totalTickets}</span> tickets
            </div>
            <div className="flex items-center gap-2">
              <Link href={`?page=${currentPage > 1 ? currentPage - 1 : 1}`}>
                <Button variant="outline" size="sm" disabled={currentPage <= 1} className="h-8">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
              </Link>
              <div className="text-sm font-semibold text-slate-700 px-2">
                Page {currentPage} of {totalPages}
              </div>
              <Link href={`?page=${currentPage < totalPages ? currentPage + 1 : totalPages}`}>
                <Button variant="outline" size="sm" disabled={currentPage >= totalPages} className="h-8">
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
