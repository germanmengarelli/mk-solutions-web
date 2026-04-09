import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

export function CTABand() {
  return (
    <section className="relative overflow-hidden bg-[#0A1628]">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern" />

      {/* Glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,180,216,0.15),transparent_60%)] blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,119,182,0.12),transparent_60%)] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-20">
        <Reveal>
          <div className="flex flex-col items-center gap-6 text-center">
            <h3 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              ¿Necesitás{" "}
              <span className="bg-gradient-to-r from-[#00B4D8] to-[#48CAE4] bg-clip-text text-transparent">
                cotizar hoy?
              </span>
            </h3>
            <p className="max-w-lg text-sm text-white/50">
              Contanos tu necesidad y te respondemos con opciones claras para
              B2B. Respuesta en menos de 24 horas.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-[#00B4D8] to-[#0077B6] text-white shadow-[0_0_24px_rgba(0,180,216,0.4)] transition-shadow hover:shadow-[0_0_32px_rgba(0,180,216,0.6)]"
              >
                <Link href="/contacto">Pedir cotización</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/ftth">Ver FTTH</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
