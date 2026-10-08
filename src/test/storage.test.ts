import { describe, it, expect, beforeEach, vi } from "vitest";
import { AppStorage } from "@/lib/storage";

describe("AppStorage layer", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("saves and retrieves a primitive and object value", () => {
    AppStorage.set("user_theme", "dark");
    expect(AppStorage.get("user_theme", "light")).toBe("dark");

    AppStorage.set("user_profile", { name: "Juan", role: "traveler" });
    expect(AppStorage.get("user_profile", null)).toEqual({ name: "Juan", role: "traveler" });
  });

  it("returns fallback if key does not exist", () => {
    expect(AppStorage.get("non_existent_key", "default_val")).toBe("default_val");
  });

  it("respects TTL and expires stale data", () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);

    AppStorage.set("temp_session", { token: "123" }, { ttlMs: 1000 });
    expect(AppStorage.get("temp_session", null)).toEqual({ token: "123" });

    // Advance time past TTL
    vi.setSystemTime(now + 1500);
    expect(AppStorage.get("temp_session", null)).toBeNull();

    vi.useRealTimers();
  });

  it("supports sessionStorage", () => {
    AppStorage.setSession("tab_state", { step: 2 });
    expect(AppStorage.getSession("tab_state", null)).toEqual({ step: 2 });

    AppStorage.removeSession("tab_state");
    expect(AppStorage.getSession("tab_state", null)).toBeNull();
  });
});
