import manifestJson from "./content-manifest.json" with { type: "json" };
import type { ColType } from "../lib/db-types.js";

/** Generated snapshot of the current shared PostgreSQL content schema; not a claim of independent ownership. */
export type ContentManifest = Record<string, Record<string, { type: ColType; nullable: boolean }>>;
export const contentManifest = manifestJson as ContentManifest;
export const contentColumns = (table: string) => contentManifest[table] ?? {};
export const hasContentColumn = (table: string, column: string) => column in contentColumns(table);
