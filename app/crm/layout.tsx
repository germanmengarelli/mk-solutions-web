import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CambiarPasswordButton from "./cambiar-password-button";

export const runtime = "nodejs";

type NavItem = {
  href: string;
  label: string;
  permisos?: string[];
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  { href: "/crm/dashboard", label: "Dashboard" },
  { href: "/crm/kanban", label: "Kanban" },
  { href: "/crm/leads", label: "Leads", permisos: ["leads"] },
  { href: "/crm/clientes", label: "Clientes", permisos: ["clientes"] },
  { href: "/crm/presupuestos", label: "Ordenes de Venta", permisos: ["presupuestos"] },
  { href: "/crm/productos", label: "Productos", permisos: ["productos"] },
  { href: "/crm/ordenes", label: "Órdenes", permisos: ["ordenes"] },
  { href: "/crm/finanzas", label: "Finanzas", adminOnly: true },
  { href: "/crm/comprobantes", label: "Comprobantes", adminOnly: true },
  { href: "/crm/usuarios", label: "Usuarios", adminOnly: true },
];

export default async function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login?next=/crm");

  const name = String((session as any)?.user?.name ?? "Usuario");
  const role = String((session as any)?.role ?? "");
  const permisos: string[] = (session as any)?.permisos ?? [];
  const isAdmin = role === "admin";

  const rolLabel =
    role === "admin"
      ? "Admin"
      : role === "comercial"
        ? "Comercial"
        : role === "vendedor"
          ? "Vendedor"
          : role;

  const visibleNav = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.permisos && !isAdmin) {
      return item.permisos.some((p) => permisos.includes(p));
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="print-hidden sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/crm/dashboard" className="flex items-center gap-2 text-sm font-semibold">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-mk.png" alt="MK Solutions" className="h-8 w-auto" />
              CRM MK Solutions
            </Link>
            <span className="text-xs text-muted-foreground">
              {name} {rolLabel ? `· ${rolLabel}` : ""}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <CambiarPasswordButton />
            <Link
              href="/"
              className="rounded-lg px-2 py-1.5 text-xs hover:bg-muted"
            >
              Web
            </Link>
            <Link
              href="/api/auth/signout"
              className="rounded-lg bg-foreground px-2 py-1.5 text-xs text-background"
            >
              Salir
            </Link>
          </div>
        </div>

        {/* Module nav — scrollable */}
        <div className="border-t">
          <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-1.5">
            {visibleNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
    </div>
  );
}
