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
    <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="text-sm text-paper">
          <span className="font-display text-base text-flare">{itemCount}</span>{" "}
          {itemCount === 1 ? "item" : "itens"} no carrinho ·{" "}
          <span className="font-medium">
            {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>
        <Link
          href="/carrinho"
          className="flex-shrink-0 rounded-lg bg-flare px-4 py-2 text-sm font-semibold text-ink hover:brightness-110"
        >
          Ver carrinho →
        </Link>
      </div>
    </div>
  );
}
