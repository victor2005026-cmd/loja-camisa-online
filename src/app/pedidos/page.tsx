import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { PedidoComItens } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  aguardando_pagamento: "Aguardando pagamento",
  pago: "Pago",
  cancelado: "Cancelado",
};

const STATUS_COLOR: Record<string, string> = {
  aguardando_pagamento: "bg-yellow-100 text-yellow-800",
  pago: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
};

export default async function PedidosPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-gray-600">Entre com sua conta Google para ver seus pedidos.</p>
        <Link href="/" className="mt-4 inline-block font-medium text-black underline">
          Voltar ao catálogo
        </Link>
      </div>
    );
  }

  const { data: pedidos } = await supabase
    .from("pedidos")
    .select(
      "id, user_id, status, valor_total, forma_pagamento, mercado_pago_preference_id, mercado_pago_payment_id, created_at, pedido_itens(id, pedido_id, camisa_id, tamanho, quantidade, preco_unitario, camisas(modelo, foto_url))",
    )
    .order("created_at", { ascending: false })
    .returns<PedidoComItens[]>();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Meus pedidos</h1>

      {!pedidos || pedidos.length === 0 ? (
        <p className="text-gray-500">Você ainda não fez nenhum pedido.</p>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
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
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {item.camisas?.foto_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.camisas.foto_url}
                          alt={item.camisas.modelo}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <span className="flex-1 text-gray-700">
                      {item.camisas?.modelo ?? "Produto"} · {item.tamanho} · {item.quantidade}x
                    </span>
                    <span className="font-medium text-gray-900">
                      {(item.preco_unitario * item.quantidade).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-sm font-medium text-gray-700">Total</span>
                <span className="text-base font-bold text-gray-900">
                  {pedido.valor_total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
