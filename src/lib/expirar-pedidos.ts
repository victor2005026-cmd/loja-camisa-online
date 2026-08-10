import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { PEDIDO_EXPIRA_EM_MINUTOS } from "@/lib/pix";

type ItemEstoque = { camisa_id: string; tamanho: string; quantidade: number };

export async function devolverEstoque(admin: SupabaseClient, itens: ItemEstoque[]) {
  for (const item of itens) {
    const { data: tamanhoAtual } = await admin
      .from("camisa_tamanhos")
      .select("estoque")
      .eq("camisa_id", item.camisa_id)
      .eq("tamanho", item.tamanho)
      .maybeSingle();

    await admin
      .from("camisa_tamanhos")
      .update({ estoque: (tamanhoAtual?.estoque ?? 0) + item.quantidade })
      .eq("camisa_id", item.camisa_id)
      .eq("tamanho", item.tamanho);
  }
}

// Cancela pedidos "aguardando_pagamento" criados há mais de 30 min e devolve
// o estoque reservado. Sem cron/infra externa: é chamado nas telas que
// precisam de números de estoque/pedido em dia (pagamento, admin).
export async function expirarPedidosVencidos() {
  const admin = createAdminClient();
  const limite = new Date(Date.now() - PEDIDO_EXPIRA_EM_MINUTOS * 60 * 1000).toISOString();

  const { data: vencidos } = await admin
    .from("pedidos")
    .select("id, pedido_itens(camisa_id, tamanho, quantidade)")
    .eq("status", "aguardando_pagamento")
    .lt("created_at", limite);

  if (!vencidos || vencidos.length === 0) return;

  for (const pedido of vencidos) {
    await devolverEstoque(admin, pedido.pedido_itens);
    await admin.from("pedidos").update({ status: "cancelado" }).eq("id", pedido.id);
  }
}
