import type { FavoriteRef, FavoritesReaderPort } from "../../contracts/favorites.js";
import type { Db } from "../../db/pool.js";

/** PostgreSQL adapter for reading favorites by user, newest first. */
export class PostgresFavoritesReader implements FavoritesReaderPort {
  constructor(private readonly db: Db) {}

  async listRecentFavorites(userId: string, limit: number): Promise<FavoriteRef[]> {
    return (await this.db.query<FavoriteRef>("SELECT entity_type, entity_id FROM favorites WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2", [userId, limit])).rows;
  }
}
