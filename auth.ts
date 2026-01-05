import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { findUserByUsername } from "@/lib/users-store";

function isTrue(v: any) {
  return String(v ?? "").trim().toLowerCase() === "true";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Importante en Vercel / proxies
  trustHost: true,

  // Si tenés AUTH_SECRET en .env.local, mejor. Si no, en dev igual levanta, pero ponelo.
  secret: process.env.AUTH_SECRET,

  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
  },

  providers: [
    Credentials({
      name: "Credenciales",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },

      async authorize(credentials) {
        const username = String(credentials?.username ?? "").trim();
        const password = String(credentials?.password ?? "").trim();

        if (!username || !password) return null;

        const user = await findUserByUsername(username);
        if (!user) return null;

        // active viene desde Sheets como TRUE/FALSE (string)
        if (!isTrue(user.active)) return null;

        const hash = String(user.password_hash ?? "").trim();
        if (!hash) return null;

        const ok = await bcrypt.compare(password, hash);
        if (!ok) return null;

        // Lo que devolvemos acá se copia a "user" en el callback jwt
        return {
          id: String(user.user_id),
          name: String(user.name ?? user.username),
          email: String(user.email ?? ""),
          user_id: String(user.user_id),
          role: String(user.role ?? "sales"),
          username: String(user.username ?? username),
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // En el primer login, "user" viene desde authorize()
      if (user) {
        (token as any).user_id = (user as any).user_id ?? (user as any).id ?? "";
        (token as any).role = (user as any).role ?? "sales";
        (token as any).username = (user as any).username ?? "";
        token.name = (user as any).name ?? token.name ?? "";
        token.email = (user as any).email ?? token.email ?? "";
      }
      return token;
    },

    async session({ session, token }) {
      // session.user puede venir undefined -> lo aseguramos
      (session as any).user = (session as any).user ?? {};
      (session as any).user.name = (session as any).user.name ?? (token.name ?? "");

      (session as any).user_id = (token as any).user_id ?? "";
      (session as any).role = (token as any).role ?? "";
      (session as any).username = (token as any).username ?? "";

      return session;
    },
  },

  debug: process.env.NODE_ENV === "development",
});
