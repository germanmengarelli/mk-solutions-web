"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/crm";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
      callbackUrl: next,
    });

    setLoading(false);

    if (!res) {
      setErr("No hubo respuesta del servidor.");
      return;
    }

    if (res.error) {
      setErr("Usuario o contraseña incorrectos.");
      return;
    }

    router.push(res.url ?? next);
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border bg-card p-6"
      >
        <h1 className="text-xl font-semibold">Acceso CRM</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ingresá tu usuario y contraseña.
        </p>

        <div className="mt-5 grid gap-3">
          <input
            className="h-11 rounded-xl border bg-background px-3"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            spellCheck={false}
          />
          <input
            className="h-11 rounded-xl border bg-background px-3"
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {err && (
            <div className="rounded-xl border px-3 py-2 text-sm">{err}</div>
          )}

          <button
            disabled={loading}
            className="h-11 rounded-xl bg-foreground text-background font-medium disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Ingresar" }
          </button>
        </div>
      </form>
    </main>
  );
}
