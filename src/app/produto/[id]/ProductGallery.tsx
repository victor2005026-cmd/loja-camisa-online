"use client";

import { useEffect, useState } from "react";
import { ShirtPlaceholder } from "@/components/ShirtPlaceholder";

const INTERVALO_AUTOPLAY_MS = 2800;

export function ProductGallery({
  fotos,
  modelo,
  categoria,
}: {
  fotos: string[];
  modelo: string;
  categoria: string;
}) {
  const [selecionada, setSelecionada] = useState(0);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    if (pausado || fotos.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => {
      setSelecionada((i) => (i + 1) % fotos.length);
    }, INTERVALO_AUTOPLAY_MS);

    return () => clearInterval(id);
  }, [pausado, fotos.length]);

  function irPara(i: number) {
    setPausado(true);
    setSelecionada(i);
  }

  if (fotos.length === 0) {
    return (
      <div className="aspect-square w-full overflow-hidden rounded-xl">
        <ShirtPlaceholder categoria={categoria} />
      </div>
    );
  }

  return (
    <div>
      <div className="group relative aspect-square w-full overflow-hidden rounded-xl bg-surface">
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{
            width: `${fotos.length * 100}%`,
            transform: `translateX(-${(selecionada * 100) / fotos.length}%)`,
          }}
        >
          {fotos.map((foto, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={foto}
              src={foto}
              alt={`${modelo} - foto ${i + 1}`}
              className="h-full flex-shrink-0 object-cover"
              style={{ width: `${100 / fotos.length}%` }}
            />
          ))}
        </div>

        {fotos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => irPara((selecionada - 1 + fotos.length) % fotos.length)}
              aria-label="Foto anterior"
              className="absolute inset-y-0 left-0 z-10 w-1/2"
            />
            <button
              type="button"
              onClick={() => irPara((selecionada + 1) % fotos.length)}
              aria-label="Próxima foto"
              className="absolute inset-y-0 right-0 z-10 w-1/2"
            />

            <span className="pointer-events-none absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-ink/60 text-paper opacity-0 backdrop-blur transition-opacity duration-200 group-hover:opacity-100">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </span>
            <span className="pointer-events-none absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-ink/60 text-paper opacity-0 backdrop-blur transition-opacity duration-200 group-hover:opacity-100">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </span>

            <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center gap-1.5">
              {fotos.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === selecionada ? "w-5 bg-ouro" : "w-1.5 bg-paper/40"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {fotos.length > 1 && (
        <div className="mt-3 flex gap-2">
          {fotos.map((foto, i) => (
            <button
              key={foto}
              onClick={() => irPara(i)}
              className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === selecionada ? "border-flare" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto} alt={`${modelo} - foto ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
