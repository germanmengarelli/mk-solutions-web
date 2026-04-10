"use client";

import { useTransition } from "react";
import { eliminarOrdenAction } from "./presupuestos-actions";
import Link from "next/link";

export default function AccionesCell({
  code,
  isAdmin,
  onMsg,
}: {
  code: string;
  isAdmin: boolean;
  onMsg: (msg: { type: "ok" | "err"; text: string }) => void;
}) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`¿Eliminar la orden ${code}? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      const result = await eliminarOrdenAction(code);
      if (result.error) onMsg({ type: "err", text: result.error });
      else onMsg({ type: "ok", text: result.message! });
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/crm/kanban/${code}`}
        className="rounded-lg border px-2 py-1 text-xs hover:bg-muted/40"
      >
        Detalle
      </Link>
      <Link
        href={`/crm/kanban/${code}/cotizacion`}
        className="rounded-lg bg-foreground px-2 py-1 text-xs text-background"
      >
        Cotización
      </Link>
      {isAdmin && (
        <button
          onClick={handleDelete}
          disabled={pending}
          className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {pending ? "..." : "Eliminar"}
        </button>
      )}
    </div>
  );
}
