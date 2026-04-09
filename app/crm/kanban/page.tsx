import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import {
  appendAuditLog,
  appendPerdida,
  CRM_STATUSES,
  formatIso,
  listAuditLogs,
  listCrmCards,
  proveedoresFromItems,
  totalVentaFromItems,
  updateCrmCard,
  createCrmCard,
  type CrmCard,
  type CrmItem,
} from "@/lib/crm-store";

export const runtime = "nodejs";

function nowIso() {
  return new Date().toISOString();
}

function safeNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function avgDuration(cards: CrmCard[], start: keyof CrmCard, end: keyof CrmCard) {
  const durations = cards
    .map((card) => {
      const startIso = String(card[start] ?? "");
      const endIso = String(card[end] ?? "");
      if (!startIso || !endIso) return null;
      const startDate = new Date(startIso);
      const endDate = new Date(endIso);
      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return null;
      }
      return endDate.getTime() - startDate.getTime();
    })
    .filter((value): value is number => value !== null && value >= 0);

  if (!durations.length) return "-";

  const avgMs = durations.reduce((acc, val) => acc + val, 0) / durations.length;
  const avgDays = avgMs / (1000 * 60 * 60 * 24);
  return `${avgDays.toFixed(1)} días`;
}

function cardTitle(card: CrmCard) {
  return `${card.cliente} · ${card.nombre}`;
}

