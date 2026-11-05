import { z } from "zod";

/** Enlace de creador: sólo http(s). `z.string().url()` acepta `javascript:` o `data:`, que luego acaban en un href. */
export const httpUrl = (max = 500) =>
  z.string().url().max(max).refine((u) => /^https?:\/\//i.test(u), "El enlace debe empezar por http:// o https://");
