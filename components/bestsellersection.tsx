"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type BestSeller = {
  id: string;
  name: string;
  brand?: string;
  short: string;
  imageSrc: string; // en /public/...
  tags?: string[];
};

type LeadPayload = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  productId: string;
  productName: string;
  source: string;
  websitePath: string;
  // honeypot
  website?: string;
};

export default function BestSellersSection({
  title = "Productos más vendidos",
  subtitle = "Pedí cotización y te contacta un comercial.",
  source = "best_sellers_section",
}: {
  title?: string;
  subtitle?: string;
  source?: string;
}) {
  const products: BestSeller[] = useMemo(
    () => [
      {
        id: "ont-hs8346x6-c",
        name: "ONT Huawei EchoLife HS8346X6-C",
        brand: "Huawei",
        short: "ONT Wi-Fi 6 para FTTH, ideal para hogares y pymes.",
        imageSrc: "/products/hs8346x6c.jpg",
        tags: ["FTTH", "Wi-Fi 6", "ONT"],
      },
      {
        id: "repeater-wa8021v5",
        name: "Repetidor Wi-Fi Huawei WA8021V5",
        brand: "Huawei",
        short: "Extensión de cobertura Wi-Fi, instalación simple.",
        imageSrc: "/products/wa8021v5.jpg",
        tags: ["Wi-Fi", "Mesh", "Cobertura"],
      },
      {
        id: "switch-s6730",
        name: "Switch Huawei CloudEngine S6730",
        brand: "Huawei",
        short: "Switching enterprise para campus y core.",
        imageSrc: "/products/s6730.jpg",
        tags: ["Switch", "Enterprise"],
      },
      {
        id: "mikrotik-router",
        name: "Router MikroTik (línea ISP/SMB)",
        brand: "MikroTik",
        short: "Routing y firewall para ISPs y pymes.",
        imageSrc: "/products/mikrotik-router.jpg",
        tags: ["Routing", "Firewall"],
      },
    ],
    []
  );

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<BestSeller | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  function openLead(p: BestSeller) {
    setSelected(p);
    setStatus("idle");
    setErrorMsg("");
    setOpen(true);
  }

  async function submitLead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;

    setStatus("loading");
    setErrorMsg("");

    const form = new FormData(e.currentTarget);

    const payload: LeadPayload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      company: String(form.get("company") || ""),
      message: String(form.get("message") || ""),
      productId: selected.id,
      productName: selected.name,
      source,
      websitePath: typeof window !== "undefined" ? window.location.pathname : "/",
      website: String(form.get("website") || ""), // honeypot
    };

    // Validación mínima
    if (!payload.name.trim() || !payload.email.trim()) {
      setStatus("error");
      setErrorMsg("Por favor completá nombre y email.");
      return;
    }

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "No se pudo enviar el lead.");
      }

      setStatus("ok");
      // opcional: cerrar modal tras 1.2s
      setTimeout(() => setOpen(false), 1200);
      (e.currentTarget as HTMLFormElement).reset();
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Error inesperado.");
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-sm text-neutral-600">{subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <article
            key={p.id}
            className="rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-neutral-50">
              <Image
                src={p.imageSrc}
                alt={p.name}
                fill
                className="object-contain p-3"
                sizes="(max-width: 1024px) 50vw, 25vw"
              />
            </div>

            <div className="p-4">
              <h3 className="text-base font-semibold leading-snug">{p.name}</h3>
              <p className="mt-2 text-sm text-neutral-600">{p.short}</p>

              {!!p.tags?.length && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={() => openLead(p)}
                className="mt-4 w-full rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Quiero cotización
              </button>

              {/* Fallback simple (opcional): mailto directo sin formulario */}
              {/* 
              <a
                className="mt-2 block w-full rounded-xl border border-neutral-300 px-4 py-2 text-center text-sm font-medium hover:bg-neutral-50"
                href={`mailto:comercial@mksolutions.com.ar?subject=Cotización%20-%20${encodeURIComponent(
                  p.name
                )}&body=${encodeURIComponent(
                  `Hola, quiero cotización por: ${p.name}\n\nNombre:\nEmpresa:\nTeléfono:\nMensaje:`
                )}`}
              >
                Enviar por email
              </a> 
              */}
            </div>
          </article>
        ))}
      </div>

      {/* Modal */}
      {open && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-neutral-200 p-5">
              <div>
                <h4 className="text-lg font-semibold">Solicitar cotización</h4>
                <p className="mt-1 text-sm text-neutral-600">{selected.name}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2 text-sm hover:bg-neutral-100"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitLead} className="p-5">
              {/* honeypot */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Nombre *</label>
                  <input
                    name="name"
                    className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                    placeholder="Tu nombre"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email *</label>
                  <input
                    name="email"
                    type="email"
                    className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Teléfono</label>
                  <input
                    name="phone"
                    className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                    placeholder="+54 ..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Empresa</label>
                  <input
                    name="company"
                    className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                    placeholder="Empresa"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="text-sm font-medium">Mensaje</label>
                <textarea
                  name="message"
                  className="mt-1 h-24 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                  placeholder="Contanos cantidad, zona, plazo, etc."
                />
              </div>

              {status === "error" && (
                <p className="mt-3 text-sm text-red-600">{errorMsg}</p>
              )}
              {status === "ok" && (
                <p className="mt-3 text-sm text-green-700">
                  ¡Listo! Te va a contactar un comercial.
                </p>
              )}

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
                  disabled={status === "loading"}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
