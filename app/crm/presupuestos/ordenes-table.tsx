"use client";

import { useState } from "react";
import Link from "next/link";
import AccionesCell from "./acciones-cell";

type CrmCardRow = {
  code: string;
  status: string;
  cliente: string;
  items: { quantity: number; price: number }[];
  totalVenta: number;
  responsable: string;
  createdAt: string;
};

const estadoColor: Record<string, string> = {
  Oportunidad: "bg-gray-100 text-gray-700",
  Propuesta: "bg-blue-100 text-blue-700",
  Facturado: "bg-yellow-100 text-yellow-700",
  Cobrado: "bg-green-100 text-green-700",
  Entregado: "bg-emerald-100 text-emerald-800",
};

function formatIso(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function OrdenesTable({
  ordenes,
  isAdmin,
}: {
  ordenes: CrmCardRow[];
  isAdmin: boolean;
}) {
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  return (
    <>
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

      <div className="rounded-2xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-center">Items</th>
                <th className="px-4 py-3 font-medium text-right">Total (USD)</th>
                <th className="px-4 py-3 font-medium">Responsable</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((card) => (
                <tr key={card.code} className="border-b last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">
                    <Link
                      href={`/crm/kanban/${card.code}`}
                      className="text-[#18417c] hover:underline"
                    >
                      {card.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium">{card.cliente}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${estadoColor[card.status] ?? "bg-gray-100"}`}
                    >
                      {card.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{card.items?.length ?? 0}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    USD {(card.totalVenta || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{card.responsable || "-"}</td>
                  <td className="px-4 py-3 text-xs">{formatIso(card.createdAt)}</td>
                  <td className="px-4 py-3">
                    <AccionesCell code={card.code} isAdmin={isAdmin} onMsg={setMsg} />
                  </td>
                </tr>
              ))}
              {!ordenes.length ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    No hay órdenes de venta con cotización generada.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
