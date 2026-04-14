"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "./actions";

export default function LoginClient() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/crm";

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setErr(null);
    setLoading(true);
    formData.set("next", next);

    const result = await loginAction(formData);

    setLoading(false);
    if (result?.error) {
      setErr(result.error);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form
        action={onSubmit}
        className="w-full max-w-sm rounded-2xl border bg-card p-6"
      >
        <h1 className="text-xl font-semibold">Acceso interno</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ingresá tu email y contraseña.
        </p>

        <div className="mt-5 grid gap-3">
          <input
            className="h-11 rounded-xl border bg-background px-3"
            placeholder="Email"
            type="email"
            name="email"
            required
            autoComplete="email"
          />
          <input
            className="h-11 rounded-xl border bg-background px-3"
            placeholder="Contraseña"
            type="password"
            name="password"
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
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </div>
      </form>
    </main>
  );
}
