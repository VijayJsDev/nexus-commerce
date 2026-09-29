/**
 * cart.types.ts — Type definitions for shopping cart state
 */

export interface CartItem {
  id: number;
  name: string;
  image: string;
  amount: number;
  quantity: number;
}

export interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  specialInstructions: string;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: {
    id: number;
    name: string;
    image: string;
    amount: number;
  }) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  setSpecialInstructions: (instructions: string) => void;
  totalCount: () => number;
  totalAmount: () => number;
}
