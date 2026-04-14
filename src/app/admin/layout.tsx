import Link from "next/link";
import { LayoutDashboard, Ticket, Users, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar: Dark theme biar kontras dan profesional */}
      <aside className="w-64 bg-slate-950 text-slate-100 flex flex-col border-r border-slate-800">
         <div className="h-16 flex items-center px-6 border-b border-slate-800">
           <span className="font-bold text-xl tracking-tight">
             VISIO<span className="text-blue-500">LAB</span>
           </span>
         </div>
         
         <nav className="flex-1 py-6 px-4 space-y-2">
           <Link href="/admin/dashboard" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg bg-slate-800 text-white transition-all">
             <LayoutDashboard className="mr-3 h-5 w-5 text-blue-400" />
             Dashboard
           </Link>
           <Link href="/admin/tickets" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
             <Ticket className="mr-3 h-5 w-5" />
             All Tickets
           </Link>
         </nav>

         <div className="p-4 border-t border-slate-800">
            {/* Direct hit ke endpoint signout NextAuth */}
            <a href="/api/auth/signout" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all">
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </a>
         </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}