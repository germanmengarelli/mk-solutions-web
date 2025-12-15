import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { Cable, Network, Laptop, Printer, Monitor } from "lucide-react";

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
    <section className="mx-auto max-w-6xl px-4 py-14 md:py-16">
      <Reveal>
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Dos verticales. Un estándar.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tecnología diseñada para continuidad operativa y escalabilidad.
            </p>
          </div>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {items.map((it, idx) => {
          const Icon = it.icon;
          return (
            <Reveal key={it.href} delay={idx * 0.06}>
              <Card className="rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">{it.title}</h3>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {it.desc}
                      </p>

                      <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
                        {it.bullets.map((b) => (
                          <li key={b} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-foreground/70" />
                            {b}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-6">
                        <Button asChild variant="secondary">
                          <Link href={it.href}>Explorar {it.title}</Link>
                        </Button>
                      </div>
                    </div>

                    <div className="hidden md:flex flex-col gap-2 text-muted-foreground">
                      <Cable className="h-5 w-5" />
                      <Printer className="h-5 w-5" />
                      <Monitor className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
