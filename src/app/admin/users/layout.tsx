import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";

// Guard: hanya ADMIN yang boleh akses User Management.
// STAFF (atau role lain) yang coba buka /admin/users* langsung dilempar balik
// ke dashboard — defense in depth, bukan cuma sembunyiin menu di sidebar.
export default async function UsersLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    redirect("/admin/dashboard");
  }

  return <>{children}</>;
}
