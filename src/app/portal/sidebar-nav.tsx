"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Ticket } from "lucide-react";

const LINKS = [
  { href: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/tickets", label: "My Tickets", icon: Ticket },
];

export function PortalSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 py-6 px-4 space-y-2">
      {LINKS.map(({ href, label, icon: Icon }) => {
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
