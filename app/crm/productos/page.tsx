import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { domoGet, domoPost } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

type Producto = {
  id: number;
  nombre: string;
  sku: string;
  marca: string;
  modelo: string;
  categoria_nombre: string;
  proveedor: string;
  precio_costo_usd: number;
  precio_final: number;
  precio_neto: number;
  stock: string;
  activo: boolean;
};

export default async function ProductosPage() {
  const session = await auth();
  if (!session) redirect("/login?next=/crm/productos");

  const token = (session as any)?.domo_token ?? "";
  let productos: Producto[] = [];
  let error = "";

  try {
    const raw = await domoGet<any>("/api/productos", token);
    productos = Array.isArray(raw) ? raw : raw.items ?? [];
  } catch (err: any) {
    error = err.message;
  }

  async function onCreate(formData: FormData) {
    "use server";
    const session2 = await (await import("@/auth")).auth();
    if (!session2) redirect("/login?next=/crm/productos");
    const tk = (session2 as any)?.domo_token ?? "";

    const nombre = String(formData.get("nombre") ?? "").trim();
    const sku = String(formData.get("sku") ?? "").trim();
    const marca = String(formData.get("marca") ?? "").trim();
    const modelo = String(formData.get("modelo") ?? "").trim();
    const proveedor = String(formData.get("proveedor") ?? "").trim();
    const precio_costo_usd = Number(formData.get("precio_costo_usd") || 0);

    if (!nombre) throw new Error("Nombre es obligatorio");

    await domoPost("/api/productos", tk, {
      nombre, sku, marca, modelo, proveedor,
      precio_costo_usd,
    });
    revalidatePath("/crm/productos");
  }

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Productos</h1>
        <p className="text-sm text-muted-foreground">
          {productos.length} producto{productos.length !== 1 ? "s" : ""} en catálogo
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Error: {error}
        </div>
      ) : null}

      {/* Formulario crear */}
      <section className="rounded-2xl border bg-card p-5">
        <h2 className="text-base font-semibold">Nuevo producto</h2>
        <form action={onCreate} className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            name="nombre"
            className="h-11 rounded-xl border bg-background px-3 text-sm"
            placeholder="Nombre *"
            required
          />
          <input
            name="sku"
            className="h-11 rounded-xl border bg-background px-3 text-sm"
            placeholder="SKU"
          />
          <input
            name="marca"
            className="h-11 rounded-xl border bg-background px-3 text-sm"
            placeholder="Marca"
          />
          <input
            name="modelo"
            className="h-11 rounded-xl border bg-background px-3 text-sm"
            placeholder="Modelo"
          />
          <input
            name="proveedor"
            className="h-11 rounded-xl border bg-background px-3 text-sm"
            placeholder="Proveedor"
          />
          <input
            name="precio_costo_usd"
            type="number"
            step="0.01"
            className="h-11 rounded-xl border bg-background px-3 text-sm"
            placeholder="Costo USD"
          />
          <button className="h-11 rounded-xl bg-foreground text-sm text-background md:col-span-3">
            Crear producto
          </button>
        </form>
      </section>

      {/* Tabla */}
      <div className="rounded-2xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Marca</th>
                <th className="px-4 py-3 font-medium">Proveedor</th>
                <th className="px-4 py-3 font-medium text-right">Costo USD</th>
                <th className="px-4 py-3 font-medium text-right">Precio Final</th>
                <th className="px-4 py-3 font-medium">Stock</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.nombre}</div>
                    {p.modelo ? <div className="text-xs text-muted-foreground">{p.modelo}</div> : null}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{p.sku || "-"}</td>
                  <td className="px-4 py-3">{p.marca || "-"}</td>
                  <td className="px-4 py-3">{p.proveedor || "-"}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {p.precio_costo_usd ? `$${Number(p.precio_costo_usd).toLocaleString()}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {p.precio_final ? `$${Number(p.precio_final).toLocaleString()}` : "-"}
                  </td>
                  <td className="px-4 py-3 capitalize">{(p.stock || "").replace(/_/g, " ")}</td>
                </tr>
              ))}
              {!productos.length && !error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Sin productos en catálogo.
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
