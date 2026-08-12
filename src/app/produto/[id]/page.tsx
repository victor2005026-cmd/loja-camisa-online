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
      "id, modelo, descricao, preco, preco_promocional, foto_url, categoria, ativo, created_at, camisa_tamanhos(id, camisa_id, tamanho, estoque), camisa_fotos(id, camisa_id, url, ordem)",
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
      price: camisa.preco_promocional ?? camisa.preco,
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
          <div className="mt-1 flex items-baseline gap-2">
            {camisa.preco_promocional != null && (
              <span className="text-base text-muted line-through">
                {camisa.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            )}
            <p className="font-display text-3xl text-flare">
              {(camisa.preco_promocional ?? camisa.preco).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
          {camisa.descricao && <p className="mt-3 text-sm text-muted">{camisa.descricao}</p>}

          {tamanhos.length === 0 ? (
            <p className="mt-6 text-sm font-medium text-red-400">Sem estoque disponível.</p>
          ) : (
            <div id="comprar" className="scroll-mt-28">
              <AddToCartForm
                camisaId={camisa.id}
                modelo={camisa.modelo}
                fotoUrl={camisa.foto_url}
                preco={camisa.preco_promocional ?? camisa.preco}
                tamanhos={tamanhos}
              />
            </div>
          )}

          <div className="mt-6 grid grid-cols-3 gap-2 border-y border-line py-4 text-center text-[11px] text-muted">
            <div className="flex flex-col items-center gap-1">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-ouro" aria-hidden="true">
                <path d="M12 2 4 6v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-4Z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              Pix seguro
            </div>
            <div className="flex flex-col items-center gap-1">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-ouro" aria-hidden="true">
                <rect x="1" y="7" width="15" height="10" rx="1.5" />
                <path d="M16 10h3.5L22 13.5V17h-6" />
                <circle cx="6" cy="18.5" r="1.6" />
                <circle cx="17.5" cy="18.5" r="1.6" />
              </svg>
              Santos, SV e PG
            </div>
            <div className="flex flex-col items-center gap-1">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-ouro" aria-hidden="true">
                <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-4.2-1.1L3 20l1.1-5.3A8.4 8.4 0 0 1 3 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5Z" />
              </svg>
              Dúvidas no WhatsApp
            </div>
          </div>

          <div className="mt-4 divide-y divide-line border-b border-line text-sm">
            <details className="group py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-paper">
                Entrega e pagamento
                <span className="text-muted transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-muted">
                Pagamento só via Pix — depois de confirmarmos que caiu, combinamos a entrega pelo
                WhatsApp com quem comprou. Entregamos em Santos, São Vicente e Praia Grande.
              </p>
            </details>
            <details className="group py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-paper">
                Trocas e devolução
                <span className="text-muted transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-muted">
                Você pode desistir da compra em até 7 dias corridos após o recebimento, sem
                precisar justificar, com reembolso integral — conforme o Código de Defesa do
                Consumidor. Detalhes completos nos{" "}
                <a href="/termos" className="text-ouro hover:underline">
                  Termos de Uso
                </a>
                .
              </p>
            </details>
          </div>
        </div>
      </div>

      <RelacionadosSection camisaId={camisa.id} categoria={camisa.categoria} />
    </div>
  );
}
