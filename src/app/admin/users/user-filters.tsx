"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/src/components/ui/input";
import { Search } from "lucide-react";
import { useTransition } from "react";

export function UserFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition(); // Biar UI ga freeze pas fetch data

  // Fungsi utama buat ngubah URL Parameters
  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1"); // Kalau search, reset selalu ke halaman 1
    
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }

    // startTransition bikin pergerakan URL lebih smooth di Next.js
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleRoleFilter = (role: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    
    if (role && role !== "ALL") {
      params.set("role", role);
    } else {
      params.delete("role");
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center">
      {/* Search Input */}
      <div className="relative w-full sm:w-72">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <Input
          type="text"
          placeholder="Search name, email, or company..."
          defaultValue={searchParams.get("q")?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9 border-slate-200 focus:border-blue-500 w-full bg-white shadow-sm text-slate-900 placeholder:text-slate-500"
        />
      </div>

      {/* Role Filter */}
      <select
        defaultValue={searchParams.get("role")?.toString() || "ALL"}
        onChange={(e) => handleRoleFilter(e.target.value)}
        className="w-full sm:w-40 h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm outline-none transition-all"
      >
        <option value="ALL">All Roles</option>
        <option value="ADMIN">Admin</option>
        <option value="STAFF">Staff</option>
        <option value="DEVELOPER">Developer</option>
        <option value="DESIGNER">Designer</option>
        <option value="CLIENT">Client</option>
      </select>
    </div>
  );
}