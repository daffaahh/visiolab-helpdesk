"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw, X } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { approveTicket, requestRevision } from "../actions";

const selectClass =
  "flex w-full rounded-md border border-slate-300 bg-slate-50 text-slate-950 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600";

export function ReviewActions({ ticketId }: { ticketId: string }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Approve */}
        <form action={approveTicket} className="flex-1">
          <input type="hidden" name="id" value={ticketId} />
          <Button
            type="submit"
            className="w-full h-11 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" /> Approve Hasil
          </Button>
        </form>

        {/* Buka modal revisi */}
        <Button
          type="button"
          onClick={() => setShowModal(true)}
          variant="outline"
          className="flex-1 h-11 font-semibold border-orange-300 text-orange-700 hover:bg-orange-50 rounded-xl"
        >
          <RotateCcw className="h-4 w-4 mr-2" /> Minta Revisi
        </Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-900">Minta Revisi</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form action={requestRevision} className="p-6 space-y-5">
              <input type="hidden" name="id" value={ticketId} />

              <div className="space-y-2">
                <Label htmlFor="revisionNote" className="text-sm font-bold text-slate-900">
                  Deskripsi Revisi *
                </Label>
                <textarea
                  id="revisionNote"
                  name="revisionNote"
                  required
                  rows={4}
                  placeholder="Jelaskan bagian yang perlu direvisi..."
                  className={`${selectClass} resize-y`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="revisionAsset" className="text-sm font-bold text-slate-900">
                  Link Supporting Asset
                </Label>
                <input
                  id="revisionAsset"
                  name="revisionAsset"
                  type="url"
                  placeholder="https://drive.google.com/..."
                  className={selectClass}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="h-10 px-5 font-semibold border-slate-300 bg-white hover:bg-slate-100 text-slate-950 rounded-xl"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="h-10 px-6 font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-xl"
                >
                  Kirim Revisi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
