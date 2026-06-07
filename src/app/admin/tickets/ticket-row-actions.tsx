"use client";

import { Trash2 } from "lucide-react";
import { Status } from "@prisma/client";
import { updateTicketStatus, deleteTicket } from "./actions";

const STATUSES: Status[] = ["DRAFT", "PENDING", "IN_PROGRESS", "REVIEW", "REVISION", "DONE"];

export function TicketRowActions({
  ticketId,
  currentStatus,
}: {
  ticketId: string;
  currentStatus: Status;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      {/* Ubah status: auto-submit form ke Server Action saat select berubah */}
      <form action={updateTicketStatus}>
        <input type="hidden" name="id" value={ticketId} />
        <select
          name="status"
          defaultValue={currentStatus}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </form>

      {/* Hapus: konfirmasi dulu sebelum submit ke Server Action */}
      <form
        action={deleteTicket}
        onSubmit={(e) => {
          if (!confirm("Hapus tiket ini? Detail & asset ikut terhapus.")) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={ticketId} />
        <button
          type="submit"
          title="Delete ticket"
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
