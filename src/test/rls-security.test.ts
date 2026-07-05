import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";

/**
 * RLS regression tests.
 *
 * These run against the live Supabase project using the anon key ONLY.
 * They validate the hardening applied for the security findings on:
 *   - contest_registrations
 *   - vacation_registrations
 *   - survey_responses
 *   - establecimientos
 *   - notifications
 *
 * If any of these expectations flip (e.g. a future migration relaxes a
 * policy), CI must fail so regressions are caught immediately.
 */

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://jhwfhhajvmcdmtwslgbb.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const skipIfNoKey = SUPABASE_ANON_KEY ? describe : describe.skip;

skipIfNoKey("RLS regression: sensitive INSERT validation", () => {
  it("contest_registrations rejects rows with invalid email", async () => {
    const { error } = await anon.from("contest_registrations").insert({
      nombre: "Test User",
      email: "not-an-email",
    });
    expect(error).not.toBeNull();
  });

  it("contest_registrations rejects rows with too-short name", async () => {
    const { error } = await anon.from("contest_registrations").insert({
      nombre: "A",
      email: "valid@example.com",
    });
    expect(error).not.toBeNull();
  });

  it("vacation_registrations rejects rows with invalid email", async () => {
    const { error } = await anon.from("vacation_registrations").insert({
      nombre: "Traveler Test",
      email: "invalid",
    });
    expect(error).not.toBeNull();
  });

  it("vacation_registrations rejects rows with too-short name", async () => {
    const { error } = await anon.from("vacation_registrations").insert({
      nombre: "X",
      email: "valid@example.com",
    });
    expect(error).not.toBeNull();
  });

  it("survey_responses rejects rows with invalid email format", async () => {
    // Pick any survey_id (nullable). Use a random uuid.
    const { error } = await anon.from("survey_responses").insert({
      email: "not-an-email",
      respuestas: { q1: "a" },
    });
    expect(error).not.toBeNull();
  });

  it("survey_responses rejects INSERT with a user_id != auth.uid() (anon has no uid)", async () => {
    const { error } = await anon.from("survey_responses").insert({
      user_id: "00000000-0000-0000-0000-000000000001",
      email: "valid@example.com",
      respuestas: { q1: "a" },
    });
    expect(error).not.toBeNull();
  });
});

skipIfNoKey("RLS regression: SELECT scoping", () => {
  it("establecimientos is NOT readable by anonymous users", async () => {
    const { data, error } = await anon
      .from("establecimientos")
      .select("id")
      .limit(1);
    // Either an error, or an empty result set — never rows.
    expect(error !== null || (Array.isArray(data) && data.length === 0)).toBe(
      true,
    );
  });

  it("notifications is NOT readable by anonymous users", async () => {
    const { data, error } = await anon
      .from("notifications")
      .select("id")
      .limit(1);
    expect(error !== null || (Array.isArray(data) && data.length === 0)).toBe(
      true,
    );
  });

  it("contest_registrations is NOT readable by anonymous users", async () => {
    const { data, error } = await anon
      .from("contest_registrations")
      .select("id")
      .limit(1);
    expect(error !== null || (Array.isArray(data) && data.length === 0)).toBe(
      true,
    );
  });

  it("vacation_registrations is NOT readable by anonymous users", async () => {
    const { data, error } = await anon
      .from("vacation_registrations")
      .select("id")
      .limit(1);
    expect(error !== null || (Array.isArray(data) && data.length === 0)).toBe(
      true,
    );
  });

  it("survey_responses is NOT readable by anonymous users", async () => {
    const { data, error } = await anon
      .from("survey_responses")
      .select("id")
      .limit(1);
    expect(error !== null || (Array.isArray(data) && data.length === 0)).toBe(
      true,
    );
  });
});

skipIfNoKey("RLS regression: notifications INSERT is closed", () => {
  it("anonymous users cannot insert notifications", async () => {
    const { error } = await anon.from("notifications").insert({
      user_id: "00000000-0000-0000-0000-000000000001",
      title: "spoofed",
      message: "should be rejected",
    });
    expect(error).not.toBeNull();
  });
});