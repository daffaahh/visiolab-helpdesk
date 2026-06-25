import { prisma } from "@/src/lib/prisma";
import { notFound } from "next/navigation";
import EditUserForm from "./edit-form";

export default async function EditUserPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  // Tarik data user langsung dari DB
  const user = await prisma.user.findUnique({
    where: { id },
  });

  // Kalau ada orang iseng masukin ID ngasal di URL, tendang ke halaman 404
  if (!user) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4 sm:gap-6 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tighter text-slate-950">
            Edit User Profile
          </h1>
          <p className="text-slate-700 mt-1.5 font-medium text-sm sm:text-base">
            Update account credentials and system access permissions.
          </p>
        </div>
      </div>

      {/* Oper data dari DB ke Client Component */}
      <EditUserForm user={user} />
    </div>
  );
}