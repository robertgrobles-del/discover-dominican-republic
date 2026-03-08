import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

let sessionId = sessionStorage.getItem("analytics_session");
if (!sessionId) {
  sessionId = crypto.randomUUID();
  sessionStorage.setItem("analytics_session", sessionId);
}

export function usePageTracking() {
  const location = useLocation();
  
  useEffect(() => {
    supabase.from("analytics_events").insert({
      event_type: "page_view",
      page: location.pathname,
      session_id: sessionId,
    }).then(() => {});
  }, [location.pathname]);
}

export function trackEvent(eventType: string, metadata?: Record<string, unknown>) {
  supabase.from("analytics_events").insert({
    event_type: eventType,
    metadata: metadata || {},
    session_id: sessionId,
  }).then(() => {});
}
