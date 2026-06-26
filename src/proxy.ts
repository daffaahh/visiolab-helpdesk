import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Next.js 16: konvensi "middleware" diganti "proxy". Logic auth tetap sama.
export default withAuth(
  function proxy(req) {
    const role = req.nextauth.token?.role;
    // tim Visiolab (ADMIN/STAFF/DEVELOPER) — lihat src/lib/role-access.ts
    const isInternal = role === "ADMIN" || role === "STAFF" || role === "DEVELOPER";
    const { pathname } = req.nextUrl;
    const isUrlAdmin = pathname.startsWith("/admin");

    // Hanya tim internal yang boleh masuk /admin; CLIENT ditendang ke portal
    if (isUrlAdmin && !isInternal) {
      return NextResponse.redirect(new URL("/portal/dashboard", req.url));
    }

    // User Management khusus ADMIN — STAFF ditolak walau ngetik URL langsung
    if (pathname.startsWith("/admin/users") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    // Area /portal cuma buat CLIENT; tim internal diarahkan ke dashboard admin
    if (pathname.startsWith("/portal") && isInternal) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Harus login buat akses apapun kecuali login page
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
