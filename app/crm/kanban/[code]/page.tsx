import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { domoGet } from "@/lib/api-client";
import {
  updateCrmCard,
  totalVentaFromItems,
  proveedoresFromItems,
  formatIso,
  type CrmCard,
  type CrmItem,
} from "@/lib/crm-store";
import Link from "next/link";
import { ItemsForm } from "./items-form";

export const runtime = "nodejs";

export default async function CardDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { code } = await params;
  const { saved } = await searchParams;
  const session = await auth();
  if (!session) redirect(`/login?next=/crm/kanban/${code}`);

  const token = (session as any)?.domo_token ?? "";

  let card: CrmCard | undefined;
  let error = "";

  try {
    const cards = await domoGet<CrmCard[]>("/api/crm/cards", token);
    card = cards.find((c) => c.code === code);
  } catch (err: any) {
    error = err.message;
  }

  async function onSaveItems(formData: FormData) {
    "use server";

    const session2 = await (await import("@/auth")).auth();
    if (!session2) redirect(`/login?next=/crm/kanban/${code}`);

    const itemsJson = String(formData.get("items_json") ?? "[]");
    const cardCode = String(formData.get("code") ?? "");

    let items: CrmItem[] = [];
    try {
      items = JSON.parse(itemsJson);
    } catch {
      items = [];
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Debes agregar al menos un producto.");
    }

    const invalidItem = items.find(
      (item) =>
        !item.product || !item.supplier || item.quantity <= 0 || item.price < 0
    );
    if (invalidItem) {
      throw new Error(
        "Completa producto, proveedor, cantidad y precio de venta para cada item."
      );
    }

    const totalVenta = totalVentaFromItems(items);
    const proveedores = proveedoresFromItems(items);

    await updateCrmCard(cardCode, {
      items,
      totalVenta,
      proveedores,
    });

    revalidatePath(`/crm/kanban/${cardCode}`);
    revalidatePath("/crm/kanban");
    redirect(`/crm/kanban/${cardCode}?saved=1`);
  }

  if (error || !card) {
    return (
      <main className="space-y-6">
        <Link
          href="/crm/kanban"
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Volver al Kanban
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error || `Oportunidad "${code}" no encontrada.`}
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <Link
        href="/crm/kanban"
        className="text-sm text-muted-foreground hover:underline"
      >
        &larr; Volver al Kanban
      </Link>

      {saved === "1" ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          Items guardados correctamente.
        </div>
      ) : null}

      {/* Card info header */}
      <section className="rounded-2xl border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">
              {card.code} &mdash; {card.cliente}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{card.nombre}</p>
          </div>
          <span className="rounded-full border px-3 py-1 text-xs">
            {card.status}
          </span>
        </div>

        <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
          <div>
            <div className="text-xs text-muted-foreground">Contacto</div>
            <div>{card.contacto || "-"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Responsable</div>
            <div>{card.responsable || "-"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">
              Fecha de creacion
            </div>
            <div>{formatIso(card.createdAt)}</div>
          </div>
        </div>

        {card.observaciones ? (
          <div className="mt-3 text-sm text-muted-foreground">
            {card.observaciones}
          </div>
        ) : null}
      </section>

      {/* Items form */}
      <section className="rounded-2xl border bg-card p-5">
        <form action={onSaveItems} className="grid gap-4">
          <ItemsForm initialItems={card.items ?? []} code={card.code} />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="h-11 rounded-xl bg-foreground px-6 text-sm text-background"
            >
              Guardar items
            </button>
            <Link
              href={`/crm/kanban/${card.code}/cotizacion`}
              className="inline-flex h-11 items-center rounded-xl border px-6 text-sm hover:bg-muted/40"
            >
              Generar cotizacion
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
