import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { expirarPedidosVencidos } from "@/lib/expirar-pedidos";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  // Sem isso, um pedido vencido só vira "cancelado" quando outra tela
  // fizer a varredura — o cliente ficaria vendo o Pix "aguardando" pra
  // sempre nesta mesma aba.
  await expirarPedidosVencidos();

  const { data: pedido } = await supabase
    .from("pedidos")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (!pedido) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ status: pedido.status });
}