export default async function CrmKanbanPage() {
  const session = await auth();
  if (!session) redirect("/login?next=/crm/kanban");

  const userName = String((session as any)?.user?.name ?? "Usuario");

  const [cards, auditLogs] = await Promise.all([
    listCrmCards(),
    listAuditLogs(),
  ]);

  const auditByCode = auditLogs.reduce<Record<string, typeof auditLogs>>(
    (acc, log) => {
      const code = log.codigo ?? "";
      if (!acc[code]) acc[code] = [];
      acc[code].push(log);
      return acc;
    },
    {}
  );

  const metrics = {
    oportunidades: cards.filter((card) => card.status === "Oportunidad").length,
    propuestas: cards.filter((card) => card.status === "Propuesta").length,
    aceptadas: cards.filter((card) => card.resultado === "Aceptado").length,
    rechazadas: cards.filter((card) => card.resultado === "Rechazado").length,
    totalFacturado: cards
      .filter((card) =>
        ["Facturado", "Cobrado", "Entregado"].includes(card.status)
      )
      .reduce((acc, card) => acc + safeNumber(card.totalVenta), 0),
    totalCobrado: cards
      .filter((card) => ["Cobrado", "Entregado"].includes(card.status))
      .reduce((acc, card) => acc + safeNumber(card.totalVenta), 0),
    tiempoOpPropuesta: avgDuration(cards, "oportunidadAt", "propuestaAt"),
    tiempoPropuestaFacturado: avgDuration(cards, "propuestaAt", "facturadoAt"),
    tiempoFacturadoCobrado: avgDuration(cards, "facturadoAt", "cobradoAt"),
    tiempoCobradoEntregado: avgDuration(cards, "cobradoAt", "entregadoAt"),
  };

  const acceptanceRate =
    metrics.aceptadas + metrics.rechazadas > 0
      ? Math.round(
          (metrics.aceptadas / (metrics.aceptadas + metrics.rechazadas)) * 100
        )
      : 0;

  const ranking = Object.values(
    cards.reduce<Record<string, { name: string; propuestas: number; cerradas: number; monto: number }>>(
      (acc, card) => {
        const key = card.responsable || "Sin asignar";
        if (!acc[key]) {
          acc[key] = { name: key, propuestas: 0, cerradas: 0, monto: 0 };
        }
        if (card.propuestaAt) acc[key].propuestas += 1;
        if (card.entregadoAt) {
          acc[key].cerradas += 1;
          acc[key].monto += safeNumber(card.totalVenta);
        }
        return acc;
      },
      {}
    )
  ).sort((a, b) => b.monto - a.monto);

  async function logAction(params: {
    codigo: string;
    accion: string;
    antes: unknown;
    despues: unknown;
    usuario: string;
  }) {
    await appendAuditLog({
      timestamp: nowIso(),
      usuario: params.usuario,
      codigo: params.codigo,
      accion: params.accion,
      antes: JSON.stringify(params.antes ?? {}),
      despues: JSON.stringify(params.despues ?? {}),
    });
  }

  async function onCreate(formData: FormData) {
    "use server";

    const session2 = await auth();
    if (!session2) redirect("/login?next=/crm/kanban");

    const responsable = String((session2 as any)?.user?.name ?? "Usuario");
    const cliente = String(formData.get("cliente") ?? "").trim();
    const contacto = String(formData.get("contacto") ?? "").trim();
    const observaciones = String(formData.get("observaciones") ?? "").trim();

    if (!cliente || !contacto) {
      throw new Error("Cliente y Contacto son obligatorios.");
    }

    const code = await createCrmCard({
      cliente,
      nombre: "", // El backend genera el código OV-XXXX automáticamente
      contacto,
      observaciones,
      responsable,
    });

    revalidatePath("/crm/kanban");
    redirect(`/crm/kanban/${code}`);
  }

  async function onMoveToPropuesta(formData: FormData) {
    "use server";

    const session2 = await auth();
    if (!session2) redirect("/login?next=/crm/kanban");
    const usuario = String((session2 as any)?.user?.name ?? "Usuario");

    const code = String(formData.get("code") ?? "");

    const { currentCard, nextCard } = await updateCrmCard(code, {
      status: "Propuesta",
      propuestaAt: nowIso(),
      resultado: "",
    });

    await logAction({
      codigo: code,
      accion: "mover",
      antes: currentCard,
      despues: nextCard,
      usuario,
    });

    revalidatePath("/crm/kanban");
  }

  async function onUpdatePropuesta(formData: FormData) {
    "use server";

    const session2 = await auth();
    if (!session2) redirect("/login?next=/crm/kanban");
    const usuario = String((session2 as any)?.user?.name ?? "Usuario");

    const code = String(formData.get("code") ?? "");
    const itemsJson = String(formData.get("items_json") ?? "[]");
    const resultado = String(formData.get("resultado") ?? "");
    const motivoRechazo = String(formData.get("motivo_rechazo") ?? "").trim();
    const observaciones = String(formData.get("observaciones") ?? "").trim();

    let items: CrmItem[] = [];
    try {
      items = JSON.parse(itemsJson);
    } catch {
      items = [];
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Debes agregar al menos un ítem.");
    }

    const invalidItem = items.find(
      (item) =>
        !item.product || !item.supplier || item.quantity <= 0 || item.price < 0
    );
    if (invalidItem) {
      throw new Error("Completá producto, proveedor, cantidad y precio.");
    }

    if (!resultado) {
      throw new Error("Seleccioná un resultado.");
    }

    if (resultado === "Rechazado" && !motivoRechazo) {
      throw new Error("Indicá el motivo de rechazo.");
    }

    const totalVenta = totalVentaFromItems(items);
    const proveedores = proveedoresFromItems(items);
    const nextStatus = resultado === "Aceptado" ? "Facturado" : "Propuesta";

    const now = nowIso();
    const { currentCard, nextCard } = await updateCrmCard(code, {
      status: nextStatus,
      items,
      totalVenta,
      proveedores,
      resultado,
      motivoRechazo,
      observaciones,
      responsable: usuario,
      propuestaAt: now,
      facturadoAt: resultado === "Aceptado" ? now : undefined,
    });

    await logAction({
      codigo: code,
      accion: resultado === "Aceptado" ? "aceptar" : "rechazar",
      antes: currentCard,
      despues: nextCard,
      usuario,
    });

    if (resultado === "Rechazado") {
      await appendPerdida({
        codigo: code,
        cliente: nextCard.cliente,
        responsable: usuario,
        totalCotizado: totalVenta,
        motivo: motivoRechazo,
        fecha: nowIso(),
        usuario,
      });
    }

    revalidatePath("/crm/kanban");
  }

  async function onToggleCobrado(formData: FormData) {
    "use server";

    const session2 = await auth();
    if (!session2) redirect("/login?next=/crm/kanban");
    const usuario = String((session2 as any)?.user?.name ?? "Usuario");

    const code = String(formData.get("code") ?? "");
    const cobrado = String(formData.get("cobrado") ?? "") === "on";

    const { currentCard, nextCard } = await updateCrmCard(code, {
      cobrado,
      status: cobrado ? "Cobrado" : "Facturado",
      cobradoAt: cobrado ? nowIso() : undefined,
    });

    await logAction({
      codigo: code,
      accion: "cobrar",
      antes: currentCard,
      despues: nextCard,
      usuario,
    });

    revalidatePath("/crm/kanban");
  }

  async function onMarkEntregado(formData: FormData) {
    "use server";

    const session2 = await auth();
    if (!session2) redirect("/login?next=/crm/kanban");
    const usuario = String((session2 as any)?.user?.name ?? "Usuario");

    const code = String(formData.get("code") ?? "");
    const entregaOk = String(formData.get("entrega_ok") ?? "") === "on";
    const fechaEntrega = String(formData.get("fecha_entrega") ?? "");
    const observaciones = String(formData.get("observaciones") ?? "").trim();

    if (!entregaOk) {
      throw new Error("Confirmá la entrega para cerrar la venta.");
    }

    if (!fechaEntrega) {
      throw new Error("Ingresá la fecha de entrega.");
    }

    const { currentCard, nextCard } = await updateCrmCard(code, {
      status: "Entregado",
      entregaOk,
      entregadoAt: new Date(fechaEntrega).toISOString(),
      observaciones,
    });

    await logAction({
      codigo: code,
      accion: "entregar",
      antes: currentCard,
      despues: nextCard,
      usuario,
    });

    revalidatePath("/crm/kanban");
  }

  const grouped = Object.fromEntries(
    CRM_STATUSES.map((status) => [
      status,
      cards.filter((card) => card.status === status),
    ])
  ) as Record<(typeof CRM_STATUSES)[number], CrmCard[]>;

  return (
    <main className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">CRM Kanban de Ventas</h1>
        <p className="text-sm text-muted-foreground">
          Pipeline con trazabilidad completa, automatizaciones y métricas de
          performance comercial.
        </p>
      </section>

      <section className="grid gap-4 rounded-2xl border bg-card p-5 md:grid-cols-4">
        <div>
          <div className="text-xs text-muted-foreground">Oportunidades</div>
          <div className="text-lg font-semibold">{metrics.oportunidades}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Propuestas</div>
          <div className="text-lg font-semibold">{metrics.propuestas}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Tasa aceptación</div>
          <div className="text-lg font-semibold">{acceptanceRate}%</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Total facturado</div>
          <div className="text-lg font-semibold">
            ${metrics.totalFacturado.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Total cobrado</div>
          <div className="text-lg font-semibold">
            ${metrics.totalCobrado.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Oportunidad → Propuesta</div>
          <div className="text-lg font-semibold">{metrics.tiempoOpPropuesta}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Propuesta → Facturado</div>
          <div className="text-lg font-semibold">
            {metrics.tiempoPropuestaFacturado}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Facturado → Cobrado</div>
          <div className="text-lg font-semibold">
            {metrics.tiempoFacturadoCobrado}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Cobrado → Entregado</div>
          <div className="text-lg font-semibold">{metrics.tiempoCobradoEntregado}</div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Nueva oportunidad</h2>
          <span className="text-xs text-muted-foreground">Usuario: {userName}</span>
        </div>
        <form action={onCreate} className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            name="cliente"
            className="h-11 rounded-xl border bg-background px-3"
            placeholder="Cliente / Empresa *"
            required
          />
          <input
            name="contacto"
            className="h-11 rounded-xl border bg-background px-3"
            placeholder="Teléfono o email de contacto *"
            required
          />
          <input
            name="observaciones"
            className="h-11 rounded-xl border bg-background px-3"
            placeholder="Observaciones (opcional)"
          />
          <button className="h-11 rounded-xl bg-foreground text-background md:col-span-3">
            Crear oportunidad
          </button>
        </form>
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="text-base font-semibold">Ranking comercial</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {ranking.length ? (
            ranking.map((entry) => (
              <div key={entry.name} className="rounded-xl border p-3">
                <div className="text-sm font-medium">{entry.name}</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Propuestas: {entry.propuestas}
                </div>
                <div className="text-xs text-muted-foreground">
                  Ventas cerradas: {entry.cerradas}
                </div>
                <div className="text-xs text-muted-foreground">
                  Monto vendido: ${entry.monto.toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">
              Sin datos de performance aún.
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4">
        <h2 className="text-base font-semibold">Pipeline Kanban</h2>
        <div className="grid gap-4 overflow-x-auto md:grid-cols-5">
          {CRM_STATUSES.map((status) => (
            <div key={status} className="rounded-2xl border bg-muted/30 p-3">
              <div className="mb-3 text-sm font-semibold">{status}</div>
              <div className="grid gap-3">
                {grouped[status].length ? (
                  grouped[status].map((card) => (
                    <Link
                      key={card.code}
                      href={`/crm/kanban/${card.code}`}
                      className="block rounded-xl border bg-background p-3 transition hover:border-foreground/30 hover:shadow-sm"
                    >
                      <div className="text-xs font-mono text-muted-foreground">{card.code}</div>
                      <h3 className="mt-1 text-sm font-semibold truncate">{card.cliente}</h3>
                      {card.totalVenta > 0 ? (
                        <div className="mt-2 text-base font-semibold">
                          ${card.totalVenta.toLocaleString()}
                        </div>
                      ) : (
                        <div className="mt-2 text-xs text-muted-foreground italic">
                          Sin cotizar
                        </div>
                      )}
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        {card.responsable || "Sin asignar"}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed p-3 text-xs text-muted-foreground">
                    Sin tarjetas.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
