import { haptic } from "@/lib/haptics";
import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { favoritesApi } from "@/lib/favoritesApi";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export type FavoriteType = "destino" | "hotel" | "experiencia" | "restaurante" | "evento" | "parque" | "bar" | "agencia" | "guia" | "clinica" | "puerto" | "estadio" | "cueva" | "parque-nacional" | "destino-religioso" | "airbnb" | "provincia" | "playa" | "rio" | "spa" | "tour" | "reserva-natural";

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
/** De quién es la copia local: de un invitado o de la cuenta cuyo id se guarda. */
const OWNER_KEY = "rd-travel-favorites-owner";
const GUEST = "guest";
const readOwner = () => { try { return localStorage.getItem(OWNER_KEY) ?? GUEST; } catch { return GUEST; } };
/**
 * Copia local de la lista. Se lee con la misma clave con la que se escribe: el lector genérico de la aplicación
 * antepone un prefijo a las claves, y con él la lista guardada no se encontraba al recargar.
 */
function readLocal(): FavoriteItem[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as FavoriteItem[]).filter((f) => f && typeof f.id === "string" && typeof f.type === "string") : [];
  } catch {
    return [];
  }
}
const writeOwner = (owner: string) => { try { localStorage.setItem(OWNER_KEY, owner); } catch { /* sin almacenamiento no hay copia local */ } };

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(false);
  // Hasta que la lista se ha leído no se escribe la copia local: si no, el arranque la pisaba con una lista
  // vacía antes de leerla (y en desarrollo, donde los efectos corren dos veces, los favoritos de invitado se perdían).
  const [ready, setReady] = useState(false);

  // Load favorites from localStorage or database
  useEffect(() => {
    let cancelled = false;

    async function loadFavorites() {
      if (user) {
        setLoading(true);
        try {
          if (HAS_BACKEND_SESSION) {
            // Con sesión real mandan los favoritos de la cuenta; los que se guardaron en este navegador antes
            // de entrar se suben una vez para no perderlos.
            // Sólo los de invitado: la copia local de una cuenta (ésta u otra) no se vuelve a subir, o reviviría
            // favoritos quitados desde otro dispositivo o mezclaría los de dos personas en el mismo navegador.
            const guestOnes = readOwner() === GUEST ? readLocal() : [];
            const merged = await favoritesApi.mergeLocal(guestOnes);
            if (!cancelled) { writeOwner(user.id); setFavorites(merged as FavoriteItem[]); }
            return;
          }

          // Fallback / mock mode
          const { data, error } = await supabase
            .from("favorites")
            .select("*")
            .eq("user_id", user.id);
          if (!cancelled && !error && data) {
            setFavorites(
              data.map((f: any) => ({
                id: f.item_id,
                type: f.item_type as FavoriteType,
                name: f.item_name,
                image: f.item_image || "",
                location: f.item_location || undefined,
                addedAt: new Date(f.created_at).getTime(),
              }))
            );
          }
        } catch {
          if (!cancelled) {
            setFavorites(readLocal());
          }
        } finally {
          if (!cancelled) { setLoading(false); setReady(true); }
        }
      } else {
        // Not logged in: use localStorage. Si lo guardado era la copia de una cuenta que acaba de cerrar sesión,
        // no se le muestra a quien use el navegador después.
        if (HAS_BACKEND_SESSION && readOwner() !== GUEST) { writeOwner(GUEST); setFavorites([]); }
        else setFavorites(readLocal());
        setReady(true);
      }
    }

    void loadFavorites();
    return () => { cancelled = true; };
  }, [user]);

  // Sync localStorage as local cache/offline copy
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // quota or blocked storage
    }
  }, [favorites, ready]);

  const addFavorite = useCallback(
    async (item: Omit<FavoriteItem, "addedAt">) => {
      const exists = favorites.some((f) => f.id === item.id && f.type === item.type);
      if (exists) return;

      const newFavorite: FavoriteItem = { ...item, addedAt: Date.now() };
      setFavorites((prev) => [...prev, newFavorite]);
      haptic("success");

      if (user) {
        try {
          if (HAS_BACKEND_SESSION) {
            await favoritesApi.add(item);
            return;
          }

          const { error } = await supabase.from("favorites").insert({
            user_id: user.id,
            item_id: item.id,
            item_type: item.type,
            item_name: item.name,
            item_image: item.image || null,
            item_location: item.location || null,
          });
          if (error) throw error;
        } catch {
          setFavorites((prev) => prev.filter((f) => !(f.id === item.id && f.type === item.type)));
          haptic("warning");
          toast({ title: "No se pudo guardar el favorito", description: "Inténtalo de nuevo en un momento.", variant: "destructive" });
        }
      }
    },
    [favorites, user, toast]
  );

  const removeFavorite = useCallback(
    async (id: string, type: FavoriteType) => {
      const removed = favorites.find((f) => f.id === id && f.type === type);
      setFavorites((prev) => prev.filter((f) => !(f.id === id && f.type === type)));

      if (user) {
        try {
          if (HAS_BACKEND_SESSION) {
            await favoritesApi.remove({ id, type });
            return;
          }

          const { error } = await supabase
            .from("favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("item_id", id)
            .eq("item_type", type);
          if (error && removed) throw error;
        } catch {
          if (removed) setFavorites((prev) => [...prev, removed]);
          toast({ title: "No se pudo quitar el favorito", description: "Inténtalo de nuevo en un momento.", variant: "destructive" });
        }
      }
    },
    [favorites, user, toast]
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
    const previous = favorites;
    setFavorites([]);
    if (user) {
      try {
        if (HAS_BACKEND_SESSION) {
          await Promise.all(previous.map((f) => favoritesApi.remove(f).catch(() => undefined)));
          return;
        }

        const { error } = await supabase.from("favorites").delete().eq("user_id", user.id);
        if (error) throw error;
      } catch {
        setFavorites(previous);
        toast({ title: "No se pudieron borrar los favoritos", description: "Inténtalo de nuevo en un momento.", variant: "destructive" });
      }
    }
  }, [favorites, user, toast]);

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
