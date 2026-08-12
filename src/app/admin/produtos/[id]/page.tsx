import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CamisaComDetalhes } from "@/lib/types";
import { salvarCamisa } from "../actions";
import { ProdutoForm } from "../ProdutoForm";

export const dynamic = "force-dynamic";

export default async function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: camisa } = await admin
    .from("camisas")
    .select(
      "id, modelo, descricao, preco, foto_url, categoria, ativo, created_at, camisa_tamanhos(id, camisa_id, tamanho, estoque), camisa_fotos(id, camisa_id, url, ordem)",
    )
    .eq("id", id)
    .maybeSingle<CamisaComDetalhes>();

  if (!camisa) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Editar produto</h1>
      <ProdutoForm action={salvarCamisa} camisa={camisa} />
    </div>
  );
}
