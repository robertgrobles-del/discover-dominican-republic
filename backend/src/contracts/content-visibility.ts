import type { CollectionDef } from "./content-collections.js";
import { hasContentColumn } from "./content-schema.js";

/** SQL predicate shared by public catalog readers; visibility rules remain part of the content contract. */
export function contentVisibility(definition: CollectionDef): string {
  const table = definition.table;
  const parts: string[] = [];
  if (hasContentColumn(table, "status")) parts.push("status = 'published'");
  if (hasContentColumn(table, "deleted_at")) parts.push("deleted_at IS NULL");
  if (hasContentColumn(table, "published_at")) parts.push("(published_at IS NULL OR published_at <= now())");
  if (hasContentColumn(table, "is_active")) parts.push("COALESCE(is_active, true)");
  if (definition.visible) parts.push(definition.visible);
  return parts.length ? parts.join(" AND ") : "true";
}
