"use client";

import { useMemo, useState } from "react";
import type { CrmItem } from "@/lib/crm-store";

const emptyItem: CrmItem = {
  product: "",
  quantity: 1,
  price: 0,
  supplier: "",
  cost: null,
};

export function PropuestaFormFields({
  initialItems,
  initialResultado,
}: {
  initialItems: CrmItem[];
  initialResultado: string;
}) {
  const [items, setItems] = useState<CrmItem[]>(
    initialItems.length ? initialItems : [emptyItem]
  );
  const [resultado, setResultado] = useState(initialResultado);

  const total = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  }, [items]);

  function updateItem(index: number, patch: Partial<CrmItem>) {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item))
    );
  }

  function addItem() {
    setItems((prev) => [...prev, { ...emptyItem }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Ítems cotizados</h4>
        <button
          type="button"
          onClick={addItem}
          className="rounded-lg border px-2 py-1 text-xs"
        >
          + Agregar ítem
        </button>
      </div>

      <div className="grid gap-3">
        {items.map((item, index) => (
          <div
            key={`${index}-${item.product}`}
            className="grid gap-2 rounded-xl border bg-background/40 p-3"
          >
            <div className="grid gap-2 md:grid-cols-2">
              <input
                className="h-10 rounded-lg border bg-background px-2 text-sm"
                placeholder="Producto/Servicio"
                value={item.product}
                onChange={(e) => updateItem(index, { product: e.target.value })}
                required
              />
              <input
                className="h-10 rounded-lg border bg-background px-2 text-sm"
                placeholder="Proveedor"
                value={item.supplier}
                onChange={(e) => updateItem(index, { supplier: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2 md:grid-cols-3">
              <input
                type="number"
                min={1}
                className="h-10 rounded-lg border bg-background px-2 text-sm"
                placeholder="Cantidad"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(index, { quantity: Number(e.target.value) })
                }
                required
              />
              <input
                type="number"
                min={0}
                className="h-10 rounded-lg border bg-background px-2 text-sm"
                placeholder="Precio venta"
                value={item.price}
                onChange={(e) =>
                  updateItem(index, { price: Number(e.target.value) })
                }
                required
              />
              <input
                type="number"
                min={0}
                className="h-10 rounded-lg border bg-background px-2 text-sm"
                placeholder="Costo (opcional)"
                value={item.cost ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  updateItem(index, { cost: value ? Number(value) : null });
                }}
              />
            </div>

            {items.length > 1 ? (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Quitar ítem
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <input type="hidden" name="items_json" value={JSON.stringify(items)} />

      <div className="rounded-lg border bg-muted/40 px-3 py-2 text-xs">
        Total venta estimada: <strong>${total.toLocaleString()}</strong>
      </div>

      <select
        name="resultado"
        className="h-10 rounded-lg border bg-background px-2 text-sm"
        value={resultado}
        onChange={(e) => setResultado(e.target.value)}
        required
      >
        <option value="">Resultado *</option>
        <option value="Aceptado">Aceptado</option>
        <option value="Rechazado">Rechazado</option>
      </select>

      {resultado === "Rechazado" ? (
        <textarea
          name="motivo_rechazo"
          className="min-h-[80px] rounded-lg border bg-background px-2 py-2 text-sm"
          placeholder="Motivo de rechazo"
          required
        />
      ) : null}
    </div>
  );
}
