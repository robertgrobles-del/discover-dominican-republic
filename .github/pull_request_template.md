<!-- Fase 10.53 del plan maestro: checklist obligatorio de revisión. Borra las secciones que no apliquen. -->

## Qué cambia y por qué



## Checklist

- [ ] `npm run typecheck` pasa sin errores (frontend y/o `backend/`, según lo que toques).
- [ ] `npm test` pasa en verde en `backend/` si tocaste algo ahí (suite completa, no un subconjunto).
- [ ] Si agregaste o cambiaste una ruta del backend: `npm run docs:api` corrido y el diff de `docs/BACKEND_API_IMPLEMENTADO.md` incluido.
- [ ] Si agregaste una migración: probada contra una base vacía (`npm run db:migrate` desde cero), no sólo contra tu base de desarrollo ya migrada.
- [ ] Si el cambio toca autenticación/autorización: la ruta nueva exige sesión/rol salvo que haya una razón explícita documentada aquí para que sea pública.
- [ ] No hay secretos, tokens ni credenciales en el diff.
- [ ] Se actualizó `README.md`/`PLAN_MAESTRO_MEJORAS.md` si el cambio cierra o modifica un ítem del plan.

## Cómo se probó

<!-- Pasos manuales o comando exacto usado para verificar el cambio, si aplica más allá del checklist de arriba. -->

## Riesgo y rollback

<!-- Qué tan reversible es esto (¿migración destructiva? ¿flag de feature?) y cómo se revierte si algo sale mal en producción. -->
