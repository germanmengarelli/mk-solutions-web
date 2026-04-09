"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { BrandLogo } from "@/components/brand/logo";
import { site } from "@/lib/site";
import { Network, Cpu, Shield } from "lucide-react";

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
    <section className="relative overflow-hidden bg-[#0A1628] text-white">
      {/* Grid pattern background */}
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern" />

      {/* Glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,180,216,0.2),transparent_60%)] blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,119,182,0.18),transparent_60%)] blur-3xl" />
        <div className="absolute top-1/2 left-0 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(0,180,216,0.08),transparent_60%)] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-32">
        <Reveal>
          <div className="inline-flex items-center gap-2">
            <Badge className="border-cyan/30 bg-cyan/10 text-[#00B4D8] hover:bg-cyan/20">
              {eyebrow}
            </Badge>
            <span className="text-xs text-white/50">{site.tagline}</span>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-12 md:grid-cols-2 md:items-center">
          <div className="space-y-8">
            <Reveal delay={0.05}>
              <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
                <span className="text-white">Infraestructura </span>
                <span className="bg-gradient-to-r from-[#00B4D8] to-[#0077B6] bg-clip-text text-transparent">
                  y tecnología{" "}
                </span>
                <span className="text-white">para que tu operación </span>
                <span className="bg-gradient-to-r from-[#00B4D8] to-[#48CAE4] bg-clip-text text-transparent">
                  no se detenga.
                </span>
              </h1>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="max-w-lg text-base text-white/60 md:text-lg">
                {subtitle}
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-[#00B4D8] to-[#0077B6] text-white shadow-[0_0_24px_rgba(0,180,216,0.4)] transition-shadow hover:shadow-[0_0_32px_rgba(0,180,216,0.6)]"
                >
                  <Link href={primaryCtaHref}>{primaryCtaLabel}</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-white/5 text-white backdrop-blur hover:bg-white/10 hover:text-white"
                >
                  <Link href={secondaryCtaHref}>{secondaryCtaLabel}</Link>
                </Button>
              </div>
            </Reveal>
          </div>

          {/* Right side: Feature cards on glass */}
          <Reveal delay={0.12}>
            <div className="relative">
              {/* Glow behind card */}
              <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-[radial-gradient(circle_at_center,rgba(0,180,216,0.12),transparent_70%)] blur-2xl" />

              <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
                <div className="flex items-center justify-between">
                  <BrandLogo />
                  <Badge className="border-cyan/30 bg-cyan/10 text-[#00B4D8]">
                    MK
                  </Badge>
                </div>

                <div className="mt-6 grid gap-4">
                  {[
                    {
                      icon: Network,
                      title: "FTTH & Redes",
                      desc: "Fibra óptica, switches, routers, conectividad segura.",
                    },
                    {
                      icon: Cpu,
                      title: "Informática",
                      desc: "Notebooks, PCs, impresoras, monitores para operación.",
                    },
                    {
                      icon: Shield,
                      title: "Entrega B2B",
                      desc: "Velocidad + criterio técnico + soporte comercial.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="group rounded-xl border border-white/8 bg-white/[0.03] p-4 transition-all hover:border-[#00B4D8]/30 hover:bg-white/[0.06]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00B4D8]/10">
                          <item.icon className="h-4 w-4 text-[#00B4D8]" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {item.title}
                          </div>
                          <div className="mt-1 text-sm text-white/50">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
