/**
 * Security Middleware and Rate Limiter for Descubre RD Backend
 */

// ─── Security Headers Middleware ─────────────────────────────────────────────

export function securityHeaders(req, res, next) {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  // Basic XSS Protection for legacy browsers
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Referrer Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Hide server tech details
  res.removeHeader("X-Powered-By");
  next();
}

// ─── In-Memory Rate Limiter ──────────────────────────────────────────────────

/**
 * Creates an in-memory sliding-window rate limiter per IP address.
 * Automatically cleans up expired windows to avoid memory growth.
 */
export function createRateLimiter({
  windowMs = 15 * 60 * 1000, // 15 minutes by default
  max = 100,                 // Max requests per window
  message = "Demasiadas solicitudes desde esta IP, por favor intente más tarde.",
} = {}) {
  const ipStore = new Map();

  // Periodic cleanup every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of ipStore.entries()) {
      if (now > data.resetTime) {
        ipStore.delete(ip);
      }
    }
  }, 5 * 60 * 1000).unref();

  return function rateLimiter(req, res, next) {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown-ip";
    const now = Date.now();

    let record = ipStore.get(ip);
    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      ipStore.set(ip, record);
      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", max - 1);
      return next();
    }

    record.count++;
    const remaining = Math.max(0, max - record.count);
    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      return res.status(429).json({
        error: message,
        retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
      });
    }

    next();
  };
}
