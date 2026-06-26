import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { Shell } from "@/src/components/shell";
import { SidebarNav } from "./sidebar-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  return (
    <Shell label="Helpdesk Portal" nav={<SidebarNav role={role} />}>
      {children}
    </Shell>
  );
}
