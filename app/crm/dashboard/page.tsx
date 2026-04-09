import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { domoGet } from "@/lib/api-client";

export const runtime = "nodejs";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login?next=/crm/dashboard");

  const token = (session as any)?.domo_token ?? "";
  let data: any = null;
  let error = "";

  try {
    data = await domoGet<any>("/api/dashboard", token);
  } catch (err: any) {
    error = err.message;
  }

  if (error) {
    return (
      <main className="space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Error: {error}
        </div>
      </main>
    );
  }

  const r = data?.resumen ?? data ?? {};
  const fmt = (v: any) => {
    const n = Number(v);
    return isNaN(n) ? "$0" : `$${n.toLocaleString()}`;
  };

  const kpis = [
    { label: "Presupuestos pendientes", value: r.presupuestos_pendientes ?? "-" },
    { label: "Saldo a cobrar", value: fmt(r.saldo_cobrar?.total ?? r.saldo_cobrar) },
    { label: "Pendientes admin", value: r.pendientes_admin?.cantidad ?? r.pendientes_admin ?? "-" },
    { label: "Cheques próximos", value: fmt(r.cheques_proximos?.total ?? r.cheques_proximos) },
    { label: "Facturado este mes", value: fmt(data?.ingresos_mes?.total ?? r.facturado_mes) },
    { label: "Cobrado este mes", value: fmt(r.cobrado_mes) },
  ];

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Resumen de operaciones
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border bg-card p-5">
            <div className="text-xs text-muted-foreground">{kpi.label}</div>
            <div className="mt-1 text-2xl font-semibold">{kpi.value}</div>
          </div>
        ))}
      </section>

      {Array.isArray(data?.balance_cajas) && data.balance_cajas.length > 0 ? (
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="text-base font-semibold">Balance por caja</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {data.balance_cajas.map((c: any) => (
                <div key={c.caja} className="rounded-xl border p-3">
                  <div className="text-sm font-medium capitalize">{c.caja}</div>
                  <div className="text-lg font-semibold">
                    {fmt(c.saldo)}
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      ) : null}

      {data?.ordenes_por_estado ? (
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="text-base font-semibold">Órdenes por estado</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-5">
            {Object.entries(data.ordenes_por_estado as Record<string, number>).map(
              ([estado, count]) => (
                <div key={estado} className="rounded-xl border p-3 text-center">
                  <div className="text-xs text-muted-foreground capitalize">{estado}</div>
                  <div className="text-xl font-semibold">{String(count)}</div>
                </div>
              )
            )}
          </div>
        </section>
      ) : null}
    </main>
  );
}
