"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { site } from "@/lib/site";

type FormState = {
  empresa: string;
  contacto: string;
  email: string;
  necesidad: string;
  // honeypot anti-bots
  website: string;
};

export default function ContactoPage() {
  const [form, setForm] = useState<FormState>({
    empresa: "",
    contacto: "",
    email: "",
    necesidad: "",
    website: "",
  });

  const [loading, setLoading] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function validate() {
    if (form.empresa.trim().length < 2) return "Ingresá la empresa.";
    if (form.contacto.trim().length < 2) return "Ingresá el contacto.";
    if (!form.email.includes("@")) return "Ingresá un email válido.";
    if (form.necesidad.trim().length < 5) return "Contanos un poco más de la necesidad.";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOkMsg(null);
    setErrMsg(null);

    const v = validate();
    if (v) {
      setErrMsg(v);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setErrMsg(data?.error ?? "No se pudo enviar. Probá de nuevo.");
        setLoading(false);
        return;
      }

      setOkMsg("¡Listo! Recibimos tu consulta. Te respondemos a la brevedad.");
      setForm({ empresa: "", contacto: "", email: "", necesidad: "", website: "" });
    } catch {
      setErrMsg("Error de red. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

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
            <form className="grid gap-4" onSubmit={onSubmit}>
              {/* Honeypot (anti-bots) - oculto */}
              <div className="hidden">
                <label className="text-sm font-medium">Website</label>
                <Input
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                  placeholder="No completar"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Empresa</label>
                <Input
                  placeholder="Nombre de la empresa"
                  value={form.empresa}
                  onChange={(e) => set("empresa", e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Contacto</label>
                <Input
                  placeholder="Nombre y apellido"
                  value={form.contacto}
                  onChange={(e) => set("contacto", e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Necesidad</label>
                <Textarea
                  placeholder="Ej: Conectores fibra + switches / Notebooks + monitores, cantidades y urgencia"
                  value={form.necesidad}
                  onChange={(e) => set("necesidad", e.target.value)}
                  required
                />
              </div>

              {errMsg && (
                <div className="rounded-xl border px-3 py-2 text-sm">
                  {errMsg}
                </div>
              )}

              {okMsg && (
                <div className="rounded-xl border px-3 py-2 text-sm">
                  {okMsg}
                </div>
              )}

              <Button type="submit" size="lg" disabled={loading}>
                {loading ? "Enviando..." : "Enviar"}
              </Button>

              <p className="text-xs text-muted-foreground">
                *Tu consulta se guarda automáticamente en nuestro sistema.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
