import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createLead, listLeads, updateLead } from "@/lib/leads-store";
import { listUsers } from "@/lib/users-store";
import { createActivity, listActivitiesByLeadIds } from "@/lib/activities-store";

export const runtime = "nodejs";

const ESTADOS = ["Nuevo", "Contactado", "En negociación", "Ganado", "Perdido"] as const;
const TIPOS = ["Llamada", "WhatsApp", "Email", "Reunión", "Otro"] as const;

function fmtDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default async function LeadsPage() {
  const session = await auth();
  if (!session) redirect("/login?next=/crm/leads");

  const user_id = String((session as any).user_id ?? "");
  const role = String((session as any).role ?? "");

  const [leads, users] = await Promise.all([
    listLeads({ role, user_id }),
    role === "admin" ? listUsers() : Promise.resolve([]),
  ]);

  const sellers = (users.length ? users : [])
    .filter((u) => u.role === "sales" || u.role === "admin");

  const leadIds = leads.map((l) => l.lead_id).filter(Boolean);
  const activitiesByLead = await listActivitiesByLeadIds(leadIds);

  // Para mostrar nombre del owner en vez del ID
  const ownerName = (id: string) =>
    sellers.find((u) => u.user_id === id)?.name ?? id;

  const grouped = Object.fromEntries(
    ESTADOS.map((e) => [e, leads.filter((l) => (l.estado || "Nuevo") === e)])
  ) as Record<(typeof ESTADOS)[number], typeof leads>;

  async function onCreate(formData: FormData) {
    "use server";

    const session2 = await auth();
    if (!session2) redirect("/login?next=/crm/leads");

    const role2 = String((session2 as any).role ?? "");
    const myId = String((session2 as any).user_id ?? "");

    const empresa = String(formData.get("empresa") ?? "").trim();
    const contacto = String(formData.get("contacto") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const telefono = String(formData.get("telefono") ?? "").trim();
    const estado = String(formData.get("estado") ?? "Nuevo").trim();
    const origen = String(formData.get("origen") ?? "Web").trim();
    const notas = String(formData.get("notas") ?? "").trim();

    // Admin puede elegir owner; vendedor no.
    const ownerFromForm = String(formData.get("owner_user_id") ?? "").trim();
    const owner_user_id = role2 === "admin" && ownerFromForm ? ownerFromForm : myId;

    if (!empresa) throw new Error("Falta empresa");

    await createLead({
      owner_user_id,
      empresa,
      contacto,
      email,
      telefono,
      estado,
      origen,
      notas,
    });

    revalidatePath("/crm/leads");
  }

  async function onUpdateStatus(formData: FormData) {
    "use server";
    const session2 = await auth();
    if (!session2) redirect("/login?next=/crm/leads");

    const lead_id = String(formData.get("lead_id") ?? "");
    const estado = String(formData.get("estado") ?? "");

    await updateLead(lead_id, { estado });
    revalidatePath("/crm/leads");
  }

  async function onUpdateOwner(formData: FormData) {
    "use server";
    const session2 = await auth();
    if (!session2) redirect("/login?next=/crm/leads");

    const role2 = String((session2 as any).role ?? "");
    if (role2 !== "admin") throw new Error("No autorizado");

    const lead_id = String(formData.get("lead_id") ?? "");
    const owner_user_id = String(formData.get("owner_user_id") ?? "");

    await updateLead(lead_id, { owner_user_id });
    revalidatePath("/crm/leads");
  }

  async function onAddActivity(formData: FormData) {
    "use server";
    const session2 = await auth();
    if (!session2) redirect("/login?next=/crm/leads");

    const myId = String((session2 as any).user_id ?? "");

    const lead_id = String(formData.get("lead_id") ?? "").trim();
    const tipo = String(formData.get("tipo") ?? "Otro").trim();
    const detalle = String(formData.get("detalle") ?? "").trim();
    const resultado = String(formData.get("resultado") ?? "").trim();
    const next_step = String(formData.get("next_step") ?? "").trim();
    const next_date = String(formData.get("next_date") ?? "").trim(); // YYYY-MM-DD

    if (!lead_id) throw new Error("Falta lead_id");
    if (!detalle) throw new Error("Escribí un detalle de la actividad");

    await createActivity({
      lead_id,
      owner_user_id: myId,
      tipo,
      detalle,
      resultado,
      next_step,
      next_date,
    });

    revalidatePath("/crm/leads");
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Leads</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {role === "admin"
              ? "Administrador: ves todos y podés reasignar."
              : "Vendedor: ves solo los tuyos."}
          </p>
        </div>
      </div>

      {/* Formulario */}
      <section className="mt-6 rounded-2xl border bg-card p-5">
        <h2 className="text-base font-medium">Agregar lead</h2>

        <form action={onCreate} className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            name="empresa"
            className="h-11 rounded-xl border bg-background px-3"
            placeholder="Empresa *"
            required
          />

          {role === "admin" ? (
            <select
              name="owner_user_id"
              className="h-11 rounded-xl border bg-background px-3"
              defaultValue={user_id}
              title="Asignar a"
            >
              {sellers.map((u) => (
                <option key={u.user_id} value={u.user_id}>
                  {u.name} ({u.username})
                </option>
              ))}
            </select>
          ) : (
            <div className="h-11 rounded-xl border bg-muted/40 px-3 flex items-center text-sm text-muted-foreground">
              Asignado a vos
            </div>
          )}

          <input
            name="contacto"
            className="h-11 rounded-xl border bg-background px-3"
            placeholder="Contacto"
          />
          <input
            name="email"
            className="h-11 rounded-xl border bg-background px-3"
            placeholder="Email"
          />
          <input
            name="telefono"
            className="h-11 rounded-xl border bg-background px-3"
            placeholder="Teléfono"
          />

          <select
            name="estado"
            className="h-11 rounded-xl border bg-background px-3"
            defaultValue="Nuevo"
          >
            {ESTADOS.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>

          <select
            name="origen"
            className="h-11 rounded-xl border bg-background px-3"
            defaultValue="Web"
          >
            <option>Web</option>
            <option>Referido</option>
            <option>Outbound</option>
            <option>Evento</option>
            <option>Otro</option>
          </select>

          <textarea
            name="notas"
            className="min-h-[90px] rounded-xl border bg-background px-3 py-2 md:col-span-2"
            placeholder="Notas"
          />

          <div className="md:col-span-2">
            <button className="h-11 rounded-xl bg-foreground px-5 font-medium text-background">
              Guardar lead
            </button>
          </div>
        </form>
      </section>

      {/* Kanban */}
      <section className="mt-6">
        <h2 className="text-base font-medium">Kanban</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Cada tarjeta permite cambiar estado y registrar actividades.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-5">
          {ESTADOS.map((col) => (
            <div key={col} className="rounded-2xl border bg-card p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{col}</div>
                <div className="text-xs text-muted-foreground">
                  {grouped[col].length}
                </div>
              </div>

              <div className="mt-3 grid gap-3">
                {grouped[col].length === 0 ? (
                  <div className="text-xs text-muted-foreground">Sin leads.</div>
                ) : (
                  grouped[col].map((l) => {
                    const acts = activitiesByLead[l.lead_id] ?? [];
                    const last = acts[0];

                    return (
                      <div key={l.lead_id} className="rounded-xl border bg-background p-3">
                        <div className="text-sm font-medium">{l.empresa}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {l.contacto || "—"} · {l.email || "—"}
                        </div>

                        <div className="mt-2 text-xs">
                          <span className="text-muted-foreground">Owner:</span>{" "}
                          {role === "admin" ? ownerName(l.owner_user_id) : l.owner_user_id}
                        </div>

                        {/* Última actividad */}
                        <div className="mt-2 rounded-lg border bg-muted/20 p-2 text-xs">
                          <div className="text-muted-foreground">Última actividad</div>
                          {last ? (
                            <div className="mt-1">
                              <div>
                                <b>{last.tipo}</b> · {fmtDate(last.created_at)}
                              </div>
                              <div className="text-muted-foreground">
                                {last.detalle}
                              </div>
                              {last.next_step ? (
                                <div className="mt-1">
                                  <span className="text-muted-foreground">Próximo:</span>{" "}
                                  {last.next_step} {last.next_date ? `(${last.next_date})` : ""}
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            <div className="mt-1 text-muted-foreground">
                              Todavía no hay actividades.
                            </div>
                          )}
                        </div>

                        {/* Cambiar estado */}
                        <div className="mt-3 grid gap-2">
                          <form action={onUpdateStatus} className="flex gap-2">
                            <input type="hidden" name="lead_id" value={l.lead_id} />
                            <select
                              name="estado"
                              defaultValue={l.estado || "Nuevo"}
                              className="h-9 flex-1 rounded-lg border bg-background px-2 text-xs"
                            >
                              {ESTADOS.map((e) => (
                                <option key={e}>{e}</option>
                              ))}
                            </select>
                            <button className="h-9 rounded-lg bg-foreground px-3 text-xs text-background">
                              OK
                            </button>
                          </form>

                          {/* Reasignación solo admin */}
                          {role === "admin" && (
                            <form action={onUpdateOwner} className="flex gap-2">
                              <input type="hidden" name="lead_id" value={l.lead_id} />
                              <select
                                name="owner_user_id"
                                defaultValue={l.owner_user_id}
                                className="h-9 flex-1 rounded-lg border bg-background px-2 text-xs"
                              >
                                {sellers.map((u) => (
                                  <option key={u.user_id} value={u.user_id}>
                                    {u.name}
                                  </option>
                                ))}
                              </select>
                              <button className="h-9 rounded-lg bg-foreground px-3 text-xs text-background">
                                OK
                              </button>
                            </form>
                          )}
                        </div>

                        {/* Historial + alta actividad */}
                        <details className="mt-3">
                          <summary className="cursor-pointer text-xs font-medium">
                            Actividades ({acts.length})
                          </summary>

                          <div className="mt-3 grid gap-2">
                            {/* Alta */}
                            <form action={onAddActivity} className="grid gap-2 rounded-xl border p-2">
                              <input type="hidden" name="lead_id" value={l.lead_id} />

                              <select
                                name="tipo"
                                className="h-9 rounded-lg border bg-background px-2 text-xs"
                                defaultValue="WhatsApp"
                              >
                                {TIPOS.map((t) => (
                                  <option key={t}>{t}</option>
                                ))}
                              </select>

                              <textarea
                                name="detalle"
                                className="min-h-[70px] rounded-lg border bg-background px-2 py-2 text-xs"
                                placeholder="Detalle (qué hiciste / qué respondió)"
                                required
                              />

                              <input
                                name="resultado"
                                className="h-9 rounded-lg border bg-background px-2 text-xs"
                                placeholder="Resultado (ej: pidió lista / confirmó reunión / sin respuesta)"
                              />

                              <input
                                name="next_step"
                                className="h-9 rounded-lg border bg-background px-2 text-xs"
                                placeholder="Próximo paso (ej: enviar cotización / volver a llamar)"
                              />

                              <input
                                name="next_date"
                                type="date"
                                className="h-9 rounded-lg border bg-background px-2 text-xs"
                              />

                              <button className="h-9 rounded-lg bg-foreground px-3 text-xs text-background">
                                Guardar actividad
                              </button>
                            </form>

                            {/* Lista */}
                            <div className="grid gap-2">
                              {acts.length === 0 ? (
                                <div className="text-xs text-muted-foreground">
                                  No hay actividades todavía.
                                </div>
                              ) : (
                                acts.slice(0, 8).map((a) => (
                                  <div key={a.activity_id} className="rounded-xl border bg-background p-2 text-xs">
                                    <div className="flex items-center justify-between">
                                      <div className="font-medium">{a.tipo}</div>
                                      <div className="text-muted-foreground">{fmtDate(a.created_at)}</div>
                                    </div>
                                    <div className="mt-1 text-muted-foreground">{a.detalle}</div>
                                    {a.resultado ? (
                                      <div className="mt-1">
                                        <span className="text-muted-foreground">Resultado:</span>{" "}
                                        {a.resultado}
                                      </div>
                                    ) : null}
                                    {a.next_step ? (
                                      <div className="mt-1">
                                        <span className="text-muted-foreground">Próximo:</span>{" "}
                                        {a.next_step}{" "}
                                        {a.next_date ? `(${a.next_date})` : ""}
                                      </div>
                                    ) : null}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </details>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
