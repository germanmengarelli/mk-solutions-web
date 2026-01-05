import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

export default async function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login?next=/crm");

  const name = String((session as any)?.user?.name ?? "Usuario");
  const role = String((session as any)?.role ?? "");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold">CRM MK Solutions</div>
            <span className="text-xs text-muted-foreground">
              {name} {role ? `· ${role}` : ""}
            </span>
          </div>

          <nav className="flex items-center gap-2">
            <Link
              href="/crm/leads"
              className="rounded-lg px-3 py-2 text-sm hover:bg-muted"
            >
              Leads
            </Link>

            <Link
              href="/"
              className="rounded-lg px-3 py-2 text-sm hover:bg-muted"
            >
              Web
            </Link>

            <Link
              href="/api/auth/signout"
              className="rounded-lg bg-foreground px-3 py-2 text-sm text-background"
            >
              Salir
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
<Link
  href="/crm/tareas"
  className="rounded-lg px-3 py-2 text-sm hover:bg-muted"
>
  Tareas
</Link>
