# Servidor Legacy Prototipo (Express + MySQL) — No Utilizado en Producción

> ⚠️ **Aviso de Obsolescencia y Archivo:**
> Este directorio `server/` contiene el prototipo original de desarrollo basado en Express 4 y MySQL 8.
> **No debe utilizarse en despliegue ni producción.**

### Arquitectura Definitiva del Proyecto
- **Backend Activo y en Producción:** `backend/` (Fastify 5 + PostgreSQL 16 + TypeScript).
- **Esquema de Base de Datos y RLS:** `supabase/` (PostgreSQL con extensiones, Auth y RLS).
- **Frontend:** React 18 + Vite + Tailwind/Shadcn UI en `src/`.

Para más detalles sobre la arquitectura de la API implementada, consultar:
- [`docs/BACKEND_API_IMPLEMENTADO.md`](../docs/BACKEND_API_IMPLEMENTADO.md)
- [`docs/BACKEND_API.md`](../docs/BACKEND_API.md)
- [`backend/README.md`](../backend/README.md)
