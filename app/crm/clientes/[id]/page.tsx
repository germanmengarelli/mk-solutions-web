import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { domoGet, domoPost, domoPut } from "@/lib/api-client";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const runtime = "nodejs";

type Locacion = {
  id: number;
  numero_cliente: string;
  nombre: string;
  domicilio: string;
};

type Contacto = {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  cargo: string;
};

type ClienteDetalle = {
  id: number;
  razon_social: string;
  cuit: string;
  tipo: string;
  condicion_iva: string;
  activo: boolean;
  created_at: string;
  locaciones: Locacion[];
  contactos: Contacto[];
};

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect(`/login?next=/crm/clientes/${id}`);

  const token = (session as any)?.domo_token ?? "";
  let cliente: ClienteDetalle | null = null;
  let error = "";

  try {
    cliente = await domoGet<ClienteDetalle>(`/api/clientes/${id}`, token);
  } catch (err: any) {
    error = err.message;
  }

  async function onUpdate(formData: FormData) {
    "use server";
    const session2 = await (await import("@/auth")).auth();
    if (!session2) redirect(`/login?next=/crm/clientes/${id}`);
    const tk = (session2 as any)?.domo_token ?? "";

    const razon_social = String(formData.get("razon_social") ?? "").trim();
    const cuit = String(formData.get("cuit") ?? "").trim();
    const tipo = String(formData.get("tipo") ?? "");
    const condicion_iva = String(formData.get("condicion_iva") ?? "");

    await domoPut(`/api/clientes/${id}`, tk, { razon_social, cuit, tipo, condicion_iva });
    revalidatePath(`/crm/clientes/${id}`);
  }

  async function onAddContacto(formData: FormData) {
    "use server";
    const session2 = await (await import("@/auth")).auth();
    if (!session2) redirect(`/login?next=/crm/clientes/${id}`);
    const tk = (session2 as any)?.domo_token ?? "";

    const nombre = String(formData.get("nombre") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const telefono = String(formData.get("telefono") ?? "").trim();
    const cargo = String(formData.get("cargo") ?? "").trim();

    if (!nombre) return;

    await domoPost(`/api/clientes/${id}/contactos`, tk, { nombre, email, telefono, cargo });
    revalidatePath(`/crm/clientes/${id}`);
  }

  async function onAddLocacion(formData: FormData) {
    "use server";
    const session2 = await (await import("@/auth")).auth();
    if (!session2) redirect(`/login?next=/crm/clientes/${id}`);
    const tk = (session2 as any)?.domo_token ?? "";

    const nombre = String(formData.get("nombre") ?? "").trim();
    const domicilio = String(formData.get("domicilio") ?? "").trim();

    if (!nombre) return;

    await domoPost(`/api/clientes/${id}/locaciones`, tk, { nombre, domicilio });
    revalidatePath(`/crm/clientes/${id}`);
  }

  if (error || !cliente) {
    return (
      <main className="space-y-6">
        <Link href="/crm/clientes" className="text-sm text-muted-foreground hover:underline">
          ← Volver a clientes
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error || "Cliente no encontrado"}
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <Link href="/crm/clientes" className="text-sm text-muted-foreground hover:underline">
        ← Volver a clientes
      </Link>

      {/* Datos del cliente — editable */}
      <section className="rounded-2xl border bg-card p-5">
        <h1 className="text-xl font-semibold">{cliente.razon_social}</h1>
        <form action={onUpdate} className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            name="razon_social"
            defaultValue={cliente.razon_social}
            className="h-11 rounded-xl border bg-background px-3 text-sm"
            placeholder="Razón social *"
            required
          />
          <input
            name="cuit"
            defaultValue={cliente.cuit}
            className="h-11 rounded-xl border bg-background px-3 text-sm"
            placeholder="CUIT"
          />
          <select
            name="tipo"
            defaultValue={cliente.tipo}
            className="h-11 rounded-xl border bg-background px-3 text-sm"
          >
            <option value="comercial">Comercial</option>
            <option value="residencial">Residencial</option>
            <option value="industrial">Industrial</option>
            <option value="country">Country</option>
            <option value="barrio_cerrado">Barrio Cerrado</option>
          </select>
          <select
            name="condicion_iva"
            defaultValue={cliente.condicion_iva}
            className="h-11 rounded-xl border bg-background px-3 text-sm"
          >
            <option value="responsable_inscripto">Responsable Inscripto</option>
            <option value="monotributo">Monotributo</option>
            <option value="exento">Exento</option>
            <option value="consumidor_final">Consumidor Final</option>
          </select>
          <button className="h-10 rounded-xl bg-foreground text-sm text-background md:col-span-2">
            Guardar cambios
          </button>
        </form>
      </section>

      {/* Locaciones */}
      <section className="rounded-2xl border bg-card p-5">
        <h2 className="text-base font-semibold">
          Locaciones ({cliente.locaciones?.length ?? 0})
        </h2>

        {(cliente.locaciones ?? []).length > 0 ? (
          <div className="mt-3 grid gap-2">
            {cliente.locaciones.map((loc) => (
              <div key={loc.id} className="rounded-xl border p-3">
                <div className="text-sm font-medium">{loc.nombre}</div>
                <div className="text-xs text-muted-foreground">
                  {loc.domicilio || "Sin domicilio"} {loc.numero_cliente ? `· #${loc.numero_cliente}` : ""}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Sin locaciones.</p>
        )}

        <form action={onAddLocacion} className="mt-4 grid gap-2 md:grid-cols-3">
          <input
            name="nombre"
            className="h-10 rounded-xl border bg-background px-3 text-sm"
            placeholder="Nombre locación *"
            required
          />
          <input
            name="domicilio"
            className="h-10 rounded-xl border bg-background px-3 text-sm"
            placeholder="Domicilio"
          />
          <button className="h-10 rounded-xl bg-foreground text-sm text-background">
            Agregar locación
          </button>
        </form>
      </section>

      {/* Contactos */}
      <section className="rounded-2xl border bg-card p-5">
        <h2 className="text-base font-semibold">
          Contactos ({cliente.contactos?.length ?? 0})
        </h2>

        {(cliente.contactos ?? []).length > 0 ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Nombre</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">Teléfono</th>
                  <th className="px-3 py-2 font-medium">Cargo</th>
                </tr>
              </thead>
              <tbody>
                {cliente.contactos.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium">{c.nombre}</td>
                    <td className="px-3 py-2">{c.email || "-"}</td>
                    <td className="px-3 py-2">{c.telefono || "-"}</td>
                    <td className="px-3 py-2">{c.cargo || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Sin contactos.</p>
        )}

        <form action={onAddContacto} className="mt-4 grid gap-2 md:grid-cols-5">
          <input
            name="nombre"
            className="h-10 rounded-xl border bg-background px-3 text-sm"
            placeholder="Nombre *"
            required
          />
          <input
            name="email"
            type="email"
            className="h-10 rounded-xl border bg-background px-3 text-sm"
            placeholder="Email"
          />
          <input
            name="telefono"
            className="h-10 rounded-xl border bg-background px-3 text-sm"
            placeholder="Teléfono"
          />
          <input
            name="cargo"
            className="h-10 rounded-xl border bg-background px-3 text-sm"
            placeholder="Cargo"
          />
          <button className="h-10 rounded-xl bg-foreground text-sm text-background">
            Agregar contacto
          </button>
        </form>
      </section>
    </main>
  );
}
