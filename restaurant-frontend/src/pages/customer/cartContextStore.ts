import { createContext, useContext } from "react";

export interface CartItem {
  cartItemId: string;
  menuItemId: number;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  note?: string;
  productOptionIds: number[];
  optionsLabel: string;
}

export interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "cartItemId">) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  count: number;
  subtotal: number;
}

export const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
