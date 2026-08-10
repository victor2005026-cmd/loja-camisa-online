"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/cart-store";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantidade, 0));

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-ink/95 backdrop-blur">
      <div className="flex w-full items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="font-display text-lg uppercase tracking-wide text-paper">
          Loja de Camisas
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/carrinho" className="relative flex items-center gap-1.5 text-sm font-medium text-muted hover:text-paper">
            <span>Carrinho</span>
            {itemCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-flare px-1 font-display text-xs text-ink">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/pedidos" className="text-sm font-medium text-muted hover:text-paper">
                Meus pedidos
              </Link>
              {user.user_metadata?.avatar_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata?.full_name ?? "Avatar"}
                  className="h-7 w-7 rounded-full border border-line"
                />
              )}
              <button onClick={handleLogout} className="text-sm text-muted hover:text-paper">
                Sair
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <GoogleLoginButton className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-paper hover:border-muted" />
              <Link href="/entrar" className="text-sm font-medium text-muted hover:text-paper">
                E-mail
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
