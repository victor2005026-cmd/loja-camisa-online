import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CamisaComTamanhos } from "@/lib/types";
import { alternarAtivo } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminProdutosPage() {
  const admin = createAdminClient();

  const { data: camisas } = await admin
    .from("camisas")
    .select(
      "id, modelo, descricao, preco, foto_url, ativo, created_at, camisa_tamanhos(id, camisa_id, tamanho, estoque)",
    )
    .order("created_at", { ascending: false })
    .returns<CamisaComTamanhos[]>();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Link
          href="/admin/produtos/novo"
          className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Novo produto
        </Link>
      </div>

      <div className="space-y-3">
        {(camisas ?? []).map((camisa) => (
          <div
            key={camisa.id}
            className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
              {camisa.foto_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={camisa.foto_url} alt={camisa.modelo} className="h-full w-full object-cover" />
              )}
            </div>

            <div className="min-w-40 flex-1">
              <p className="text-sm font-semibold text-gray-900">{camisa.modelo}</p>
              <p className="text-xs text-gray-500">
                {camisa.camisa_tamanhos.map((t) => `${t.tamanho}: ${t.estoque}`).join(" · ")}
              </p>
              <p className="text-sm font-medium text-gray-900">
                {camisa.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </div>

            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                camisa.ativo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
              }`}
            >
              {camisa.ativo ? "Ativo" : "Inativo"}
            </span>

            <Link href={`/admin/produtos/${camisa.id}`} className="text-sm font-medium text-black underline">
              Editar
            </Link>

            <form action={alternarAtivo.bind(null, camisa.id, !camisa.ativo)}>
              <button className="text-sm text-gray-500 hover:text-gray-800">
                {camisa.ativo ? "Desativar" : "Ativar"}
              </button>
            </form>
          </div>
        ))}

        {(!camisas || camisas.length === 0) && <p className="text-gray-500">Nenhum produto cadastrado ainda.</p>}
      </div>
    </div>
  );
}
