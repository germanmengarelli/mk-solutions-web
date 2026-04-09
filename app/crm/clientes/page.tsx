import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { domoGet, domoPost } from "@/lib/api-client";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const runtime = "nodejs";

type Cliente = {
  id: number;
  razon_social: string;
  cuit: string;
  tipo: string;
  condicion_iva: string;
  activo: boolean;
  total_locaciones: number;
  total_contactos: number;
  created_at: string;
};

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const session = await auth();
  if (!session) redirect("/login?next=/crm/clientes");

  const token = (session as any)?.domo_token ?? "";
  let clientes: Cliente[] = [];
  let error = "";

  try {
    const raw = await domoGet<any>("/api/clientes", token);
    clientes = Array.isArray(raw) ? raw : raw.items ?? [];
  } catch (err: any) {
    error = err.message;
  }

  // Client-side search filter
  const query = (q ?? "").toLowerCase().trim();
  const filtered = query
    ? clientes.filter(
        (c) =>
          c.razon_social?.toLowerCase().includes(query) ||
          c.cuit?.toLowerCase().includes(query)
      )
    : clientes;

  async function onCreate(formData: FormData) {
    "use server";
    const session2 = await (await import("@/auth")).auth();
    if (!session2) redirect("/login?next=/crm/clientes");
    const tk = (session2 as any)?.domo_token ?? "";

    const razon_social = String(formData.get("razon_social") ?? "").trim();
    const cuit = String(formData.get("cuit") ?? "").trim();
    const tipo = String(formData.get("tipo") ?? "comercial").trim();
    const condicion_iva = String(formData.get("condicion_iva") ?? "consumidor_final").trim();

    if (!razon_social) throw new Error("Razón social es obligatoria");

    await domoPost("/api/clientes", tk, { razon_social, cuit, tipo, condicion_iva });
    revalidatePath("/crm/clientes");
  }

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <p className="text-sm text-muted-foreground">
          {filtered.length} de {clientes.length} cliente{clientes.length !== 1 ? "s" : ""}
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Error: {error}
        </div>
      ) : null}

      {/* Búsqueda */}
      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          className="h-11 flex-1 rounded-xl border bg-background px-4 text-sm"
          placeholder="Buscar por razón social o CUIT..."
        />
        <button className="h-11 rounded-xl bg-foreground px-6 text-sm text-background">
          Buscar
        </button>
      </form>

      {/* Formulario crear */}
      <section className="rounded-2xl border bg-card p-5">
        <h2 className="text-base font-semibold">Nuevo cliente</h2>
        <form action={onCreate} className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            name="razon_social"
            className="h-11 rounded-xl border bg-background px-3 text-sm"
            placeholder="Razón social *"
            required
          />
          <input
            name="cuit"
            className="h-11 rounded-xl border bg-background px-3 text-sm"
            placeholder="CUIT"
          />
          <select
            name="tipo"
            className="h-11 rounded-xl border bg-background px-3 text-sm"
            defaultValue="comercial"
          >
            <option value="comercial">Comercial</option>
            <option value="residencial">Residencial</option>
            <option value="industrial">Industrial</option>
            <option value="country">Country</option>
            <option value="barrio_cerrado">Barrio Cerrado</option>
          </select>
          <select
            name="condicion_iva"
            className="h-11 rounded-xl border bg-background px-3 text-sm"
            defaultValue="consumidor_final"
          >
            <option value="responsable_inscripto">Responsable Inscripto</option>
            <option value="monotributo">Monotributo</option>
            <option value="exento">Exento</option>
            <option value="consumidor_final">Consumidor Final</option>
          </select>
          <button className="h-11 rounded-xl bg-foreground text-sm text-background md:col-span-2">
            Crear cliente
          </button>
        </form>
      </section>

      {/* Tabla clickeable */}
      <div className="rounded-2xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Razón Social</th>
                <th className="px-4 py-3 font-medium">CUIT</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Cond. IVA</th>
                <th className="px-4 py-3 font-medium text-center">Locaciones</th>
                <th className="px-4 py-3 font-medium text-center">Contactos</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <Link href={`/crm/clientes/${c.id}`} className="font-medium text-foreground hover:underline">
                      {c.razon_social}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{c.cuit || "-"}</td>
                  <td className="px-4 py-3 capitalize">{c.tipo || "-"}</td>
                  <td className="px-4 py-3 capitalize">{(c.condicion_iva || "").replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-center">{c.total_locaciones ?? 0}</td>
                  <td className="px-4 py-3 text-center">{c.total_contactos ?? 0}</td>
                </tr>
              ))}
              {!filtered.length && !error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    {query ? `Sin resultados para "${query}"` : "Sin clientes registrados."}
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
