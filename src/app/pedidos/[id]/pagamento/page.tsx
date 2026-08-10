import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { expirarPedidosVencidos } from "@/lib/expirar-pedidos";
import { gerarPix, PEDIDO_EXPIRA_EM_MINUTOS } from "@/lib/pix";
import { PagamentoPix } from "./PagamentoPix";

export const dynamic = "force-dynamic";

export default async function PagamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await expirarPedidosVencidos();

  const supabase = await createClient();
  const { data: pedido } = await supabase
    .from("pedidos")
    .select("id, status, valor_total, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!pedido) notFound();

  if (pedido.status === "pago") {
    redirect("/pedidos?status=sucesso");
  }

  if (pedido.status === "cancelado") {
    return (
      <div className="mx-auto max-w-sm px-4 py-10 text-center">
        <h1 className="font-display text-2xl uppercase tracking-wide text-paper">Pedido cancelado</h1>
        <p className="mt-3 text-sm text-muted">
          Esse pedido expirou ou foi cancelado antes do pagamento. O estoque já foi devolvido — pode
          montar o carrinho de novo quando quiser.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm font-medium text-flare underline">
          Voltar ao catálogo
        </Link>
      </div>
    );
  }

  const { brCode, qrCodeImage } = await gerarPix(pedido.id, pedido.valor_total);
  const expiraEm = new Date(
    new Date(pedido.created_at).getTime() + PEDIDO_EXPIRA_EM_MINUTOS * 60 * 1000,
  ).toISOString();

  return (
    <div className="mx-auto max-w-sm px-4 py-10 text-center">
      <h1 className="font-display text-2xl uppercase tracking-wide text-paper">Pague com Pix</h1>
      <p className="mt-1 font-display text-3xl text-flare">
        {pedido.valor_total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      </p>

      <div className="mx-auto mt-6 w-56 overflow-hidden rounded-xl border border-line bg-paper p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrCodeImage} alt="QR Code Pix" className="h-full w-full" />
      </div>

      <PagamentoPix pedidoId={pedido.id} brCode={brCode} expiraEm={expiraEm} />
    </div>
  );
}
