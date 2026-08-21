"use client";

import { useEffect, useRef, useState } from "react";

function IconEstrela() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3.5 14.5 9l6 .8-4.3 4.1 1 6-5.2-2.9L7 20l1-6-4.3-4.1 6-.8Z" />
    </svg>
  );
}

function IconEscudo() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3.5 19 6v5c0 5-3 8.5-7 9.5-4-1-7-4.5-7-9.5V6Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IconMapa() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  );
}

function IconSeta() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

const CARTOES = [
  { Icone: IconEstrela, titulo: "Grade 1:1", texto: "Fidelidade ao modelo oficial" },
  { Icone: IconEscudo, titulo: "Revisão manual", texto: "Cada peça conferida antes de anunciar" },
  { Icone: IconMapa, titulo: "Entrega rápida", texto: "Santos, São Vicente e Praia Grande" },
];

export function ScrollCinema({ videoSrc }: { videoSrc: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const textoHeroRef = useRef<HTMLDivElement>(null);
  const textoRolarRef = useRef<HTMLParagraphElement>(null);
  const textoFinalRef = useRef<HTMLDivElement>(null);
  const cartaoRefs = useRef<(HTMLDivElement | null)[]>([]);

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

      cartaoRefs.current.forEach((el, i) => {
        if (!el) return;
        const inicio = 0.08 + i * 0.1;
        const entra = Math.max(0, Math.min(1, (p - inicio) / 0.1));
        const sai = Math.max(0, 1 - Math.max(0, p - 0.42) / 0.1);
        const opacidade = entra * sai;
        el.style.opacity = String(opacidade);
        el.style.transform = `translateX(${(1 - entra) * 16}px)`;
      });

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
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/50 to-transparent" />

        <div
          ref={textoHeroRef}
          className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 md:max-w-xl md:px-16"
        >
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-ouro/50 bg-ink/40 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-ouro backdrop-blur">
            Camisas oficiais · Grau 1:1
          </div>
          <h1 className="mt-4 font-display text-6xl uppercase leading-[0.9] tracking-tight text-paper [text-shadow:0_4px_20px_rgba(0,0,0,0.6)] sm:text-8xl">
            A Camisa
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/80 [text-shadow:0_2px_12px_rgba(0,0,0,0.7)] sm:text-base">
            Cada detalhe visto de perto — o tecido, a costura, o escudo. É assim que a gente escolhe
            o que vai pro seu guarda-roupa.
          </p>
        </div>

        {!reduzMovimento && (
          <p
            ref={textoRolarRef}
            className="absolute bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-1.5 text-xs uppercase tracking-widest text-muted"
          >
            Role pra explorar
            <IconSeta />
          </p>
        )}

        {!reduzMovimento && (
          <div className="absolute right-4 top-1/2 hidden w-56 -translate-y-1/2 flex-col gap-3 sm:right-8 md:flex">
            {CARTOES.map((c, i) => (
              <div
                key={c.titulo}
                ref={(el) => {
                  cartaoRefs.current[i] = el;
                }}
                className="flex items-start gap-2.5 rounded-xl border border-line bg-ink/60 p-3 opacity-0 backdrop-blur"
              >
                <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-ouro/40 text-ouro">
                  <c.Icone />
                </span>
                <div>
                  <p className="font-display text-xs uppercase tracking-wide text-paper">{c.titulo}</p>
                  <p className="mt-0.5 text-xs text-muted">{c.texto}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div
          ref={textoFinalRef}
          className="absolute inset-0 flex flex-col justify-center px-6 opacity-0 sm:px-12 md:max-w-xl md:px-16"
        >
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-ouro/50 bg-ink/40 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-ouro backdrop-blur">
            Tecido · Costura · Acabamento
          </div>
          <h2 className="mt-4 font-display text-5xl uppercase leading-[0.92] tracking-tight text-paper [text-shadow:0_4px_20px_rgba(0,0,0,0.6)] sm:text-7xl">
            Feita pra jogar.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/80 [text-shadow:0_2px_12px_rgba(0,0,0,0.7)] sm:text-base">
            Tecido leve, caimento certo, acabamento que aguenta o jogo inteiro — não só a foto do
            catálogo.
          </p>
        </div>
      </div>
    </div>
  );
}
