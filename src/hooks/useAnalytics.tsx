import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { clearAnalyticsSessionId, cleanAnalyticsMetadata, cleanAnalyticsPage, getAnalyticsSessionId, sendAnalyticsEvent, type AnalyticsEventType } from "@/lib/analytics-core";
import { isAnalyticsAllowed } from "@/lib/privacy-consent";

export type { AnalyticsEventType };
export { cleanAnalyticsMetadata, cleanAnalyticsPage, getAnalyticsSessionId };

export function trackEvent(eventType: AnalyticsEventType, metadata?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  sendAnalyticsEvent(eventType, window.location.pathname, metadata ?? {});
}

export function usePageTracking() {
  const { pathname } = useLocation();

  useEffect(() => {
    const recordPageView = () => sendAnalyticsEvent("page_view", pathname, {});
    const resetSession = () => {
      if (!isAnalyticsAllowed()) clearAnalyticsSessionId();
      else recordPageView();
    };

    recordPageView();
    window.addEventListener("dr:privacy-consent-change", resetSession);
    return () => window.removeEventListener("dr:privacy-consent-change", resetSession);
  }, [pathname]);
}
