"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { getCategoryFields, type TicketActionState } from "@/src/lib/ticket-categories";

const inputClass =
  "border-slate-300 focus:border-blue-600 focus:ring-blue-600/30 text-slate-950 bg-slate-50";
const selectClass =
  "flex h-10 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-950 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600";

type TicketAction = (state: TicketActionState, formData: FormData) => Promise<TicketActionState>;

type InitialData = {
  id?: string;
  title?: string;
  priority?: string;
  description?: string;
  referenceLinks?: string[];
  customFields?: Record<string, string>;
};

export function ClientTicketForm({
  categories,
  defaultCategoryId,
  action,
  initial,
  allowDraft = true,
  submitLabel = "Submit Ticket",
  cancelHref = "/portal/dashboard",
}: {
  categories: { id: number; name: string }[];
  defaultCategoryId: number;
  action: TicketAction;
  initial?: InitialData;
  allowDraft?: boolean;
  submitLabel?: string;
  cancelHref?: string;
}) {
  const [state, formAction, pending] = useActionState<TicketActionState, FormData>(action, {});
  const [categoryId, setCategoryId] = useState<number>(defaultCategoryId);
  const dynamicFields = getCategoryFields(categoryId);

  return (
    <form action={formAction} className="space-y-8">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      {state.error && (
        <div className="flex items-center gap-2 p-4 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl">
          ⚠️ {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title" className="text-sm font-bold text-slate-900">Title *</Label>
          <Input id="title" name="title" required defaultValue={initial?.title} placeholder="Judul singkat permintaan" className={inputClass} />
        </div>

        <div className="space-y-2">
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

        <div className="space-y-2">
          <Label htmlFor="priority" className="text-sm font-bold text-slate-900">Priority</Label>
          <select id="priority" name="priority" defaultValue={initial?.priority ?? "MEDIUM"} className={selectClass}>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description" className="text-sm font-bold text-slate-900">Description *</Label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            defaultValue={initial?.description}
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
            defaultValue={initial?.referenceLinks?.join("\n")}
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
            {dynamicFields.map((field) => {
              const fieldId = `cf_${field.name}`;
              const initialValue = initial?.customFields?.[field.name];
              return (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={fieldId} className="text-sm font-bold text-slate-900">
                    {field.label}
                  </Label>
                  {field.type === "select" ? (
                    <select id={fieldId} name={fieldId} defaultValue={initialValue} className={selectClass}>
                      <option value="">— pilih —</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      id={fieldId}
                      name={fieldId}
                      rows={3}
                      defaultValue={initialValue}
                      placeholder={field.placeholder}
                      className={`${selectClass} h-auto resize-y`}
                    />
                  ) : (
                    <Input
                      id={fieldId}
                      name={fieldId}
                      type={field.type === "number" ? "number" : field.type === "url" ? "url" : "text"}
                      defaultValue={initialValue}
                      placeholder={field.placeholder}
                      className={inputClass}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
        <Link href={cancelHref}>
          <Button type="button" variant="outline" className="h-11 px-6 font-semibold border-slate-300 bg-white hover:bg-slate-100 text-slate-950 rounded-xl">
            Cancel
          </Button>
        </Link>

        {allowDraft && (
          <Button
            type="submit"
            name="intent"
            value="draft"
            formNoValidate
            disabled={pending}
            variant="outline"
            className="h-11 px-6 font-semibold border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded-xl"
          >
            <Save className="h-4 w-4 mr-2" /> Save as Draft
          </Button>
        )}

        <Button
          type="submit"
          name="intent"
          value="submit"
          disabled={pending}
          className="h-11 px-8 font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-xl"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {pending ? "Menyimpan..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
