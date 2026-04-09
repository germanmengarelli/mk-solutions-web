import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { domoGet, domoPost } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

type Comprobante = {
  id: number;
  tipo: string;
  numero: string;
  cliente_nombre: string;
  monto: number;
  fecha: string;
  estado_afip: string;
  cobrado_at: string | null;
  orden_id: number;
};

export default async function ComprobantesPage() {
  const session = await auth();
  if (!session) redirect("/login?next=/crm/comprobantes");

  const token = (session as any)?.domo_token ?? "";
  let comprobantes: Comprobante[] = [];
  let error = "";

  try {
    const raw = await domoGet<any>("/api/comprobantes", token);
    comprobantes = Array.isArray(raw) ? raw : raw.items ?? [];
  } catch (err: any) {
    error = err.message;
  }

  async function onRegistrarCobro(formData: FormData) {
    "use server";
    const session2 = await (await import("@/auth")).auth();
    if (!session2) redirect("/login?next=/crm/comprobantes");
    const tk = (session2 as any)?.domo_token ?? "";

    const id = String(formData.get("id") ?? "");
    await domoPost(`/api/comprobantes/${id}/registrar-cobro`, tk, {});
    revalidatePath("/crm/comprobantes");
  }

  const totalPendiente = comprobantes
    .filter((c) => !c.cobrado_at)
    .reduce((acc, c) => acc + Number(c.monto || 0), 0);

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Comprobantes</h1>
        <p className="text-sm text-muted-foreground">
          {comprobantes.length} comprobante{comprobantes.length !== 1 ? "s" : ""} — Pendiente de cobro: ${totalPendiente.toLocaleString()}
        </p>
      </div>

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
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Número</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium text-right">Monto</th>
                <th className="px-4 py-3 font-medium">AFIP</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Cobro</th>
              </tr>
            </thead>
            <tbody>
              {comprobantes.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3 capitalize">{(c.tipo || "").replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 font-mono text-xs">{c.numero || "-"}</td>
                  <td className="px-4 py-3 font-medium">{c.cliente_nombre || "-"}</td>
                  <td className="px-4 py-3 text-right font-mono">${Number(c.monto || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${c.estado_afip === "emitido" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {c.estado_afip || "pendiente"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {c.fecha ? new Date(c.fecha).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {c.cobrado_at ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Cobrado</span>
                    ) : (
                      <form action={onRegistrarCobro} className="inline">
                        <input type="hidden" name="id" value={c.id} />
                        <button className="h-7 rounded-lg bg-foreground px-3 text-xs text-background">
                          Registrar cobro
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {!comprobantes.length && !error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Sin comprobantes.
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
