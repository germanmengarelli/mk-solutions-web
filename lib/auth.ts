import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { findUserByUsername } from "@/lib/users-store";
import { rateLimitLogin } from "@/lib/rate-limit";

const credsSchema = z.object({
  username: z.string().min(3).max(40),
  password: z.string().min(8).max(128),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "MK Login",
      credentials: { username: {}, password: {} },
      authorize: async (credentials, req) => {
        const parsed = credsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const username = parsed.data.username.trim().toLowerCase();
        const password = parsed.data.password;

        // ✅ rate limit anti ataques
        await rateLimitLogin(username, req);

        const user = await findUserByUsername(username);
        if (!user || user.active !== "true" || !user.password_hash) return null;

        const ok = await bcrypt.compare(password, String(user.password_hash));
        if (!ok) return null;

        return {
          id: String(user.user_id),
          name: String(user.name),
          role: String(user.role),
          username,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.user_id = user.id;
        token.role = (user as any).role;
        token.username = (user as any).username;
      }
      return token;
    },
    session: async ({ session, token }) => {
      (session as any).user_id = token.user_id;
      (session as any).role = token.role;
      (session as any).username = token.username;
      return session;
    },
  },
  pages: { signIn: "/login" },
});
