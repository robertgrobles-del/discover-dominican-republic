import { describe, expect, it } from "vitest";
import { getChatbotConfig } from "@/lib/chatbotConfig";

describe("getChatbotConfig", () => {
  it("lee la clave pública usando el nombre canónico", () => {
    const config = getChatbotConfig({
      VITE_SUPABASE_URL: "https://example.supabase.co",
      VITE_SUPABASE_PUBLISHABLE_KEY: "public-test-key",
    });

    expect(config.publishableKey).toBe("public-test-key");
    expect(config.chatUrl).toBe(
      "https://example.supabase.co/functions/v1/chat-turistico",
    );
  });

  it("no acepta nombres alternativos o antiguos de clave", () => {
    const config = getChatbotConfig({
      VITE_SUPABASE_URL: "https://example.supabase.co",
      VITE_SUPABASE_ANON_KEY: "legacy-test-key",
    } as Parameters<typeof getChatbotConfig>[0]);

    expect(config.publishableKey).toBeUndefined();
  });
});
