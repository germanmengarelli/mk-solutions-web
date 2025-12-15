import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { site } from "@/lib/site";

export default function ContactoPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid gap-8 md:grid-cols-2 md:items-start">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Contacto</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Contanos qué necesitás (FTTH / Informática) y respondemos con opciones claras.
          </p>

          <div className="mt-6 rounded-2xl border bg-card p-6">
            <div className="text-sm font-medium">Canales directos</div>
            <div className="mt-2 text-sm text-muted-foreground">
              Email: {site.links.email}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              WhatsApp: Comercial
            </div>
            <div className="mt-5">
              <Button asChild variant="secondary">
                <a href={site.links.whatsapp} target="_blank" rel="noreferrer">
                  Abrir WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>

        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <form className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Empresa</label>
                <Input placeholder="Nombre de la empresa" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Contacto</label>
                <Input placeholder="Nombre y apellido" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="tu@email.com" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Necesidad</label>
                <Textarea placeholder="Ej: Conectores fibra + switches / Notebooks + monitores, cantidades y urgencia" />
              </div>

              <Button type="button" size="lg">
                Enviar (demo)
              </Button>
              <p className="text-xs text-muted-foreground">
                *Formulario sin backend. Integrá EmailJS / API Route cuando definas el envío.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
