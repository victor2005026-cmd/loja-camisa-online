"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/cart-store";
import { LogoutButton } from "@/components/LogoutButton";

function IconPessoa() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.4-4 4-6 7.5-6s6.1 2 7.5 6" />
    </svg>
  );
}

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [rolado, setRolado] = useState(false);
  const [avatarComErro, setAvatarComErro] = useState(false);
  const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantidade, 0));

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAvatarComErro(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Zona morta entre 50 e 120px: evita que o header pisque (esconde,
    // reflow, o navegador reajusta o scroll, mostra de novo, repete).
    function aoRolar() {
      setRolado((estavaRolado) => {
        const y = window.scrollY;
        if (y > 120) return true;
        if (y < 50) return false;
        return estavaRolado;
      });
    }
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-ink/95 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className={`flex flex-shrink-0 items-center overflow-hidden transition-[max-width,opacity,margin] duration-300 ${
            rolado ? "-mr-3 max-w-0 opacity-0" : "mr-0 max-w-[160px] opacity-100"
          }`}
        >
          <Image src="/logo.png" alt="LV Sports" width={140} height={91} className="h-9 w-auto" priority />
        </Link>

        <div className="hidden flex-1 justify-center sm:flex">
          <Link
            href="/experiencia"
            className={`items-center font-display text-xs uppercase tracking-wide text-ouro transition-[max-width,opacity] duration-300 hover:brightness-125 sm:inline-flex overflow-hidden ${
              rolado ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100"
            }`}
          >
            Vista a Camisa
          </Link>
        </div>

        <form action="/" role="search" className="min-w-0 flex-1">
          <div className="relative mx-auto max-w-xl">
            <input
              type="text"
              name="busca"
              placeholder="Buscar camisa, time, seleção..."
              className="w-full rounded-full border border-line bg-surface px-4 py-2 pr-10 text-sm text-paper placeholder:text-muted focus:border-ouro focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:text-ouro"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </button>
          </div>
        </form>

        <div
          className={`flex flex-shrink-0 items-center gap-3 overflow-hidden transition-[max-width,opacity,margin] duration-300 ${
            rolado ? "-ml-3 max-w-0 opacity-0" : "ml-0 max-w-[280px] opacity-100"
          }`}
        >
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/pedidos" className="hidden text-sm font-medium text-muted hover:text-paper sm:inline">
                Meus pedidos
              </Link>
              <Link href="/conta" aria-label="Minha conta">
                {user.user_metadata?.avatar_url && !avatarComErro ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={user.user_metadata?.full_name ?? "Minha conta"}
                    onError={() => setAvatarComErro(true)}
                    className="h-8 w-8 rounded-full border border-line object-cover transition hover:border-ouro"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted transition hover:border-ouro hover:text-paper">
                    <IconPessoa />
                  </span>
                )}
              </Link>
              <LogoutButton className="hidden text-sm text-muted hover:text-paper sm:inline" />
            </div>
          ) : (
            <Link
              href="/entrar"
              className="rounded-full bg-paper px-4 py-1.5 text-sm font-semibold text-ink shadow-md transition hover:brightness-95 hover:shadow-lg"
            >
              Entrar ou Cadastrar
            </Link>
          )}

          <Link
            href="/carrinho"
            aria-label="Carrinho"
            className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-line text-paper transition hover:border-ouro"
          >
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="9" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 7H6" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-flare px-1 font-display text-[11px] text-ink">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
