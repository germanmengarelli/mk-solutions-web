import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { BrandLogo } from "@/components/brand/logo";
import { site } from "@/lib/site";

export function Hero({
  eyebrow = "B2B Technology Partner",
  title = "Conectividad y tecnología sin fricción.",
  subtitle = "Soluciones FTTH y equipamiento informático para empresas. Respuesta ágil, criterio técnico y foco en continuidad operativa.",
  primaryCtaHref = "/contacto",
  primaryCtaLabel = "Pedir cotización",
  secondaryCtaHref = "/ftth",
  secondaryCtaLabel = "Ver vertical FTTH",
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCtaHref?: string;
  primaryCtaLabel?: string;
  secondaryCtaHref?: string;
  secondaryCtaLabel?: string;
}) {
  return (
    <section className="relative overflow-hidden">
      {/* glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.35),transparent_60%)] blur-2xl" />
        <div className="absolute -bottom-40 right-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.22),transparent_60%)] blur-2xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <Reveal>
          <div className="inline-flex items-center gap-2">
            <Badge variant="secondary">{eyebrow}</Badge>
            <span className="text-xs text-muted-foreground">{site.tagline}</span>
          </div>
        </Reveal>

        <div className="mt-6 grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <Reveal delay={0.05}>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                {title}
              </h1>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="text-base text-muted-foreground md:text-lg">
                {subtitle}
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href={primaryCtaHref}>{primaryCtaLabel}</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href={secondaryCtaHref}>{secondaryCtaLabel}</Link>
                </Button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.12}>
            <div className="relative rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                {/* Logo +20% (antes: scale-105) */}
                <div className="scale-[1.26] origin-left">
                  <BrandLogo />
                </div>

                <Badge className="bg-foreground text-background">MK</Badge>
              </div>

              <div className="mt-6 grid gap-4">
                <div className="rounded-xl border bg-background p-4">
                  <div className="text-sm font-medium">FTTH & Redes</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Fibra óptica, switches, routers, conectividad segura.
                  </div>
                </div>

                <div className="rounded-xl border bg-background p-4">
                  <div className="text-sm font-medium">Informática</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Notebooks, PCs, impresoras, monitores para operación.
                  </div>
                </div>

                <div className="rounded-xl border bg-background p-4">
                  <div className="text-sm font-medium">Entrega B2B</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Velocidad + criterio técnico + soporte comercial.
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}