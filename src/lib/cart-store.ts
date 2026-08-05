import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/types";

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantidade: (camisaId: string, tamanho: string, quantidade: number) => void;
  removeItem: (camisaId: string, tamanho: string) => void;
  clear: () => void;
  total: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.camisaId === item.camisaId && i.tamanho === item.tamanho,
          );
          if (existing) {
            const novaQuantidade = Math.min(
              existing.quantidade + item.quantidade,
              existing.estoqueDisponivel,
            );
            return {
              items: state.items.map((i) =>
                i === existing ? { ...i, quantidade: novaQuantidade } : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },

      updateQuantidade: (camisaId, tamanho, quantidade) => {
        set((state) => ({
          items: state.items
            .map((i) =>
              i.camisaId === camisaId && i.tamanho === tamanho
                ? { ...i, quantidade: Math.max(1, Math.min(quantidade, i.estoqueDisponivel)) }
                : i,
            )
            .filter((i) => i.quantidade > 0),
        }));
      },

      removeItem: (camisaId, tamanho) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.camisaId === camisaId && i.tamanho === tamanho),
          ),
        }));
      },

      clear: () => set({ items: [] }),

      total: () => get().items.reduce((sum, i) => sum + i.preco * i.quantidade, 0),
    }),
    { name: "loja-camisa-carrinho" },
  ),
);
