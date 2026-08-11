"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIAS_DISPONIVEIS } from "@/lib/types";

function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-line px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted">Institucional</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a
                href="https://wa.me/5513991749391"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-paper"
              >
                Fale Conosco
              </a>
            </li>
            <li>
              <Link href="/termos" className="text-muted hover:text-paper">
                Termos de Uso
              </Link>
            </li>
            <li>
              <Link href="/privacidade" className="text-muted hover:text-paper">
                Política de Privacidade
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted">Categorias</p>
          <ul className="mt-3 space-y-2 text-sm">
            {CATEGORIAS_DISPONIVEIS.map((cat) => (
              <li key={cat}>
                <Link
                  href={`/?categoria=${encodeURIComponent(cat)}`}
                  className="text-muted hover:text-paper"
                >
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted">Atendimento</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a
                href="https://wa.me/5513991749391"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted hover:text-paper"
              >
                <IconWhatsApp />
                (13) 99174-9391
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com/lv.sports013"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted hover:text-paper"
              >
                <IconInstagram />
                @lv.sports013
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center gap-4 border-t border-line pt-8">
        <Image src="/logo.png" alt="LV Sports" width={140} height={91} className="h-14 w-auto" />

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted">
          <span>© {new Date().getFullYear()} LV Sports</span>
        </div>
      </div>
    </footer>
  );
}
