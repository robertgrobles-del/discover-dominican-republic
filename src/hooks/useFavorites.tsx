import { useState, useEffect, createContext, useContext, ReactNode } from "react";

export type FavoriteType = "destino" | "hotel" | "experiencia" | "restaurante" | "evento";

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
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = "rd-travel-favorites";

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (item: Omit<FavoriteItem, "addedAt">) => {
    if (!isFavorite(item.id, item.type)) {
      setFavorites((prev) => [...prev, { ...item, addedAt: Date.now() }]);
    }
  };

  const removeFavorite = (id: string, type: FavoriteType) => {
    setFavorites((prev) => prev.filter((f) => !(f.id === id && f.type === type)));
  };

  const isFavorite = (id: string, type: FavoriteType) => {
    return favorites.some((f) => f.id === id && f.type === type);
  };

  const getFavoritesByType = (type: FavoriteType) => {
    return favorites.filter((f) => f.type === type);
  };

  const clearAll = () => {
    setFavorites([]);
  };

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
