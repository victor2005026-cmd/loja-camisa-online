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
  const [itemNoLimite, setItemNoLimite] = useState<string | null>(null);

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
        if (res.status === 401) {
          // Sessão expirou entre carregar a página e finalizar a compra —
          // atualiza o estado local pra mostrar a tela de login de novo.
          setUser(null);
          setErro("Sua sessão expirou. Entre de novo pra continuar.");
          setLoading(false);
          return;
        }
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

  function linhasItens() {
    return items.map(
      (i) => `• ${i.quantidade}x ${i.modelo} (${i.tamanho}) — ${i.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
    );
  }

  function mensagemWhatsAppForaDaArea() {
    return [
      "Olá! Quero fazer esse pedido, mas meu endereço fica fora da área de entrega automática:",
      "",
      ...linhasItens(),
      "",
      `Total: ${total().toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
      foraDaArea ? `Endereço: ${foraDaArea.cidade}/${foraDaArea.estado}` : "",
      "",
      "Conseguem me dizer como fica o envio?",
    ]
      .filter(Boolean)
      .join("\n");
  }

  function mensagemWhatsAppNormal() {
    return [
      "Olá! Quero fazer esse pedido:",
      "",
      ...linhasItens(),
      "",
      `Total: ${total().toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
      "",
      "Pode me ajudar a fechar?",
    ].join("\n");
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

            <div>
              <input
                type="number"
                min={1}
                max={item.estoqueDisponivel}
                value={item.quantidade}
                onChange={(e) => {
                  const chave = `${item.camisaId}-${item.tamanho}`;
                  const digitado = Number(e.target.value);
                  if (digitado > item.estoqueDisponivel) {
                    setItemNoLimite(chave);
                    setTimeout(() => setItemNoLimite((atual) => (atual === chave ? null : atual)), 3000);
                  }
                  updateQuantidade(item.camisaId, item.tamanho, digitado);
                }}
                className="w-16 rounded-lg border border-line bg-ink px-2 py-1 text-sm text-paper"
              />
              {itemNoLimite === `${item.camisaId}-${item.tamanho}` && (
                <p className="mt-1 text-xs text-flare">Só temos {item.estoqueDisponivel} em estoque</p>
              )}
            </div>

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
              href={`https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagemWhatsAppForaDaArea())}`}
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
          <div className="space-y-2">
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full rounded-lg bg-flare px-5 py-3 text-sm font-semibold text-ink hover:brightness-110 disabled:opacity-50"
            >
              {loading ? "Redirecionando para pagamento..." : "Finalizar compra com Pix"}
            </button>
            <a
              href={`https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagemWhatsAppNormal())}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#25D366]/40 px-5 py-2.5 text-sm font-medium text-[#25D366] transition hover:border-[#25D366] hover:bg-[#25D366]/10"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
              Prefere fechar pelo WhatsApp?
            </a>
          </div>
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
