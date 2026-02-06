import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 30 seconds or on second visit
      const hasVisited = localStorage.getItem("pwa-visited");
      if (hasVisited) {
        setTimeout(() => setShowPrompt(true), 5000);
      } else {
        localStorage.setItem("pwa-visited", "true");
        setTimeout(() => setShowPrompt(true), 30000);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-dismissed", Date.now().toString());
  };

  // Don't show if already installed or dismissed recently
  if (isStandalone) return null;
  
  const dismissedAt = localStorage.getItem("pwa-dismissed");
  if (dismissedAt && Date.now() - parseInt(dismissedAt) < 7 * 24 * 60 * 60 * 1000) {
    return null;
  }

  if (!showPrompt && !isIOS) return null;

  return (
    <AnimatePresence>
      {(showPrompt || isIOS) && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
        >
          <div className="pwa-prompt rounded-2xl p-5 shadow-2xl">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
                <Smartphone className="h-7 w-7 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground mb-1">Instalar RD Turismo</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Accede rápidamente y disfruta de la app sin conexión
                </p>

                {isIOS ? (
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-2">En Safari:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Toca el botón compartir <span className="inline-block">⬆️</span></li>
                      <li>Selecciona "Añadir a pantalla de inicio"</li>
                    </ol>
                  </div>
                ) : (
                  <Button onClick={handleInstall} className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    Instalar App
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Offline indicator
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 text-center py-2 text-sm font-medium"
    >
      Sin conexión - Algunas funciones pueden no estar disponibles
    </motion.div>
  );
}
