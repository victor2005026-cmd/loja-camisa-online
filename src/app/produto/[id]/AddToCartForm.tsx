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
        <label className="mb-1 block text-sm font-medium text-gray-700">Tamanho</label>
        <div className="flex flex-wrap gap-2">
          {tamanhos.map((t) => (
            <button
              key={t.tamanho}
              onClick={() => {
                setTamanho(t.tamanho);
                setQuantidade(1);
                setAdicionado(false);
              }}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                tamanho === t.tamanho
                  ? "border-black bg-black text-white"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {t.tamanho}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Quantidade</label>
        <input
          type="number"
          min={1}
          max={estoqueSelecionado}
          value={quantidade}
          onChange={(e) => setQuantidade(Math.max(1, Math.min(Number(e.target.value), estoqueSelecionado)))}
          className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
        />
        <span className="ml-2 text-xs text-gray-500">{estoqueSelecionado} em estoque</span>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Adicionar ao carrinho
        </button>
        {adicionado && (
          <button
            onClick={() => router.push("/carrinho")}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Ir para o carrinho
          </button>
        )}
      </div>
    </div>
  );
}
