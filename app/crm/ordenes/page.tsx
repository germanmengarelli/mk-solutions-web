import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { domoGet, domoPut } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

type Orden = {
  id: number;
  numero: string;
  estado: string;
  proveedor_nombre: string;
  total: number;
  fecha_estimada: string;
  observaciones: string;
  created_at: string;
};

const estadoColor: Record<string, string> = {
  borrador: "bg-gray-100 text-gray-700",
  enviada: "bg-blue-100 text-blue-700",
  confirmada: "bg-purple-100 text-purple-700",
  recibida_parcial: "bg-yellow-100 text-yellow-700",
  recibida: "bg-green-100 text-green-700",
  cancelada: "bg-red-100 text-red-700",
};

const transiciones: Record<string, string[]> = {
  borrador: ["enviada", "cancelada"],
  enviada: ["confirmada", "cancelada"],
  confirmada: ["recibida_parcial", "recibida", "cancelada"],
  recibida_parcial: ["recibida", "cancelada"],
};

export default async function OrdenesPage() {
  const session = await auth();
  if (!session) redirect("/login?next=/crm/ordenes");

  const token = (session as any)?.domo_token ?? "";
  let ordenes: Orden[] = [];
  let error = "";

  try {
    const raw = await domoGet<any>("/api/ordenes-compra", token);
    ordenes = Array.isArray(raw) ? raw : raw.items ?? [];
  } catch (err: any) {
    error = err.message;
  }

  async function onChangeEstado(formData: FormData) {
    "use server";
    const session2 = await (await import("@/auth")).auth();
    if (!session2) redirect("/login?next=/crm/ordenes");
    const tk = (session2 as any)?.domo_token ?? "";

    const id = String(formData.get("id") ?? "");
    const estado = String(formData.get("estado") ?? "");

    await domoPut(`/api/ordenes-compra/${id}/estado`, tk, { estado });
    revalidatePath("/crm/ordenes");
  }

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Órdenes de Compra</h1>
        <p className="text-sm text-muted-foreground">
          {ordenes.length} orden{ordenes.length !== 1 ? "es" : ""}
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
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Proveedor</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium">Fecha estimada</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((o) => {
                const nextStates = transiciones[o.estado] ?? [];
                return (
                  <tr key={o.id} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="px-4 py-3 font-mono text-xs">{o.numero || o.id}</td>
                    <td className="px-4 py-3 font-medium">{o.proveedor_nombre || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${estadoColor[o.estado] ?? "bg-gray-100"}`}>
                        {(o.estado || "").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      ${Number(o.total || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {o.fecha_estimada ? new Date(o.fecha_estimada).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {nextStates.length > 0 ? (
                        <form action={onChangeEstado} className="flex items-center gap-1">
                          <input type="hidden" name="id" value={o.id} />
                          <select name="estado" className="h-8 rounded-lg border bg-background px-2 text-xs">
                            {nextStates.map((s) => (
                              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                            ))}
                          </select>
                          <button className="h-8 rounded-lg bg-foreground px-3 text-xs text-background">
                            Cambiar
                          </button>
                        </form>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!ordenes.length && !error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Sin órdenes de compra.
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
