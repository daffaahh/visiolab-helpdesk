"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

// Filter kategori untuk daftar tiket client. Sengaja dibuat ringan (cuma
// kategori) — client hanya butuh menyaring tiket miliknya sendiri.
export function ClientTicketFilters({
  categories,
}: {
  categories: { id: number; name: string }[];
}) {
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
      <select
        defaultValue={searchParams.get("category")?.toString() || "ALL"}
        onChange={(e) => update("category", e.target.value)}
        className="w-full sm:w-56 h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm outline-none transition-all"
      >
        <option value="ALL">All Categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </div>
  );
}
