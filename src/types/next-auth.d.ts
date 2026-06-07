import { Role } from "@prisma/client";
import { DefaultSession } from "next-auth";

// Type augmentation: bikin role & id type-safe di seluruh app
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
