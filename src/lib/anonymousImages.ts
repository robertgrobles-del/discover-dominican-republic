// Las imágenes de images.unsplash.com dejan cookies de terceros (azk, azk-ss): Lighthouse las marca en Best
// Practices y los navegadores las bloquean cada vez más. Pedidas con crossorigin="anonymous" (Unsplash responde
// Access-Control-Allow-Origin: *), el navegador no envía ni guarda cookies de ese origen.
// El atributo tiene que estar ANTES del src: la descarga empieza al asignarlo. Hay ~150 componentes con estas URLs,
// así que se hace en un solo sitio interceptando cómo se asigna el src (React usa setAttribute).
// shortcut: parche global del DOM; cuando las fotos dejen de venir de Unsplash (subidas al sitio), se puede quitar.
const HOSTS = /^https:\/\/images\.unsplash\.com\//i;

export function shouldBeAnonymous(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return value.split(",").some((part) => HOSTS.test(part.trim())); // src o cualquier candidato de srcset
}

export function installAnonymousImages(): void {
  if (typeof window === "undefined" || (window as { __anonImages?: boolean }).__anonImages) return;
  (window as { __anonImages?: boolean }).__anonImages = true;

  const mark = (el: Element) => {
    if ((el instanceof HTMLImageElement || el instanceof HTMLSourceElement) && !el.hasAttribute("crossorigin")) {
      el.setAttribute("crossorigin", "anonymous");
    }
  };

  const setAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name: string, value: string) {
    if ((name === "src" || name === "srcset") && shouldBeAnonymous(value)) mark(this);
    return setAttribute.call(this, name, value);
  };

  for (const [proto, prop] of [[HTMLImageElement.prototype, "src"], [HTMLImageElement.prototype, "srcset"], [HTMLSourceElement.prototype, "srcset"]] as const) {
    const desc = Object.getOwnPropertyDescriptor(proto, prop);
    if (!desc?.set || !desc.get) continue;
    Object.defineProperty(proto, prop, {
      ...desc,
      set(this: Element, value: string) {
        if (shouldBeAnonymous(value)) mark(this);
        desc.set!.call(this, value);
      },
    });
  }
}
