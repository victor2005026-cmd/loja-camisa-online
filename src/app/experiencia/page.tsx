import Link from "next/link";
import { ScrollCinema } from "@/components/ScrollCinema";
import { RevelarAoRolar } from "@/components/RevelarAoRolar";
import { createClient } from "@/lib/supabase/server";
import type { CamisaComTamanhos } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ExperienciaPage() {
  const supabase = await createClient();
  const { data: destaque } = await supabase
    .from("camisas")
    .select(
      "id, modelo, descricao, preco, foto_url, categoria, camisa_tamanhos(id, camisa_id, tamanho, estoque)",
    )
    .eq("ativo", true)
    .ilike("modelo", "%brasil%branca%")
    .maybeSingle<CamisaComTamanhos>();

  const tamanhosDisponiveis = destaque?.camisa_tamanhos
    .filter((t) => t.estoque > 0)
    .map((t) => t.tamanho);

  return (
    <div>
      <ScrollCinema videoSrc="/experiencia/camisa-video.mp4" />

      <section className="mx-auto max-w-2xl px-4 py-24 text-center">
        <RevelarAoRolar>
          <p className="font-mono text-xs uppercase tracking-widest text-ouro">Grade 1:1</p>
          <h2 className="mt-3 font-display text-3xl uppercase leading-tight tracking-tight text-paper sm:text-4xl">
            Feitas pra parecer a de verdade
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            &ldquo;1:1&rdquo; é o nome que o mercado dá pra réplica de grau mais alto — a que mais se aproxima do
            modelo oficial em escudo, cores, tecido e acabamento. Não é peça licenciada pelo clube, mas
            é o padrão que a gente busca em cada camisa antes de colocar no catálogo: nada de estampa
            torta, escudo desalinhado ou tecido fino demais.
          </p>
        </RevelarAoRolar>
      </section>

      <section className="border-y border-line bg-surface py-16">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 px-4 text-center sm:grid-cols-3">
          <RevelarAoRolar>
            <p className="font-display text-lg uppercase tracking-wide text-paper">Pix na hora</p>
            <p className="mt-2 text-sm text-muted">Pagou, confirmamos rapidinho e o pedido já entra na fila.</p>
          </RevelarAoRolar>
          <RevelarAoRolar className="delay-100">
            <p className="font-display text-lg uppercase tracking-wide text-paper">Cada peça revisada</p>
            <p className="mt-2 text-sm text-muted">A gente confere escudo, costura e tecido antes de anunciar.</p>
          </RevelarAoRolar>
          <RevelarAoRolar className="delay-200">
            <p className="font-display text-lg uppercase tracking-wide text-paper">Fala com a gente</p>
            <p className="mt-2 text-sm text-muted">Dúvida numa peça? Chama no WhatsApp antes de comprar.</p>
          </RevelarAoRolar>
        </div>
      </section>

      {destaque && destaque.foto_url && (
        <section className="mx-auto max-w-5xl px-4 py-24">
          <RevelarAoRolar className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
            <div className="overflow-hidden rounded-2xl border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={destaque.foto_url} alt={destaque.modelo} className="h-full w-full object-cover" />
            </div>
            <div className="text-center md:text-left">
              <p className="font-mono text-xs uppercase tracking-widest text-ouro">{destaque.categoria}</p>
              <h3 className="mt-3 font-display text-2xl uppercase tracking-tight text-paper sm:text-3xl">
                {destaque.modelo}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted">{destaque.descricao}</p>

              {tamanhosDisponiveis && tamanhosDisponiveis.length > 0 && (
                <div className="mt-6 flex justify-center gap-2 md:justify-start">
                  {tamanhosDisponiveis.map((t) => (
                    <span
                      key={t}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-xs text-muted"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <p className="mt-6 font-display text-2xl text-flare">
                {destaque.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>

              <Link
                href={`/produto/${destaque.id}`}
                className="mt-4 inline-block rounded-full bg-paper px-6 py-2.5 text-sm font-semibold text-ink shadow-md transition hover:brightness-95 hover:shadow-lg"
              >
                Ver essa camisa
              </Link>
            </div>
          </RevelarAoRolar>
        </section>
      )}

      <section className="px-4 pb-24 text-center">
        <RevelarAoRolar>
          <Link href="/" className="text-sm text-muted underline hover:text-paper">
            Ver o catálogo completo
          </Link>
        </RevelarAoRolar>
      </section>
    </div>
  );
}
