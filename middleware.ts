import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminPath = req.nextauth.token?.role === "ADMIN";
    const isUrlAdmin = req.nextUrl.pathname.startsWith("/admin");

    // Kalau mau masuk /admin tapi bukan ADMIN, tendang ke /portal
    if (isUrlAdmin && !isAdminPath) {
      return NextResponse.redirect(new URL("/portal", req.url));
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