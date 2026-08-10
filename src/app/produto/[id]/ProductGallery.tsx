"use client";

import { useState } from "react";
import { ShirtPlaceholder } from "@/components/ShirtPlaceholder";

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

  if (fotos.length === 0) {
    return (
      <div className="aspect-square w-full overflow-hidden rounded-xl">
        <ShirtPlaceholder categoria={categoria} />
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fotos[selecionada]} alt={modelo} className="h-full w-full object-cover" />
      </div>

      {fotos.length > 1 && (
        <div className="mt-3 flex gap-2">
          {fotos.map((foto, i) => (
            <button
              key={foto}
              onClick={() => setSelecionada(i)}
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
