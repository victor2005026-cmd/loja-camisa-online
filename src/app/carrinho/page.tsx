"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/cart-store";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { ShirtPlaceholder } from "@/components/ShirtPlaceholder";

const NUMERO_WHATSAPP = "5513991749391";

export default function CarrinhoPage() {
  const router = useRouter();
  const { items, updateQuantidade, removeItem, total, clear } = useCartStore();
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [foraDaArea, setForaDaArea] = useState<{ cidade: string; estado: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoadingUser(false);
    });
  }, []);

  async function handleCheckout() {
    setErro(null);
    setForaDaArea(null);
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
        if (data.redirectTo) {
          router.push(`${data.redirectTo}?next=${encodeURIComponent("/carrinho")}`);
          return;
        }
        if (data.foraDaArea) {
          setForaDaArea({ cidade: data.cidade, estado: data.estado });
          setLoading(false);
          return;
        }
        setErro(data.error ?? "Não foi possível iniciar o pagamento.");
        setLoading(false);
        return;
      }

      clear();
      router.push(`/pedidos/${data.pedidoId}/pagamento`);
    } catch {
      setErro("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  function mensagemWhatsApp() {
    const linhas = items.map(
      (i) => `• ${i.quantidade}x ${i.modelo} (${i.tamanho}) — ${i.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
    );
    return [
      "Olá! Quero fazer esse pedido, mas meu endereço fica fora da área de entrega automática:",
      "",
      ...linhas,
      "",
      `Total: ${total().toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
      foraDaArea ? `Endereço: ${foraDaArea.cidade}/${foraDaArea.estado}` : "",
      "",
      "Conseguem me dizer como fica o envio?",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="text-muted">Seu carrinho está vazio.</p>
        <Link href="/" className="mt-4 inline-block font-medium text-flare underline">
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 font-display text-2xl uppercase tracking-wide text-paper">Carrinho</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={`${item.camisaId}-${item.tamanho}`}
            className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4"
          >
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
              {item.fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.fotoUrl} alt={item.modelo} className="h-full w-full object-cover" />
              ) : (
                <ShirtPlaceholder categoria="" />
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-paper">{item.modelo}</p>
              <p className="text-xs text-muted">Tamanho: {item.tamanho}</p>
              <p className="font-display text-base text-flare">
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
              className="w-16 rounded-lg border border-line bg-ink px-2 py-1 text-sm text-paper"
            />

            <button
              onClick={() => removeItem(item.camisaId, item.tamanho)}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Remover
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-line bg-surface p-4">
        <span className="text-sm font-medium text-muted">Total</span>
        <span className="font-display text-2xl text-flare">
          {total().toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </span>
      </div>

      {erro && <p className="mt-4 rounded-lg bg-red-950 p-3 text-sm text-red-300">{erro}</p>}

      <div className="mt-6">
        {loadingUser ? null : user ? foraDaArea ? (
          <div className="space-y-3 rounded-xl border border-line bg-surface p-4 text-center">
            <p className="text-sm text-paper">
              Ainda não entregamos automaticamente em{" "}
              <strong>
                {foraDaArea.cidade}/{foraDaArea.estado}
              </strong>
              .
            </p>
            <p className="text-xs text-muted">
              Fala com a gente no WhatsApp com seu pedido que a gente vê o melhor jeito de enviar.
            </p>
            <a
              href={`https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagemWhatsApp())}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-5 py-3 text-sm font-semibold text-white hover:brightness-110"
            >
              Falar no WhatsApp
            </a>
            <button onClick={() => setForaDaArea(null)} className="text-xs text-muted hover:text-paper">
              Voltar
            </button>
          </div>
        ) : (
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full rounded-lg bg-flare px-5 py-3 text-sm font-semibold text-ink hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "Redirecionando para pagamento..." : "Finalizar compra"}
          </button>
        ) : (
          <div className="space-y-2 text-center">
            <p className="text-sm text-muted">Entre pra finalizar a compra.</p>
            <GoogleLoginButton className="mx-auto flex items-center justify-center gap-2 rounded-full bg-paper px-5 py-2.5 text-sm font-semibold text-ink shadow-md transition hover:brightness-95 hover:shadow-lg" />
            <Link href="/entrar?next=/carrinho" className="block text-xs text-muted hover:text-paper">
              ou entrar com e-mail
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
