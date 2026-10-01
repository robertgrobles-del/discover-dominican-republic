# Adopción por perfil (sin PII)

Instrumentación del punto 67 del plan de accesos y paneles por perfil: saber si la gente **completa el
onboarding, empieza y termina tareas, abandona o se topa con errores**, separado por tipo de panel, sin
registrar datos personales innecesarios.

## Qué se mide

| Métrica | Pregunta que responde |
|---|---|
| `panel_open` | ¿La persona llegó a su panel? |
| `onboarding_started` / `onboarding_completed` (`onboarding_rate`) | ¿El alta del perfil se termina o se abandona a medias? |
| `task_started` / `task_completed` / `task_abandoned` (`completion_rate`) | ¿Las tareas reales (invitar al equipo, atender una reserva, publicar una pieza, resolver una moderación) se cierran? |
| `task_error` | ¿Dónde se rompe el flujo? |
| `avg_duration_ms` | ¿Cuánto tarda una tarea cuando se declara la duración? |
| Desglose por `task` | ¿Qué tarea concreta es la que se cae? |

Paneles medidos: `viajero`, `empresa`, `creador`, `embajador`, `editorial`, `moderacion`, `admin`.

## Reglas que no se negocian

1. **Sin PII.** La lista blanca de propiedades es `panel`, `step`, `task`, `role`, `space`, `result`,
   `duration_ms`, `seats`, `count`. Cualquier otra clave se descarta antes de enviarse
   (`sanitizeAdoptionProps`), y el saneador general de analítica (`cleanAnalyticsMetadata`) elimina además
   todo lo que parezca correo, teléfono, token, identificador o nombre. Nunca se envía texto libre.
2. **Con consentimiento.** Se usa el mismo canal que el resto de la analítica: si la persona no aceptó
   analítica o el navegador envía Do Not Track / Global Privacy Control, no se envía nada.
3. **Sin bloquear el producto.** El envío es «dispara y olvida»: un fallo de medición no puede romper la
   tarea de nadie (`trackPanelAdoption` nunca lanza).
4. **Agregado, no individual.** El endpoint devuelve conteos y tasas por panel y tarea. No expone el JSON
   de propiedades ni permite reconstruir la actividad de una persona.

## Cómo se envía

```ts
import { trackPanelAdoption, usePanelAdoption, type PanelKey, type AdoptionStep } from "@/lib/adoption";

// Apertura del panel, una sola vez por montaje:
usePanelAdoption("empresa");

// Pasos concretos de una tarea:
trackPanelAdoption("empresa", "task_started", { task: "invitar_equipo" });
trackPanelAdoption("empresa", "task_completed", { task: "invitar_equipo", seats: 2, duration_ms: 84_000 });
trackPanelAdoption("empresa", "task_error", { task: "invitar_equipo", result: "email_invalido" });
```

Por debajo, `sendAnalyticsEvent(..., { internalPanel })` envía el evento a `POST /api/v1/analytics/events`
con la página sintética `panel/<tipo>`. Esa marca es necesaria porque las rutas privadas (`/admin`,
`/perfil`, `/panel`…) están excluidas de la analítica de navegación pública: la adopción de paneles se mide
como una serie propia, no como un `page_view` más.

## Cómo se consulta

`GET /api/v1/admin/analytics/panel-adoption` (rol `admin`, segundo factor obligatorio):

- `days` (1-365, por defecto 30) y `panel` (opcional) como filtros.
- Devuelve `range` (ventana usada), `totals` y `panels[]` ordenados por volumen; cada panel incluye sus
  tasas, su media de duración y el desglose por `tasks[]`.

Ejemplo:

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/admin/analytics/panel-adoption?days=30&panel=empresa" | jq .data.totals
```

## Qué decisiones permite tomar

- Si `onboarding_rate` es bajo en `creador`, el problema está en el alta (fricción, requisitos confusos),
  no en el uso.
- Si `completion_rate` cae solo en una tarea concreta de un panel, ahí está el arreglo de producto.
- Si `task_error` se concentra en un panel, se prioriza su estabilidad antes de añadir funciones.
- Comparar `empresa` con `creador` dice si el esfuerzo de desarrollo está rindiendo donde se espera.

## Pruebas

`backend/test/analytics.test.ts` (`describe("adopción por perfil")`) siembra eventos de adopción y comprueba
el agregado, las tasas, los filtros, que un usuario corriente recibe 403 y que la respuesta no contiene
ninguna clave potencialmente personal.
