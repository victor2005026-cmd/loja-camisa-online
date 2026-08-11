import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIAS_DISPONIVEIS, type CamisaComDetalhes, type HeroFoto } from "@/lib/types";
import { ShirtPlaceholder } from "@/components/ShirtPlaceholder";
import { HeroColagem } from "@/components/HeroColagem";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("camisas")
    .select(
      "id, modelo, descricao, preco, foto_url, categoria, ativo, created_at, camisa_tamanhos(id, camisa_id, tamanho, estoque), camisa_fotos(id, camisa_id, url, ordem)",
    )
    .eq("ativo", true)
    .order("created_at", { ascending: false });

  if (categoria) {
    query = query.eq("categoria", categoria);
  }

  const { data: camisas, error } = await query.returns<CamisaComDetalhes[]>();

  const disponiveis = (camisas ?? []).filter((c) =>
    c.camisa_tamanhos.some((t) => t.estoque > 0),
  );

  const { data: heroFotos } = await supabase
    .from("hero_fotos")
    .select("id, url, ordem")
    .order("ordem", { ascending: true })
    .returns<HeroFoto[]>();

  const heroFotoUnica = disponiveis.find((c) => c.foto_url)?.foto_url;

  return (
    <div className="w-full">
      <div className="relative flex min-h-[380px] flex-col justify-end overflow-hidden border-b border-line sm:min-h-[460px]">
        {heroFotos && heroFotos.length > 0 ? (
          <>
            <HeroColagem fotos={heroFotos.map((f) => f.url)} />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/10" />
          </>
        ) : heroFotoUnica ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroFotoUnica}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/10" />
          </>
        ) : (
          <div className="textura-tecido absolute inset-0 bg-gradient-to-br from-surface to-ink" />
        )}

        <div className="relative px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <h1 className="font-display text-5xl uppercase leading-[0.92] tracking-tight text-paper sm:text-6xl">
            Vista a
            <br />
            camisa.
          </h1>
          <p className="mt-3 max-w-md text-sm text-muted">
            Torcedor, retrô, player ou treino — direto pro seu guarda-roupa.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-widest text-ouro">
            <span>Entrega em Santos · São Vicente · Praia Grande</span>
            <a
              href="https://instagram.com/lv.sports013"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted transition hover:text-paper"
            >
              @lv.sports013
            </a>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/"
            className={`min-w-[110px] flex-1 rounded-full border px-4 py-2 text-center text-sm font-medium transition ${
              !categoria
                ? "border-ouro bg-ouro/10 text-ouro"
                : "border-line text-muted hover:border-muted hover:text-paper"
            }`}
          >
            Todos
          </Link>
          {CATEGORIAS_DISPONIVEIS.map((cat) => (
            <Link
              key={cat}
              href={`/?categoria=${encodeURIComponent(cat)}`}
              className={`min-w-[110px] flex-1 rounded-full border px-4 py-2 text-center text-sm font-medium transition ${
                categoria === cat
                  ? "border-ouro bg-ouro/10 text-ouro"
                  : "border-line text-muted hover:border-muted hover:text-paper"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {error && (
          <p className="rounded-lg bg-red-950 p-4 text-sm text-red-300">
            Não foi possível carregar o catálogo agora. Tente novamente em instantes.
          </p>
        )}

        {!error && disponiveis.length === 0 && (
          <p className="text-muted">Nenhuma camisa disponível nessa categoria no momento.</p>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {disponiveis.map((camisa) => {
            const tamanhosDisponiveis = camisa.camisa_tamanhos
              .filter((t) => t.estoque > 0)
              .map((t) => t.tamanho);

            const fotoHover = [...camisa.camisa_fotos].sort((a, b) => a.ordem - b.ordem)[0]?.url;

            return (
              <Link
                key={camisa.id}
                href={`/produto/${camisa.id}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-ouro hover:shadow-[0_12px_32px_-12px_rgba(201,162,74,0.35)]"
              >
                <div className="relative aspect-square w-full overflow-hidden">
                  {camisa.foto_url ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={camisa.foto_url}
                        alt={camisa.modelo}
                        className={`h-full w-full object-cover ${
                          fotoHover ? "transition-opacity duration-300 group-hover:opacity-0" : ""
                        }`}
                      />
                      {fotoHover && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={fotoHover}
                          alt={`${camisa.modelo} - outro ângulo`}
                          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        />
                      )}
                    </>
                  ) : (
                    <ShirtPlaceholder categoria={camisa.categoria} />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-3">
                  <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-ouro" />
                    {camisa.categoria}
                  </span>
                  <h2 className="text-sm font-medium text-paper">{camisa.modelo}</h2>
                  <p className="text-xs text-muted">Tamanhos: {tamanhosDisponiveis.join(", ")}</p>
                  <p className="mt-auto font-display text-lg text-flare">
                    {camisa.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
