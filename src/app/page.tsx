import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIAS_DISPONIVEIS, type CamisaComDetalhes, type HeroFoto } from "@/lib/types";
import { HeroColagem } from "@/components/HeroColagem";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; busca?: string; promocao?: string; erro?: string }>;
}) {
  const { categoria, busca, promocao, erro } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("camisas")
    .select(
      "id, modelo, descricao, preco, preco_promocional, foto_url, categoria, ativo, created_at, camisa_tamanhos(id, camisa_id, tamanho, estoque), camisa_fotos(id, camisa_id, url, ordem)",
    )
    .eq("ativo", true)
    .order("created_at", { ascending: false });

  if (categoria) {
    query = query.eq("categoria", categoria);
  }

  if (busca) {
    query = query.or(`modelo.ilike.%${busca}%,descricao.ilike.%${busca}%`);
  }

  if (promocao) {
    query = query.not("preco_promocional", "is", null);
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
          <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-ouro/50 bg-ink/40 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-ouro backdrop-blur">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11Z" />
              <circle cx="12" cy="10" r="2.4" />
            </svg>
            Santos · São Vicente · Praia Grande
          </div>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {erro === "login" && (
          <div className="mb-4 rounded-lg bg-red-950 p-3 text-sm text-red-300">
            Não foi possível entrar com o Google. Tenta de novo, ou entra com e-mail e senha.
          </div>
        )}

        {busca && (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted">
            <span>
              Resultado pra <strong className="text-paper">&quot;{busca}&quot;</strong>
            </span>
            <Link href="/" className="text-ouro hover:underline">
              limpar
            </Link>
          </div>
        )}

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
          <p className="text-muted">
            {busca
              ? `Nenhuma camisa encontrada pra "${busca}".`
              : promocao
                ? "Nenhuma camisa em promoção no momento."
                : "Nenhuma camisa disponível nessa categoria no momento."}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {disponiveis.map((camisa) => (
            <ProductCard key={camisa.id} camisa={camisa} />
          ))}
        </div>
      </div>
    </div>
  );
}
