import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { domoGet } from "@/lib/api-client";
import { type CrmCard } from "@/lib/crm-store";
import OrdenesTable from "./ordenes-table";

export const runtime = "nodejs";

export default async function OrdenesDeVentaPage() {
  const session = await auth();
  if (!session) redirect("/login?next=/crm/presupuestos");

  const token = (session as any)?.domo_token ?? "";
  const role = (session as any)?.role ?? "";
  const isAdmin = role === "admin";

  let cards: CrmCard[] = [];
  let error = "";

  try {
    const raw = await domoGet<CrmCard[]>("/api/crm/cards", token);
    cards = Array.isArray(raw) ? raw : [];
  } catch (err: any) {
    error = err.message;
  }

  // Mostrar todas las órdenes que tienen items (ya cotizadas)
  const ordenes = cards.filter((c) => c.items && c.items.length > 0);
  // Ordenar por código descendente (más recientes primero)
  ordenes.sort((a, b) => b.code.localeCompare(a.code));

  const totalGeneral = ordenes.reduce(
    (acc, c) => acc + (c.totalVenta || 0),
    0,
  );

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Órdenes de Venta</h1>
        <p className="text-sm text-muted-foreground">
          {ordenes.length} orden{ordenes.length !== 1 ? "es" : ""} con
          cotización — Total: USD {totalGeneral.toLocaleString()}
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Error: {error}
        </div>
      ) : null}

      <OrdenesTable ordenes={ordenes} isAdmin={isAdmin} />
    </main>
  );
}
