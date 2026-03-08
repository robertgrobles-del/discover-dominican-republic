import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: Omit<CartItem, "id">) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const db = supabase as any;

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); return; }
    const { data } = await db.from("cart_items").select("*").eq("user_id", user.id).order("created_at");
    if (data) setItems(data.map((d: any) => ({ id: d.id, product_id: d.product_id, product_name: d.product_name, product_image: d.product_image, price: Number(d.price), quantity: d.quantity })));
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addItem = async (item: Omit<CartItem, "id">) => {
    if (!user) { toast({ title: "Inicia sesión para agregar al carrito", variant: "destructive" }); return; }
    const existing = items.find((i) => i.product_id === item.product_id);
    if (existing) {
      await updateQuantity(existing.id, existing.quantity + 1);
      return;
    }
    const { error } = await db.from("cart_items").insert({ user_id: user.id, ...item });
    if (!error) {
      toast({ title: "Agregado al carrito", description: item.product_name });
      fetchCart();
    }
  };

  const removeItem = async (id: string) => {
    await db.from("cart_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) { await removeItem(id); return; }
    await db.from("cart_items").update({ quantity }).eq("id", id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  };

  const clearCart = async () => {
    if (!user) return;
    await db.from("cart_items").delete().eq("user_id", user.id);
    setItems([]);
  };

  const count = items.reduce((acc, i) => acc + i.quantity, 0);
  const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, total, addItem, removeItem, updateQuantity, clearCart, loading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
