import { createElement, useLayoutEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fastifyClient";

/**
 * Textos e imágenes de cada página, editables desde el panel («Textos e imágenes de páginas»).
 *
 * Cada página (o componente compartido) guarda sus cambios en el documento de contenido `page-<nombre>` con la
 * forma `{ texts: { clave: texto }, images: { clave: url } }`:
 *  - clave ausente  → se ve el contenido del código (respaldo si el backend no responde o nadie lo ha editado);
 *  - clave con texto → se ve ese texto;
 *  - clave vacía ("") → el texto se OCULTA del portal, junto con el elemento que lo contenía si queda vacío.
 *
 * Las claves las ponen `scripts/page-content-codemod.cjs` (textos de JSX: `h1.1`, `p.4`…) y
 * `scripts/page-content-pass2.cjs` (listas de datos: `features.0.title`; imágenes: `asset.heroImg`), y
 * `scripts/page-content-registry.cjs` las reúne en `src/generated/pageContentRegistry.json` para el editor.
 */

export interface PageContentDoc {
  texts?: Record<string, string>;
  images?: Record<string, string>;
}

/** Clave del documento de una página: `SobreNosotros` → `page-sobre-nosotros`. */
export const pageDocKey = (page: string) => `page-${page}`;

// La mayoría de las páginas no tiene documento (nadie las ha editado). En lugar de pedir cada uno y recibir un
// 404 por página y por componente compartido, se pide una vez el índice de documentos y sólo se descargan los que existen.
let docIndex: Promise<Set<string> | null> | null = null;
let docIndexAt = 0;
const DOC_INDEX_TTL_MS = 60_000;
function documentIndex(): Promise<Set<string> | null> {
  if (!docIndex || Date.now() - docIndexAt > DOC_INDEX_TTL_MS) {
    docIndexAt = Date.now();
    docIndex = fetchApi<{ data: { key: string }[] }>("/datasets").then((r) => new Set(r.data.map((d) => d.key))).catch(() => null);
  }
  return docIndex;
}
/** Tras guardar o borrar un documento desde el panel. */
export const invalidatePageContentIndex = () => { docIndex = null; };

/** `direct` salta el índice (el editor del panel, que necesita lo recién guardado). */
export async function fetchPageContent(page: string, direct = false): Promise<PageContentDoc | null> {
  if (!direct) {
    const index = await documentIndex();
    if (index && !index.has(pageDocKey(page))) return null;
  }
  try {
    return (await fetchApi<{ data: { value: PageContentDoc } }>(`/datasets/${pageDocKey(page)}`)).data.value ?? null;
  } catch {
    return null; // sin documento (nadie lo editó) o backend caído: se ve el contenido del código
  }
}

// ---------- Vista previa del editor ----------
// El editor del panel abre la página en un marco y le envía su borrador (aún sin guardar) con postMessage:
// la página lo muestra al instante en lugar de lo guardado. Sólo se aceptan mensajes del mismo origen.
export const PREVIEW_MESSAGE = "pc-preview";
const previewDocs = new Map<string, PageContentDoc>();
const previewListeners = new Set<() => void>();
let previewVersion = 0;
if (typeof window !== "undefined") {
  window.addEventListener("message", (e: MessageEvent) => {
    const d = e.data as { type?: string; page?: string; doc?: PageContentDoc | null } | null;
    if (e.origin !== window.location.origin || !d || d.type !== PREVIEW_MESSAGE || typeof d.page !== "string") return;
    if (d.doc) previewDocs.set(d.page, d.doc); else previewDocs.delete(d.page);
    previewVersion++;
    previewListeners.forEach((l) => l());
  });
}
const subscribePreview = (l: () => void) => { previewListeners.add(l); return () => { previewListeners.delete(l); }; };

// ---------- Texto ocultado ----------
const MEDIA = "img,svg,video,picture,canvas,iframe,input,textarea,select";
const isBlank = (el: HTMLElement) => !el.textContent?.trim() && !el.querySelector(MEDIA);

/**
 * Marca de un texto vaciado en el panel. No pinta nada y oculta el elemento que lo contenía (y hasta dos niveles
 * por encima) mientras quede sin contenido: un botón, un párrafo o un título vaciados no dejan hueco.
 */
function HiddenText() {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const hidden: [HTMLElement, string][] = [];
    let el = ref.current?.parentElement ?? null;
    for (let i = 0; el && i < 3 && el !== document.body && isBlank(el); i++, el = el.parentElement) {
      hidden.push([el, el.style.display]);
      el.style.display = "none";
    }
    return () => hidden.forEach(([e, d]) => { e.style.display = d; });
  });
  return createElement("span", { ref, hidden: true, "data-pc-hidden": "" });
}

