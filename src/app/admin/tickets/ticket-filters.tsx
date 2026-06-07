"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Search } from "lucide-react";
import { Input } from "@/src/components/ui/input";

const STATUS_OPTIONS = ["DRAFT", "PENDING", "IN_PROGRESS", "REVIEW", "REVISION", "DONE"];

export function TicketFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (value && value !== "ALL") params.set(key, value);
    else params.delete(key);
    startTransition(() => router.replace(`${pathname}?${params.toString()}`));
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center">
      <div className="relative w-full sm:w-72">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <Input
          type="text"
          placeholder="Search ticket or client..."
          defaultValue={searchParams.get("q")?.toString()}
          onChange={(e) => update("q", e.target.value)}
          className="pl-9 border-slate-200 focus:border-blue-500 w-full bg-white shadow-sm text-slate-900 placeholder:text-slate-500"
        />
      </div>

      <select
        defaultValue={searchParams.get("status")?.toString() || "ALL"}
        onChange={(e) => update("status", e.target.value)}
        className="w-full sm:w-48 h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm outline-none transition-all"
      >
        <option value="ALL">All Status</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s.replace("_", " ")}</option>
        ))}
      </select>
    </div>
  );
}
