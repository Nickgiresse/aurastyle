import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/api";

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, size?: string) => void;
  removeItem: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,

      addItem: (product, quantity = 1, size) => {
        set((state) => {
          const existing = state.items.find(
            (item) => item.product.id === product.id && item.size === size
          );
          let newItems: CartItem[];

          if (existing) {
            newItems = state.items.map((item) =>
              item.product.id === product.id && item.size === size
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            newItems = [
              ...state.items,
              { product, quantity, size },
            ];
          }

          const total = newItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );
          const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

          return { items: newItems, total, itemCount };
        });
      },

      removeItem: (productId, size) => {
        set((state) => {
          const newItems = state.items.filter(
            (item) =>
              !(
                item.product.id === productId &&
                (size == null ? item.size == null : item.size === size)
              )
          );
          const total = newItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );
          const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
          return { items: newItems, total, itemCount };
        });
      },

      updateQuantity: (productId, quantity, size) => {
        if (quantity <= 0) {
          get().removeItem(productId, size);
          return;
        }
        set((state) => {
          const newItems = state.items.map((item) =>
            item.product.id === productId &&
            (size == null ? item.size == null : item.size === size)
              ? { ...item, quantity }
              : item
          );
          const total = newItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );
          const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
          return { items: newItems, total, itemCount };
        });
      },

      clearCart: () => set({ items: [], total: 0, itemCount: 0 }),
    }),
    { name: "aura-cart" }
  )
);
