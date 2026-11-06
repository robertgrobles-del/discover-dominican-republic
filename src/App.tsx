import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ScrollToTop } from "@/components/ScrollToTop";
import { DeferredWidget } from "@/components/DeferredWidget";
import { NetworkStatusNotice } from "@/components/NetworkStatusNotice";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import { SessionExpiryGuard } from "@/components/SessionExpiryGuard";
import { AffiliateReferralCapture } from "@/components/AffiliateReferralCapture";
import { FavoritesProvider } from "@/hooks/useFavorites";
import { AuthProvider } from "@/hooks/useAuth";
import { I18nProvider } from "@/hooks/useI18n";
import { CartProvider } from "@/hooks/useCart";
import { queryClient } from "@/lib/fastifyClient";
import { usePageTracking } from "@/hooks/useAnalytics";
import { captureAndStoreUtmParams } from "@/utils/utm";
import { useEffect } from "react";

// Rama staging: solo la landing (sin enlaces activos), el acceso y el panel de administración.
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const NoticiasLista = lazy(() => import("./pages/staging/NoticiasLista"));
const NoticiaDetalle = lazy(() => import("./pages/staging/NoticiaDetalle"));
// Traídas del portal completo: funcionan con los datos del propio código, sin backend.
const Eventos = lazy(() => import("./pages/Eventos"));
const EventoDetalle = lazy(() => import("./pages/EventoDetalle"));
const RequisitosViaje = lazy(() => import("./pages/RequisitosViaje"));
const ETicket = lazy(() => import("./pages/ETicket"));
const Privacidad = lazy(() => import("./pages/staging/Privacidad"));
const Terminos = lazy(() => import("./pages/staging/Terminos"));

/** Páginas públicas que existen en staging: la landing, noticias, eventos y requisitos de viaje. */
const PUBLISHED = ["/noticias", "/eventos", "/evento", "/requisitos-viaje", "/e-ticket", "/privacidad", "/terminos"];
const isPublishedPath = (path: string) => path === "/" || PUBLISHED.some((p) => path === p || path.startsWith(`${p}/`));

/**
 * Staging solo publica la landing y las noticias: los enlaces internos a otras secciones no navegan.
 * Los externos solo funcionan dentro de una noticia (la fuente original, enlaces del cuerpo).
 * Se intercepta en captura para cubrir también los enlaces de widgets fuera de la página (pie, banners).
 */
function DisableUnpublishedLinks() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!isPublishedPath(pathname)) return; // /login y /admin navegan con normalidad
    const blocked = (target: EventTarget | null) => {
      const a = (target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return false;
      const url = new URL(a.href, window.location.href);
      if (url.origin === window.location.origin) return !isPublishedPath(url.pathname);
      return !(pathname.startsWith("/noticias/") && a.closest("article"));
    };
    const block = (e: MouseEvent) => { if (blocked(e.target)) { e.preventDefault(); e.stopPropagation(); } };
    const blockKey = (e: KeyboardEvent) => { if (e.key === "Enter" && blocked(e.target)) { e.preventDefault(); e.stopPropagation(); } };
    document.addEventListener("click", block, true);
    document.addEventListener("keydown", blockKey, true);
    document.documentElement.classList.add("staging-links-off");
    return () => {
      document.removeEventListener("click", block, true);
      document.removeEventListener("keydown", blockKey, true);
      document.documentElement.classList.remove("staging-links-off");
    };
  }, [pathname]);
  return null;
}

// Lazy load non-critical global UI
const BackToTop = lazy(() => import("@/components/BackToTop").then(m => ({ default: m.BackToTop })));
const ChatbotTuristico = lazy(() => import("@/components/ChatbotTuristico").then(m => ({ default: m.ChatbotTuristico })));
const GamificationToastOverlay = lazy(() => import("@/components/gamification/GamificationToast").then(m => ({ default: m.GamificationToastOverlay })));
const ExitIntentModal = lazy(() => import("@/components/promo/ExitIntentModal").then(m => ({ default: m.ExitIntentModal })));
const CookieConsentBanner = lazy(() => import("@/components/privacy/CookieConsentBanner").then(m => ({ default: m.CookieConsentBanner })));
/**
 * Aviso flotante «Fulano reservó…». Apagado: hoy muestra reservas de ejemplo, no reales. El componente se conserva
 * para encenderlo cuando lea reservas confirmadas del backend (con consentimiento del cliente y datos anonimizados).
 */
const SOCIAL_PROOF_ENABLED = false;
const SocialProofNotifications = lazy(() => import("@/components/social/SocialProofNotifications").then(m => ({ default: m.SocialProofNotifications })));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground text-sm">Cargando...</p>
    </div>
  </div>
);

/** Asistente, avisos de actividad y ventanas promocionales: solo en el sitio público, no en las consolas internas. */
function PublicSiteWidgets() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin") || pathname.startsWith("/operadores/panel")) return null;
  return (
    <>
      <DeferredWidget><BackToTop /></DeferredWidget>
      <DeferredWidget><ChatbotTuristico /></DeferredWidget>
      <DeferredWidget><GamificationToastOverlay /></DeferredWidget>
      <DeferredWidget><ExitIntentModal /></DeferredWidget>
      {SOCIAL_PROOF_ENABLED && <DeferredWidget delayMs={3000}><SocialProofNotifications /></DeferredWidget>}
    </>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  usePageTracking();
  
  useEffect(() => {
    captureAndStoreUtmParams();
  }, [location.search]);

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <RouteErrorBoundary key={location.pathname}>
          <Routes location={location}>
            {/* Homepage */}
            <Route path="/" element={<Index />} />

            <Route path="/eventos" element={<Eventos />} />
            <Route path="/evento/:slug" element={<EventoDetalle />} />
            <Route path="/requisitos-viaje" element={<RequisitosViaje />} />
            <Route path="/e-ticket" element={<ETicket />} />
            <Route path="/privacidad" element={<Privacidad />} />
            <Route path="/terminos" element={<Terminos />} />
            <Route path="/noticias" element={<NoticiasLista />} />
            <Route path="/noticias/:slug" element={<NoticiaDetalle />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminPanel />} />

            {/* Lo demás no existe en staging: vuelve a la landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </RouteErrorBoundary>
      </Suspense>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <I18nProvider>
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AffiliateReferralCapture />
                <NetworkStatusNotice />
                <ScrollToTop />
                <SessionExpiryGuard />
                <DisableUnpublishedLinks />
                <AnimatedRoutes />
                <Suspense fallback={null}>
                  <PublicSiteWidgets />
                  <DeferredWidget delayMs={250}><CookieConsentBanner /></DeferredWidget>
                </Suspense>
              </BrowserRouter>
            </CartProvider>
          </FavoritesProvider>
        </AuthProvider>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
