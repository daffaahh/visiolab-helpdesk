"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Ticket, Users } from "lucide-react";
import type { Role } from "@prisma/client";

// staffOnlyHidden: link yang TIDAK boleh muncul untuk role STAFF (mis. Users)
const LINKS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/admin/tickets", label: "Tickets", icon: Ticket, adminOnly: false },
  { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
];

export function SidebarNav({ role }: { role?: Role }) {
  const pathname = usePathname();

  // STAFF tidak punya akses ke menu admin-only (Users)
  const links = LINKS.filter((link) => !link.adminOnly || role === "ADMIN");

  return (
    <nav className="flex-1 py-6 px-4 space-y-2">
      {links.map(({ href, label, icon: Icon }) => {
        // Active kalau path sama persis ATAU sub-route-nya (mis. /admin/tickets/new)
        const active = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
              active
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Icon className={`mr-3 h-5 w-5 ${active ? "text-blue-400" : ""}`} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
