import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { lockedCategoriesForRole } from "@/src/lib/role-access";
import { prisma } from "@/src/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Ticket, Users, Clock } from "lucide-react";

// Selalu render on-demand (query DB live, bukan prerender saat build)
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  // Role yang dikunci kategori (mis. DEVELOPER, DESIGNER) cuma hitung tiket
  // dalam jatah kategorinya.
  const lockedCategories = lockedCategoriesForRole(role);
  const ticketWhere = lockedCategories ? { categoryId: { in: lockedCategories } } : {};

  // Logic Fortress: Tarik data secara paralel biar load-nya kencang
  const [totalTickets, pendingTickets, totalClients] = await Promise.all([
    prisma.ticket.count({ where: ticketWhere }),
    prisma.ticket.count({ where: { ...ticketWhere, status: "PENDING" } }),
    prisma.user.count({ where: { role: "CLIENT" } })
  ]);

  // Nama akun yang login (fallback "there" kalau session belum kebaca)
  const name = session?.user?.name ?? "there";

  // Copywriting per role: admin lihat status agency, eksekutor fokus ke tiketnya
  let subtitle: string;
  if (lockedCategories) {
    subtitle = `Welcome back, ${name}. Here are your assigned tickets.`;
  } else if (role === "STAFF") {
    subtitle = `Welcome back, ${name}. Here are the tickets that need your attention.`;
  } else {
    subtitle = `Welcome back, ${name}. Here is your agency's current status.`;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Overview</h1>
        <p className="text-slate-500 mt-1">{subtitle}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Total Tickets</CardTitle>
            <Ticket className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{totalTickets}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Pending Approvals</CardTitle>
            <Clock className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{pendingTickets}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Active Clients</CardTitle>
            <Users className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{totalClients}</div>
          </CardContent>
        </Card>
      </div>

      {/* Nanti di bawah sini kita bisa tambahin Tabel Recent Tickets */}
    </div>
  );
}