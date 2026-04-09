import { Hero } from "@/components/sections/hero";
import { CTABand } from "@/components/sections/cta-band";
import { Brands } from "@/components/sections/brands";
import { Reveal } from "@/components/motion/reveal";

const categorias = [
  {
    t: "Notebooks & PCs",
    d: "Equipos para oficina, campo y operaciones. Estandarización de flota con soporte y garantía.",
    items: ["Notebooks empresariales", "PCs de escritorio", "Workstations", "Mini PCs", "Tablets"],
  },
  {
    t: "Impresión & Consumibles",
    d: "Impresoras laser, multifunción y plotters. Toner y consumibles originales y compatibles.",
    items: ["Impresoras laser", "Multifunción", "Toner original", "Consumibles compatibles"],
  },
  {
    t: "Monitores & Periféricos",
    d: "Monitores profesionales, teclados, mouse, docking stations y accesorios de productividad.",
    items: ["Monitores 24\" / 27\"", "Docking stations", "Teclados y mouse", "Webcams", "Auriculares"],
  },
  {
    t: "Servidores & Storage",
    d: "Servidores rack y torre, NAS, discos y soluciones de backup para PyMEs.",
    items: ["Servidores rack", "NAS", "Discos SSD/HDD", "UPS", "Rack y accesorios"],
  },
];

export default function InformaticaPage() {
  return (
    <>
      <Hero
        eyebrow="Equipamiento Informático"
        title="Equipos para operar, no para complicarte."
        subtitle="Notebooks, PCs, impresoras, monitores y servidores con enfoque B2B: selección inteligente, stock disponible y entrega confiable."
        secondaryCtaHref="/ftth"
        secondaryCtaLabel="Ver FTTH"
      />

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <Reveal>
          <div className="grid gap-5 md:grid-cols-2">
            {categorias.map((c) => (
              <div key={c.t} className="rounded-2xl border bg-card p-6">
                <div className="text-base font-semibold">{c.t}</div>
                <div className="mt-2 text-sm text-muted-foreground">{c.d}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {c.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border bg-background px-3 py-1 text-xs"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <Brands />
      <CTABand />
    </>
  );
}
