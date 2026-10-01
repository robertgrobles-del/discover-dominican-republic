/**
 * Cliente API para Strapi Headless CMS (Descubre RD)
 * Con soporte de fallback automático a datos estáticos locales
 */

import { z } from "zod";
import { requestJson } from "@/lib/httpClient";

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || "http://localhost:1337";

export type StrapiQueryValue = string | number | boolean | null | StrapiQueryValue[] | { [key: string]: StrapiQueryValue };

export interface StrapiQueryParams {
  locale?: string;
  populate?: string | string[] | Record<string, StrapiQueryValue>;
  filters?: Record<string, StrapiQueryValue>;
  sort?: string[];
  pagination?: {
    page?: number;
    pageSize?: number;
  };
}

export interface StrapiCollection<T> {
  data: T[];
  meta?: unknown;
}

function appendQueryValue(query: URLSearchParams, key: string, value: StrapiQueryValue): void {
  if (value === null) {
    query.append(key, "");
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => appendQueryValue(query, `${key}[${index}]`, item));
  } else if (typeof value === "object") {
    Object.entries(value).forEach(([childKey, childValue]) => appendQueryValue(query, `${key}[${childKey}]`, childValue));
  } else {
    query.append(key, String(value));
  }
}

export function serializeStrapiQuery(params: StrapiQueryParams): string {
  const query = new URLSearchParams();
  if (params.locale) query.set("locale", params.locale);
  if (params.populate) {
    if (typeof params.populate === "string") query.set("populate", params.populate);
    else appendQueryValue(query, "populate", params.populate);
  }
  if (params.filters) appendQueryValue(query, "filters", params.filters);
  params.sort?.forEach((sort, index) => query.set(`sort[${index}]`, sort));
  if (params.pagination) {
    const pagination = Object.fromEntries(Object.entries(params.pagination).filter(([, value]) => value !== undefined));
    appendQueryValue(query, "pagination", pagination);
  }
  return query.toString();
}

export async function fetchStrapiCollection<T>(
  endpoint: string,
  params: StrapiQueryParams = {},
  responseSchema: z.ZodType<StrapiCollection<T>>,
  fallbackData?: T
): Promise<StrapiCollection<T>> {
  try {
    const normalizedEndpoint = endpoint.replace(/^\/+/, "");
    if (!normalizedEndpoint || normalizedEndpoint.split("/").includes("..")) {
      throw new Error("Endpoint de Strapi inválido");
    }
    const url = new URL(`/api/${normalizedEndpoint}`, STRAPI_URL);
    const query = serializeStrapiQuery(params);
    if (query) url.search = query;
    const json: unknown = await requestJson<unknown>(url.toString());
    return responseSchema.parse(json);
  } catch {
    // Si Strapi no está corriendo o hay error de red, usa los datos mock locales
    if (fallbackData) {
      return { data: Array.isArray(fallbackData) ? fallbackData : [fallbackData] };
    }
    return { data: [] };
  }
}
