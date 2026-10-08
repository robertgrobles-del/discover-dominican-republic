/**
 * Server-side Request Validation & Sanitization Helpers
 * Descubre RD Backend
 */

export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const rncRegex = /^[0-9]{9}$|^[0-9]{11}$/;
export const ncfRegex = /^[A-Z][0-9]{10}$/;

export function validateRegisterInput(body) {
  const errors = [];
  if (!body.email || typeof body.email !== "string" || !emailRegex.test(body.email.trim())) {
    errors.push("Email inválido o no proporcionado.");
  }
  if (!body.password || typeof body.password !== "string" || body.password.length < 6) {
    errors.push("La contraseña debe tener al menos 6 caracteres.");
  }
  if (body.display_name && (typeof body.display_name !== "string" || body.display_name.trim().length > 100)) {
    errors.push("Nombre de usuario no válido.");
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateLoginInput(body) {
  const errors = [];
  if (!body.email || typeof body.email !== "string" || !emailRegex.test(body.email.trim())) {
    errors.push("Email inválido.");
  }
  if (!body.password || typeof body.password !== "string" || body.password.length === 0) {
    errors.push("Contraseña requerida.");
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateRNC(rnc) {
  if (!rnc || typeof rnc !== "string") return false;
  const clean = rnc.replace(/[-\s]/g, "");
  return rncRegex.test(clean);
}

export function validateNCF(ncf) {
  if (!ncf || typeof ncf !== "string") return false;
  return ncfRegex.test(ncf.trim().toUpperCase());
}

export function sanitizeString(input) {
  if (typeof input !== "string") return "";
  return input.trim().replace(/<[^>]*>?/gm, "");
}
