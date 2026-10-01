export interface FavoriteRef { entity_type: string; entity_id: string }

/** Read projection of favorites by user; writes remain in the profile owner. */
export interface FavoritesReaderPort {
  listRecentFavorites(userId: string, limit: number): Promise<FavoriteRef[]>;
}
