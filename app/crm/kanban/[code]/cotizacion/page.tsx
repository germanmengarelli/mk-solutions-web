import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { domoGet } from "@/lib/api-client";
import { formatIso, type CrmCard } from "@/lib/crm-store";
import Link from "next/link";
import { PrintButton } from "./print-button";

export const runtime = "nodejs";

export default async function CotizacionPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const session = await auth();
  if (!session) redirect(`/login?next=/crm/kanban/${code}/cotizacion`);

  const token = (session as any)?.domo_token ?? "";
  const vendedor = String((session as any)?.user?.name ?? "Vendedor");

  let card: CrmCard | undefined;
  try {
    const cards = await domoGet<CrmCard[]>("/api/crm/cards", token);
    card = cards.find((c) => c.code === code);
  } catch {
    /* error handled below */
  }

  if (!card) {
    return (
      <main className="space-y-6">
        <Link href={`/crm/kanban/${code}`} className="text-sm text-muted-foreground hover:underline">
          &larr; Volver
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Oportunidad &quot;{code}&quot; no encontrada.
        </div>
      </main>
    );
  }

  if (!card.items || card.items.length === 0) {
    return (
      <main className="space-y-6">
        <Link href={`/crm/kanban/${code}`} className="text-sm text-muted-foreground hover:underline">
          &larr; Volver
        </Link>
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
          No hay productos cargados. Agregá items antes de generar la cotización.
        </div>
      </main>
    );
  }

  const today = new Date();
  const fechaStr = today.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const validez = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const validezStr = validez.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const subtotal = card.items.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );
  const totalIva = card.items.reduce((acc, item) => {
    const rate = (item.ivaRate ?? 21) / 100;
    return acc + item.quantity * item.price * rate;
  }, 0);
  const total = subtotal + totalIva;

  return (
    <>
      {/* Controls - hidden when printing */}
      <div className="mb-6 flex items-center gap-4 print-hidden">
        <Link
          href={`/crm/kanban/${code}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Volver a {code}
        </Link>
        <PrintButton />
      </div>

      {/* Cotización document */}
      <div className="cotizacion-doc mx-auto max-w-[210mm] rounded-2xl border bg-white p-8 shadow-sm">
        {/* Header / Membrete */}
        <header className="flex items-start justify-between border-b pb-6">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-mk.png"
              alt="MK Solutions"
              className="h-20 w-auto"
            />
            <div>
              <div className="text-xl font-bold text-[#18417c]">
                MK Solutions
              </div>
              <div className="text-xs text-gray-500">
                Tecnología &middot; Conectividad
              </div>
            </div>
          </div>
          <div className="text-right text-xs text-gray-500 leading-relaxed">
            <div className="font-semibold text-gray-700">MK Solutions SAS</div>
            <div>CUIT: 30-71234567-8</div>
            <div>Córdoba, Argentina</div>
            <div>comercial@mksolutions.com.ar</div>
            <div>www.mksolutions.com.ar</div>
          </div>
        </header>

        {/* Document title */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Cotización X
            </h1>
            <p className="text-sm text-gray-500">
              Documento no válido como factura
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-mono font-bold text-[#18417c]">
              {card.code}
            </div>
            <div className="text-xs text-gray-500">Fecha: {fechaStr}</div>
          </div>
        </div>

        {/* Client info */}
        <section className="mt-6 rounded-lg border border-gray-200 p-4">
          <div className="text-xs font-semibold uppercase text-gray-400 mb-2">
            Cliente
          </div>
          <div className="grid gap-1 text-sm">
            <div className="font-semibold text-gray-800">{card.cliente}</div>
            <div className="text-gray-600">Contacto: {card.contacto}</div>
            {card.observaciones ? (
              <div className="text-gray-500 text-xs mt-1">
                Obs: {card.observaciones}
              </div>
            ) : null}
          </div>
        </section>

        {/* Vendedor */}
        <section className="mt-4 text-sm text-gray-600">
          <span className="text-xs text-gray-400">Vendedor:</span>{" "}
          <span className="font-medium">{vendedor}</span>
        </section>

        {/* Items table */}
        <section className="mt-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300 text-left text-xs uppercase text-gray-500">
                <th className="pb-2 pr-3">#</th>
                <th className="pb-2 pr-3">Producto</th>
                <th className="pb-2 pr-3 text-center">Cant.</th>
                <th className="pb-2 pr-3 text-right">P. Unit.</th>
                <th className="pb-2 pr-3 text-right">Subtotal</th>
                <th className="pb-2 pr-3 text-center">IVA %</th>
                <th className="pb-2 text-right">IVA</th>
              </tr>
            </thead>
            <tbody>
              {card.items.map((item, idx) => {
                const itemSubtotal = item.quantity * item.price;
                const ivaRate = item.ivaRate ?? 21;
                const itemIva = itemSubtotal * (ivaRate / 100);
                return (
                  <tr
                    key={idx}
                    className="border-b border-gray-100"
                  >
                    <td className="py-2 pr-3 text-gray-400">{idx + 1}</td>
                    <td className="py-2 pr-3 font-medium text-gray-800">
                      {item.product}
                    </td>
                    <td className="py-2 pr-3 text-center">{item.quantity}</td>
                    <td className="py-2 pr-3 text-right">
                      USD {item.price.toLocaleString()}
                    </td>
                    <td className="py-2 pr-3 text-right font-medium">
                      USD {itemSubtotal.toLocaleString()}
                    </td>
                    <td className="py-2 pr-3 text-center text-gray-500">
                      {ivaRate}%
                    </td>
                    <td className="py-2 text-right">
                      USD {itemIva.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* Totals */}
        <section className="mt-4 flex justify-end">
          <div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>USD {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">IVA</span>
              <span>USD {totalIva.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t-2 border-gray-800 pt-2 text-lg font-bold">
              <span>Total</span>
              <span className="text-[#18417c]">
                USD {total.toLocaleString()}
              </span>
            </div>
          </div>
        </section>

        {/* Conditions */}
        <section className="mt-8 rounded-lg bg-gray-50 p-4 text-xs text-gray-500 leading-relaxed">
          <div className="font-semibold text-gray-600 mb-1">
            Condiciones
          </div>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Cotización válida hasta: {validezStr} (7 días)</li>
            <li>Precios unitarios expresados en USD, de confirmar se hará la operación al tipo de cambio vendedor del Banco Nación de la República Argentina</li>
            <li>Forma de pago: a convenir</li>
            <li>Plazo de entrega: a confirmar según disponibilidad de stock</li>
            <li>Este documento es una cotización y no tiene validez fiscal</li>
          </ul>
        </section>

        {/* Footer */}
        <footer className="mt-8 border-t pt-4 text-center text-xs text-gray-400">
          <div>
            MK Solutions &middot; comercial@mksolutions.com.ar &middot;
            www.mksolutions.com.ar
          </div>
          <div className="mt-1">
            Documento generado el {fechaStr} por {vendedor}
          </div>
        </footer>
      </div>
    </>
  );
}
