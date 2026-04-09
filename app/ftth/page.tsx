import { Hero } from "@/components/sections/hero";
import { CTABand } from "@/components/sections/cta-band";
import { Brands } from "@/components/sections/brands";
import { Reveal } from "@/components/motion/reveal";

const categorias = [
  {
    t: "Fibra óptica",
    d: "Cables drop y troncal, conectores SC/APC, patch cords, pigtails, ODF, bandejas de empalme, splitters PLC 1x8/1x16/1x32.",
    items: ["Cable drop 1 hilo", "Cable troncal ADSS", "Splitters PLC", "Conectores SC/APC", "Patch cords", "ODF y bandejas"],
  },
  {
    t: "ONTs y OLTs",
    d: "Equipos de acceso y cabecera para redes GPON/EPON. Marcas líderes con soporte local.",
    items: ["ONT GPON", "OLT 8/16 puertos", "SFP GPON", "Módulos PON", "Firmware y licencias"],
  },
  {
    t: "Switching & Routing",
    d: "Equipos de distribución y borde para redes de acceso, transporte y backbone.",
    items: ["Switches capa 2/3", "Routers MikroTik", "Access points", "Firewalls", "PoE injectors"],
  },
  {
    t: "Herramental",
    d: "Fusionadoras, OTDR, herramientas de terminación y testeo para instalaciones profesionales.",
    items: ["Fusionadora", "OTDR", "Cortadora de fibra", "Peladora de cables", "Kit de limpieza"],
  },
];

export default function FtthPage() {
  return (
    <>
      <Hero
        eyebrow="FTTH & Redes"
        title="Infraestructura de red lista para escalar."
        subtitle="Fibra óptica, switching y routing con criterio técnico B2B. Desde la OLT hasta la última milla, todo lo que necesitás para desplegar y mantener tu red."
        secondaryCtaHref="/informatica"
        secondaryCtaLabel="Ver Informática"
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
