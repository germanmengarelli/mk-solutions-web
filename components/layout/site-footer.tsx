import { BrandLogo } from "@/components/brand/logo";
import { site } from "@/lib/site";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#070E1A] text-white">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-50" />

      <div className="relative mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <BrandLogo />
            <p className="max-w-md text-sm text-white/40">
              {site.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
            <div className="space-y-3">
              <div className="text-sm font-semibold text-white">Servicios</div>
              <ul className="space-y-2 text-sm text-white/40">
                <li>
                  <Link
                    href="/ftth"
                    className="transition hover:text-[#00B4D8]"
                  >
                    FTTH & Redes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/informatica"
                    className="transition hover:text-[#00B4D8]"
                  >
                    Informática
                  </Link>
                </li>
                <li className="transition hover:text-[#00B4D8]">
                  Soporte B2B
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <div className="text-sm font-semibold text-white">Contacto</div>
              <ul className="space-y-2 text-sm text-white/40">
                <li>{site.links.email}</li>
                <li>
                  <a
                    href={site.links.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="transition hover:text-[#00B4D8]"
                  >
                    WhatsApp Comercial
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <div className="text-sm font-semibold text-white">Cobertura</div>
              <ul className="space-y-2 text-sm text-white/40">
                <li>Argentina</li>
                <li>Entregas y logística</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 h-px bg-white/10" />

        <div className="flex flex-col gap-2 text-xs text-white/30 md:flex-row md:items-center md:justify-between">
          <span>&copy; {new Date().getFullYear()} MK Solutions</span>
          <span className="text-[#00B4D8]/60">Tech &bull; Conectividad &bull; B2B</span>
        </div>
      </div>
    </footer>
  );
}
