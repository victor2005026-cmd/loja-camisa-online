"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";

export function CartBar() {
  const pathname = usePathname();
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const itemCount = items.reduce((n, i) => n + i.quantidade, 0);

  if (pathname?.startsWith("/admin")) return null;
  if (pathname === "/carrinho") return null;
  if (itemCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-10 flex justify-center px-4 pb-4 sm:px-6">
      <div className="flex w-full max-w-lg items-center justify-between gap-3 rounded-2xl border border-ouro/40 bg-surface/95 px-5 py-3.5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur">
        <div className="flex items-center gap-2.5 text-sm text-paper">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-ouro"
            aria-hidden="true"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 7H6" />
          </svg>
          <span>
            <span className="font-display text-base text-flare">{itemCount}</span>{" "}
            {itemCount === 1 ? "item" : "itens"} ·{" "}
            <span className="font-medium">
              {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </span>
        </div>
        <Link
          href="/carrinho"
          className="flex-shrink-0 rounded-full bg-flare px-4 py-2 text-sm font-semibold text-ink shadow-md transition hover:brightness-110"
        >
          Ver carrinho →
        </Link>
      </div>
    </div>
  );
}
