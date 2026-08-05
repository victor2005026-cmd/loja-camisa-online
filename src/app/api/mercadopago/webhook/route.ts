import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PedidoComItens } from "@/lib/types";

function mapFormaPagamento(paymentTypeId: string | undefined): string {
  switch (paymentTypeId) {
    case "credit_card":
      return "credito";
    case "debit_card":
      return "debito";
    case "bank_transfer":
    case "account_money":
    case "pix":
      return "pix";
    default:
      return paymentTypeId ?? "desconhecido";
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const body = await request.json().catch(() => null);

  // O Mercado Pago manda o id do pagamento tanto via body (webhooks novos)
  // quanto via querystring (IPN legado) — tratamos os dois formatos.
  const paymentId =
    body?.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id");
  const type = body?.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");

  if (type !== "payment" || !paymentId) {
    // Notificação de outro tipo (ex: merchant_order) — apenas confirmamos recebimento.
    return NextResponse.json({ received: true });
  }

  const admin = createAdminClient();

  try {
    const mpClient = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
    const payment = await new Payment(mpClient).get({ id: paymentId });

    const pedidoId = payment.external_reference;
    if (!pedidoId) {
      console.error("Webhook: pagamento sem external_reference", paymentId);
      return NextResponse.json({ received: true });
    }

    const { data: pedido, error: pedidoError } = await admin
      .from("pedidos")
      .select("id, user_id, status, valor_total, pedido_itens(id, camisa_id, tamanho, quantidade, preco_unitario)")
      .eq("id", pedidoId)
      .maybeSingle<PedidoComItens>();

    if (pedidoError || !pedido) {
      console.error("Webhook: pedido não encontrado", pedidoId);
      return NextResponse.json({ received: true });
    }

    // Idempotência: se já processamos esse pedido como pago, não reaplica o abatimento de estoque.
    if (pedido.status === "pago") {
      return NextResponse.json({ received: true });
    }

    if (payment.status === "approved") {
      // Confere se o valor pago realmente bate com o valor do pedido, evitando
      // que um valor manipulado no frontend seja aceito como pago.
      const valorPago = payment.transaction_amount ?? 0;
      const diferenca = Math.abs(valorPago - Number(pedido.valor_total));
      if (diferenca > 0.01) {
        console.error(
          `Webhook: valor pago (${valorPago}) não corresponde ao pedido ${pedidoId} (${pedido.valor_total})`,
        );
        await admin
          .from("pedidos")
          .update({ status: "cancelado", mercado_pago_payment_id: String(payment.id) })
          .eq("id", pedidoId);
        return NextResponse.json({ received: true });
      }

      await admin
        .from("pedidos")
        .update({
          status: "pago",
          mercado_pago_payment_id: String(payment.id),
          forma_pagamento: mapFormaPagamento(payment.payment_type_id),
        })
        .eq("id", pedidoId);

      for (const item of pedido.pedido_itens) {
        const { data: tamanhoAtual } = await admin
          .from("camisa_tamanhos")
          .select("estoque")
          .eq("camisa_id", item.camisa_id)
          .eq("tamanho", item.tamanho)
          .maybeSingle();

        const novoEstoque = Math.max(0, (tamanhoAtual?.estoque ?? 0) - item.quantidade);

        await admin
          .from("camisa_tamanhos")
          .update({ estoque: novoEstoque })
          .eq("camisa_id", item.camisa_id)
          .eq("tamanho", item.tamanho);
      }
    } else if (payment.status === "rejected" || payment.status === "cancelled") {
      await admin
        .from("pedidos")
        .update({ status: "cancelado", mercado_pago_payment_id: String(payment.id) })
        .eq("id", pedidoId);
    }
    // Outros status (pending, in_process) não alteram o pedido; esperamos a próxima notificação.

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Erro ao processar webhook do Mercado Pago", err);
    // Retorna 500 para que o Mercado Pago tente reenviar a notificação depois.
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
