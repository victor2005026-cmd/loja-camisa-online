"use client";

import { useEffect, useRef, useState } from "react";

export function ScrollCinema({ videoSrc }: { videoSrc: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const textoHeroRef = useRef<HTMLDivElement>(null);
  const textoRolarRef = useRef<HTMLParagraphElement>(null);
  const textoFinalRef = useRef<HTMLDivElement>(null);

  const progressoAlvo = useRef(0);
  const progressoAtual = useRef(0);
  const duracao = useRef(0);

  const [reduzMovimento, setReduzMovimento] = useState(false);

  useEffect(() => {
    function verificarPreferencia() {
      setReduzMovimento(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }
    verificarPreferencia();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (reduzMovimento || !video) return;

    function aoCarregarMetadados() {
      duracao.current = video!.duration || 0;
      video!.pause();
    }
    video.addEventListener("loadedmetadata", aoCarregarMetadados);

    function aoRolar() {
      const el = containerRef.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      const percorrido = -el.getBoundingClientRect().top;
      progressoAlvo.current = total > 0 ? Math.min(1, Math.max(0, percorrido / total)) : 0;
    }
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar);

    let raf: number;
    function aplicar() {
      progressoAtual.current += (progressoAlvo.current - progressoAtual.current) * 0.15;
      const p = progressoAtual.current;

      if (duracao.current > 0) {
        video!.currentTime = p * duracao.current;
      }

      if (textoHeroRef.current) {
        textoHeroRef.current.style.opacity = String(Math.max(0, 1 - p / 0.25));
      }
      if (textoRolarRef.current) {
        textoRolarRef.current.style.opacity = String(Math.max(0, 1 - p / 0.06));
      }
      if (textoFinalRef.current) {
        const entra = Math.max(0, Math.min(1, (p - 0.55) / 0.2));
        const sai = Math.max(0, 1 - Math.max(0, p - 0.9) / 0.1);
        textoFinalRef.current.style.opacity = String(entra * sai);
      }

      raf = requestAnimationFrame(aplicar);
    }
    raf = requestAnimationFrame(aplicar);

    return () => {
      video.removeEventListener("loadedmetadata", aoCarregarMetadados);
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
      cancelAnimationFrame(raf);
    };
  }, [reduzMovimento]);

  return (
    <div ref={containerRef} className="relative" style={{ height: reduzMovimento ? "100vh" : "260vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-ink">
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          playsInline
          preload="auto"
          autoPlay={false}
          controls={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/30" />

        <div ref={textoHeroRef} className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="font-display text-5xl uppercase leading-[0.92] tracking-tight text-paper sm:text-7xl">
            A Camisa
          </h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-widest text-ouro">
            Cada detalhe, de perto
          </p>
          {!reduzMovimento && (
            <p ref={textoRolarRef} className="mt-10 text-xs text-muted">
              Role pra explorar ↓
            </p>
          )}
        </div>

        <div ref={textoFinalRef} className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center opacity-0">
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
