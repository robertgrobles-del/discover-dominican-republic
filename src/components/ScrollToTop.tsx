import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    // Las páginas sin SEOHead no deben heredar el canonical de la portada; SEOHead lo sobrescribe después.
    const url = `${window.location.origin}${pathname}`;
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", url);
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", url);
  }, [pathname]);

  // Enlaces a una sección (/conectividad#esim): la página carga en diferido, así que se espera a que exista el ancla.
  useEffect(() => {
    if (!hash) return;
    let tries = 0;
    const timer = window.setInterval(() => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) el.scrollIntoView({ behavior: "smooth" });
      if (el || ++tries > 20) window.clearInterval(timer);
    }, 150);
    return () => window.clearInterval(timer);
  }, [pathname, hash]);

  return null;
}
