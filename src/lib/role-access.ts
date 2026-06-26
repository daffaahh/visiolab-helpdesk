import { Role } from "@prisma/client";

// Role tim internal Visiolab yang boleh masuk area /admin.
// (CLIENT bukan internal — mereka di /portal.)
export const INTERNAL_ROLES: Role[] = ["ADMIN", "STAFF", "DEVELOPER", "DESIGNER"];

export function isInternalRole(role?: Role | null): boolean {
  return !!role && INTERNAL_ROLES.includes(role);
}

// Role yang DIBATASI ke sekumpulan kategori jasa tertentu. categoryId mengacu
// ke prisma/seed.ts:
//   1 Graphic Design · 2 Video Editing · 3 UI/UX Design
//   4 Web Development · 5 3D & Animation · 6 Flyer Event
// ADMIN & STAFF tidak ada di sini = boleh lihat SEMUA kategori.
// Nambah pemisahan role↔kategori berikutnya cukup tambah entri di sini —
// listing (admin & portal), detail, dan dashboard otomatis ikut ke-scope.
export const ROLE_CATEGORY: Partial<Record<Role, number[]>> = {
  DEVELOPER: [4], // Web Development
  DESIGNER: [1, 3, 5, 6], // Graphic Design, UI/UX Design, 3D & Animation, Flyer Event
};

// Kembalikan daftar categoryId yang boleh dilihat role ini, atau null kalau
// role tersebut boleh lihat semua kategori (ADMIN/STAFF).
export function lockedCategoriesForRole(role?: Role | null): number[] | null {
  if (!role) return null;
  return ROLE_CATEGORY[role] ?? null;
}
