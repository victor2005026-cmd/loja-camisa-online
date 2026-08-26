import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { expirarPedidosVencidos } from "@/lib/expirar-pedidos";
import type { PedidoComItens } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  aguardando_pagamento: "Aguardando pagamento",
  pago: "Pago",
  cancelado: "Cancelado",
};

const STATUS_COLOR: Record<string, string> = {
  aguardando_pagamento: "bg-yellow-950 text-yellow-300",
  pago: "bg-green-950 text-green-300",
  cancelado: "bg-red-950 text-red-300",
};

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-muted">Entre com sua conta Google para ver seus pedidos.</p>
        <Link href="/" className="mt-4 inline-block font-medium text-flare underline">
          Voltar ao catálogo
        </Link>
      </div>
    );
  }

  await expirarPedidosVencidos();

  const { data: pedidos } = await supabase
    .from("pedidos")
    .select(
      "id, user_id, status, valor_total, forma_pagamento, mercado_pago_preference_id, mercado_pago_payment_id, entrega_rua, entrega_numero, entrega_complemento, entrega_bairro, entrega_cidade, entrega_estado, entrega_cep, created_at, pedido_itens(id, pedido_id, camisa_id, tamanho, quantidade, preco_unitario, camisas(modelo, foto_url))",
    )
    .order("created_at", { ascending: false })
    .returns<PedidoComItens[]>();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl uppercase tracking-wide text-paper">Meus pedidos</h1>

      {status === "sucesso" && (
        <div className="mb-4 rounded-lg bg-green-950 p-3 text-sm text-green-300">
          Pagamento confirmado! Seu pedido já está marcado como pago.
        </div>
      )}

      {!pedidos || pedidos.length === 0 ? (
        <p className="text-muted">Você ainda não fez nenhum pedido.</p>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="rounded-xl border border-line bg-surface p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">
                  {new Date(pedido.created_at).toLocaleString("pt-BR")}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[pedido.status]}`}
                >
                  {STATUS_LABEL[pedido.status]}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {pedido.pedido_itens.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-ink">
                      {item.camisas?.foto_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.camisas.foto_url}
                          alt={item.camisas.modelo}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <span className="flex-1 text-muted">
                      {item.camisas?.modelo ?? "Produto"} · {item.tamanho} · {item.quantidade}x
                    </span>
                    <span className="font-medium text-paper">
                      {(item.preco_unitario * item.quantidade).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                ))}
              </div>

              {pedido.entrega_rua && (
                <p className="mt-3 text-xs text-muted">
                  Entrega: {pedido.entrega_rua}, {pedido.entrega_numero}
                  {pedido.entrega_complemento && ` - ${pedido.entrega_complemento}`} ·{" "}
                  {pedido.entrega_bairro} · {pedido.entrega_cidade}/{pedido.entrega_estado}
                </p>
              )}

              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <span className="text-sm font-medium text-muted">Total</span>
                <span className="font-display text-lg text-flare">
                  {pedido.valor_total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>

              {pedido.status === "aguardando_pagamento" && (
                <Link
                  href={`/pedidos/${pedido.id}/pagamento`}
                  className="mt-3 block text-center text-sm font-medium text-flare underline"
                >
                  Ver QR Code / código Pix
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
