/**
 * Cliente API para Strapi Headless CMS (Descubre RD)
 * Con soporte de fallback automático a datos estáticos locales
 */

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || "http://localhost:1337";

export interface StrapiQueryParams {
  locale?: string;
  populate?: string | string[] | Record<string, any>;
  filters?: Record<string, any>;
  sort?: string[];
  pagination?: {
    page?: number;
    pageSize?: number;
  };
}

export async function fetchStrapiCollection<T>(
  endpoint: string,
  params: StrapiQueryParams = {},
  fallbackData?: T
): Promise<{ data: T[]; meta?: any }> {
  try {
    const url = new URL(`/api/${endpoint}`, STRAPI_URL);
    
    if (params.locale) {
      url.searchParams.append("locale", params.locale);
    }
    
    if (params.populate) {
      if (typeof params.populate === "string") {
        url.searchParams.append("populate", params.populate);
      } else {
        url.searchParams.append("populate", "*");
      }
    }

    const response = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error en Strapi (${response.status}): ${response.statusText}`);
    }

    const json = await response.json();
    return json;
  } catch (error) {
    // Si Strapi no está corriendo o hay error de red, usa los datos mock locales
    if (fallbackData) {
      return { data: Array.isArray(fallbackData) ? fallbackData : [fallbackData] };
    }
    return { data: [] };
  }
}
