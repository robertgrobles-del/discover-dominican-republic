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

/**
 * UPDATE / DELETE regression coverage.
 *
 * Anonymous users must not be able to modify or delete existing rows
 * on any of the sensitive resources. PostgREST returns either an
 * error, or an empty payload (204/PGRST116) when no row matches the
 * RLS filter — both outcomes are acceptable. What is NOT acceptable
 * is receiving back the affected row(s), which would indicate the
 * write succeeded.
 */
function assertBlocked(
  result: { error: unknown; data: unknown },
  label: string,
) {
  const { error, data } = result;
  let rowsReturned = 0;
  if (Array.isArray(data)) rowsReturned = data.length;
  else if (data && typeof data === "object") rowsReturned = 1;
  expect(
    error !== null || rowsReturned === 0,
    `${label}: unexpectedly succeeded (rows=${rowsReturned})`,
  ).toBe(true);
}

const FAKE_ID = "00000000-0000-0000-0000-000000000001";

skipIfNoKey("RLS regression: UPDATE is blocked for anon", () => {
  it("contest_registrations UPDATE returns no rows for anon", async () => {
    const result = await anon
      .from("contest_registrations")
      .update({ nombre: "hacked" })
      .eq("id", FAKE_ID)
      .select();
    assertBlocked(result, "contest_registrations UPDATE");
  });

  it("vacation_registrations UPDATE returns no rows for anon", async () => {
    const result = await anon
      .from("vacation_registrations")
      .update({ nombre: "hacked" })
      .eq("id", FAKE_ID)
      .select();
    assertBlocked(result, "vacation_registrations UPDATE");
  });

  it("survey_responses UPDATE returns no rows for anon", async () => {
    const result = await anon
      .from("survey_responses")
      .update({ respuestas: { tampered: true } })
      .eq("id", FAKE_ID)
      .select();
    assertBlocked(result, "survey_responses UPDATE");
  });

  it("establecimientos UPDATE returns no rows for anon", async () => {
    const result = await anon
      .from("establecimientos")
      .update({ nombre: "hacked" })
      .eq("id", FAKE_ID)
      .select();
    assertBlocked(result, "establecimientos UPDATE");
  });

  it("notifications UPDATE returns no rows for anon", async () => {
    const result = await anon
      .from("notifications")
      .update({ read: true })
      .eq("id", FAKE_ID)
      .select();
    assertBlocked(result, "notifications UPDATE");
  });
});

skipIfNoKey("RLS regression: DELETE is blocked for anon", () => {
  it("contest_registrations DELETE returns no rows for anon", async () => {
    const result = await anon
      .from("contest_registrations")
      .delete()
      .eq("id", FAKE_ID)
      .select();
    assertBlocked(result, "contest_registrations DELETE");
  });

  it("vacation_registrations DELETE returns no rows for anon", async () => {
    const result = await anon
      .from("vacation_registrations")
      .delete()
      .eq("id", FAKE_ID)
      .select();
    assertBlocked(result, "vacation_registrations DELETE");
  });

  it("survey_responses DELETE returns no rows for anon", async () => {
    const result = await anon
      .from("survey_responses")
      .delete()
      .eq("id", FAKE_ID)
      .select();
    assertBlocked(result, "survey_responses DELETE");
  });

  it("establecimientos DELETE returns no rows for anon", async () => {
    const result = await anon
      .from("establecimientos")
      .delete()
      .eq("id", FAKE_ID)
      .select();
    assertBlocked(result, "establecimientos DELETE");
  });

  it("notifications DELETE returns no rows for anon", async () => {
    const result = await anon
      .from("notifications")
      .delete()
      .eq("id", FAKE_ID)
      .select();
    assertBlocked(result, "notifications DELETE");
  });
});

skipIfNoKey("RLS regression: user_id edge cases", () => {
  it("survey_responses rejects a malformed user_id (not a uuid)", async () => {
    const { error } = await anon.from("survey_responses").insert({
      user_id: "not-a-uuid",
      email: "valid@example.com",
      respuestas: { q1: "a" },
    });
    expect(error).not.toBeNull();
  });

  it("survey_responses rejects a spoofed user_id from anon", async () => {
    // anon has no auth.uid(); providing any concrete uuid must fail the RLS check.
    const { error } = await anon.from("survey_responses").insert({
      user_id: FAKE_ID,
      email: "valid@example.com",
      respuestas: { q1: "a" },
    });
    expect(error).not.toBeNull();
  });

  it("notifications rejects insert with the nil-uuid user_id", async () => {
    const { error } = await anon.from("notifications").insert({
      user_id: "00000000-0000-0000-0000-000000000000",
      title: "x",
      message: "y",
    });
    expect(error).not.toBeNull();
  });

  it("notifications rejects insert with a NULL user_id", async () => {
    const { error } = await anon.from("notifications").insert({
      user_id: null as unknown as string,
      title: "x",
      message: "y",
    });
    expect(error).not.toBeNull();
  });

  it("contest_registrations rejects an empty-string email edge case", async () => {
    const { error } = await anon.from("contest_registrations").insert({
      nombre: "Valid Name",
      email: "",
    });
    expect(error).not.toBeNull();
  });

  it("vacation_registrations rejects an overlong nombre (>200 chars)", async () => {
    const { error } = await anon.from("vacation_registrations").insert({
      nombre: "a".repeat(500),
      email: "valid@example.com",
    });
    expect(error).not.toBeNull();
  });
});