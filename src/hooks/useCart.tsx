import { createContext, useContext, ReactNode, useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/hooks/useAnalytics";
import { queryKeys, queryStaleTime } from "@/lib/queryPolicy";

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
  error: Error | null;
  retry: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const db = supabase;
  const key = queryKeys.cart(user?.id);

  const cartQuery = useQuery({
    queryKey: key,
    enabled: !!user,
    staleTime: queryStaleTime.cart,
    queryFn: async (): Promise<CartItem[]> => {
      if (!user) return [];
      const { data, error } = await db.from("cart_items").select("*").eq("user_id", user.id).order("created_at");
      if (error) throw new Error(error.message || "No se pudo cargar el carrito");
      return ((data || []) as CartItem[]).map((item) => ({ ...item, price: Number(item.price), quantity: Number(item.quantity) }));
    },
  });
  const refreshCart = () => queryClient.invalidateQueries({ queryKey: key });
  const reportError = (error: Error) => toast({ title: "No se pudo actualizar el carrito", description: error.message, variant: "destructive" });

  const addMutation = useMutation({
    mutationFn: async (item: Omit<CartItem, "id">) => {
      if (!user) throw new Error("Inicia sesión para agregar al carrito");
      const existing = (cartQuery.data || []).find((row) => row.product_id === item.product_id);
      const result = existing
        ? await db.from("cart_items").update({ quantity: existing.quantity + Math.max(1, item.quantity || 1) }).eq("id", existing.id).eq("user_id", user.id)
        : await db.from("cart_items").insert({ user_id: user.id, ...item });
      if (result.error) throw new Error(result.error.message || "No se pudo agregar el producto");
      return item;
    },
    onSuccess: (item) => {
      toast({ title: "Agregado al carrito", description: item.product_name });
      trackEvent("add_to_cart", { quantity: Math.max(1, item.quantity || 1) });
      void refreshCart();
    },
    onError: reportError,
  });
  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Inicia sesión para administrar el carrito");
      const { error } = await db.from("cart_items").delete().eq("id", id).eq("user_id", user.id);
      if (error) throw new Error(error.message || "No se pudo quitar el producto");
    },
    onSuccess: refreshCart,
    onError: reportError,
  });
  const updateMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      if (!user) throw new Error("Inicia sesión para administrar el carrito");
      if (quantity <= 0) {
        const { error } = await db.from("cart_items").delete().eq("id", id).eq("user_id", user.id);
        if (error) throw new Error(error.message);
        return;
      }
      const { error } = await db.from("cart_items").update({ quantity }).eq("id", id).eq("user_id", user.id);
      if (error) throw new Error(error.message || "No se pudo cambiar la cantidad");
    },
    onSuccess: refreshCart,
    onError: reportError,
  });
  const clearMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await db.from("cart_items").delete().eq("user_id", user.id);
      if (error) throw new Error(error.message || "No se pudo vaciar el carrito");
    },
    onSuccess: refreshCart,
    onError: reportError,
  });

  const run = useCallback(async <T,>(promise: Promise<T>) => { await promise.catch(() => undefined); }, []);
  const items = cartQuery.data || [];
  const count = items.reduce((acc, item) => acc + item.quantity, 0);
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const addItem = useCallback((item: Omit<CartItem, "id">) => run(addMutation.mutateAsync(item)), [addMutation.mutateAsync, run]);
  const removeItem = useCallback((id: string) => run(removeMutation.mutateAsync(id)), [removeMutation.mutateAsync, run]);
  const updateQuantity = useCallback((id: string, quantity: number) => run(updateMutation.mutateAsync({ id, quantity })), [updateMutation.mutateAsync, run]);
  const clearCart = useCallback(() => run(clearMutation.mutateAsync()), [clearMutation.mutateAsync, run]);
  const retry = useCallback(() => { void cartQuery.refetch(); }, [cartQuery.refetch]);
  const value = useMemo<CartContextType>(() => ({
    items, count, total, addItem, removeItem, updateQuantity, clearCart,
    loading: cartQuery.isLoading,
    error: cartQuery.error,
    retry,
  }), [items, count, total, addItem, removeItem, updateQuantity, clearCart, cartQuery.isLoading, cartQuery.error, retry]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
