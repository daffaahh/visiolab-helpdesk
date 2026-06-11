"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { createTicket } from "../actions";
import { getCategoryFields, type TicketActionState } from "@/src/lib/ticket-categories";

type Option = { id: string; label: string };

const inputClass =
  "border-slate-300 focus:border-blue-600 focus:ring-blue-600/30 text-slate-950 bg-slate-50";
const selectClass =
  "flex h-10 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-950 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600";

export function TicketForm({
  clients,
  categories,
}: {
  clients: Option[];
  categories: { id: number; name: string }[];
}) {
  const [state, formAction, pending] = useActionState<TicketActionState, FormData>(
    createTicket,
    {}
  );

  // categoryId dipantau di state biar field dinamisnya ikut berubah
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id ?? 0);
  const dynamicFields = getCategoryFields(categoryId);

  return (
    <form action={formAction} className="space-y-8">
      {state.error && (
        <div className="flex items-center gap-2 p-4 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl">
          ⚠️ {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title" className="text-sm font-bold text-slate-900">Title *</Label>
          <Input id="title" name="title" required placeholder="Judul singkat permintaan" className={inputClass} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientId" className="text-sm font-bold text-slate-900">Client *</Label>
          <select id="clientId" name="clientId" required className={selectClass}>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority" className="text-sm font-bold text-slate-900">Priority</Label>
          <select id="priority" name="priority" defaultValue="MEDIUM" className={selectClass}>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>
          <p className="text-xs text-slate-400">Otomatis naik HIGH (&lt;5 hari) / URGENT (&lt;3 hari) sesuai due date.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate" className="text-sm font-bold text-slate-900">Due Date</Label>
          <Input id="dueDate" name="dueDate" type="date" className={`${inputClass} [color-scheme:light]`} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="categoryId" className="text-sm font-bold text-slate-900">Category *</Label>
          <select
            id="categoryId"
            name="categoryId"
            required
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className={selectClass}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description" className="text-sm font-bold text-slate-900">Description *</Label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            placeholder="Jelaskan detail permintaan pekerjaan..."
            className={`${selectClass} h-auto resize-y`}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="referenceLinks" className="text-sm font-bold text-slate-900">
            Reference Links <span className="font-normal text-slate-400">(1 URL per baris)</span>
          </Label>
          <textarea
            id="referenceLinks"
            name="referenceLinks"
            rows={3}
            placeholder={"https://figma.com/...\nhttps://drive.google.com/..."}
            className={`${selectClass} h-auto resize-y`}
          />
        </div>
      </div>

      {/* Field dinamis sesuai kategori — disimpan ke customFields (JSONB) */}
      {dynamicFields.length > 0 && (
        <div className="pt-6 border-t border-slate-100 space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Detail Spesifik Kategori</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            {dynamicFields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={`cf_${field.name}`} className="text-sm font-bold text-slate-900">
                  {field.label}
                </Label>
                {field.type === "select" ? (
                  <select id={`cf_${field.name}`} name={`cf_${field.name}`} className={selectClass}>
                    <option value="">— pilih —</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    id={`cf_${field.name}`}
                    name={`cf_${field.name}`}
                    rows={3}
                    placeholder={field.placeholder}
                    className={`${selectClass} h-auto resize-y`}
                  />
                ) : (
                  <Input
                    id={`cf_${field.name}`}
                    name={`cf_${field.name}`}
                    type={field.type === "number" ? "number" : field.type === "url" ? "url" : "text"}
                    placeholder={field.placeholder}
                    className={inputClass}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
        <Link href="/admin/tickets">
          <Button type="button" variant="outline" className="h-11 px-8 font-semibold border-slate-300 bg-white hover:bg-slate-100 text-slate-950 rounded-xl">
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={pending} className="h-11 px-8 font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-xl">
          {pending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {pending ? "Saving..." : "Create Ticket"}
        </Button>
      </div>
    </form>
  );
}
