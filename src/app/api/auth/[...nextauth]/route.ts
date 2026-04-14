import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { prisma } from "@/src/lib/prisma";

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // Wajib JWT kalau pake Credentials
  },
  pages: {
    signIn: "/login", // Redirect ke page custom kita kalau belum login
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Cari client di Database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        // MVP Logic: Selama email ada di DB dan password "password123", tembusin.
        // Nanti kalau udah mau production, baru kita pasang bcrypt buat hash password.
        if (user && credentials.password === "password123") {
          return { 
            id: user.id, 
            email: user.email, 
            name: user.name, 
            role: user.role // Passing role biar ketahuan dia ADMIN atau CLIENT
          };
        }
        
        // Kalau email ga ada / password salah
        return null;
      }
    })
  ],
  callbacks: {
    // Inject Role ke dalam Token & Session biar bisa dibaca Middleware & UI
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  }
});

export { handler as GET, handler as POST };