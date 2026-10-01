export interface UtmTags { source: string; medium: string; campaign: string; content?: string | null }

const slug = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

/**
 * Añade parámetros UTM a un destino externo para que el anunciante pueda atribuir el tráfico.
 * No toca rutas propias (`/…`) ni pisa los UTM que el anunciante ya haya puesto en su enlace.
 */
export function withUtm(url: string, tags: UtmTags): string {
  if (!url.startsWith("https://")) return url;
  let parsed: URL;
  try { parsed = new URL(url); } catch { return url; }
  const add = (key: string, value: string | null | undefined) => {
    const clean = value ? slug(value) : "";
    if (clean && !parsed.searchParams.has(key)) parsed.searchParams.set(key, clean);
  };
  add("utm_source", tags.source);
  add("utm_medium", tags.medium);
  add("utm_campaign", tags.campaign);
  add("utm_content", tags.content);
  return parsed.toString();
}
