import { Hero } from "@/components/sections/hero";
import { VerticalCards } from "@/components/sections/vertical-cards";
import { CTABand } from "@/components/sections/cta-band";
import { TrustStrip } from "@/components/sections/trust-strip";

export default function HomePage() {
  return (
    <>
      <Hero
        eyebrow="MK Solutions • B2B"
        title="Infraestructura y tecnología para que tu operación no se detenga."
        subtitle="Proveemos equipamiento FTTH y tecnología informática con criterio técnico, respuesta ágil y foco en continuidad. Cotizá rápido, elegí bien, entregá a tiempo."
        primaryCtaLabel="Cotizar ahora"
        primaryCtaHref="/contacto"
        secondaryCtaLabel="Ver verticales"
        secondaryCtaHref="#verticales"
      />
      <TrustStrip />
      <div id="verticales">
        <VerticalCards />
      </div>
      <CTABand />
    </>
  );
}
