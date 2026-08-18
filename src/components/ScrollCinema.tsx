"use client";

import { useEffect, useRef, useState } from "react";

export function ScrollCinema({ imagemSrc }: { imagemSrc: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progresso, setProgresso] = useState(0);
  const [reduzMovimento, setReduzMovimento] = useState(false);

  useEffect(() => {
    function verificarPreferencia() {
      setReduzMovimento(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }
    verificarPreferencia();
  }, []);

  useEffect(() => {
    if (reduzMovimento) return;

    function aoRolar() {
      const el = containerRef.current;
      if (!el) return;

      const total = el.offsetHeight - window.innerHeight;
      const percorrido = -el.getBoundingClientRect().top;
      const p = total > 0 ? Math.min(1, Math.max(0, percorrido / total)) : 0;
      setProgresso(p);
    }

    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, [reduzMovimento]);

  const escala = reduzMovimento ? 1 : 1 + progresso * 0.5;
  const opacidadeHero = reduzMovimento ? 1 : Math.max(0, 1 - progresso / 0.3);
  const opacidadeTexto2 = reduzMovimento
    ? 0
    : Math.max(0, Math.min(1, (progresso - 0.4) / 0.3)) * Math.max(0, 1 - Math.max(0, progresso - 0.8) / 0.2);

  return (
    <div ref={containerRef} className="relative" style={{ height: reduzMovimento ? "100vh" : "300vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imagemSrc}
          alt="Camisa em destaque"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transform: `scale(${escala})`, transition: reduzMovimento ? "none" : undefined }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/30" />

        {/* DEBUG temporário — remover depois */}
        <div className="absolute left-2 top-2 z-50 rounded bg-black/80 px-2 py-1 font-mono text-xs text-lime-400">
          progresso: {progresso.toFixed(3)} · reduzMovimento: {String(reduzMovimento)}
        </div>

        <div
          className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
          style={{ opacity: opacidadeHero }}
        >
          <h1 className="font-display text-5xl uppercase leading-[0.92] tracking-tight text-paper sm:text-7xl">
            A Camisa
          </h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-widest text-ouro">
            Cada detalhe, de perto
          </p>
          {!reduzMovimento && (
            <p
              className="mt-10 text-xs text-muted"
              style={{ opacity: Math.max(0, 1 - progresso / 0.08) }}
            >
              Role pra explorar ↓
            </p>
          )}
        </div>

        <div
          className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
          style={{ opacity: opacidadeTexto2 }}
        >
          <h2 className="font-display text-3xl uppercase leading-[0.95] tracking-tight text-paper sm:text-5xl">
            Feita pra jogar.
          </h2>
          <p className="mt-3 max-w-md text-sm text-muted">
            Tecido leve, caimento certo, acabamento que aguenta o jogo inteiro.
          </p>
        </div>
      </div>
    </div>
  );
}
