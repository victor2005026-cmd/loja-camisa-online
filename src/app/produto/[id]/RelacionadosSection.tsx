import { createClient } from "@/lib/supabase/server";
import type { CamisaComDetalhes } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";

export async function RelacionadosSection({
  camisaId,
  categoria,
}: {
  camisaId: string;
  categoria: string;
}) {
  const supabase = await createClient();

  const { data: camisas } = await supabase
    .from("camisas")
    .select(
      "id, modelo, descricao, preco, foto_url, categoria, ativo, created_at, camisa_tamanhos(id, camisa_id, tamanho, estoque), camisa_fotos(id, camisa_id, url, ordem)",
    )
    .eq("ativo", true)
    .eq("categoria", categoria)
    .neq("id", camisaId)
    .order("created_at", { ascending: false })
    .limit(8)
    .returns<CamisaComDetalhes[]>();

  const relacionados = (camisas ?? [])
    .filter((c) => c.camisa_tamanhos.some((t) => t.estoque > 0))
    .slice(0, 4);

  if (relacionados.length === 0) return null;

  return (
    <div className="mt-16 border-t border-line pt-8">
      <h2 className="font-display text-xl uppercase tracking-wide text-paper">
        Você também vai curtir
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {relacionados.map((camisa) => (
          <ProductCard key={camisa.id} camisa={camisa} />
        ))}
      </div>
    </div>
  );
}
