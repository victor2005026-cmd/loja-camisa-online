"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { devolverEstoque } from "@/lib/expirar-pedidos";

export async function marcarComoPago(pedidoId: string) {
  await requireAdmin();
  const admin = createAdminClient();

  await admin
    .from("pedidos")
    .update({ status: "pago" })
    .eq("id", pedidoId)
    .eq("status", "aguardando_pagamento");

  revalidatePath("/admin/pedidos");
  revalidatePath("/pedidos");
}

export async function cancelarPedido(pedidoId: string) {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: pedido } = await admin
    .from("pedidos")
    .select("id, status, pedido_itens(camisa_id, tamanho, quantidade)")
    .eq("id", pedidoId)
    .eq("status", "aguardando_pagamento")
    .maybeSingle();

  if (!pedido) return;

  await devolverEstoque(admin, pedido.pedido_itens);
  await admin.from("pedidos").update({ status: "cancelado" }).eq("id", pedidoId);

  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/produtos");
  revalidatePath("/pedidos");
  revalidatePath("/");
}
