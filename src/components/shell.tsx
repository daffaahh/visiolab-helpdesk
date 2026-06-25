"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Menu, X } from "lucide-react";

import VisiolabLogo from "@/public/images/visiolab_logo.png";

/**
 * Responsive app shell: a static sidebar on desktop (lg+), and a slide-in
 * drawer toggled by a hamburger top bar on mobile/tablet.
 *
 * `nav` is the (client) navigation component for the section; tapping any link
 * inside it closes the drawer on mobile via the wrapping onClick handler.
 */
export function Shell({
  label,
  nav,
  children,
}: {
  label: string;
  nav: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar — fixed drawer on mobile, static column on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-800 bg-slate-950 text-slate-100 transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Section */}
        <div className="relative flex flex-col items-center justify-center border-b border-slate-800 py-6">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
          <Image
            src={VisiolabLogo}
            alt="Visiolab.ID Logo"
            className="mb-2 h-auto w-32 drop-shadow-md"
            priority
          />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            {label}
          </span>
        </div>

        {/* Navigation — close drawer when a link is tapped */}
        <div className="flex-1 overflow-y-auto" onClick={() => setOpen(false)}>
          {nav}
        </div>

        {/* Logout */}
        <div className="border-t border-slate-800 p-4">
          <Link
            href="/logout"
            className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-500"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center gap-3 border-b border-slate-800 bg-slate-950 px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Image
            src={VisiolabLogo}
            alt="Visiolab.ID Logo"
            className="ml-auto h-4 w-auto"
            priority
          />
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
