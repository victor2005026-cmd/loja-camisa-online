import type { CamisaComTamanhos } from "@/lib/types";
import { TAMANHOS_DISPONIVEIS } from "@/lib/types";

export function ProdutoForm({
  action,
  camisa,
}: {
  action: (formData: FormData) => void | Promise<void>;
  camisa?: CamisaComTamanhos;
}) {
  const estoquePorTamanho = new Map(camisa?.camisa_tamanhos.map((t) => [t.tamanho, t.estoque]));

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
        <label className="block text-sm font-medium text-gray-700">URL da foto</label>
        <input
          name="foto_url"
          defaultValue={camisa?.foto_url ?? ""}
          placeholder="https://..."
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
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
