import { Hero } from "@/components/sections/hero";
import { CTABand } from "@/components/sections/cta-band";

export default function InformaticaPage() {
  return (
    <>
      <Hero
        eyebrow="Equipamiento Informático"
        title="Equipos para operar, no para complicarte."
        subtitle="Notebooks, PCs, impresoras y monitores con enfoque B2B: selección inteligente y entrega confiable."
        secondaryCtaHref="/ftth"
        secondaryCtaLabel="Ver FTTH"
      />

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { t: "Notebooks & PCs", d: "Estandarización, performance y soporte." },
            { t: "Impresión", d: "Impresoras y consumibles para continuidad." },
            { t: "Monitores", d: "Productividad: tamaños, ergonomía y stock." },
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
