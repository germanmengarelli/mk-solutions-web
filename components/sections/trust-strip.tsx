import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";

export function TrustStrip() {
  const items = [
    {
      t: "Respuesta ágil",
      d: "Cotización clara y rápida para compras B2B.",
    },
    {
      t: "Criterio técnico",
      d: "Te ayudamos a elegir lo correcto, sin sobrecostos.",
    },
    {
      t: "Entrega y continuidad",
      d: "Equipos para operar: disponibilidad + logística.",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 pb-14">
      <Reveal>
        <div className="rounded-2xl border bg-card p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge variant="secondary">Cómo trabajamos</Badge>
              <h2 className="text-2xl font-semibold tracking-tight">
                Simple, técnico y orientado a resultados.
              </h2>
              <p className="text-sm text-muted-foreground">
                Menos vueltas, más claridad: te acompañamos desde la necesidad hasta la entrega.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {items.map((it) => (
                <div key={it.t} className="rounded-xl border bg-background p-4">
                  <div className="text-sm font-semibold">{it.t}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{it.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
