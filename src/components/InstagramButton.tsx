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
      href="https://instagram.com/lvsports013"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Seguir no Instagram"
      className={`fixed right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition hover:brightness-110 ${
        cartBarVisivel ? "bottom-40" : "bottom-24"
      }`}
      style={{
        background:
          "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="white"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1" fill="white" stroke="none" />
      </svg>
    </a>
  );
}
