import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchApi } from "@/lib/fastifyClient";

const REFERRAL_TTL_DAYS = 30;

export function AffiliateReferralCapture() {
  const location = useLocation();
  const navigate = useNavigate();
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    const expiresAt = Number(localStorage.getItem("affiliate_ref_expires_at") || 0);
    if (localStorage.getItem("affiliate_ref") && (!expiresAt || expiresAt <= Date.now())) {
      localStorage.removeItem("affiliate_ref");
      localStorage.removeItem("affiliate_ref_expires_at");
    }
    const ref = new URLSearchParams(location.search).get("ref")?.trim();
    if (!ref || ref.length < 4 || ref.length > 30 || trackedRef.current === ref) return;
    trackedRef.current = ref;

    void fetchApi<{ data: { valid: boolean; ref: string | null; cookie_days: number } }>(
      `/ambassadors/track?ref=${encodeURIComponent(ref)}`,
    ).then(({ data }) => {
      if (!data.valid || !data.ref) return;
      const expiresAt = Date.now() + Math.min(data.cookie_days || REFERRAL_TTL_DAYS, REFERRAL_TTL_DAYS) * 24 * 60 * 60 * 1000;
      localStorage.setItem("affiliate_ref", data.ref);
      localStorage.setItem("affiliate_ref_expires_at", String(expiresAt));
      const remainingParams = new URLSearchParams(location.search);
      remainingParams.delete("ref");
      const remainingQuery = remainingParams.toString();
      navigate(`${location.pathname}${remainingQuery ? `?${remainingQuery}` : ""}${location.hash}`, { replace: true });
    }).catch(() => {
      // La navegación sigue disponible si el servicio de atribución está temporalmente caído.
    });
  }, [location.hash, location.pathname, location.search, navigate]);

  return null;
}
