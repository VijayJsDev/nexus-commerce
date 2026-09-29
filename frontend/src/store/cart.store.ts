/**
 * cart.store.ts — Zustand cart state store with persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, CartStore } from '@/types/cart.types';

const INITIAL_ITEMS: CartItem[] = [
  {
    id: 101,
    name: 'Flower Tape D. Green',
    image: '/product_image_1.jpg',
    amount: 16,
    quantity: 1,
  },
  {
    id: 102,
    name: 'Floral Bouquet Flower Card',
    image: '/product_image_2.jpg',
    amount: 75,
    quantity: 1,
  },
];

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: INITIAL_ITEMS,
      isOpen: false,
      specialInstructions: '',

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (product) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
              isOpen: true,
            };
          }
          return {
            items: [
              ...state.items,
              {
                id: product.id,
                name: product.name,
                image: product.image,
                amount: product.amount,
                quantity: 1,
              },
            ],
            isOpen: true,
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      setSpecialInstructions: (instructions) =>
        set({ specialInstructions: instructions }),

      totalCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      totalAmount: () => {
        return get().items.reduce(
          (sum, item) => sum + item.amount * item.quantity,
          0
        );
      },
    }),
    {
      name: 'nexus_cart_storage',
      partialize: (state) => ({
        items: state.items,
        specialInstructions: state.specialInstructions,
      }),
    }
  )
);
