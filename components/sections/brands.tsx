import { Reveal } from "@/components/motion/reveal";

const brands = [
  "MikroTik",
  "TP-Link",
  "Ubiquiti",
  "Furukawa",
  "Huawei",
  "HP",
  "Lenovo",
  "ZTE",
];

export function Brands() {
  return (
    <section className="overflow-hidden border-t border-white/5 bg-[#0D1B2A] py-12">
      <Reveal>
        <p className="text-center text-xs font-medium uppercase tracking-widest text-white/40">
          Marcas con las que trabajamos
        </p>
      </Reveal>

      {/* Infinite scroll carousel */}
      <div className="relative mt-8">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-[#0D1B2A] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-[#0D1B2A] to-transparent" />

        <div className="flex animate-scroll-brands">
          {/* Double the items for seamless loop */}
          {[...brands, ...brands].map((brand, i) => (
            <span
              key={`${brand}-${i}`}
              className="mx-8 shrink-0 text-xl font-bold text-white/20 transition hover:text-[#00B4D8] md:mx-12 md:text-2xl"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
