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
    <header className="sticky top-0 z-50 border-b bg-background/70 backdrop-blur">
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
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      "absolute -bottom-2 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-primary transition",
                      active && "scale-x-100"
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right CTAs */}
          <div className="flex items-center gap-2">
            <Button asChild variant="secondary" className="hidden md:inline-flex">
              <a href={site.links.whatsapp} target="_blank" rel="noreferrer">
                Cotizar por WhatsApp
              </a>
            </Button>

            <Button
              asChild
              className="relative overflow-hidden shadow-sm"
            >
              <Link href="/contacto">
                <span className="relative z-10">Contactame</span>
                {/* glow */}
                <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity hover:opacity-100">
                  <span className="absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.35),transparent_60%)] blur-2xl" />
                </span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Mobile nav (simple + premium) */}
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
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-border bg-background text-muted-foreground"
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
            className="whitespace-nowrap rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}
