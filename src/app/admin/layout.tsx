import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, Ticket, Users, LogOut } from "lucide-react";

// Pastiin path dan nama file logo putih lo bener
import VisiolabLogo from "@/public/images/visiolab_logo.png";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar: Dark theme biar kontras dan profesional */}
      <aside className="w-64 bg-slate-950 text-slate-100 flex flex-col border-r border-slate-800">
         
         {/* Logo Section */}
         <div className="flex flex-col items-center justify-center py-6 border-b border-slate-800">
           <Image 
             src={VisiolabLogo} 
             alt="Visiolab.ID Logo" 
             className="w-32 h-auto drop-shadow-md mb-2" 
             priority 
           />
           <span className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase">
             Helpdesk Portal
           </span>
         </div>
         
         {/* Navigation */}
         <nav className="flex-1 py-6 px-4 space-y-2">
           <Link href="/admin/dashboard" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg bg-slate-800 text-white transition-all">
             <LayoutDashboard className="mr-3 h-5 w-5 text-blue-400" />
             Dashboard
           </Link>
           
           <Link href="/admin/tickets" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
             <Ticket className="mr-3 h-5 w-5" />
             Tickets
           </Link>

           <Link href="/admin/users" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
             <Users className="mr-3 h-5 w-5" />
             Users
           </Link>
         </nav>

         {/* Logout */}
          <div className="p-4 border-t border-slate-800">
            <Link href="/logout" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all">
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Link>
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