import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIAS_DISPONIVEIS, type CamisaComTamanhos } from "@/lib/types";
import { ShirtPlaceholder } from "@/components/ShirtPlaceholder";

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
      "id, modelo, descricao, preco, foto_url, categoria, ativo, created_at, camisa_tamanhos(id, camisa_id, tamanho, estoque)",
    )
    .eq("ativo", true)
    .order("created_at", { ascending: false });

  if (categoria) {
    query = query.eq("categoria", categoria);
  }

  const { data: camisas, error } = await query.returns<CamisaComTamanhos[]>();

  const disponiveis = (camisas ?? []).filter((c) =>
    c.camisa_tamanhos.some((t) => t.estoque > 0),
  );

  return (
    <div className="w-full">
      <div className="textura-tecido border-b border-line px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-5xl uppercase leading-[0.92] tracking-tight text-paper sm:text-6xl">
          Vista a
          <br />
          camisa.
        </h1>
        <p className="mt-3 max-w-md text-sm text-muted">
          Torcedor, retrô, player ou treino — direto pro seu guarda-roupa.
        </p>
      </div>

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          <Link
            href="/"
            className={`flex-shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              !categoria
                ? "border-flare bg-flare text-ink"
                : "border-line text-muted hover:border-muted hover:text-paper"
            }`}
          >
            Todos
          </Link>
          {CATEGORIAS_DISPONIVEIS.map((cat) => (
            <Link
              key={cat}
              href={`/?categoria=${encodeURIComponent(cat)}`}
              className={`flex-shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                categoria === cat
                  ? "border-flare bg-flare text-ink"
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

            return (
              <Link
                key={camisa.id}
                href={`/produto/${camisa.id}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-flare"
              >
                <div className="aspect-square w-full">
                  {camisa.foto_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={camisa.foto_url}
                      alt={camisa.modelo}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ShirtPlaceholder categoria={camisa.categoria} />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-3">
                  <span className="inline-block w-fit rounded border border-dashed border-line px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-muted">
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
