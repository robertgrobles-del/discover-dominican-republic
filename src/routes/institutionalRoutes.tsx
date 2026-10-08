import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";

// Lazy-loaded pages
const EditorialMagazineHub = lazy(() => import("@/pages/EditorialMagazineHub"));
const Articulo = lazy(() => import("@/pages/Articulo"));
const Galeria = lazy(() => import("@/pages/Galeria"));
const SobreNosotros = lazy(() => import("@/pages/SobreNosotros"));
const NewsletterPage = lazy(() => import("@/pages/NewsletterPage"));
const Estadisticas = lazy(() => import("@/pages/Estadisticas"));
const Partners = lazy(() => import("@/pages/Partners"));
const CentroAyuda = lazy(() => import("@/pages/CentroAyuda"));
const Sostenible = lazy(() => import("@/pages/Sostenible"));
const Terminos = lazy(() => import("@/pages/Terminos"));
const EstadoServicio = lazy(() => import("@/pages/EstadoServicio"));
const Sitemap = lazy(() => import("@/pages/Sitemap"));
const Ofertas = lazy(() => import("@/pages/Ofertas"));
const Encuesta = lazy(() => import("@/pages/Encuesta"));
const EncuestaPostViaje = lazy(() => import("@/pages/EncuestaPostViaje"));
const Opiniones = lazy(() => import("@/pages/Opiniones"));
const Sugerencias = lazy(() => import("@/pages/Sugerencias"));
const AdminPanel = lazy(() => import("@/pages/AdminPanel"));

export const institutionalRoutes = (
  <>
    {/* Portal Editorial & Magazine Unificado */}
    <Route path="/revista" element={<EditorialMagazineHub />} />
    <Route path="/blog" element={<Navigate to="/revista?canal=experiencias" replace />} />
    <Route path="/prensa" element={<Navigate to="/revista?canal=prensa" replace />} />
    <Route path="/noticias" element={<Navigate to="/revista?canal=noticias" replace />} />
    <Route path="/articulo/:slug" element={<Articulo />} />
    <Route path="/galeria" element={<Galeria />} />

    {/* Institucional, Prensa & Estadísticas */}
    <Route path="/sobre-nosotros" element={<SobreNosotros />} />
    <Route path="/newsletter" element={<Navigate to="/revista?canal=prensa" replace />} />
    <Route path="/prensa-comunicacion" element={<Navigate to="/revista?canal=prensa" replace />} />
    <Route path="/newsletter-subscribe" element={<NewsletterPage />} />
    <Route path="/estadisticas" element={<Estadisticas />} />
    <Route path="/partners" element={<Partners />} />

    {/* Centro de Ayuda & Sostenibilidad */}
    <Route path="/ayuda" element={<CentroAyuda />} />
    <Route path="/centro-ayuda" element={<CentroAyuda />} />
    <Route path="/asistencia" element={<CentroAyuda />} />
    <Route path="/sostenible" element={<Sostenible />} />
    <Route path="/viaje-responsable" element={<Sostenible />} />

    {/* Feedback, Encuestas & Ofertas */}
    <Route path="/ofertas" element={<Ofertas />} />
    <Route path="/encuesta" element={<Encuesta />} />
    <Route path="/encuesta-post-viaje" element={<EncuestaPostViaje />} />
    <Route path="/opiniones" element={<Opiniones />} />
    <Route path="/sugerencias" element={<Sugerencias />} />

    {/* Técnico, Legal & Administración */}
    <Route path="/terminos" element={<Terminos />} />
    <Route path="/estado" element={<EstadoServicio />} />
    <Route path="/sitemap" element={<Sitemap />} />
    <Route path="/admin" element={<AdminPanel />} />
  </>
);
