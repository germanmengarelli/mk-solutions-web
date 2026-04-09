"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="h-10 rounded-xl bg-foreground px-5 text-sm text-background"
    >
      Imprimir / Guardar PDF
    </button>
  );
}
