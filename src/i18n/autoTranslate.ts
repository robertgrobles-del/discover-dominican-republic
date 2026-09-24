// Runtime DOM translator. Pages keep their Spanish source text; when the locale
// is not Spanish, visible text nodes and a few attributes are swapped using a
// pre-generated dictionary (src/i18n/auto/keys.json + <locale>.json, aligned by
// index). Untranslated strings simply stay in Spanish.
import type { Locale } from "./index";

const ATTRS = ["placeholder", "alt", "title", "aria-label"] as const;
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA", "SVG", "INPUT"]);

let keysPromise: Promise<string[]> | null = null;
const dicts = new Map<string, Map<string, string>>();
let activeDict: Map<string, string> | null = null;
let activeLocale: Locale = "es";
let observer: MutationObserver | null = null;
let scheduled = false;
const pending = new Set<Node>();

const originalText = new WeakMap<Node, string>(); // text node -> original Spanish data
const lastWritten = new WeakMap<Node, string>(); // text node -> last translated data we wrote
const originalAttr = new WeakMap<Element, Map<string, string>>();
const lastAttr = new WeakMap<Element, Map<string, string>>();

function norm(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

async function loadDict(locale: Locale): Promise<Map<string, string> | null> {
  if (locale === "es") return null;
  const cached = dicts.get(locale);
  if (cached) return cached;
  keysPromise ??= import("./auto/keys.json").then((m) => m.default as string[]);
  const loaders: Record<string, () => Promise<{ default: string[] }>> = {
    en: () => import("./auto/en.json"),
    fr: () => import("./auto/fr.json"),
    de: () => import("./auto/de.json"),
    pt: () => import("./auto/pt.json"),
    it: () => import("./auto/it.json"),
  };
  const [keys, vals] = await Promise.all([keysPromise, loaders[locale]().then((m) => m.default)]);
  const map = new Map<string, string>();
  for (let i = 0; i < keys.length; i++) {
    const v = vals[i];
    if (v) map.set(keys[i], v);
  }
  dicts.set(locale, map);
  return map;
}

function translateString(original: string): string {
  if (!activeDict) return original;
  const trimmed = norm(original);
  const hit = activeDict.get(trimmed);
  if (!hit) return original;
  const lead = original.match(/^\s*/)![0];
  const trail = original.match(/\s*$/)![0];
  return lead + hit + trail;
}

function skipped(el: Element | null): boolean {
  for (let e: Element | null = el; e; e = e.parentElement) {
    if (SKIP_TAGS.has(e.tagName.toUpperCase())) return true;
    if (e.getAttribute("translate") === "no" || e.classList.contains("notranslate")) return true;
  }
  return false;
}

function processText(node: Text) {
  if (skipped(node.parentElement)) return;
  const current = node.data;
  const written = lastWritten.get(node);
  if (written !== undefined && current === written) return; // our own write
  // Content is (new) Spanish source: remember it and translate.
  if (activeLocale === "es") return;
  originalText.set(node, current);
  const translated = translateString(current);
  if (translated !== current) {
    lastWritten.set(node, translated);
    node.data = translated;
  } else {
    lastWritten.delete(node);
  }
}

function processElementAttrs(el: Element) {
  if (skipped(el)) return;
  for (const a of ATTRS) {
    const v = el.getAttribute(a);
    if (v === null) continue;
    const written = lastAttr.get(el)?.get(a);
    if (written !== undefined && v === written) continue;
    if (activeLocale === "es") continue;
    let o = originalAttr.get(el);
    if (!o) originalAttr.set(el, (o = new Map()));
    o.set(a, v);
    const t = translateString(v);
    if (t !== v) {
      let l = lastAttr.get(el);
      if (!l) lastAttr.set(el, (l = new Map()));
      l.set(a, t);
      el.setAttribute(a, t);
    }
  }
}

function walk(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) {
    processText(root as Text);
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  const el = root as Element;
  processElementAttrs(el);
  const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let n: Node | null = tw.nextNode();
  while (n) {
    if (n.nodeType === Node.TEXT_NODE) processText(n as Text);
    else processElementAttrs(n as Element);
    n = tw.nextNode();
  }
}

function restoreAll() {
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let n: Node | null = tw.nextNode();
  while (n) {
    if (n.nodeType === Node.TEXT_NODE) {
      const o = originalText.get(n);
      if (o !== undefined && (n as Text).data === lastWritten.get(n)) (n as Text).data = o;
      lastWritten.delete(n);
    } else {
      const el = n as Element;
      const o = originalAttr.get(el);
      if (o) {
        for (const [a, v] of o) if (el.getAttribute(a) === lastAttr.get(el)?.get(a)) el.setAttribute(a, v);
        lastAttr.delete(el);
      }
    }
    n = tw.nextNode();
  }
}

function retranslateAll() {
  // Restore Spanish first so a new locale always translates from the source text.
  restoreAll();
  walk(document.body);
  translateTitle();
}

let originalTitle: string | null = null;
let lastTitleWritten: string | null = null;
function translateTitle() {
  if (typeof document === "undefined") return;
  const cur = document.title;
  if (activeLocale === "es" || !activeDict) {
    if (originalTitle !== null && cur === lastTitleWritten) document.title = originalTitle;
    originalTitle = null;
    lastTitleWritten = null;
    return;
  }
  if (cur === lastTitleWritten) return; // our own write
  originalTitle = cur;
  const t = cur.split(" | ").map((part) => translateString(part)).join(" | ");
  if (t !== cur) {
    lastTitleWritten = t;
    document.title = t;
  } else {
    lastTitleWritten = null;
  }
}

function flush() {
  scheduled = false;
  const nodes = [...pending];
  pending.clear();
  observer?.disconnect();
  for (const n of nodes) if (n.isConnected) walk(n);
  translateTitle();
  startObserver();
}

function schedule(node: Node) {
  pending.add(node);
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(flush);
  }
}

let titleObserver: MutationObserver | null = null;
function startTitleObserver() {
  if (titleObserver) return;
  const el = document.querySelector("title");
  if (!el) return;
  titleObserver = new MutationObserver(() => translateTitle());
  titleObserver.observe(el, { childList: true, characterData: true, subtree: true });
}

function startObserver() {
  startTitleObserver();
  if (!observer) {
    observer = new MutationObserver((muts) => {
      if (activeLocale === "es") return;
      for (const m of muts) {
        if (m.type === "childList") m.addedNodes.forEach((n) => schedule(n));
        else if (m.type === "characterData") schedule(m.target);
        else if (m.type === "attributes") schedule(m.target);
      }
    });
  }
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: [...ATTRS],
  });
}

export async function setAutoTranslateLocale(locale: Locale) {
  activeLocale = locale;
  if (locale === "es") {
    activeDict = null;
    observer?.disconnect();
    restoreAll();
    translateTitle();
    return;
  }
  const dict = await loadDict(locale);
  if (activeLocale !== locale) return; // superseded by a newer switch
  activeDict = dict;
  observer?.disconnect();
  retranslateAll();
  startObserver();
}

/** Re-run title translation; call after SEOHead updates document.title. */
export function refreshAutoTranslateTitle() {
  translateTitle();
}
