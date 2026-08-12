import type { CamisaComDetalhes } from "@/lib/types";
import { CATEGORIAS_DISPONIVEIS, MAX_FOTOS_PRODUTO, TAMANHOS_DISPONIVEIS } from "@/lib/types";
import { FotoUploader } from "@/components/admin/FotoUploader";

export function ProdutoForm({
  action,
  camisa,
}: {
  action: (formData: FormData) => void | Promise<void>;
  camisa?: CamisaComDetalhes;
}) {
  const estoquePorTamanho = new Map(camisa?.camisa_tamanhos.map((t) => [t.tamanho, t.estoque]));
  const fotosIniciais = [
    ...(camisa?.foto_url ? [{ id: "capa", url: camisa.foto_url }] : []),
    ...[...(camisa?.camisa_fotos ?? [])]
      .sort((a, b) => a.ordem - b.ordem)
      .map((f) => ({ id: f.id, url: f.url })),
  ];

  return (
    <form action={action} className="space-y-4">
      {camisa && <input type="hidden" name="id" value={camisa.id} />}

      <div>
        <label className="block text-sm font-medium text-gray-700">Modelo</label>
        <input
          name="modelo"
          defaultValue={camisa?.modelo}
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Descrição</label>
        <textarea
          name="descricao"
          defaultValue={camisa?.descricao ?? ""}
          rows={3}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Categoria</label>
        <select
          name="categoria"
          defaultValue={camisa?.categoria ?? CATEGORIAS_DISPONIVEIS[0]}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          {CATEGORIAS_DISPONIVEIS.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Preço (R$)</label>
          <input
            type="number"
            step="0.01"
            min={0}
            name="preco"
            defaultValue={camisa?.preco}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Preço promocional (opcional)</label>
          <input
            type="number"
            step="0.01"
            min={0}
            name="preco_promocional"
            defaultValue={camisa?.preco_promocional ?? ""}
            placeholder="Deixe em branco pra não ter promoção"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Fotos do produto</label>
        <p className="mb-2 mt-1 text-xs text-gray-500">
          Arraste pra reordenar — a primeira vira a capa (aparece no catálogo). Até{" "}
          {MAX_FOTOS_PRODUTO} fotos, 5MB cada.
        </p>
        <FotoUploader
          existentes={fotosIniciais}
          max={MAX_FOTOS_PRODUTO}
          nomePlano="fotos_plano"
          nomeArquivos="fotos_novas"
          legendaPrimaria="Capa"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Estoque por tamanho</label>
        <div className="mt-1 grid grid-cols-4 gap-2">
          {TAMANHOS_DISPONIVEIS.map((tamanho) => (
            <div key={tamanho}>
              <label className="block text-xs text-gray-500">{tamanho}</label>
              <input
                type="number"
                min={0}
                name={`estoque_${tamanho}`}
                defaultValue={estoquePorTamanho.get(tamanho) ?? 0}
                className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" name="ativo" defaultChecked={camisa?.ativo ?? true} />
        Ativo (visível no catálogo)
      </label>

      <button
        type="submit"
        className="w-full rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
      >
        Salvar
      </button>
    </form>
  );
}
