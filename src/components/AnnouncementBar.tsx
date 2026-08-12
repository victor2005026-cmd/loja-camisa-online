"use client";

import { usePathname } from "next/navigation";

const ITENS = [
  "ENVIO PRA SANTOS, SÃO VICENTE E PRAIA GRANDE",
  "PIX NA HORA, SEM COMPLICAÇÃO",
  "CHAMA NO ZAP QUE A GENTE RESPONDE",
  "SEGUE A GENTE: @LV.SPORTS013",
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
