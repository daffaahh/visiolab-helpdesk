import { Shell } from "@/src/components/shell";
import { SidebarNav } from "./sidebar-nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Shell label="Helpdesk Portal" nav={<SidebarNav />}>
      {children}
    </Shell>
  );
}
