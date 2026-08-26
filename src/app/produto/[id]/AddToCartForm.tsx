"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import type { CamisaTamanho } from "@/lib/types";

export function AddToCartForm({
  camisaId,
  modelo,
  fotoUrl,
  preco,
  tamanhos,
}: {
  camisaId: string;
  modelo: string;
  fotoUrl: string | null;
  preco: number;
  tamanhos: CamisaTamanho[];
}) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [tamanho, setTamanho] = useState(tamanhos[0]?.tamanho ?? "");
  const [quantidade, setQuantidade] = useState(1);
  const [adicionado, setAdicionado] = useState(false);
  const [noLimite, setNoLimite] = useState(false);

  const estoqueSelecionado = tamanhos.find((t) => t.tamanho === tamanho)?.estoque ?? 0;

  function handleAdd() {
    addItem({
      camisaId,
      modelo,
      fotoUrl,
      tamanho,
      quantidade,
      preco,
      estoqueDisponivel: estoqueSelecionado,
    });
    setAdicionado(true);
  }

  return (
    <div className="mt-6 space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-muted">Tamanho</label>
        <div className="flex flex-wrap gap-2">
          {tamanhos.map((t) => (
            <button
              key={t.tamanho}
              onClick={() => {
                setTamanho(t.tamanho);
                setQuantidade(1);
                setAdicionado(false);
              }}
              className={`relative rounded-lg border px-3 py-1.5 font-display text-sm tracking-wide transition ${
                tamanho === t.tamanho
                  ? "border-flare bg-flare text-ink"
                  : "border-line text-paper hover:border-muted"
              }`}
            >
              {t.tamanho}
              {t.estoque <= 3 && (
                <span className="absolute -right-1.5 -top-1.5 rounded-full bg-ouro px-1 font-mono text-[9px] font-bold text-ink">
                  {t.estoque}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-muted">Quantidade</label>
        <input
          type="number"
          min={1}
          max={estoqueSelecionado}
          value={quantidade}
          onChange={(e) => {
            const digitado = Number(e.target.value);
            if (digitado > estoqueSelecionado) {
              setNoLimite(true);
              setTimeout(() => setNoLimite(false), 3000);
            }
            setQuantidade(Math.max(1, Math.min(digitado, estoqueSelecionado)));
          }}
          className="w-24 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-paper"
        />
        <span className="ml-2 text-xs text-muted">{estoqueSelecionado} em estoque</span>
        {noLimite && (
          <p className="mt-1 text-xs text-flare">Só temos {estoqueSelecionado} dessa camisa/tamanho</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          className="rounded-lg bg-flare px-5 py-2.5 text-sm font-semibold text-ink hover:brightness-110"
        >
          Adicionar ao carrinho
        </button>
        {adicionado && (
          <button
            onClick={() => router.push("/carrinho")}
            className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-paper hover:bg-surface"
          >
            Ir para o carrinho
          </button>
        )}
      </div>
    </div>
  );
}
