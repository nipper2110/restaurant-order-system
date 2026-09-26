import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "react-router";

import {
  CartContext,
  type CartContextValue,
  type CartItem,
} from "./cartContextStore";

const createCartItemId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const { qrToken } = useParams<{ qrToken: string }>();
  const storageKey = `cart:${qrToken}`;

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // Ignore storage errors (private browsing, quota, etc.) — the cart
      // still works for the rest of this session via in-memory state.
    }
  }, [items, storageKey]);

  const addItem: CartContextValue["addItem"] = (item) => {
    setItems((prev) => [...prev, { ...item, cartItemId: createCartItemId() }]);
  };

  const removeItem = (cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.cartItemId === cartItemId ? { ...i, quantity } : i)),
    );
  };

  const clearCart = () => setItems([]);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, count, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}
