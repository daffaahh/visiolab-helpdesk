export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

const ORDER: PriorityLevel[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const RANK: Record<string, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, URGENT: 3 };

// Eskalasi prioritas berdasarkan due date (dihitung dinamis saat render):
//  - < 3 hari (atau lewat deadline) -> URGENT
//  - < 5 hari                       -> HIGH
// Tidak pernah MENURUNKAN prioritas manual yang sudah dipilih (ambil yang tertinggi).
export function effectivePriority(
  stored: string,
  dueDate: Date | string | null
): PriorityLevel {
  let rank = RANK[stored] ?? 1;

  if (dueDate) {
    const days = (new Date(dueDate).getTime() - Date.now()) / 86_400_000;
    if (days < 3) rank = Math.max(rank, 3);
    else if (days < 5) rank = Math.max(rank, 2);
  }

  return ORDER[rank];
}

// Info due date untuk ditampilkan (sisa hari + apakah sudah lewat)
export function dueInfo(dueDate: Date | string | null) {
  if (!dueDate) return null;
  const d = new Date(dueDate);
  const days = Math.ceil((d.getTime() - Date.now()) / 86_400_000);
  return { date: d, days, overdue: days < 0 };
}
