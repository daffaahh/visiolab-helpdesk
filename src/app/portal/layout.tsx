import { Shell } from "@/src/components/shell";
import { PortalSidebarNav } from "./sidebar-nav";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Shell label="Client Portal" nav={<PortalSidebarNav />}>
      {children}
    </Shell>
  );
}
