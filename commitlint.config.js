// Fase 10.51 del plan maestro: Conventional Commits obligatorio (feat/fix/docs/refactor/security/chore/...).
// Reglas relajadas en longitud porque el proyecto escribe mensajes descriptivos en español; el prefijo es lo que se exige.
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [2, "always", 120],
    "subject-case": [0], // permite mayúsculas iniciales por nombres propios (NCF, MITUR, S3, etc.)
  },
};
