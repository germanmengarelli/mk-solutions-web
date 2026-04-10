"use client";

import { useState } from "react";
import { cambiarPasswordAction } from "./cambiar-password-action";

export default function CambiarPasswordButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function onSubmit(formData: FormData) {
    setMsg(null);
    setLoading(true);
    const result = await cambiarPasswordAction(formData);
    setLoading(false);

    if (result?.error) {
      setMsg({ type: "err", text: result.error });
    } else {
      setMsg({ type: "ok", text: result?.message ?? "Contraseña actualizada." });
      setTimeout(() => {
        setOpen(false);
        window.location.href = "/api/auth/signout";
      }, 1500);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg px-2 py-1.5 text-xs hover:bg-muted"
      >
        Cambiar contraseña
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40"
        onClick={() => !loading && setOpen(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-lg font-semibold">Cambiar contraseña</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Después de cambiarla se cerrará la sesión.
          </p>

          <form action={onSubmit} className="mt-4 grid gap-3">
            <input
              name="password_actual"
              type="password"
              className="h-11 rounded-xl border bg-background px-3 text-sm"
              placeholder="Contraseña actual"
              required
              autoComplete="current-password"
            />
            <input
              name="password_nuevo"
              type="password"
              className="h-11 rounded-xl border bg-background px-3 text-sm"
              placeholder="Nueva contraseña (mín. 8 caracteres)"
              required
              minLength={8}
              autoComplete="new-password"
            />

            {msg && (
              <div
                className={`rounded-xl border px-3 py-2 text-sm ${
                  msg.type === "ok"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {msg.text}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="h-11 flex-1 rounded-xl border text-sm font-medium disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-11 flex-1 rounded-xl bg-foreground text-sm text-background font-medium disabled:opacity-60"
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
