import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { expirarPedidosVencidos } from "@/lib/expirar-pedidos";
import { notificarNovoPedido } from "@/lib/notificar-pedido";
import { CIDADES_ATENDIDAS, type CamisaComTamanhos } from "@/lib/types";

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

  const { data: perfil } = await supabase
    .from("perfis")
    .select("telefone, rua, numero, complemento, bairro, cidade, estado, cep")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!perfil) {
    return NextResponse.json(
      { error: "Complete seu cadastro (telefone e endereço) antes de finalizar a compra.", redirectTo: "/completar-cadastro" },
      { status: 400 },
    );
  }

  const naAreaDeEntrega =
    perfil.estado === "SP" &&
    CIDADES_ATENDIDAS.includes(perfil.cidade as (typeof CIDADES_ATENDIDAS)[number]);

  if (!naAreaDeEntrega) {
    return NextResponse.json(
      {
        error: "Ainda não entregamos automaticamente nessa cidade.",
        foraDaArea: true,
        cidade: perfil.cidade,
        estado: perfil.estado,
      },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => null);
  const itens: ItemRequest[] = body?.itens;

  if (!Array.isArray(itens) || itens.length === 0) {
    return NextResponse.json({ error: "Carrinho vazio." }, { status: 400 });
  }

  // Libera o estoque de pedidos vencidos antes de checar disponibilidade.
  await expirarPedidosVencidos();

  const admin = createAdminClient();

  // Nunca confiamos em preço/estoque vindos do cliente: buscamos tudo de novo no banco.
  const camisaIds = [...new Set(itens.map((i) => i.camisaId))];
  const { data: camisas, error: camisasError } = await admin
    .from("camisas")
    .select("id, modelo, descricao, preco, preco_promocional, foto_url, ativo, created_at, camisa_tamanhos(id, camisa_id, tamanho, estoque)")
    .in("id", camisaIds)
    .eq("ativo", true)
    .returns<CamisaComTamanhos[]>();

  if (camisasError || !camisas) {
    return NextResponse.json({ error: "Não foi possível validar os produtos." }, { status: 500 });
  }

  const camisasById = new Map(camisas.map((c) => [c.id, c]));

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

    const precoUnitario = camisa.preco_promocional ?? camisa.preco;
    valorTotal += precoUnitario * item.quantidade;

    pedidoItensParaInserir.push({
      camisa_id: camisa.id,
      tamanho: item.tamanho,
      quantidade: item.quantidade,
      preco_unitario: precoUnitario,
    });
  }

  // Baixa de estoque + criação do pedido em uma única transação no banco,
  // pra dois clientes não conseguirem comprar a última unidade ao mesmo tempo.
  const { data: pedidoId, error: rpcError } = await admin.rpc("criar_pedido_com_estoque", {
    p_user_id: user.id,
    p_valor_total: valorTotal,
    p_entrega_telefone: perfil.telefone,
    p_entrega_rua: perfil.rua,
    p_entrega_numero: perfil.numero,
    p_entrega_complemento: perfil.complemento,
    p_entrega_bairro: perfil.bairro,
    p_entrega_cidade: perfil.cidade,
    p_entrega_estado: perfil.estado,
    p_entrega_cep: perfil.cep,
    p_itens: pedidoItensParaInserir,
  });

  if (rpcError) {
    const match = /ESTOQUE_INSUFICIENTE:([^:]+):(.+)/.exec(rpcError.message);
    if (match) {
      const camisa = camisasById.get(match[1]);
      return NextResponse.json(
        { error: `Estoque insuficiente para ${camisa?.modelo ?? "esse produto"} (${match[2]}).` },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Não foi possível criar o pedido." }, { status: 500 });
  }

  const pedido = { id: pedidoId as string };

  await notificarNovoPedido({
    valorTotal,
    telefone: perfil.telefone,
    endereco: `${perfil.rua}, ${perfil.numero}${perfil.complemento ? ` - ${perfil.complemento}` : ""} - ${perfil.bairro}, ${perfil.cidade}/${perfil.estado}`,
    itens: pedidoItensParaInserir.map((item) => ({
      modelo: camisasById.get(item.camisa_id)!.modelo,
      tamanho: item.tamanho,
      quantidade: item.quantidade,
      precoUnitario: item.preco_unitario,
    })),
  });

  return NextResponse.json({ pedidoId: pedido.id });
}
