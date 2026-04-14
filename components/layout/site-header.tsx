"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand/logo";
import { site } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="print-hidden sticky top-0 z-50 bg-[#0A1628]/90 backdrop-blur-lg">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left */}
          <Link href="/" className="flex items-center">
            <BrandLogo size="lg" />
          </Link>

          {/* Center nav (desktop) */}
          <nav className="hidden items-center gap-8 md:flex">
            {site.nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative text-sm font-medium transition",
                    active
                      ? "text-white"
                      : "text-white/60 hover:text-white"
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      "absolute -bottom-2 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-[#00B4D8] transition",
                      active && "scale-x-100"
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right CTAs */}
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              className="hidden text-white/70 hover:bg-white/10 hover:text-white md:inline-flex"
            >
              <a href={site.links.whatsapp} target="_blank" rel="noreferrer">
                Cotizar por WhatsApp
              </a>
            </Button>

            <Button
              asChild
              className="relative overflow-hidden bg-gradient-to-r from-[#00B4D8] to-[#0077B6] text-white shadow-[0_0_16px_rgba(0,180,216,0.3)] transition-shadow hover:shadow-[0_0_24px_rgba(0,180,216,0.5)]"
            >
              <Link href="/contacto">Contactame</Link>
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden">
          {site.nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-full border px-3 py-1 text-xs transition",
                  active
                    ? "border-[#00B4D8]/40 bg-[#00B4D8]/10 text-white"
                    : "border-white/10 bg-white/5 text-white/60"
                )}
              >
                {item.label}
              </Link>
            );
          })}

          <a
            href={site.links.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}
