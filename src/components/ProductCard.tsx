import Link from "next/link";
import type { CamisaComDetalhes } from "@/lib/types";
import { ShirtPlaceholder } from "@/components/ShirtPlaceholder";

export function ProductCard({ camisa }: { camisa: CamisaComDetalhes }) {
  const tamanhosDisponiveis = camisa.camisa_tamanhos
    .filter((t) => t.estoque > 0)
    .map((t) => t.tamanho);

  const fotoHover = [...camisa.camisa_fotos].sort((a, b) => a.ordem - b.ordem)[0]?.url;

  return (
    <Link
      href={`/produto/${camisa.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-ouro hover:shadow-[0_12px_32px_-12px_rgba(201,162,74,0.35)]"
    >
      <div className="relative aspect-square w-full overflow-hidden">
        {camisa.foto_url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={camisa.foto_url}
              alt={camisa.modelo}
              className={`h-full w-full object-cover ${
                fotoHover ? "transition-opacity duration-300 group-hover:opacity-0" : ""
              }`}
            />
            {fotoHover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fotoHover}
                alt={`${camisa.modelo} - outro ângulo`}
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <ShirtPlaceholder categoria={camisa.categoria} />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-ouro" />
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
}
