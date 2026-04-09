import { Reveal } from "@/components/motion/reveal";
import { Cpu, Network, Monitor, HeadphonesIcon } from "lucide-react";

export function About() {
  const features = [
    { icon: Network, n: "FTTH", d: "ONTs, OLTs, splitters, cables, herramental" },
    { icon: Cpu, n: "Networking", d: "Switches, routers, access points, firewalls" },
    { icon: Monitor, n: "IT", d: "Notebooks, PCs, monitores, impresoras" },
    { icon: HeadphonesIcon, n: "Soporte", d: "Asesoramiento técnico pre y post venta" },
  ];

  return (
    <section className="relative overflow-hidden bg-[#0D1B2A] text-white">
      {/* Subtle cyan gradient on left */}
      <div className="pointer-events-none absolute -left-40 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(0,180,216,0.08),transparent_60%)] blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <Reveal>
              <span className="text-xs font-medium uppercase tracking-widest text-[#00B4D8]">
                Quiénes somos
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
                Tecnología B2B con{" "}
                <span className="bg-gradient-to-r from-[#00B4D8] to-[#0077B6] bg-clip-text text-transparent">
                  criterio técnico.
                </span>
              </h2>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="mt-5 space-y-3 text-sm text-white/50">
                <p>
                  MK Solutions nació para resolver una necesidad concreta: que las
                  empresas de telecomunicaciones e IT puedan comprar equipamiento
                  con respuesta rápida, asesoramiento real y entrega confiable.
                </p>
                <p>
                  Trabajamos con proveedores directos y mantenemos stock propio
                  para garantizar disponibilidad. No vendemos catálogos: entendemos
                  tu operación y te ayudamos a elegir lo que necesitás.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.n} delay={idx * 0.06}>
                  <div className="glass-card rounded-2xl p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00B4D8]/10">
                      <Icon className="h-4 w-4 text-[#00B4D8]" />
                    </div>
                    <div className="mt-3 text-sm font-semibold text-white">
                      {item.n}
                    </div>
                    <div className="mt-1 text-xs text-white/40">
                      {item.d}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
