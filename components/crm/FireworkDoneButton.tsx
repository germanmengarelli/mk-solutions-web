"use client";

import { useRef, useState } from "react";

type Particle = {
  dx: number;
  dy: number;
  delayMs: number;
  durMs: number;
  size: number;
  color: string;
};

const COLORS = [
  "#60a5fa", // azul
  "#22d3ee", // cian
  "#a78bfa", // violeta
  "#34d399", // verde
  "#fbbf24", // amarillo
  "#fb7185", // rosa
  "#f472b6", // fucsia
  "#38bdf8", // celeste
];

function buildBurst(r: number, count: number, durMs: number, size: number, seed: number) {
  const out: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;

    // Variación sutil para que no sea un círculo perfecto
    const jitter = 0.85 + (((i + seed) % 5) / 20); // 0.85..1.05
    const dx = Math.cos(angle) * r * jitter;
    const dy = Math.sin(angle) * r * jitter;

    out.push({
      dx,
      dy,
      delayMs: i * 10,
      durMs,
      size: size + ((i + seed) % 3) * 0.6,
      color: COLORS[(i + seed) % COLORS.length],
    });
  }
  return out;
}

function playPop() {
  try {
    const AudioCtx =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx: AudioContext = new AudioCtx();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Sonido tipo "pop" (muy cortito, agradable)
    osc.type = "triangle";
    const t0 = ctx.currentTime;

    // Barrido de frecuencia (punchy)
    osc.frequency.setValueAtTime(520, t0);
    osc.frequency.exponentialRampToValueAtTime(220, t0 + 0.12);

    // Envolvente de volumen (ataque rápido, caída suave)
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.12, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t0);
    osc.stop(t0 + 0.18);

    // Cerrar contexto luego (evita “acumular” recursos)
    osc.onended = () => {
      try {
        ctx.close();
      } catch {}
    };
  } catch {
    // Si el navegador bloquea audio por alguna razón, no pasa nada.
  }
}

export function FireworkDoneButton({ label = "Hecho" }: { label?: string }) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [burst, setBurst] = useState(0);

  function onClick() {
    // 1) Efectos
    setBurst((x) => x + 1);
    playPop();

    // 2) Submit un poquito después para que se vea el halo + fueguito
    const form = btnRef.current?.closest("form") as HTMLFormElement | null;
    if (form) {
      setTimeout(() => form.requestSubmit(), 220);
    }
  }

  // Doble explosión: anillo chico + grande
  const seed = burst % 1000;
  const inner = buildBurst(16, 12, 520, 2.2, seed);
  const outer = buildBurst(30, 14, 720, 2.0, seed + 7);

  return (
    <div className="relative inline-flex items-center">
      {/* Halo suave detrás del botón */}
      <div
        key={`halo-${burst}`}
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="mk-halo absolute left-1/2 top-1/2" />
      </div>

      <button
        ref={btnRef}
        type="button"
        onClick={onClick}
        className="relative h-9 rounded-lg bg-foreground px-3 text-xs text-background"
      >
        {label}
      </button>

      {/* Fueguito */}
      <div
        key={`burst-${burst}`}
        className="pointer-events-none absolute left-1/2 top-1/2"
        style={{ transform: "translate(-50%, -50%)" }}
        aria-hidden="true"
      >
        {[...inner, ...outer].map((p, idx) => (
          <span
            key={idx}
            className="absolute left-0 top-0 block rounded-full opacity-0"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              boxShadow: `0 0 12px ${p.color}55`,
              transform: "translate(0px, 0px) scale(0.8)",
              animation: `mk-pro-burst ${p.durMs}ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
              animationDelay: `${p.delayMs}ms`,
              ["--dx" as any]: `${p.dx}px`,
              ["--dy" as any]: `${p.dy}px`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        /* Halo: flash suave */
        .mk-halo {
          width: 76px;
          height: 76px;
          transform: translate(-50%, -50%) scale(0.85);
          opacity: 0;
          border-radius: 9999px;
          background: radial-gradient(
            circle at center,
            rgba(96, 165, 250, 0.45),
            rgba(34, 211, 238, 0.18),
            transparent 65%
          );
          filter: blur(8px);
          animation: mk-halo 520ms ease-out forwards;
        }

        @keyframes mk-halo {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.78);
          }
          15% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.08);
          }
        }

        /* Partículas */
        @keyframes mk-pro-burst {
          0% {
            opacity: 0;
            transform: translate(0px, 0px) scale(0.8);
          }
          12% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(var(--dx), var(--dy)) scale(0.9);
          }
        }

        span {
          mix-blend-mode: screen;
        }
      `}</style>
    </div>
  );
}
