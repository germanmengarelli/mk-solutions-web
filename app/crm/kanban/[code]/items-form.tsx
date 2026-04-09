"use client";

import { useMemo, useState } from "react";
import type { CrmItem } from "@/lib/crm-store";

const emptyItem: CrmItem = {
  product: "",
  quantity: 1,
  price: 0,
  supplier: "",
  cost: null,
  ivaRate: 21,
};

export function ItemsForm({
  initialItems,
  code,
}: {
  initialItems: CrmItem[];
  code: string;
}) {
  const [items, setItems] = useState<CrmItem[]>(
    initialItems.length ? initialItems : [{ ...emptyItem }]
  );

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
    <div className="grid gap-4">
      <input type="hidden" name="items_json" value={JSON.stringify(items)} />
      <input type="hidden" name="code" value={code} />

      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Productos / Items</h2>
        <button
          type="button"
          onClick={addItem}
          className="rounded-xl border px-3 py-2 text-sm hover:bg-muted/40"
        >
          + Agregar producto
        </button>
      </div>

      <div className="grid gap-3">
        {items.map((item, index) => (
          <div
            key={`item-${index}`}
            className="grid gap-3 rounded-xl border bg-background/40 p-4"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Producto
                </label>
                <input
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                  placeholder="Producto / Servicio"
                  value={item.product}
                  onChange={(e) =>
                    updateItem(index, { product: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Proveedor
                </label>
                <input
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                  placeholder="Proveedor"
                  value={item.supplier}
                  onChange={(e) =>
                    updateItem(index, { supplier: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Cantidad
                </label>
                <input
                  type="number"
                  min={1}
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                  placeholder="Cantidad"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(index, { quantity: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Precio de costo
                </label>
                <input
                  type="number"
                  min={0}
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                  placeholder="Costo"
                  value={item.cost ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateItem(index, { cost: value ? Number(value) : null });
                  }}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Precio de venta
                </label>
                <input
                  type="number"
                  min={0}
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                  placeholder="Precio venta"
                  value={item.price}
                  onChange={(e) =>
                    updateItem(index, { price: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  IVA %
                </label>
                <select
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
                  value={item.ivaRate ?? 21}
                  onChange={(e) =>
                    updateItem(index, { ivaRate: Number(e.target.value) })
                  }
                >
                  <option value={21}>21%</option>
                  <option value={10.5}>10,5%</option>
                  <option value={0}>Exento</option>
                </select>
              </div>
            </div>

            {items.length > 1 ? (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="justify-self-end text-xs text-muted-foreground hover:text-foreground"
              >
                Quitar
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-muted/40 px-4 py-3 text-sm">
        Total venta estimada:{" "}
        <strong className="text-base">${total.toLocaleString()}</strong>
      </div>
    </div>
  );
}
