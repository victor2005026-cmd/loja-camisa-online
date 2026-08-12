import Link from "next/link";
import type { CamisaComDetalhes } from "@/lib/types";
import { ShirtPlaceholder } from "@/components/ShirtPlaceholder";

const WHATSAPP_NUMERO = "5513991749391";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function ProductCard({ camisa }: { camisa: CamisaComDetalhes }) {
  const tamanhosDisponiveis = camisa.camisa_tamanhos
    .filter((t) => t.estoque > 0)
    .map((t) => t.tamanho);

  const fotoHover = [...camisa.camisa_fotos].sort((a, b) => a.ordem - b.ordem)[0]?.url;
  const emPromocao = camisa.preco_promocional != null;

  const mensagemWpp = `Olá! Tenho interesse na camisa ${camisa.modelo}: ${siteUrl}/produto/${camisa.id}`;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-ouro hover:shadow-[0_12px_32px_-12px_rgba(201,162,74,0.35)]">
      <div className="relative aspect-square w-full overflow-hidden">
        <Link href={`/produto/${camisa.id}`} className="absolute inset-0 z-0 block">
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
        </Link>

        {emPromocao && (
          <span className="pointer-events-none absolute left-2 top-2 z-20 rounded-full bg-flare px-2 py-0.5 font-display text-[10px] uppercase text-ink">
            Oferta
          </span>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex translate-y-full items-center gap-1.5 bg-ink/85 p-1.5 opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          <Link
            href={`/produto/${camisa.id}#comprar`}
            className="pointer-events-auto flex-1 rounded-full bg-flare px-2 py-1.5 text-center text-[11px] font-semibold text-ink transition hover:brightness-110"
          >
            Comprar
          </Link>
          <Link
            href={`/produto/${camisa.id}`}
            className="pointer-events-auto flex-1 rounded-full border border-paper/60 px-2 py-1.5 text-center text-[11px] font-semibold text-paper transition hover:border-paper"
          >
            Saiba mais
          </Link>
          <a
            href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagemWpp)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Perguntar no WhatsApp"
            className="pointer-events-auto flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white transition hover:brightness-110"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
            </svg>
          </a>
        </div>
      </div>

      <Link href={`/produto/${camisa.id}`} className="flex flex-1 flex-col gap-1.5 p-3">
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-ouro" />
          {camisa.categoria}
        </span>
        <h2 className="text-sm font-medium text-paper">{camisa.modelo}</h2>
        <p className="text-xs text-muted">Tamanhos: {tamanhosDisponiveis.join(", ")}</p>
        <div className="mt-auto flex items-baseline gap-2">
          {emPromocao && (
            <span className="text-xs text-muted line-through">
              {camisa.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          )}
          <p className="font-display text-lg text-flare">
            {(camisa.preco_promocional ?? camisa.preco).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
      </Link>
    </div>
  );
}
