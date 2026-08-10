import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CamisaComDetalhes } from "@/lib/types";
import { AddToCartForm } from "./AddToCartForm";
import { ProductGallery } from "./ProductGallery";

export const dynamic = "force-dynamic";

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: camisa } = await supabase
    .from("camisas")
    .select(
      "id, modelo, descricao, preco, foto_url, categoria, ativo, created_at, camisa_tamanhos(id, camisa_id, tamanho, estoque), camisa_fotos(id, camisa_id, url, ordem)",
    )
    .eq("id", id)
    .eq("ativo", true)
    .maybeSingle<CamisaComDetalhes>();

  if (!camisa) notFound();

  const tamanhos = camisa.camisa_tamanhos.filter((t) => t.estoque > 0);
  const fotos = [
    ...(camisa.foto_url ? [camisa.foto_url] : []),
    ...[...camisa.camisa_fotos].sort((a, b) => a.ordem - b.ordem).map((f) => f.url),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[520px_1fr]">
        <ProductGallery fotos={fotos} modelo={camisa.modelo} categoria={camisa.categoria} />

        <div>
          <span className="inline-block rounded border border-dashed border-line px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted">
            {camisa.categoria}
          </span>
          <h1 className="mt-2 font-display text-2xl uppercase tracking-wide text-paper">{camisa.modelo}</h1>
          <p className="mt-1 font-display text-3xl text-flare">
            {camisa.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          {camisa.descricao && <p className="mt-3 text-sm text-muted">{camisa.descricao}</p>}

          {tamanhos.length === 0 ? (
            <p className="mt-6 text-sm font-medium text-red-400">Sem estoque disponível.</p>
          ) : (
            <AddToCartForm
              camisaId={camisa.id}
              modelo={camisa.modelo}
              fotoUrl={camisa.foto_url}
              preco={camisa.preco}
              tamanhos={tamanhos}
            />
          )}
        </div>
      </div>
    </div>
  );
}
