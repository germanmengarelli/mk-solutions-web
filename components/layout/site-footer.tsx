import { BrandLogo } from "@/components/brand/logo";
import { site } from "@/lib/site";
import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <BrandLogo />
            <p className="max-w-md text-sm text-muted-foreground">
              {site.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-sm font-medium">Servicios</div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>FTTH & Redes</li>
                <li>Informática</li>
                <li>Soporte B2B</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Contacto</div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>{site.links.email}</li>
                <li>WhatsApp Comercial</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Cobertura</div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Argentina</li>
                <li>Entregas y logística</li>
              </ul>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col gap-2 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} MK Solutions</span>
          <span>Minimal • Tech • B2B</span>
        </div>
      </div>
    </footer>
  );
}
