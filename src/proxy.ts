import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Next.js 16: konvensi "middleware" diganti "proxy". Logic auth tetap sama.
export default withAuth(
  function proxy(req) {
    const role = req.nextauth.token?.role;
    const isInternal = role === "ADMIN" || role === "STAFF"; // tim Visiolab
    const isUrlAdmin = req.nextUrl.pathname.startsWith("/admin");

    // Hanya tim internal yang boleh masuk /admin; CLIENT ditendang ke portal
    if (isUrlAdmin && !isInternal) {
      return NextResponse.redirect(new URL("/portal/dashboard", req.url));
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
