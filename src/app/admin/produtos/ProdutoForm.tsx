import type { CamisaComDetalhes } from "@/lib/types";
import { CATEGORIAS_DISPONIVEIS, TAMANHOS_DISPONIVEIS } from "@/lib/types";

export function ProdutoForm({
  action,
  removerFoto,
  camisa,
}: {
  action: (formData: FormData) => void | Promise<void>;
  removerFoto?: (fotoId: string) => void | Promise<void>;
  camisa?: CamisaComDetalhes;
}) {
  const estoquePorTamanho = new Map(camisa?.camisa_tamanhos.map((t) => [t.tamanho, t.estoque]));
  const fotosExtras = camisa?.camisa_fotos ?? [];

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
        <label className="block text-sm font-medium text-gray-700">Foto principal (capa)</label>
        {camisa?.foto_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={camisa.foto_url} alt="Capa atual" className="mt-2 h-24 w-24 rounded-lg object-cover" />
        )}
        <input
          type="file"
          name="capa"
          accept="image/jpeg,image/png,image/webp"
          className="mt-2 w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-black file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
        />
        <p className="mt-1 text-xs text-gray-500">Até 5MB. Deixe em branco pra manter a foto atual.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Fotos extras (até 5)</label>
        {fotosExtras.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {fotosExtras.map((foto) => (
              <div key={foto.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={foto.url} alt="Foto extra" className="h-16 w-16 rounded-lg object-cover" />
                {removerFoto && (
                  <button
                    type="submit"
                    formAction={removerFoto.bind(null, foto.id)}
                    formNoValidate
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white hover:bg-red-700"
                    title="Remover foto"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        <input
          type="file"
          name="fotos_extra"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="mt-2 w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-800 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
        />
        <p className="mt-1 text-xs text-gray-500">Aparecem na página do produto. Os 5 primeiros arquivos enviados são usados.</p>
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
