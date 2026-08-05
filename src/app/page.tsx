import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { CamisaComTamanhos } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: camisas, error } = await supabase
    .from("camisas")
    .select("id, modelo, descricao, preco, foto_url, ativo, created_at, camisa_tamanhos(id, camisa_id, tamanho, estoque)")
    .eq("ativo", true)
    .order("created_at", { ascending: false })
    .returns<CamisaComTamanhos[]>();

  const disponiveis = (camisas ?? []).filter((c) =>
    c.camisa_tamanhos.some((t) => t.estoque > 0),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Catálogo</h1>

      {error && (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          Não foi possível carregar o catálogo agora. Tente novamente em instantes.
        </p>
      )}

      {!error && disponiveis.length === 0 && (
        <p className="text-gray-500">Nenhuma camisa disponível no momento.</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {disponiveis.map((camisa) => {
          const tamanhosDisponiveis = camisa.camisa_tamanhos
            .filter((t) => t.estoque > 0)
            .map((t) => t.tamanho);

          return (
            <Link
              key={camisa.id}
              href={`/produto/${camisa.id}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="aspect-square w-full bg-gray-100">
                {camisa.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={camisa.foto_url}
                    alt={camisa.modelo}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                    Sem foto
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1 p-3">
                <h2 className="text-sm font-semibold text-gray-900">{camisa.modelo}</h2>
                <p className="text-xs text-gray-500">Tamanhos: {tamanhosDisponiveis.join(", ")}</p>
                <p className="mt-auto text-base font-bold text-gray-900">
                  {camisa.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
