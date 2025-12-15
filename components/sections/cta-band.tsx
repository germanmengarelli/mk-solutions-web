import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

export function CTABand() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <Reveal>
        <div className="rounded-2xl border bg-card p-6 md:p-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold tracking-tight">
                ¿Necesitás cotizar hoy?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Contanos tu necesidad y te respondemos con opciones claras para B2B.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/contacto">Pedir cotización</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/ftth">Ver FTTH</Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
