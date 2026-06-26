import { prisma } from "@/src/lib/prisma";
import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Plus, Shield, User as UserIcon, CalendarX, CalendarCheck, Headset, Code, Palette, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { UserActions } from "./user-action"; // <-- Pastikan namanya sesuai file lo kemaren (user-actions.tsx atau user-action.tsx)
import { UserFilters } from "./user-filters"; // <-- Import Remote Control kita

export default async function UsersManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  // 1. Unpack Promise searchParams (Wajib di Next.js 15)
  const sp = await searchParams;
  
  // 2. Tangkap parameter dari URL
  const query = sp.q || "";
  const roleFilter = sp.role || "";
  const currentPage = Number(sp.page) || 1;
  const itemsPerPage = 10; // Jumlah data per halaman
  
  // 3. Logic Fortress: Rakit query WHERE untuk Prisma
  const whereCondition: any = {};
  
  // Kalau ada search query, cari di nama, email, atau company (Case Insensitive)
  if (query) {
    whereCondition.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
      { companyName: { contains: query, mode: "insensitive" } },
    ];
  }

  // Kalau ada filter role, tambahin ke kondisi
  if (roleFilter) {
    whereCondition.role = roleFilter;
  }

  // 4. Hitung Total Data & Ambil Data per Halaman secara Paralel (Biar Ngebut)
  const [totalUsers, users] = await Promise.all([
    prisma.user.count({ where: whereCondition }),
    prisma.user.findMany({
      where: whereCondition,
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
      take: itemsPerPage, // Limit
      skip: (currentPage - 1) * itemsPerPage, // Offset
    })
  ]);

  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-1">Manage Visiolab admins and client access here.</p>
        </div>
        <Link href="/admin/users/add">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-lg transition-all h-10 px-4">
            <Plus className="mr-2 h-4 w-4" /> Add New User
          </Button>
        </Link>
      </div>

      {/* Logic Fortress: Pasang Remote Control di sini */}
      <UserFilters />

      {/* Data Table Section */}
      <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-xl">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Name & Company</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Contract Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const isClient = user.role === 'CLIENT';
                const isExpired = isClient && user.activeUntil ? new Date(user.activeUntil) < new Date() : false;
                const dateString = user.activeUntil ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(user.activeUntil)) : '-';

                let badgeStyle = '';
                let RoleIcon = UserIcon;

                if (user.role === 'ADMIN') {
                  badgeStyle = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                  RoleIcon = Shield;
                } else if (user.role === 'STAFF') {
                  badgeStyle = 'bg-sky-50 text-sky-700 border-sky-200';
                  RoleIcon = Headset;
                } else if (user.role === 'DEVELOPER') {
                  badgeStyle = 'bg-violet-50 text-violet-700 border-violet-200';
                  RoleIcon = Code;
                } else if (user.role === 'DESIGNER') {
                  badgeStyle = 'bg-pink-50 text-pink-700 border-pink-200';
                  RoleIcon = Palette;
                } else {
                  badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  RoleIcon = UserIcon;
                }

                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{user.name}</div>
                      <div className="text-slate-500 mt-0.5 font-medium flex items-center gap-1.5">
                        {user.companyName || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900 font-medium">{user.email}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{user.phone || 'No phone number'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeStyle}`}>
                        <RoleIcon className="w-3 h-3 mr-1.5" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {!isClient ? (
                        <span className="text-slate-400 font-medium italic text-xs">Internal Team</span>
                      ) : (
                        <div>
                          <div className={`font-semibold text-xs flex items-center gap-1 ${isExpired ? 'text-red-600' : 'text-emerald-600'}`}>
                            {isExpired ? <CalendarX className="w-3.5 h-3.5" /> : <CalendarCheck className="w-3.5 h-3.5" />}
                            {isExpired ? 'Expired' : 'Active'}
                          </div>
                          <div className="text-slate-500 text-xs mt-0.5">Until: {dateString}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                       <UserActions user={{ id: user.id, role: user.role, activeUntil: user.activeUntil }} />
                    </td>
                  </tr>
                );
              })}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* LOGIC FORTRESS: Server-Side Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="text-sm text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, totalUsers)}</span> of <span className="font-bold text-slate-900">{totalUsers}</span> results
            </div>
            
            <div className="flex items-center gap-2">
              <Link href={`?q=${query}&role=${roleFilter}&page=${currentPage > 1 ? currentPage - 1 : 1}`}>
                <Button variant="outline" size="sm" disabled={currentPage <= 1} className="h-8">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
              </Link>
              
              <div className="text-sm font-semibold text-slate-700 px-2">
                Page {currentPage} of {totalPages}
              </div>

              <Link href={`?q=${query}&role=${roleFilter}&page=${currentPage < totalPages ? currentPage + 1 : totalPages}`}>
                <Button variant="outline" size="sm" disabled={currentPage >= totalPages} className="h-8">
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}