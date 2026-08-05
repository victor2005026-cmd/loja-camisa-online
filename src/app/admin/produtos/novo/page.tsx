import { salvarCamisa } from "../actions";
import { ProdutoForm } from "../ProdutoForm";

export default function NovoProdutoPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Novo produto</h1>
      <ProdutoForm action={salvarCamisa} />
    </div>
  );
}
