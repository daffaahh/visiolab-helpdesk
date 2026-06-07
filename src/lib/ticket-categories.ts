// Konfigurasi field dinamis per kategori jasa.
// Tiap kategori punya field isian beda-beda, TAPI semua disimpan di SATU kolom
// JSONB (TicketDetail.customFields) — bukan tabel terpisah per kategori.
// Tambah/ubah kategori cukup edit file ini, tanpa migrasi DB.

export type CategoryFieldType = "text" | "number" | "select" | "url" | "textarea";

export interface CategoryField {
  name: string; // key di dalam customFields JSON
  label: string;
  type: CategoryFieldType;
  options?: string[]; // khusus type "select"
  placeholder?: string;
}

// Pilihan platform sosial media (dipakai Graphic Design & Video Editing)
const SOCIAL_PLATFORMS = [
  "Instagram Story",
  "Instagram Feed",
  "Instagram Reels",
  "TikTok",
  "YouTube",
  "YouTube Shorts",
  "Facebook",
  "X / Twitter",
  "Lainnya",
];

// Field "supporting asset" — link Google Drive aset dari client (dipakai semua kategori)
const SUPPORTING_ASSET: CategoryField = {
  name: "supportingAsset",
  label: "Supporting Asset",
  type: "url",
  placeholder: "Link Google Drive aset dari client",
};

// categoryId (lihat prisma/seed.ts) -> daftar field-nya
export const CATEGORY_FIELDS: Record<number, CategoryField[]> = {
  1: [
    // Graphic Design — cukup platform + supporting asset
    { name: "platform", label: "Platform", type: "select", options: SOCIAL_PLATFORMS },
    SUPPORTING_ASSET,
  ],
  2: [
    // Video Editing — durasi + platform + supporting asset (resolusi dihapus)
    { name: "duration", label: "Durasi (detik)", type: "number", placeholder: "60" },
    { name: "platform", label: "Platform", type: "select", options: SOCIAL_PLATFORMS },
    SUPPORTING_ASSET,
  ],
  3: [
    // UI/UX Design
    { name: "platform", label: "Platform", type: "select", options: ["Web", "iOS", "Android", "Desktop"] },
    { name: "screens", label: "Jumlah Screen", type: "number", placeholder: "5" },
    { name: "designTool", label: "Design Tool", type: "select", options: ["Figma", "Adobe XD", "Sketch"] },
    SUPPORTING_ASSET,
  ],
  4: [
    // Web Development
    { name: "techStack", label: "Tech Stack", type: "text", placeholder: "Next.js, Tailwind, Prisma" },
    { name: "pages", label: "Jumlah Halaman", type: "number", placeholder: "10" },
    { name: "repoUrl", label: "Repository URL", type: "url", placeholder: "https://github.com/..." },
    SUPPORTING_ASSET,
  ],
  5: [
    // 3D & Animation — cukup durasi + supporting asset
    { name: "duration", label: "Durasi Animasi (detik)", type: "number", placeholder: "30" },
    SUPPORTING_ASSET,
  ],
  6: [
    // Flyer Event — brief acara lengkap
    { name: "eventDate", label: "Tanggal Event", type: "text", placeholder: "09 June 2026" },
    { name: "venue", label: "Venue", type: "text", placeholder: "FYNE JAKARTA" },
    { name: "presentBy", label: "Present By", type: "text", placeholder: "BATAAVE" },
    { name: "theme", label: "Theme", type: "text", placeholder: "OUTBREAK" },
    { name: "talentGuest", label: "Talent / Guest", type: "textarea", placeholder: "Nama talent / guest star" },
    { name: "rsvpNumber", label: "No. RSVP", type: "text", placeholder: "0895xxxxxxxx" },
    { name: "mcPricelist", label: "MC / Pricelist", type: "textarea", placeholder: "blue: mc 1 btl\nyellow: mc 2 btl\nred: mc 3 btl" },
    { name: "outputNeeds", label: "Kebutuhan Output", type: "textarea", placeholder: "flyer jpg story, flyer jpg feed, flyer motion feed, flyer motion story" },
    { name: "photoLogoLink", label: "Link Foto & Logo", type: "url", placeholder: "https://drive.google.com/..." },
    { name: "mcPhotoLogoLink", label: "Link Foto & Logo MC", type: "url", placeholder: "https://drive.google.com/..." },
    { name: "venueLogoLink", label: "Link Logo Venue", type: "url", placeholder: "https://drive.google.com/..." },
    { name: "supportLogoLink", label: "Link Logo Support By", type: "url", placeholder: "https://drive.google.com/..." },
    { name: "mediaLogoLink", label: "Link Logo Media By", type: "url", placeholder: "https://drive.google.com/..." },
    { name: "tableLayoutLink", label: "Link Table Layout", type: "url", placeholder: "https://drive.google.com/..." },
    { ...SUPPORTING_ASSET, label: "Supporting Asset Lainnya", placeholder: "Link Google Drive aset tambahan" },
  ],
};

export function getCategoryFields(categoryId: number): CategoryField[] {
  return CATEGORY_FIELDS[categoryId] ?? [];
}

// Shared state untuk useActionState di form (didefinisikan di sini, bukan di
// file "use server", karena file Server Action hanya boleh meng-export async fn)
export type TicketActionState = {
  error?: string;
};
