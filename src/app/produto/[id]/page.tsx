import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CamisaComTamanhos } from "@/lib/types";
import { AddToCartForm } from "./AddToCartForm";

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
    .select("id, modelo, descricao, preco, foto_url, ativo, created_at, camisa_tamanhos(id, camisa_id, tamanho, estoque)")
    .eq("id", id)
    .eq("ativo", true)
    .maybeSingle<CamisaComTamanhos>();

  if (!camisa) notFound();

  const tamanhos = camisa.camisa_tamanhos.filter((t) => t.estoque > 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
          {camisa.foto_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={camisa.foto_url} alt={camisa.modelo} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
              Sem foto
            </div>
          )}
        </div>

        <div>
          <h1 className="text-xl font-bold text-gray-900">{camisa.modelo}</h1>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {camisa.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          {camisa.descricao && <p className="mt-3 text-sm text-gray-600">{camisa.descricao}</p>}

          {tamanhos.length === 0 ? (
            <p className="mt-6 text-sm font-medium text-red-600">Sem estoque disponível.</p>
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
