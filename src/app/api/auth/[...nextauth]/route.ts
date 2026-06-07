import NextAuth from "next-auth";
import { authOptions } from "@/src/lib/auth";

// Config dipindah ke src/lib/auth.ts biar bisa dipakai ulang di Server Action
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
