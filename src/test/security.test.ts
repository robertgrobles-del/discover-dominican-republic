import { describe, it, expect, beforeEach } from "vitest";
import { 
  isValidEmail, 
  sanitizeHTML, 
  stripDangerousTags, 
  detectSQLiPatterns, 
  evaluatePasswordSecurity, 
  ClientRateLimiter 
} from "@/lib/security";

describe("Security Utility Suite", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("Email Validation (RFC 5322 & RFC Constraints)", () => {
    it("validates legitimate email addresses", () => {
      expect(isValidEmail("turista@descubrerd.com")).toBe(true);
      expect(isValidEmail("john.doe+viaje@dominicanrepublic.travel")).toBe(true);
      expect(isValidEmail("user_123@sub.domain.gov.do")).toBe(true);
    });

    it("rejects invalid, malformed or dangerous email addresses", () => {
      expect(isValidEmail("")).toBe(false);
      expect(isValidEmail("invalid-email")).toBe(false);
      expect(isValidEmail("@no-local.com")).toBe(false);
      expect(isValidEmail("user@.com")).toBe(false);
      expect(isValidEmail("user..name@domain.com")).toBe(false);
      expect(isValidEmail("user@domain..com")).toBe(false);
      expect(isValidEmail("admin<script>@evil.com")).toBe(false);
    });
  });

  describe("XSS & HTML/JS Sanitization", () => {
    it("encodes HTML entities safely with sanitizeHTML", () => {
      const dirty = '<script>alert("xss")</script>';
      const clean = sanitizeHTML(dirty);
      expect(clean).not.toContain("<script>");
      expect(clean).toContain("&lt;script&gt;");
    });

    it("strips script tags and malicious attributes with stripDangerousTags", () => {
      const malicious = '<p onclick="evil()">Playa Juanillo</p><script>stealCookie()</script>';
      const safe = stripDangerousTags(malicious);
      expect(safe).not.toContain("<script>");
      expect(safe).not.toContain("onclick=");
      expect(safe).toContain("Playa Juanillo");
    });

    it("neutralizes javascript: pseudo-protocols", () => {
      const link = 'javascript:alert(1)';
      expect(stripDangerousTags(link)).not.toContain("javascript:");
    });
  });

  describe("SQL Injection Detection", () => {
    it("detects classic SQL injection payloads", () => {
      expect(detectSQLiPatterns("admin' OR '1'='1")).toBe(true);
      expect(detectSQLiPatterns("1; DROP TABLE users;--")).toBe(true);
      expect(detectSQLiPatterns("' UNION SELECT null, null, username, password FROM profiles--")).toBe(true);
      expect(detectSQLiPatterns("admin'--")).toBe(true);
      expect(detectSQLiPatterns("SELECT * FROM information_schema.tables")).toBe(true);
    });

    it("allows safe and normal search strings", () => {
      expect(detectSQLiPatterns("Playa Bávaro")).toBe(false);
      expect(detectSQLiPatterns("Villas en Punta Cana")).toBe(false);
      expect(detectSQLiPatterns("Hotel Boutique Zona Colonial")).toBe(false);
      expect(detectSQLiPatterns("Restaurante Criollo Santo Domingo")).toBe(false);
    });
  });

  describe("Password Security Evaluator", () => {
    it("rates weak passwords properly", () => {
      const result = evaluatePasswordSecurity("12345");
      expect(result.score).toBeLessThan(2);
      expect(result.isSecure).toBe(false);
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it("rates robust complex passwords with high score", () => {
      const result = evaluatePasswordSecurity("Caribe#2026!PuntaCana");
      expect(result.score).toBeGreaterThanOrEqual(3);
      expect(result.isSecure).toBe(true);
      expect(result.label).toMatch(/Fuerte|Excelente/);
    });
  });

  describe("Client-Side Rate Limiter", () => {
    it("permits actions below threshold", () => {
      const check = ClientRateLimiter.check("login", "user@test.com", 3, 60000, 300000);
      expect(check.allowed).toBe(true);
      expect(check.remainingAttempts).toBe(3);
    });

    it("blocks when max attempts are exceeded", () => {
      const email = "attacker@bot.com";
      ClientRateLimiter.recordAttempt("login", email, 3, 60000, 300000);
      ClientRateLimiter.recordAttempt("login", email, 3, 60000, 300000);
      const third = ClientRateLimiter.recordAttempt("login", email, 3, 60000, 300000);

      expect(third.isBlocked).toBe(true);
      expect(third.retryAfterSeconds).toBeGreaterThan(0);

      const check = ClientRateLimiter.check("login", email, 3, 60000, 300000);
      expect(check.allowed).toBe(false);
      expect(check.retryAfterSeconds).toBeGreaterThan(0);
    });

    it("clears rate limit on reset", () => {
      const email = "user@success.com";
      ClientRateLimiter.recordAttempt("login", email, 3, 60000, 300000);
      ClientRateLimiter.reset("login", email);

      const check = ClientRateLimiter.check("login", email, 3, 60000, 300000);
      expect(check.allowed).toBe(true);
      expect(check.remainingAttempts).toBe(3);
    });
  });
});
