import { Hero } from "@/components/sections/hero";
import { CTABand } from "@/components/sections/cta-band";

export default function FtthPage() {
  return (
    <>
      <Hero
        eyebrow="FTTH & Redes"
        title="Infraestructura de red lista para escalar."
        subtitle="Fibra óptica, switching y routing con criterio técnico B2B. Menos fricción, más continuidad."
        secondaryCtaHref="/informatica"
        secondaryCtaLabel="Ver Informática"
      />

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { t: "Fibra óptica", d: "Conectores, patch cords, ODF y misceláneos." },
            { t: "Switching", d: "Acceso y distribución para entornos exigentes." },
            { t: "Routing", d: "Equipos para borde y segmentación eficiente." },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border bg-card p-6">
              <div className="text-sm font-semibold">{c.t}</div>
              <div className="mt-2 text-sm text-muted-foreground">{c.d}</div>
            </div>
          ))}
        </div>
      </section>

      <CTABand />
    </>
  );
}
