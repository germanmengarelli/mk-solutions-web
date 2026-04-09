import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { domoGet, domoPost } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

type Usuario = {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  telefono: string;
  activo: boolean;
  permisos: string[];
  comision_porcentaje: number;
};

const PERMISOS_DISPONIBLES = [
  "leads", "clientes", "productos", "presupuestos",
  "ordenes", "finanzas", "tecnicos", "vendedores", "contratos",
];

export default async function UsuariosPage() {
  const session = await auth();
  if (!session) redirect("/login?next=/crm/usuarios");

  const role = (session as any)?.role ?? "";
  if (role !== "admin") {
    return (
      <main className="space-y-6">
        <h1 className="text-2xl font-semibold">Usuarios</h1>
        <div className="rounded-xl border p-4 text-sm text-muted-foreground">
          Solo administradores pueden gestionar usuarios.
        </div>
      </main>
    );
  }

  const token = (session as any)?.domo_token ?? "";
  let usuarios: Usuario[] = [];
  let error = "";

  try {
    const raw = await domoGet<any>("/api/usuarios", token);
    usuarios = Array.isArray(raw) ? raw : raw.items ?? [];
  } catch (err: any) {
    error = err.message;
  }

  async function onCreate(formData: FormData) {
    "use server";
    const session2 = await (await import("@/auth")).auth();
    if (!session2) redirect("/login?next=/crm/usuarios");
    const tk = (session2 as any)?.domo_token ?? "";

    const nombre = String(formData.get("nombre") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();
    const rol = String(formData.get("rol") ?? "comercial");
    const telefono = String(formData.get("telefono") ?? "").trim();
    const permisosRaw = formData.getAll("permisos");
    const permisos = permisosRaw.map(String);

    if (!nombre || !email || !password) throw new Error("Nombre, email y password son obligatorios");

    await domoPost("/api/usuarios", tk, {
      nombre, email, password, rol, telefono, permisos,
    });
    revalidatePath("/crm/usuarios");
  }

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Usuarios</h1>
        <p className="text-sm text-muted-foreground">
          {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""}
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Error: {error}
        </div>
      ) : null}

      {/* Formulario crear */}
      <section className="rounded-2xl border bg-card p-5">
        <h2 className="text-base font-semibold">Nuevo usuario</h2>
        <form action={onCreate} className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            name="nombre"
            className="h-11 rounded-xl border bg-background px-3 text-sm"
            placeholder="Nombre completo *"
            required
          />
          <input
            name="email"
            type="email"
            className="h-11 rounded-xl border bg-background px-3 text-sm"
            placeholder="Email *"
            required
          />
          <input
            name="password"
            type="password"
            className="h-11 rounded-xl border bg-background px-3 text-sm"
            placeholder="Contraseña (min 10 chars) *"
            required
            minLength={10}
          />
          <input
            name="telefono"
            className="h-11 rounded-xl border bg-background px-3 text-sm"
            placeholder="Teléfono"
          />
          <select
            name="rol"
            className="h-11 rounded-xl border bg-background px-3 text-sm"
            defaultValue="comercial"
          >
            <option value="admin">Admin</option>
            <option value="comercial">Comercial</option>
            <option value="tecnico">Técnico</option>
          </select>
          <div className="flex flex-wrap gap-2 items-center">
            {PERMISOS_DISPONIBLES.map((p) => (
              <label key={p} className="flex items-center gap-1 text-xs">
                <input type="checkbox" name="permisos" value={p} className="h-3.5 w-3.5" />
                {p}
              </label>
            ))}
          </div>
          <button className="h-11 rounded-xl bg-foreground text-sm text-background md:col-span-2">
            Crear usuario
          </button>
        </form>
      </section>

      {/* Tabla */}
      <div className="rounded-2xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Permisos</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3 font-medium">{u.nombre}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.rol === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                      {u.rol}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(u.permisos || []).map((p) => (
                        <span key={p} className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{p}</span>
                      ))}
                      {!(u.permisos || []).length ? <span className="text-xs text-muted-foreground">—</span> : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${u.activo !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {u.activo !== false ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              ))}
              {!usuarios.length && !error ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Sin usuarios.
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
