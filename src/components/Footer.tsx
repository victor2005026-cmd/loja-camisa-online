"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-line px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <span>© {new Date().getFullYear()} Loja de Camisas</span>
        <div className="flex gap-4">
          <Link href="/termos" className="hover:text-paper">
            Termos de Uso
          </Link>
          <Link href="/privacidade" className="hover:text-paper">
            Política de Privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}
