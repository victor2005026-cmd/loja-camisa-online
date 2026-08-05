import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CamisaComTamanhos } from "@/lib/types";

type ItemRequest = {
  camisaId: string;
  tamanho: string;
  quantidade: number;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return NextResponse.json({ error: "É necessário estar logado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const itens: ItemRequest[] = body?.itens;

  if (!Array.isArray(itens) || itens.length === 0) {
    return NextResponse.json({ error: "Carrinho vazio." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Nunca confiamos em preço/estoque vindos do cliente: buscamos tudo de novo no banco.
  const camisaIds = [...new Set(itens.map((i) => i.camisaId))];
  const { data: camisas, error: camisasError } = await admin
    .from("camisas")
    .select("id, modelo, descricao, preco, foto_url, ativo, created_at, camisa_tamanhos(id, camisa_id, tamanho, estoque)")
    .in("id", camisaIds)
    .eq("ativo", true)
    .returns<CamisaComTamanhos[]>();

  if (camisasError || !camisas) {
    return NextResponse.json({ error: "Não foi possível validar os produtos." }, { status: 500 });
  }

  const camisasById = new Map(camisas.map((c) => [c.id, c]));

  const preferenceItems: { id: string; title: string; quantity: number; unit_price: number; currency_id: string }[] = [];
  const pedidoItensParaInserir: {
    camisa_id: string;
    tamanho: string;
    quantidade: number;
    preco_unitario: number;
  }[] = [];

  let valorTotal = 0;

  for (const item of itens) {
    if (!item.camisaId || !item.tamanho || !Number.isInteger(item.quantidade) || item.quantidade <= 0) {
      return NextResponse.json({ error: "Item de carrinho inválido." }, { status: 400 });
    }

    const camisa = camisasById.get(item.camisaId);
    if (!camisa) {
      return NextResponse.json({ error: "Produto não encontrado ou indisponível." }, { status: 400 });
    }

    const tamanhoInfo = camisa.camisa_tamanhos.find((t) => t.tamanho === item.tamanho);
    if (!tamanhoInfo || tamanhoInfo.estoque < item.quantidade) {
      return NextResponse.json(
        { error: `Estoque insuficiente para ${camisa.modelo} (${item.tamanho}).` },
        { status: 400 },
      );
    }

    const precoUnitario = camisa.preco;
    valorTotal += precoUnitario * item.quantidade;

    preferenceItems.push({
      id: camisa.id,
      title: `${camisa.modelo} (${item.tamanho})`,
      quantity: item.quantidade,
      unit_price: precoUnitario,
      currency_id: "BRL",
    });

    pedidoItensParaInserir.push({
      camisa_id: camisa.id,
      tamanho: item.tamanho,
      quantidade: item.quantidade,
      preco_unitario: precoUnitario,
    });
  }

  const { data: pedido, error: pedidoError } = await admin
    .from("pedidos")
    .insert({
      user_id: user.id,
      status: "aguardando_pagamento",
      valor_total: valorTotal,
    })
    .select("id")
    .single();

  if (pedidoError || !pedido) {
    return NextResponse.json({ error: "Não foi possível criar o pedido." }, { status: 500 });
  }

  const { error: itensError } = await admin.from("pedido_itens").insert(
    pedidoItensParaInserir.map((item) => ({ ...item, pedido_id: pedido.id })),
  );

  if (itensError) {
    await admin.from("pedidos").delete().eq("id", pedido.id);
    return NextResponse.json({ error: "Não foi possível registrar os itens do pedido." }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

  try {
    const mpClient = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
    const preference = new Preference(mpClient);

    const result = await preference.create({
      body: {
        items: preferenceItems,
        external_reference: pedido.id,
        notification_url: `${baseUrl}/api/mercadopago/webhook`,
        back_urls: {
          success: `${baseUrl}/pedidos?status=sucesso`,
          pending: `${baseUrl}/pedidos?status=pendente`,
          failure: `${baseUrl}/carrinho?status=falha`,
        },
        auto_return: "approved",
        payer: {
          email: user.email ?? undefined,
        },
        statement_descriptor: "LOJA CAMISAS",
      },
    });

    await admin
      .from("pedidos")
      .update({ mercado_pago_preference_id: result.id })
      .eq("id", pedido.id);

    const initPoint =
      process.env.MERCADOPAGO_ENV === "production" ? result.init_point : result.sandbox_init_point;

    return NextResponse.json({ initPoint: initPoint ?? result.init_point, pedidoId: pedido.id });
  } catch (err) {
    await admin.from("pedidos").update({ status: "cancelado" }).eq("id", pedido.id);
    console.error("Erro ao criar preferência no Mercado Pago", err);
    return NextResponse.json({ error: "Não foi possível iniciar o pagamento." }, { status: 500 });
  }
}
