import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type FavoriteType = "destino" | "hotel" | "experiencia" | "restaurante" | "evento" | "parque" | "bar" | "agencia" | "guia" | "clinica" | "puerto" | "estadio" | "cueva" | "parque-nacional" | "destino-religioso" | "airbnb";

export interface FavoriteItem {
  id: string;
  type: FavoriteType;
  name: string;
  image: string;
  location?: string;
  addedAt: number;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addFavorite: (item: Omit<FavoriteItem, "addedAt">) => void;
  removeFavorite: (id: string, type: FavoriteType) => void;
  isFavorite: (id: string, type: FavoriteType) => boolean;
  getFavoritesByType: (type: FavoriteType) => FavoriteItem[];
  clearAll: () => void;
  totalCount: number;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = "rd-travel-favorites";

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load favorites from localStorage or database
  useEffect(() => {
    if (user) {
      // Logged in: fetch from database
      setLoading(true);
      supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .then(({ data, error }) => {
          if (!error && data) {
            setFavorites(
              data.map((f) => ({
                id: f.item_id,
                type: f.item_type as FavoriteType,
                name: f.item_name,
                image: f.item_image || "",
                location: f.item_location || undefined,
                addedAt: new Date(f.created_at).getTime(),
              }))
            );
          }
          setLoading(false);
        });
    } else {
      // Not logged in: use localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      setFavorites(stored ? JSON.parse(stored) : []);
    }
  }, [user]);

  // Sync localStorage when not logged in
  useEffect(() => {
    if (!user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }
  }, [favorites, user]);

  const addFavorite = useCallback(
    async (item: Omit<FavoriteItem, "addedAt">) => {
      const exists = favorites.some((f) => f.id === item.id && f.type === item.type);
      if (exists) return;

      const newFavorite: FavoriteItem = { ...item, addedAt: Date.now() };
      setFavorites((prev) => [...prev, newFavorite]);

      if (user) {
        await supabase.from("favorites").insert({
          user_id: user.id,
          item_id: item.id,
          item_type: item.type,
          item_name: item.name,
          item_image: item.image || null,
          item_location: item.location || null,
        });
      }
    },
    [favorites, user]
  );

  const removeFavorite = useCallback(
    async (id: string, type: FavoriteType) => {
      setFavorites((prev) => prev.filter((f) => !(f.id === id && f.type === type)));

      if (user) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("item_id", id)
          .eq("item_type", type);
      }
    },
    [user]
  );

  const isFavorite = useCallback(
    (id: string, type: FavoriteType) => {
      return favorites.some((f) => f.id === id && f.type === type);
    },
    [favorites]
  );

  const getFavoritesByType = useCallback(
    (type: FavoriteType) => {
      return favorites.filter((f) => f.type === type);
    },
    [favorites]
  );

  const clearAll = useCallback(async () => {
    setFavorites([]);
    if (user) {
      await supabase.from("favorites").delete().eq("user_id", user.id);
    }
  }, [user]);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        getFavoritesByType,
        clearAll,
        totalCount: favorites.length,
        loading,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
