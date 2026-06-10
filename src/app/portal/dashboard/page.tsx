import Link from "next/link";
import { getServerSession } from "next-auth";
import { Palette, Film, PenTool, Code, Box, Megaphone, ArrowRight, type LucideIcon } from "lucide-react";

import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

// Visual (ikon + warna + deskripsi) per kategori, keyed by categoryId (lihat seed)
const CATEGORY_VISUAL: Record<
  number,
  { icon: LucideIcon; color: string; bg: string; desc: string }
> = {
  1: { icon: Palette, color: "text-indigo-600", bg: "bg-indigo-50", desc: "Logo, poster, branding & materi visual." },
  2: { icon: Film, color: "text-rose-600", bg: "bg-rose-50", desc: "Editing video, motion graphic & reels." },
  3: { icon: PenTool, color: "text-sky-600", bg: "bg-sky-50", desc: "Desain antarmuka & pengalaman pengguna." },
  4: { icon: Code, color: "text-emerald-600", bg: "bg-emerald-50", desc: "Pembuatan website & aplikasi web." },
  5: { icon: Box, color: "text-amber-600", bg: "bg-amber-50", desc: "Modeling 3D & animasi." },
  6: { icon: Megaphone, color: "text-fuchsia-600", bg: "bg-fuchsia-50", desc: "Flyer & materi promosi acara." },
};

const FALLBACK = { icon: Palette, color: "text-slate-600", bg: "bg-slate-100", desc: "Permintaan jasa." };

export const dynamic = "force-dynamic";

export default async function ClientDashboard() {
  const [session, categories] = await Promise.all([
    getServerSession(authOptions),
    prisma.category.findMany({ orderBy: { id: "asc" } }),
  ]);

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Hi, {firstName} 👋</h1>
        <p className="text-slate-500 mt-1">Pilih kategori jasa untuk mengajukan tiket baru.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((cat) => {
          const visual = CATEGORY_VISUAL[cat.id] ?? FALLBACK;
          const Icon = visual.icon;

          return (
            <Link
              key={cat.id}
              href={`/portal/tickets/new?category=${cat.id}`}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-lg"
            >
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${visual.bg} mb-5`}>
                <Icon className={`h-8 w-8 ${visual.color}`} />
              </div>

              <h3 className="text-lg font-bold text-slate-900">{cat.name}</h3>
              <p className="mt-1 text-sm text-slate-500 flex-1">{visual.desc}</p>

              <span className="mt-5 inline-flex items-center text-sm font-semibold text-blue-600 transition-all group-hover:gap-2">
                Ajukan Tiket
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
