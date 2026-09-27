# decisiones.md — Registro de decisiones

> Una fila por decisión. Nunca se borra una decisión: si cambia, se agrega una nueva que la reemplaza y se marca la anterior como "Reemplazada".
> Estados: **Vigente** · **Pendiente** · **Reemplazada**.

---

## Pendientes (hay que decidir)

| # | Tema | Opciones | Recomendación | Responsable |
|---|---|---|---|---|
| P1 | **Backend definitivo** | API Fastify (`backend/`) · Supabase · Express/MySQL | API Fastify: está probada (480 pruebas) y cubre casi todo. Retirar Express, MySQL y Strapi. | Robert |
| P2 | **Colores oficiales** | `#CE1126` / `#002D62` · `#C91E2D` / `#122656` | `#CE1126` / `#002D62` (códigos exactos alineados con la bandera) | Robert |
| P3 | **Dos escalas de precios** | Planes del portal ($0 / $49 / $189) · Paquetes del pitch ($149–$2,500+) | Planes del portal como entrada autoservicio; paquetes como venta consultiva con campañas. Ajustar el Destacado frente al Esencial. | Robert |
| P4 | **Nombre del programa de aliados en Instagram** | Aliados de Descubre RD · Descubre RD Recomienda · Red de Aliados | — | Robert |
| P5 | **Fuente de cuerpo única** | Poppins · Montserrat · Inter | Una sola, en el portal y en redes | Diseño |
| P6 | **Qué hacer con `PLAN_MAESTRO_MEJORAS.md`** | Corregir · Reemplazar por `producto.md` + catálogo de mejoras | Reemplazar: hoy marca como hechas cosas que no funcionan | Robert |
| P7 | **Establecimientos del registro MITUR** | Públicos (sin cédula) · Solo con sesión · Solo admin | Públicos sin cédula, si son datos públicos del MITUR | Robert |
| P8 | **Modelo de la tienda** | Tienda propia · Marketplace · Vitrina con pedido por WhatsApp | La API ya implementa marketplace; lanzar primero con pocos vendedores | Robert |
| P9 | **Paleta y fuentes del portal frente a la marca** | A: portal con rojo y azul marino de la marca · B: mantener el cian del portal | A, con el cian como acento "Caribe" (ver `DESIGN_SYSTEM.md` §0 y §2.3). Corregir ya el contraste del modo claro | Robert |

---

## Vigentes

| Fecha | Decisión | Motivo | Estado |
|---|---|---|---|
| ago-2026 | **Piloto gratuito de 90 días** con restaurantes orientados al turista, con todos los beneficios a cambio de transparencia de datos | Tener casos reales antes de vender publicidad | Vigente |
| ago-2026 | **Exclusividad en restaurantes:** máximo 12 por destino, uno por categoría y zona | Valor de la exclusividad y calidad del directorio | Vigente |
| ago-2026 | **Paquetes para hoteles:** Esencial $199 · Crecimiento $449 · Impulso $849 · Premium $1,499 · Partner Exclusivo desde $2,500 al mes | Pitch de hoteles v15 | Vigente (ver P3) |
| ago-2026 | **Paquetes para restaurantes:** Esencial $149 · Crecimiento $349 · Impulso $649 · Premium $1,199 · Partner $2,000+ al mes | Pitch de restaurantes | Vigente (ver P3) |
| ago-2026 | **Narrativa comercial:** el hotel o restaurante es el protagonista; el retorno se explica antes del precio | Pitch en 8 actos | Vigente |
| ago-2026 | **Programa de aliados en Instagram** sin costo: una publicación por semana de una agencia o establecimiento como colaborador | Crecer la red y la comunidad | Vigente |
| ago-2026 | Decir **"alianza"**, no "colaboración"; beneficio antes que número de seguidores | Mejor recepción del mensaje | Vigente |
| jul-2026 | Nombre público: **Descubre República Dominicana** (no "DescubreRD") | Claridad de marca | Vigente |
| 18-sep-2026 | **Frontend sobre datos simulados** (`mockDb.json`) | El stack Docker, MySQL y Express fallaba y bloqueaba el portal | Vigente, temporal (ver P1) |
| 18-sep-2026 | **Se eliminó la PWA** (vite-plugin-pwa) | El service worker servía versiones viejas en caché | Vigente |
| 25-sep-2026 | **Se revirtió la sincronización con Strapi** | — | Vigente |
| 25-sep-2026 | **Nueva API en Fastify + PostgreSQL** (`backend/`) | Backend propio con seguridad, pagos y reglas en el servidor | Vigente (ver P1) |
| 26-sep-2026 | **Endurecimiento de Edge Functions:** `import-establecimientos` solo para admin; chat y recomendaciones con validación de entrada | Auditoría de seguridad | Vigente |
| 26-sep-2026 | **Documentos de contexto** en `docs/contexto/` y `PRD.md`, `ARCHITECTURE.md`, `DESIGN_SYSTEM.md` y `AGENTS.md` en la raíz como fuente de verdad | Coherencia entre código, textos y oferta | Vigente |
| 26-sep-2026 | **No prometer** sello MITUR, NCF, soporte 24/7, "líder" ni "millones de viajeros" hasta que existan | Evitar promesas falsas | Vigente |

---

## Plantilla

```
| AAAA-MM-DD | Decisión en una frase | Por qué | Vigente |
```