// ---------- Listas de datos ----------
/** Propiedades que son identificadores, rutas, estilos o valores con los que la página filtra: no se editan. */
const NOT_TEXT = new Set(["id", "slug", "key", "href", "link", "url", "to", "path", "route", "icon", "color", "colors", "className", "class", "variant", "gradient", "accent", "bg", "value", "type", "tipo", "category", "categoria", "region", "status", "code", "lang", "locale", "currency", "email", "phone", "telefono", "website", "size", "target", "rel", "categoryColor", "badgeColor", "iconColor", "bgColor", "textColor"]);
const IMAGE_KEYS = new Set(["image", "img", "src", "imagen", "foto", "photo", "heroImage", "cover", "coverImage", "avatar", "logo", "thumbnail", "poster", "backgroundImage", "banner", "picture", "imageUrl", "image_url"]);
/** ¿Es un texto para personas? (no una clase CSS, una ruta, una URL ni un identificador en kebab-case) */
export const looksLikeText = (s: string) => /\p{L}{2,}/u.test(s) && !/^(\/|#|https?:|mailto:|tel:)/.test(s) && !/(^|\s)(bg|text|from|to|via|border|ring|shadow|hover|md|lg|sm|flex|grid|w|h|p|m)-[a-z0-9[]/.test(s) && !/^[a-z0-9]+([-_][a-z0-9]+)+$/.test(s);
export const isImageKey = (k: string) => IMAGE_KEYS.has(k);
export const isTextKey = (k: string) => !NOT_TEXT.has(k) && !IMAGE_KEYS.has(k);

const dataCache = new WeakMap<object, { doc: PageContentDoc; out: unknown }>();
function applyData(doc: PageContentDoc, node: unknown, path: string, prop: string): unknown {
  if (typeof node === "string") {
    if (isImageKey(prop)) return typeof doc.images?.[path] === "string" ? doc.images[path] : node;
    if (isTextKey(prop) && looksLikeText(node)) return typeof doc.texts?.[path] === "string" ? doc.texts[path] : node;
    return node;
  }
  if (Array.isArray(node)) return node.map((v, i) => applyData(doc, v, `${path}.${i}`, prop));
  // Sólo objetos literales: componentes (iconos), elementos de React, fechas, etc. se dejan como están.
  if (node && typeof node === "object" && Object.getPrototypeOf(node) === Object.prototype && !("$$typeof" in node)) {
    return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, applyData(doc, v, `${path}.${k}`, k)]));
  }
  return node;
}

export function usePageContent(page: string) {
  const { data: saved } = useQuery({ queryKey: ["page-content", page], queryFn: () => fetchPageContent(page), staleTime: 5 * 60_000, retry: false });
  useSyncExternalStore(subscribePreview, () => previewVersion, () => 0);
  const data = previewDocs.get(page) ?? saved; // el borrador del editor manda sobre lo guardado
  const text = (key: string, fallback: string): string => {
    const v = data?.texts?.[key];
    return typeof v === "string" ? v : fallback;
  };
  return {
    /** Texto de `key` como cadena (propiedades: alt, title, placeholder…). Vaciado en el panel → "". */
    t: text,
    /** Texto de `key` dentro de JSX. Vaciado en el panel → no se pinta y se oculta el elemento que lo contenía. */
    tx: (key: string, fallback: string): ReactNode => {
      const v = text(key, fallback);
      return v.trim() ? v : createElement(HiddenText, { key: `pc-${key}` });
    },
    /** Imagen de `key`. Ocultada en el panel → "" (los `<img>` sin dirección no se muestran, ver index.css). */
    img: <T,>(key: string, fallback: T): T | string => {
      const v = data?.images?.[key];
      return typeof v === "string" ? v : fallback;
    },
    /** Lista u objeto de datos de la página con sus textos e imágenes editados (`<nombre>.<ruta>`). */
    data: <T,>(name: string, source: T): T => {
      if (!data || !source || typeof source !== "object") return source;
      const hit = dataCache.get(source as object);
      if (hit?.doc === data) return hit.out as T;
      const out = applyData(data, source, name, name) as T;
      dataCache.set(source as object, { doc: data, out });
      return out;
    },
  };
}
