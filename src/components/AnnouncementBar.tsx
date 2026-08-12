"use client";

import { usePathname } from "next/navigation";

const ITENS = [
  "ENTREGA EM SANTOS, SÃO VICENTE E PRAIA GRANDE",
  "PAGAMENTO VIA PIX",
  "DÚVIDAS? CHAMA NO WHATSAPP",
  "@LV.SPORTS013",
];

export function AnnouncementBar() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  const conteudo = ITENS.join("   ·   ");

  return (
    <div className="overflow-hidden border-b border-line bg-surface py-2">
      <div className="animate-marquee flex w-max whitespace-nowrap">
        <span className="px-4 font-mono text-[11px] uppercase tracking-widest text-ouro">
          {conteudo}
        </span>
        <span className="px-4 font-mono text-[11px] uppercase tracking-widest text-ouro" aria-hidden="true">
          {conteudo}
        </span>
      </div>
    </div>
  );
}
