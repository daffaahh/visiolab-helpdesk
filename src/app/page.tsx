import { redirect } from "next/navigation";

// Root "/" langsung lempar ke halaman login (default entry point Helpdesk)
export default function Home() {
  redirect("/login");
}
