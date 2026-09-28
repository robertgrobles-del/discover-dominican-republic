# AGENTS.md

Instrucciones para asistentes de IA (Cursor, Codex, Copilot, Claude, Gemini, Lovable y otros) y para las personas que trabajan en este repositorio.

---

## 1. Lee primero

| Documento | Para qué |
|---|---|
| [`PRD.md`](PRD.md) | Qué se construye, para quién, requisitos y prioridades |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Cómo se conectan frontend, backend, base de datos y servicios |
| [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) | Colores, tipografía, espaciado, componentes y patrones |
| [`docs/contexto/`](docs/contexto/README.md) | Negocio, cliente, oferta, voz, marca, contenido, glosario, métricas, estado del producto y decisiones |

**Según la tarea:**

| Si vas a… | Lee además |
|---|---|
| Escribir cualquier texto visible | `docs/contexto/voz.md`, `docs/contexto/glosario.md` |
| Tocar planes, precios, checkout o beneficios | `docs/contexto/oferta.md`, `docs/contexto/decisiones.md` |
| Crear o cambiar componentes o estilos | `DESIGN_SYSTEM.md` |
| Crear o editar fichas y guías | `docs/contexto/contenido.md` |
| Construir paneles, analítica o informes | `docs/contexto/metricas.md` |
| Empezar en cualquier módulo | `docs/contexto/producto.md` (estado real) |
| Tocar backend, base de datos o seguridad | `ARCHITECTURE.md`, `docs/BACKEND_API.md`, `docs/BACKEND_SEGURIDAD.md` |

---

## 2. Estado actual (léelo antes de construir)

- Rama de trabajo: **`dev`**. No se trabaja directo en `main`.
- **El frontend usa datos simulados** (`src/integrations/supabase/client.ts` + `mockDb.json`): cualquier login entra, todo usuario es admin y nada persiste. No construyas funciones que dependan de que eso sea real.
- **La API de `backend/` está probada pero no conectada.** Si una función ya existe en la API, conéctala en lugar de reimplementarla en el frontend.
- **`dev` no tiene 17 commits de `main`** (seguridad de julio, pruebas RLS). No fusiones `dev` sobre `main` sin traer antes `main`.
- Bloqueantes vigentes en `docs/contexto/producto.md`.

---

## 3. Reglas que no se negocian

**Producto y textos**
- La marca se llama **Descubre República Dominicana** en todo texto público (no "DescubreRD").
- Empresas: trato de **usted**, y el negocio es el protagonista ("su hotel"). Viajeros: trato de **tú**.
- No publiques promesas de la lista "No prometer todavía" de `oferta.md` (sello MITUR, NCF, soporte 24/7, "líder", "millones de viajeros").
- No inventes cifras, reseñas, testimonios, logos de aliados ni negocios "verificados". Cada dato lleva fuente y fecha.
- **Ningún formulario puede decir "enviado" si no guarda ni envía nada.** Nada de `setTimeout` para simular envíos.
- Moneda siempre explícita: RD$ o US$.

**Seguridad**
- Nunca pidas el número de tarjeta en un campo propio: los pagos van por la pasarela (Stripe Elements).
- El precio, el estado "pagado", los roles, las monedas y los premios **se deciden en el servidor**, nunca en el navegador.
- Ningún secreto en variables `VITE_` ni en el código del frontend.
- Toda entrada se valida en el servidor (Zod), aunque ya se valide en el formulario.
- No cambies políticas RLS ni migraciones ya aplicadas; crea una migración nueva.
- En Supabase, ninguna política de escritura puede ser `USING (true)`.

**Diseño**
- Usa tokens (`bg-primary`, `text-muted-foreground`), nunca colores escritos a mano.
- Reutiliza los componentes de `src/components/ui/` antes de crear uno nuevo.
- Todo cambio visual se prueba en móvil (375 px) y en los temas oscuro y claro.
- Contraste AA, foco visible y `aria-label` en botones de solo icono.

---

## 4. Cómo trabajar

1. **Entiende la tarea** y revisa en `producto.md` el estado del módulo.
2. **Haz cambios pequeños y enfocados.** Un objetivo por commit o pull request.
3. **No borres ni reescribas** funciones o páginas que no son parte de la tarea.
4. **Actualiza la documentación en el mismo commit** si cambias algo que describe (`producto.md`, `oferta.md`, `ARCHITECTURE.md`, `DESIGN_SYSTEM.md`, `decisiones.md`).
5. **Verifica antes de terminar** (§5). Si algo falla, arréglalo o explica claramente qué quedó pendiente.
6. **No marques como hecho** en ningún plan algo que no funciona de punta a punta.

---

## 5. Verificación obligatoria

**Frontend** (raíz del proyecto):
```bash
npx tsc -p tsconfig.app.json --noEmit   # sin errores de tipos
npm run lint                            # sin errores nuevos
npm run test                            # pruebas en verde
npm run build                           # el build termina
```

**Backend** (`backend/`):
```bash
npm run typecheck
npm test            # requiere PostgreSQL (ver backend/README.md)
```

**Traducciones:** ninguna clave duplicada ni faltante en `src/i18n/translations/*.ts`.

---

## 6. Convenciones de código

**General**
- TypeScript estricto; evita `any`. Si es inevitable, explica por qué en un comentario.
- Nombres de archivos de componentes en PascalCase (`BeachCard.tsx`); hooks con `use` (`usePassport.ts`).
- Imports con el alias `@/`.
- Comentarios en español, breves, explicando el porqué.

**Frontend**
- Datos remotos con TanStack Query; no guardes datos del servidor en contextos globales.
- Formularios con react-hook-form + Zod.
- Páginas cargadas de forma diferida en `App.tsx`.
- Textos visibles siempre por `useI18n`, nunca escritos directamente en el JSX.
- Una carpeta por dominio en `src/components/`; no crees otra carpeta para un dominio que ya existe con otro nombre.

**Backend**
- Un módulo por dominio en `backend/src/modules/`, con rutas, servicio y pruebas.
- Respuesta `{ data, meta?, links? }` y error `{ error: { code, message, details?, request_id } }`.
- SQL siempre parametrizado; columnas de orden y filtro desde listas blancas.
- Migraciones nuevas numeradas (`000N_descripcion.sql`); nunca edites una aplicada.
- Cada endpoint nuevo lleva prueba de integración.

---

## 7. Git

- Trabajo en `dev` o en ramas que salen de `dev` (`feat/…`, `fix/…`, `docs/…`).
- Mensajes de commit en español, con prefijo: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `security:`.
- Antes de hacer push, la verificación del §5 debe pasar.
- No hagas push de `.env` con secretos, carpetas `dist/`, `node_modules/` ni volcados de base de datos.

---

## 8. Cuando no estés seguro

- Si la tarea contradice un documento de contexto, **detente y pregunta**, o sigue el documento y explica la diferencia.
- Si falta un dato (precio, texto legal, cifra), deja un marcador claro (`[POR CONFIRMAR: …]`) en lugar de inventarlo.
- Si una decisión no está en `decisiones.md`, proponla ahí como pendiente.
