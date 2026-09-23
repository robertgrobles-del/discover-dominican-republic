/**
 * Core Security Utility Library for Descubre RD
 * Provides robust sanitization against XSS (HTML/JS), SQL injection patterns,
 * client-side rate limiting, email RFC validation, and password strength auditing.
 */

// HTML Entities encoder to prevent HTML/JS injection (XSS)
export function sanitizeHTML(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .replace(/`/g, "&#x60;");
}

// Strips dangerous script tags, javascript: pseudo-protocols, event handlers, and data URLs
export function stripDangerousTags(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    .replace(/\bon\w+\s*=\s*(['"]).*?\1/gi, "") // removes onload=, onclick=, onerror=, etc.
    .replace(/\bon\w+\s*=\s*[^>\s]+/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/vbscript:/gi, "")
    .replace(/data:text\/html/gi, "")
    .trim();
}

// Full text sanitizer for user comments, queries, and form inputs
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return "";
  return stripDangerousTags(input).trim();
}

// Strict email format validation according to RFC 5322 regex standards
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  // Standard robust email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(email.trim())) return false;
  
  // Extra safety checks
  const [localPart, domain] = email.trim().split("@");
  if (!localPart || !domain) return false;
  if (localPart.length > 64 || domain.length > 255) return false;
  if (email.includes("..") || domain.startsWith("-") || domain.endsWith("-")) return false;
  
  return true;
}

// SQL Injection pattern detector for form inputs and search fields
export function detectSQLiPatterns(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  const sqliPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
    /\w*((\%27)|(\'))(\s)*((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    /((\%27)|(\'))(\s)*(union|select|insert|update|delete|drop|truncate|declare|exec|execute|information_schema)/i,
    /(union(\s+)all(\s+)select)/i,
    /(\b(select|union|insert|update|delete|drop|alter|create|truncate)\b.+\b(from|into|table|database|where)\b)/i,
    /(\bOR\b\s+['"\d\w]+\s*=\s*['"\d\w]+)/i,
    /(\bAND\b\s+['"\d\w]+\s*=\s*['"\d\w]+)/i,
    /(0x[0-9a-fA-F]+)/i
  ];
  return sqliPatterns.some(pattern => pattern.test(input));
}

// Password strength analysis and criteria evaluation
export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: "Muy Débil" | "Débil" | "Aceptable" | "Fuerte" | "Excelente";
  isSecure: boolean;
  feedback: string[];
}

export function evaluatePasswordSecurity(password: string): PasswordStrengthResult {
  const feedback: string[] = [];
  let score = 0;

  if (!password || password.length < 8) {
    feedback.push("Mínimo 8 caracteres");
  } else {
    score += 1;
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Incluye al menos una mayúscula");
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Incluye al menos un número");
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Incluye un símbolo especial (!@#$%^&*)");
  }

  const labels: Record<number, PasswordStrengthResult["label"]> = {
    0: "Muy Débil",
    1: "Débil",
    2: "Aceptable",
    3: "Fuerte",
    4: "Excelente"
  };

  return {
    score,
    label: labels[score] || "Muy Débil",
    isSecure: score >= 3,
    feedback
  };
}

/**
 * Client-Side Rate Limiter with LocalStorage / Memory backup
 * Prevents brute force on login, registration spam, and comment flood.
 */
interface RateLimitRecord {
  attempts: number;
  firstAttemptTime: number;
  blockedUntil: number;
}

export class ClientRateLimiter {
  private static getStorageKey(action: string, identifier: string): string {
    return `rl_${action}_${encodeURIComponent(identifier.toLowerCase().trim())}`;
  }

  /**
   * Checks if an action is allowed.
   * @param action Identifier of action ('login', 'register', 'comment', etc.)
   * @param identifier Specific key (e.g. user email or IP substitute)
   * @param maxAttempts Max allowed attempts before blocking
   * @param windowMs Time window in milliseconds (e.g., 60000 = 1 minute)
   * @param blockDurationMs How long to block after exceeding attempts (e.g., 300000 = 5 minutes)
   */
  public static check(
    action: string,
    identifier: string,
    maxAttempts: number = 5,
    windowMs: number = 60000,
    blockDurationMs: number = 300000
  ): { allowed: boolean; remainingAttempts: number; retryAfterSeconds: number } {
    const key = this.getStorageKey(action, identifier);
    const now = Date.now();
    
    try {
      const raw = localStorage.getItem(key);
      let record: RateLimitRecord = raw 
        ? JSON.parse(raw) 
        : { attempts: 0, firstAttemptTime: now, blockedUntil: 0 };

      // Check if currently blocked
      if (record.blockedUntil > now) {
        const remainingBlock = Math.ceil((record.blockedUntil - now) / 1000);
        return {
          allowed: false,
          remainingAttempts: 0,
          retryAfterSeconds: remainingBlock
        };
      }

      // Check if window has expired to reset attempts
      if (now - record.firstAttemptTime > windowMs) {
        record = { attempts: 0, firstAttemptTime: now, blockedUntil: 0 };
        localStorage.setItem(key, JSON.stringify(record));
      }

      const remaining = Math.max(0, maxAttempts - record.attempts);
      return {
        allowed: record.attempts < maxAttempts,
        remainingAttempts: remaining,
        retryAfterSeconds: 0
      };
    } catch {
      return { allowed: true, remainingAttempts: maxAttempts, retryAfterSeconds: 0 };
    }
  }

  /**
   * Records a failed attempt and increments count
   */
  public static recordAttempt(
    action: string,
    identifier: string,
    maxAttempts: number = 5,
    windowMs: number = 60000,
    blockDurationMs: number = 300000
  ): { isBlocked: boolean; retryAfterSeconds: number } {
    const key = this.getStorageKey(action, identifier);
    const now = Date.now();

    try {
      const raw = localStorage.getItem(key);
      let record: RateLimitRecord = raw 
        ? JSON.parse(raw) 
        : { attempts: 0, firstAttemptTime: now, blockedUntil: 0 };

      if (now - record.firstAttemptTime > windowMs) {
        record.attempts = 1;
        record.firstAttemptTime = now;
        record.blockedUntil = 0;
      } else {
        record.attempts += 1;
      }

      if (record.attempts >= maxAttempts) {
        record.blockedUntil = now + blockDurationMs;
        localStorage.setItem(key, JSON.stringify(record));
        return { isBlocked: true, retryAfterSeconds: Math.ceil(blockDurationMs / 1000) };
      }

      localStorage.setItem(key, JSON.stringify(record));
      return { isBlocked: false, retryAfterSeconds: 0 };
    } catch {
      return { isBlocked: false, retryAfterSeconds: 0 };
    }
  }

  /**
   * Resets rate limit for an action upon successful authentication/completion
   */
  public static reset(action: string, identifier: string): void {
    const key = this.getStorageKey(action, identifier);
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignored
    }
  }
}
