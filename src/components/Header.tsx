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
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-gray-900">
          Loja de Camisas
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/carrinho" className="relative flex items-center gap-1 text-sm font-medium text-gray-700">
            <span>Carrinho</span>
            {itemCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-xs text-white">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/pedidos" className="text-sm font-medium text-gray-700">
                Meus pedidos
              </Link>
              {user.user_metadata?.avatar_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata?.full_name ?? "Avatar"}
                  className="h-7 w-7 rounded-full"
                />
              )}
              <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-800">
                Sair
              </button>
            </div>
          ) : (
            <GoogleLoginButton className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50" />
          )}
        </div>
      </div>
    </header>
  );
}
