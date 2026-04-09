import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { domoLogin } from "@/lib/api-client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
  },

  providers: [
    Credentials({
      name: "Credenciales",
      credentials: {
        username: { label: "Email", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },

      async authorize(credentials) {
        const email = String(credentials?.username ?? "").trim();
        const password = String(credentials?.password ?? "").trim();

        if (!email || !password) return null;

        const data = await domoLogin(email, password);
        if (!data) return null;

        const { usuario, token } = data;

        return {
          id: String(usuario.id),
          name: usuario.nombre,
          email: usuario.email,
          // Custom fields carried through JWT callbacks
          user_id: String(usuario.id),
          role: usuario.rol,
          permisos: usuario.permisos,
          domo_token: token,
          cliente_id: usuario.cliente_id ? String(usuario.cliente_id) : null,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).user_id = (user as any).user_id ?? (user as any).id ?? "";
        (token as any).role = (user as any).role ?? "comercial";
        (token as any).permisos = (user as any).permisos ?? [];
        (token as any).domo_token = (user as any).domo_token ?? "";
        (token as any).cliente_id = (user as any).cliente_id ?? null;
        token.name = (user as any).name ?? token.name ?? "";
        token.email = (user as any).email ?? token.email ?? "";
      }
      return token;
    },

    async session({ session, token }) {
      (session as any).user = (session as any).user ?? {};
      (session as any).user.name = token.name ?? "";

      (session as any).user_id = (token as any).user_id ?? "";
      (session as any).role = (token as any).role ?? "";
      (session as any).permisos = (token as any).permisos ?? [];
      (session as any).domo_token = (token as any).domo_token ?? "";
      (session as any).cliente_id = (token as any).cliente_id ?? null;

      return session;
    },
  },

  debug: process.env.NODE_ENV === "development",
});
