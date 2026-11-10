import { describe, expect, it } from "vitest";
import { readAnalyticsIds } from "@/lib/analyticsTracking";

describe("readAnalyticsIds", () => {
  it("acepta IDs válidos y descarta los mal formados", () => {
    expect(readAnalyticsIds({ VITE_GA_MEASUREMENT_ID: "G-AB12CD", VITE_GTM_ID: "GTM-XY9", VITE_CF_BEACON_TOKEN: "0123456789abcdef0123456789abcdef" }))
      .toEqual({ gaMeasurementId: "G-AB12CD", gtmId: "GTM-XY9", clarityProjectId: undefined, cloudflareToken: "0123456789abcdef0123456789abcdef" });
    expect(readAnalyticsIds({ VITE_GTM_ID: "UA-1", VITE_CF_BEACON_TOKEN: "<script>" })).toEqual({});
  });
});
