import { createAdminClient } from "@/lib/supabase/admin";
import { expirarPedidosVencidos } from "@/lib/expirar-pedidos";
import type { PedidoComItens } from "@/lib/types";
import { cancelarPedido, marcarComoPago } from "./actions";

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

export default async function AdminPedidosPage() {
  await expirarPedidosVencidos();
  const admin = createAdminClient();

  const { data: pedidos } = await admin
    .from("pedidos")
    .select(
      "id, user_id, status, valor_total, forma_pagamento, mercado_pago_payment_id, entrega_telefone, entrega_rua, entrega_numero, entrega_complemento, entrega_bairro, entrega_cidade, entrega_estado, entrega_cep, created_at, pedido_itens(id, pedido_id, camisa_id, tamanho, quantidade, preco_unitario, camisas(modelo, foto_url))",
    )
    .order("created_at", { ascending: false })
    .returns<PedidoComItens[]>();

  const userIds = [...new Set((pedidos ?? []).map((p) => p.user_id))];
  const emailPorUsuario = new Map<string, string>();

  for (const userId of userIds) {
    const { data } = await admin.auth.admin.getUserById(userId);
    if (data.user?.email) emailPorUsuario.set(userId, data.user.email);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Pedidos</h1>

      <div className="space-y-3">
        {(pedidos ?? []).map((pedido) => (
          <div key={pedido.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {emailPorUsuario.get(pedido.user_id) ?? pedido.user_id}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(pedido.created_at).toLocaleString("pt-BR")}
                  {pedido.forma_pagamento && ` · ${pedido.forma_pagamento}`}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[pedido.status]}`}
              >
                {STATUS_LABEL[pedido.status]}
              </span>
            </div>

            <div className="mt-3 space-y-1 text-sm text-gray-700">
              {pedido.pedido_itens.map((item) => (
                <p key={item.id}>
                  {item.camisas?.modelo ?? "Produto"} · {item.tamanho} · {item.quantidade}x
                </p>
              ))}
            </div>

            {pedido.entrega_rua && (
              <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                <p className="font-medium text-gray-900">Entrega</p>
                <p>
                  {pedido.entrega_rua}, {pedido.entrega_numero}
                  {pedido.entrega_complemento && ` - ${pedido.entrega_complemento}`}
                </p>
                <p>
                  {pedido.entrega_bairro} · {pedido.entrega_cidade}/{pedido.entrega_estado} · CEP{" "}
                  {pedido.entrega_cep}
                </p>
                <p>Tel: {pedido.entrega_telefone}</p>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-sm font-medium text-gray-700">Total</span>
              <span className="text-base font-bold text-gray-900">
                {pedido.valor_total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>

            {pedido.status === "aguardando_pagamento" && (
              <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                <form action={marcarComoPago.bind(null, pedido.id)}>
                  <button className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700">
                    Marcar como pago
                  </button>
                </form>
                <form action={cancelarPedido.bind(null, pedido.id)}>
                  <button className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100">
                    Cancelar
                  </button>
                </form>
              </div>
            )}
          </div>
        ))}

        {(!pedidos || pedidos.length === 0) && <p className="text-gray-500">Nenhum pedido recebido ainda.</p>}
      </div>
    </div>
  );
}
