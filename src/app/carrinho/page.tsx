"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/cart-store";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";

export default function CarrinhoPage() {
  const { items, updateQuantidade, removeItem, total } = useCartStore();
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoadingUser(false);
    });
  }, []);

  async function handleCheckout() {
    setErro(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itens: items.map((i) => ({
            camisaId: i.camisaId,
            tamanho: i.tamanho,
            quantidade: i.quantidade,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error ?? "Não foi possível iniciar o pagamento.");
        setLoading(false);
        return;
      }

      window.location.href = data.initPoint;
    } catch {
      setErro("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-gray-500">Seu carrinho está vazio.</p>
        <Link href="/" className="mt-4 inline-block font-medium text-black underline">
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Carrinho</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={`${item.camisaId}-${item.tamanho}`}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
              {item.fotoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.fotoUrl} alt={item.modelo} className="h-full w-full object-cover" />
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{item.modelo}</p>
              <p className="text-xs text-gray-500">Tamanho: {item.tamanho}</p>
              <p className="text-sm font-medium text-gray-900">
                {item.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </div>

            <input
              type="number"
              min={1}
              max={item.estoqueDisponivel}
              value={item.quantidade}
              onChange={(e) =>
                updateQuantidade(item.camisaId, item.tamanho, Number(e.target.value))
              }
              className="w-16 rounded-lg border border-gray-300 px-2 py-1 text-sm"
            />

            <button
              onClick={() => removeItem(item.camisaId, item.tamanho)}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Remover
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
        <span className="text-sm font-medium text-gray-700">Total</span>
        <span className="text-xl font-bold text-gray-900">
          {total().toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </span>
      </div>

      {erro && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{erro}</p>}

      <div className="mt-6">
        {loadingUser ? null : user ? (
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Redirecionando para pagamento..." : "Finalizar compra"}
          </button>
        ) : (
          <div className="space-y-2 text-center">
            <p className="text-sm text-gray-600">Entre com sua conta Google para finalizar a compra.</p>
            <GoogleLoginButton className="mx-auto flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50" />
          </div>
        )}
      </div>
    </div>
  );
}
