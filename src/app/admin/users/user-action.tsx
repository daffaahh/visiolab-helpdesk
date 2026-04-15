"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Edit, Trash2, Clock, Power, X, Check, CalendarDays, Loader2 } from "lucide-react";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";

type UserActionsProps = {
  user: {
    id: string;
    role: string;
    activeUntil: Date | null;
  };
};

export function UserActions({ user }: UserActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // LOGIC FORTRESS: State buat Modal Extend
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const [extendDate, setExtendDate] = useState("");

  const isClient = user.role === "CLIENT";
  const isExpired = isClient && user.activeUntil ? new Date(user.activeUntil) < new Date() : false;

  // Function Hapus Data
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      if (res.ok) {
        setIsConfirmingDelete(false);
        router.refresh(); 
      }
    } catch (error) {
      console.error("Failed to delete user", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Function Extend Kontrak
  const handleExtendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendDate) return;
    
    setIsExtending(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeUntil: extendDate }),
      });

      if (res.ok) {
        setIsExtendModalOpen(false); // Tutup modal
        setExtendDate(""); // Bersihin input
        router.refresh(); // Refresh data tabel biar badge langsung ganti
      }
    } catch (error) {
      console.error("Failed to extend contract", error);
    } finally {
      setIsExtending(false);
    }
  };

  return (
    <>
      {/* ===================== MODAL EXTEND ===================== */}
      {isExtendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  {isExpired ? "Reactivate Contract" : "Extend Contract"}
                </h2>
              </div>
              <button 
                onClick={() => setIsExtendModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleExtendSubmit} className="p-6 space-y-6 text-left">
              <div className="space-y-2">
                <Label htmlFor="newDate" className="text-sm font-bold text-slate-900">
                  Select New Expiration Date
                </Label>
                <Input 
                  id="newDate" 
                  type="date"
                  required
                  value={extendDate}
                  onChange={(e) => setExtendDate(e.target.value)}
                  className="border-slate-300 focus:border-blue-600 focus:ring-blue-600/30 text-slate-950 bg-slate-50 shadow-inner [color-scheme:light] h-12"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsExtendModalOpen(false)}
                  className="w-full h-11 font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isExtending || !extendDate}
                  className="w-full h-11 font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isExtending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isExtending ? "Saving..." : "Confirm"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ======================================================== */}

      {isConfirmingDelete ? (
        <div className="flex items-center justify-end gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
          <span className="text-xs font-semibold text-red-600 mr-2">Sure?</span>
          <Button onClick={handleDelete} disabled={isDeleting} size="sm" className="h-8 bg-red-600 hover:bg-red-700 text-white px-2">
            {isDeleting ? "..." : <Check className="h-4 w-4" />}
          </Button>
          <Button onClick={() => setIsConfirmingDelete(false)} disabled={isDeleting} variant="outline" size="sm" className="h-8 px-2 border-slate-200">
            <X className="h-4 w-4 text-slate-500" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          
          {/* Tombol Extend / Reactivate (Memicu Modal Buka) */}
          {isClient && (
            <Button 
              onClick={() => setIsExtendModalOpen(true)}
              variant="outline" 
              size="sm" 
              className={`h-8 px-3 text-xs font-semibold border ${
                isExpired 
                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {isExpired ? (
                <><Power className="mr-1.5 h-3.5 w-3.5" /> Reactivate</>
              ) : (
                <><Clock className="mr-1.5 h-3.5 w-3.5" /> Extend</>
              )}
            </Button>
          )}

          <Link href={`/admin/users/${user.id}/edit`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>

          <Button 
            onClick={() => setIsConfirmingDelete(true)} 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

        </div>
      )}
    </>
  );
}