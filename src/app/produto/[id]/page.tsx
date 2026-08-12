import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { CamisaComDetalhes } from "@/lib/types";
import { AddToCartForm } from "./AddToCartForm";
import { ProductGallery } from "./ProductGallery";
import { RelacionadosSection } from "./RelacionadosSection";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const getCamisa = cache(async (id: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("camisas")
    .select(
      "id, modelo, descricao, preco, foto_url, categoria, ativo, created_at, camisa_tamanhos(id, camisa_id, tamanho, estoque), camisa_fotos(id, camisa_id, url, ordem)",
    )
    .eq("id", id)
    .eq("ativo", true)
    .maybeSingle<CamisaComDetalhes>();

  return data;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const camisa = await getCamisa(id);
  if (!camisa) return {};

  const descricao =
    camisa.descricao ??
    `Camisa ${camisa.modelo} — ${camisa.categoria}. Pague com Pix, entrega em Santos, São Vicente e Praia Grande.`;

  return {
    title: `${camisa.modelo} — LV Sports`,
    description: descricao,
    openGraph: {
      title: camisa.modelo,
      description: descricao,
      images: camisa.foto_url ? [camisa.foto_url] : undefined,
    },
  };
}

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const camisa = await getCamisa(id);

  if (!camisa) notFound();

  const tamanhos = camisa.camisa_tamanhos.filter((t) => t.estoque > 0);
  const fotos = [
    ...(camisa.foto_url ? [camisa.foto_url] : []),
    ...[...camisa.camisa_fotos].sort((a, b) => a.ordem - b.ordem).map((f) => f.url),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: camisa.modelo,
    description: camisa.descricao ?? undefined,
    image: fotos.length > 0 ? fotos : undefined,
    category: camisa.categoria,
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/produto/${camisa.id}`,
      priceCurrency: "BRL",
      price: camisa.preco,
      availability:
        tamanhos.length > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[3fr_2fr]">
        <ProductGallery fotos={fotos} modelo={camisa.modelo} categoria={camisa.categoria} />

        <div>
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-ouro" />
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

      <RelacionadosSection camisaId={camisa.id} categoria={camisa.categoria} />
    </div>
  );
}
