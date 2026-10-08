import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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

// Route modules
import { touristRoutes } from "@/routes/touristRoutes";
import { planningRoutes } from "@/routes/planningRoutes";
import { operatorRoutes } from "@/routes/operatorRoutes";
import { storeRoutes } from "@/routes/storeRoutes";
import { userAccountRoutes } from "@/routes/userAccountRoutes";
import { institutionalRoutes } from "@/routes/institutionalRoutes";

// Core pages
const Index = lazy(() => import("./pages/Index"));
import NotFound from "./pages/NotFound";

// Lazy load non-critical global UI
const BackToTop = lazy(() => import("@/components/BackToTop").then(m => ({ default: m.BackToTop })));
const ChatbotTuristico = lazy(() => import("@/components/ChatbotTuristico").then(m => ({ default: m.ChatbotTuristico })));
const GamificationToastOverlay = lazy(() => import("@/components/gamification/GamificationToast").then(m => ({ default: m.GamificationToastOverlay })));
const ExitIntentModal = lazy(() => import("@/components/promo/ExitIntentModal").then(m => ({ default: m.ExitIntentModal })));
const CookieConsentBanner = lazy(() => import("@/components/privacy/CookieConsentBanner").then(m => ({ default: m.CookieConsentBanner })));
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
      <DeferredWidget delayMs={3000}><SocialProofNotifications /></DeferredWidget>
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

            {/* Submódulos de Rutas */}
            {touristRoutes}
            {planningRoutes}
            {operatorRoutes}
            {storeRoutes}
            {userAccountRoutes}
            {institutionalRoutes}

            {/* Catch-All 404 */}
            <Route path="*" element={<NotFound />} />
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
