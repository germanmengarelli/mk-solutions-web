import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { listLeads } from "@/lib/leads-store";
import { createActivity, listActivitiesByLeadIds } from "@/lib/activities-store";
import { FireworkDoneButton } from "@/components/crm/FireworkDoneButton";

export const runtime = "nodejs";

function asDateOnly(s: string) {
  // s: YYYY-MM-DD
  const [y, m, d] = s.split("-").map((x) => Number(x));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 0, 0, 0);
}

function todayDateOnly() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate(), 0, 0, 0);
}

export default async function TareasPage() {
  const session = await auth();
  if (!session) redirect("/login?next=/crm/tareas");

  const user_id = String((session as any).user_id ?? "");
  const role = String((session as any).role ?? "");

  const leads = await listLeads({ role, user_id });
  const leadIds = leads.map((l) => l.lead_id).filter(Boolean);
  const activitiesByLead = await listActivitiesByLeadIds(leadIds);

  async function onDone(formData: FormData) {
    "use server";

    const session2 = await auth();
    if (!session2) redirect("/login?next=/crm/tareas");

    const myId = String((session2 as any).user_id ?? "");

    const lead_id = String(formData.get("lead_id") ?? "").trim();
    const prev_step = String(formData.get("prev_step") ?? "").trim();
    const prev_date = String(formData.get("prev_date") ?? "").trim();

    if (!lead_id) throw new Error("Falta lead_id");

    // Creamos una nueva actividad "tarea completada" y dejamos next_step/date vacíos
    await createActivity({
      lead_id,
      owner_user_id: myId,
      tipo: "Tarea",
      detalle: `Tarea completada: ${prev_step || "(sin detalle)"}`,
      resultado: "Hecho",
      next_step: "",
      next_date: "",
    });

    // Refresca tareas y también leads (porque la última actividad cambia)
    revalidatePath("/crm/tareas");
    revalidatePath("/crm/leads");
  }

  // Armamos tareas desde la última actividad de cada lead
  const tareas = leads
    .map((l) => {
      const acts = activitiesByLead[l.lead_id] ?? [];
      const last = acts[0];

      const next_date = String(last?.next_date ?? "").trim();
      const next_step = String(last?.next_step ?? "").trim();

      const dateObj = next_date ? asDateOnly(next_date) : null;

      return {
        lead_id: l.lead_id,
        empresa: l.empresa,
        contacto: l.contacto,
        email: l.email,
        estado: l.estado,
        next_step,
        next_date,
        dateObj,
      };
    })
    .filter((t) => t.next_step && t.next_date && t.dateObj);

  const today = todayDateOnly();
  const in7 = new Date(today);
  in7.setDate(in7.getDate() + 7);

  const vencidas = tareas.filter((t) => (t.dateObj as Date) < today);
  const hoy = tareas.filter((t) => (t.dateObj as Date).getTime() === today.getTime());
  const semana = tareas.filter(
    (t) => (t.dateObj as Date) > today && (t.dateObj as Date) <= in7
  );

  function Card({
    title,
    items,
  }: {
    title: string;
    items: typeof tareas;
  }) {
    return (
      <section className="rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">{title}</h2>
          <div className="text-xs text-muted-foreground">{items.length}</div>
        </div>

        <div className="mt-4 grid gap-3">
          {items.length === 0 ? (
            <div className="text-sm text-muted-foreground">Sin tareas.</div>
          ) : (
            items
              .sort((a, b) => String(a.next_date).localeCompare(String(b.next_date)))
              .map((t) => (
                <div key={t.lead_id} className="rounded-xl border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">{t.empresa}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {t.contacto || "—"} · {t.email || "—"}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">{t.next_date}</div>
                  </div>

                  <div className="mt-3 text-sm">
                    <span className="text-muted-foreground">Próximo paso:</span>{" "}
                    {t.next_step}
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground">
                    Estado lead: {t.estado || "—"}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href="/crm/leads"
                      className="rounded-lg border px-3 py-2 text-xs hover:bg-muted"
                    >
                      Ver en Leads
                    </a>

                    {/* Botón Hecho con fueguito */}
                    <form action={onDone} className="inline-flex">
                      <input type="hidden" name="lead_id" value={t.lead_id} />
                      <input type="hidden" name="prev_step" value={t.next_step} />
                      <input type="hidden" name="prev_date" value={t.next_date} />
                      <FireworkDoneButton label="Hecho" />
                    </form>
                  </div>
                </div>
              ))
          )}
        </div>
      </section>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold">Tareas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Se generan desde el “Próximo paso” y “Próxima fecha” de la última actividad.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card title="Vencidas" items={vencidas} />
        <Card title="Hoy" items={hoy} />
        <Card title="Próximos 7 días" items={semana} />
      </div>
    </main>
  );
}
