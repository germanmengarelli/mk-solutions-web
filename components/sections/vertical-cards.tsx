import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { Network, Laptop, ArrowRight } from "lucide-react";

const items = [
  {
    title: "FTTH & Redes",
    desc: "Equipamiento para despliegues y operación: fibra óptica, conectividad, switching y routing. Te damos opciones compatibles y listas para implementar.",
    href: "/ftth",
    icon: Network,
    bullets: ["Fibra óptica", "Switches & Routers", "Conectividad B2B"],
  },
  {
    title: "Informática",
    desc: "Notebooks, PCs, impresión y monitores para equipos de trabajo. Armamos alternativas por performance/price y estandarizamos tu parque.",
    href: "/informatica",
    icon: Laptop,
    bullets: ["Notebooks & PCs", "Impresión", "Monitores"],
  },
];

export function VerticalCards() {
  return (
    <section className="relative overflow-hidden bg-[#0A1628] text-white">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-20">
        <Reveal>
          <div className="text-center">
            <span className="text-xs font-medium uppercase tracking-widest text-[#00B4D8]">
              Nuestras verticales
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
              Dos verticales.{" "}
              <span className="bg-gradient-to-r from-[#00B4D8] to-[#48CAE4] bg-clip-text text-transparent">
                Un estándar.
              </span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/50">
              Tecnología diseñada para continuidad operativa y escalabilidad.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {items.map((it, idx) => {
            const Icon = it.icon;
            return (
              <Reveal key={it.href} delay={idx * 0.08}>
                <div className="glass-card group rounded-2xl p-6 md:p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00B4D8]/10">
                    <Icon className="h-6 w-6 text-[#00B4D8]" />
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-white">
                    {it.title}
                  </h3>
                  <p className="mt-3 text-sm text-white/50">{it.desc}</p>

                  <ul className="mt-5 grid gap-2">
                    {it.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-center gap-2 text-sm text-white/60"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#00B4D8]" />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    <Button
                      asChild
                      variant="ghost"
                      className="gap-2 text-[#00B4D8] hover:bg-[#00B4D8]/10 hover:text-[#00B4D8]"
                    >
                      <Link href={it.href}>
                        Explorar {it.title}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
