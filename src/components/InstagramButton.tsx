"use client";

import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";

export function InstagramButton() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantidade, 0));
  if (pathname?.startsWith("/admin")) return null;

  const cartBarVisivel = itemCount > 0 && pathname !== "/carrinho";

  return (
    <a
      href="https://instagram.com/lv.sports013"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Seguir no Instagram"
      className={`fixed right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full border border-line bg-surface text-paper shadow-lg transition hover:border-ouro hover:text-ouro ${
        cartBarVisivel ? "bottom-40" : "bottom-24"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
      </svg>
    </a>
  );
}
