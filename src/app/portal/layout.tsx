import Link from "next/link";
import Image from "next/image";
import { LogOut } from "lucide-react";

import { PortalSidebarNav } from "./sidebar-nav";
import VisiolabLogo from "@/public/images/visiolab_logo.png";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 text-slate-100 flex flex-col border-r border-slate-800">
        <div className="flex flex-col items-center justify-center py-6 border-b border-slate-800">
          <Image src={VisiolabLogo} alt="Visiolab.ID Logo" className="w-32 h-auto drop-shadow-md mb-2" priority />
          <span className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase">
            Client Portal
          </span>
        </div>

        <PortalSidebarNav />

        <div className="p-4 border-t border-slate-800">
          <Link href="/logout" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all">
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
