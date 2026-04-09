"use client";

import { Reveal } from "@/components/motion/reveal";
import { Zap, Target, Truck } from "lucide-react";

export function TrustStrip() {
  const items = [
    {
      icon: Zap,
      t: "Respuesta ágil",
      d: "Cotización clara y rápida para compras B2B.",
      stat: "24hs",
      statLabel: "respuesta promedio",
    },
    {
      icon: Target,
      t: "Criterio técnico",
      d: "Te ayudamos a elegir lo correcto, sin sobrecostos.",
      stat: "+500",
      statLabel: "proyectos entregados",
    },
    {
      icon: Truck,
      t: "Entrega y continuidad",
      d: "Equipos para operar: disponibilidad + logística.",
      stat: "100%",
      statLabel: "compromiso de entrega",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#0A1628] text-white">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-20">
        <Reveal>
          <div className="text-center">
            <span className="text-xs font-medium uppercase tracking-widest text-[#00B4D8]">
              Cómo trabajamos
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
              Simple, técnico y orientado a{" "}
              <span className="bg-gradient-to-r from-[#00B4D8] to-[#48CAE4] bg-clip-text text-transparent">
                resultados.
              </span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/50">
              Menos vueltas, más claridad: te acompañamos desde la necesidad
              hasta la entrega.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((it, idx) => {
            const Icon = it.icon;
            return (
              <Reveal key={it.t} delay={idx * 0.08}>
                <div className="glass-card rounded-2xl p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#00B4D8]/10">
                    <Icon className="h-6 w-6 text-[#00B4D8]" />
                  </div>
                  <div className="mt-4 text-3xl font-bold text-[#00B4D8]">
                    {it.stat}
                  </div>
                  <div className="text-xs text-white/40">{it.statLabel}</div>
                  <div className="mt-3 text-base font-semibold text-white">
                    {it.t}
                  </div>
                  <div className="mt-2 text-sm text-white/50">{it.d}</div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
