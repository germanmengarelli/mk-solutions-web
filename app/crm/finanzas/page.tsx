import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { domoGet } from "@/lib/api-client";

export const runtime = "nodejs";

type Movimiento = {
  id: number;
  tipo: string;
  categoria: string;
  descripcion: string;
  monto: number;
  fecha: string;
  caja: string;
  usuario_nombre: string;
  cliente_nombre: string;
};

export default async function FinanzasPage() {
  const session = await auth();
  if (!session) redirect("/login?next=/crm/finanzas");

  const token = (session as any)?.domo_token ?? "";
  const role = (session as any)?.role ?? "";

  if (role !== "admin") {
    return (
      <main className="space-y-6">
        <h1 className="text-2xl font-semibold">Finanzas</h1>
        <div className="rounded-xl border p-4 text-sm text-muted-foreground">
          No tenés permisos para acceder a este módulo.
        </div>
      </main>
    );
  }

  let movimientos: Movimiento[] = [];
  let error = "";

  try {
    const raw = await domoGet<any>("/api/finanzas/movimientos", token);
    movimientos = Array.isArray(raw) ? raw : raw.items ?? [];
  } catch (err: any) {
    error = err.message;
  }

  const ingresos = movimientos.filter((m) => m.tipo === "ingreso").reduce((acc, m) => acc + Number(m.monto), 0);
  const egresos = movimientos.filter((m) => m.tipo === "egreso").reduce((acc, m) => acc + Number(m.monto), 0);

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Finanzas</h1>
        <p className="text-sm text-muted-foreground">
          {movimientos.length} movimiento{movimientos.length !== 1 ? "s" : ""}
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5">
          <div className="text-xs text-muted-foreground">Ingresos</div>
          <div className="mt-1 text-2xl font-semibold text-green-600">${ingresos.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <div className="text-xs text-muted-foreground">Egresos</div>
          <div className="mt-1 text-2xl font-semibold text-red-600">${egresos.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <div className="text-xs text-muted-foreground">Balance</div>
          <div className="mt-1 text-2xl font-semibold">${(ingresos - egresos).toLocaleString()}</div>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Error: {error}
        </div>
      ) : null}

      <div className="rounded-2xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 font-medium">Descripción</th>
                <th className="px-4 py-3 font-medium text-right">Monto</th>
                <th className="px-4 py-3 font-medium">Caja</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.slice(0, 50).map((m) => (
                <tr key={m.id} className="border-b last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3 text-xs">
                    {m.fecha ? new Date(m.fecha).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${m.tipo === "ingreso" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {m.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3">{m.categoria || "-"}</td>
                  <td className="px-4 py-3">{m.descripcion || "-"}</td>
                  <td className="px-4 py-3 text-right font-mono">${Number(m.monto).toLocaleString()}</td>
                  <td className="px-4 py-3 capitalize">{m.caja || "-"}</td>
                </tr>
              ))}
              {!movimientos.length && !error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Sin movimientos.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
