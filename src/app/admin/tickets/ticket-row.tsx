"use client";

import { useRouter } from "next/navigation";
import { Status } from "@prisma/client";
import { TicketRowActions } from "./ticket-row-actions";

const STATUS_BADGE: Record<Status, string> = {
  DRAFT: "bg-slate-100 text-slate-600 border-slate-300",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  REVIEW: "bg-purple-50 text-purple-700 border-purple-200",
  REVISION: "bg-orange-50 text-orange-700 border-orange-200",
  DONE: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const PRIORITY_STYLE: Record<string, string> = {
  LOW: "text-slate-500",
  MEDIUM: "text-blue-600",
  HIGH: "text-orange-600",
  URGENT: "text-red-600",
};

export type TicketRowData = {
  id: string;
  title: string;
  status: Status;
  priority: string;
  dateLabel: string;
  dueLabel: string | null;
  dueOverdue: boolean;
  clientName: string | null;
  clientCompany: string | null;
  categoryName: string;
};

export function TicketRow({ ticket }: { ticket: TicketRowData }) {
  const router = useRouter();

  return (
    <tr
      onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
      className="hover:bg-slate-50/50 transition-colors cursor-pointer"
    >
      <td className="px-6 py-4">
        <div className="font-bold text-slate-900">{ticket.title}</div>
        <div className="text-slate-400 text-xs mt-0.5">{ticket.dateLabel}</div>
        {ticket.dueLabel && (
          <div className={`text-xs mt-0.5 font-medium ${ticket.dueOverdue ? "text-red-600" : "text-rose-500"}`}>
            Due {ticket.dueLabel}{ticket.dueOverdue ? " (lewat)" : ""}
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="text-slate-900 font-medium">{ticket.clientName}</div>
        <div className="text-slate-500 text-xs mt-0.5">{ticket.clientCompany || "-"}</div>
      </td>
      <td className="px-6 py-4 text-slate-700 font-medium">{ticket.categoryName}</td>
      <td className="px-6 py-4">
        <span className={`font-bold text-xs uppercase ${PRIORITY_STYLE[ticket.priority] || "text-slate-500"}`}>
          {ticket.priority}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_BADGE[ticket.status]}`}>
          {ticket.status.replace("_", " ")}
        </span>
      </td>
      {/* Cegah klik action menavigasi ke detail */}
      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
        <TicketRowActions ticketId={ticket.id} currentStatus={ticket.status} />
      </td>
    </tr>
  );
}
