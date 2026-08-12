"use client";

import { useEffect, useRef, useState } from "react";

type Slot =
  | { kind: "existing"; id: string; url: string }
  | { kind: "new"; id: string; url: string; file: File };

export function FotoUploader({
  existentes,
  max,
  nomePlano,
  nomeArquivos,
  legendaPrimaria,
}: {
  existentes: { id: string; url: string }[];
  max: number;
  nomePlano: string;
  nomeArquivos: string;
  legendaPrimaria?: string;
}) {
  const [slots, setSlots] = useState<Slot[]>(() =>
    existentes.map((e) => ({ kind: "existing", id: e.id, url: e.url })),
  );
  const [arrastando, setArrastando] = useState<number | null>(null);
  const arquivosRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const dt = new DataTransfer();
    for (const slot of slots) {
      if (slot.kind === "new") dt.items.add(slot.file);
    }
    if (arquivosRef.current) arquivosRef.current.files = dt.files;
  }, [slots]);

  useEffect(() => {
    return () => {
      for (const slot of slots) {
        if (slot.kind === "new") URL.revokeObjectURL(slot.url);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function adicionarArquivos(lista: FileList | null) {
    const arquivos = Array.from(lista ?? []);
    if (arquivos.length === 0) return;
    setSlots((prev) => {
      const espaco = Math.max(0, max - prev.length);
      const aceitos = arquivos.slice(0, espaco);
      const novos: Slot[] = aceitos.map((file) => ({
        kind: "new",
        id: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        file,
      }));
      return [...prev, ...novos];
    });
  }

  function removerSlot(id: string) {
    setSlots((prev) => {
      const alvo = prev.find((s) => s.id === id);
      if (alvo?.kind === "new") URL.revokeObjectURL(alvo.url);
      return prev.filter((s) => s.id !== id);
    });
  }

  function reordenar(de: number, para: number) {
    if (de === para) return;
    setSlots((prev) => {
      const copia = [...prev];
      const [item] = copia.splice(de, 1);
      copia.splice(para, 0, item);
      return copia;
    });
  }

  const plano = slots.map((s) =>
    s.kind === "existing" ? { kind: "existing" as const, id: s.id } : { kind: "new" as const },
  );

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {slots.map((slot, i) => (
          <div
            key={slot.id}
            draggable
            onDragStart={() => setArrastando(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (arrastando !== null) reordenar(arrastando, i);
              setArrastando(null);
            }}
            onDragEnd={() => setArrastando(null)}
            className={`group relative aspect-square cursor-grab rounded-lg active:cursor-grabbing ${
              arrastando === i ? "opacity-40" : ""
            }`}
            title="Arraste pra reordenar"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slot.url} alt="" className="h-full w-full rounded-lg object-cover" />
            {i === 0 && legendaPrimaria && (
              <span className="pointer-events-none absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                {legendaPrimaria}
              </span>
            )}
            <button
              type="button"
              onClick={() => removerSlot(slot.id)}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
              title="Remover"
            >
              ×
            </button>
          </div>
        ))}

        {slots.length < max && (
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              adicionarArquivos(e.dataTransfer.files);
            }}
            className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500"
          >
            <span className="text-2xl leading-none">+</span>
            <span className="text-[10px]">Adicionar</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                adicionarArquivos(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>

      <input ref={arquivosRef} type="file" name={nomeArquivos} multiple className="hidden" />
      <input type="hidden" name={nomePlano} value={JSON.stringify(plano)} readOnly />
    </div>
  );
}
