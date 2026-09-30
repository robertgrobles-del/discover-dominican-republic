# Plan de mejoras: contenido, gamificación, creadores, afiliados y monetización

**Proyecto:** Descubre RD · **Fecha:** 2026-09-30 · **Estado:** propuesta para priorizar

Este documento reúne las mejoras propuestas para dos frentes que se refuerzan entre sí:

1. **Contenido e información** de las páginas del portal (qué falta, qué está desactualizado, qué no se conecta).
2. **Los sistemas de participación y sus ingresos**: gamificación, viajeros, embajadores/afiliados, creadores de contenido e influencers, patrocinio y membresía.

Está pensado para que cualquier persona del equipo (producto, diseño, contenido, desarrollo) o un agente de IA pueda leerlo sin contexto previo y tomar un ítem para trabajar.

---

## Índice

1. [Punto de partida: qué existe hoy](#1-punto-de-partida-qué-existe-hoy)
2. [Principios que guían el plan](#2-principios-que-guían-el-plan)
3. [Contenido e información por sección](#3-contenido-e-información-por-sección)
4. [Gamificación](#4-gamificación)
5. [Viajeros y comunidad](#5-viajeros-y-comunidad)
6. [Embajadores y afiliados](#6-embajadores-y-afiliados)
7. [Creadores de contenido e influencers](#7-creadores-de-contenido-e-influencers)
8. [Negocios, patrocinio y membresía](#8-negocios-patrocinio-y-membresía)
9. [Monetización integrada: la historia de ingresos](#9-monetización-integrada-la-historia-de-ingresos)
10. [Confianza, reglas y antifraude](#10-confianza-reglas-y-antifraude)
11. [Métricas de éxito](#11-métricas-de-éxito)
12. [Hoja de ruta por fases](#12-hoja-de-ruta-por-fases)
13. [Dependencias y decisiones pendientes](#13-dependencias-y-decisiones-pendientes)
14. [Matriz de priorización](#14-matriz-de-priorización)

---

## 1. Punto de partida: qué existe hoy

### Backend (`backend/`, Fastify + PostgreSQL) — ya implementado

| Módulo | Qué resuelve | Endpoints principales |
|---|---|---|
| `game` | XP, monedas, niveles, misiones, logros, ligas, temporadas, rachas, trivia, canje de premios, envíos, referidos | `/gamification/*`, `/trivia/*`, `/referrals/*` |
| `ambassadors` | Programa de afiliados: postulación, referidos, comisiones sobre pedidos cobrados, solicitudes de pago | `/ambassadors/*`, `/admin/ambassadors/*` |
| `creators` | Perfiles de creador, onboarding, videos, feed público, eventos de video, payouts | `/creators/*`, `/admin/creators/*` |
| `sponsorship` | Campañas, creatividades, espacios publicitarios, telemetría de impresiones/clics con presupuesto CPC/CPM | `/sponsorship/*` |
| `memberships` | Pasaporte RD VIP (planes, suscripción, puntos), tickets de eventos con QR | `/memberships/*`, `/events/*` |
| `marketplace` / `store` | Ventas con comisión, tienda oficial | `/marketplace/*`, `/store/*` |

La comisión de embajadores se calcula **en el servidor** sobre pedidos ya cobrados; el cliente nunca informa cifras. Esto es una base sana para todo lo que sigue.

### Frontend (`src/`, React) — páginas existentes

| Página | Tamaño aprox. | Observación |
|---|---|---|
| `GamificacionHub.tsx` | 313 líneas | Punto de entrada general |
| `GamificacionTuristica.tsx` | 560 líneas | Contenido extenso |
| `ReglasGamificacion.tsx` | 560 líneas | Puede estar desactualizada frente al backend |
| `ClubRecompensas.tsx` | 422 líneas | Premios y canje |
| `PasaporteDigital.tsx` | 153 líneas | Contenedor delgado; delega en 7 subcomponentes |
| `ProgramaCreadores.tsx` | 263 líneas | Lado del creador |
| `ContratarInfluencers.tsx` | 389 líneas | Lado de la empresa |
| `SistemaAfiliados.tsx` | 486 líneas | Afiliados |
| `RutasEmbajadores.tsx`, `RequisitosEmbajadores.tsx` | — | Mismo programa repartido en varias páginas |

**Estado de integración:** ninguna de estas páginas consume todavía la API del backend; funcionan con datos locales o de ejemplo. Conectarlas es una decisión aparte (ver [sección 13](#13-dependencias-y-decisiones-pendientes)). Casi todo este plan puede avanzar en contenido y diseño sin esperar esa conexión.

### El hueco principal

El backend ya soporta un ecosistema completo de participación e ingresos. El frontend lo presenta **en piezas sueltas**: cada programa vende su propio valor por separado, los ciclos (acción → recompensa → canje) no se ven como un recorrido, y las páginas de contenido (destinos, hoteles, playas) no invitan a participar en ninguno de ellos.

---

## 2. Principios que guían el plan

1. **Un solo recorrido, varias puertas.** Un visitante debe poder pasar de "estoy mirando una playa" a "gano puntos", "comparto y gano comisión" o "creo contenido y cobro" sin buscar la página correcta.
2. **Cifras reales, no promesas.** Todo lo que diga cuánto se gana debe salir de reglas reales (tasas de comisión, XP por acción) y mostrarse con ejemplos, no con frases vagas.
3. **El servidor decide el dinero.** Ningún cálculo de comisión, XP o premio se hace en el navegador. Esto ya es así en el backend y se mantiene.
4. **Transparencia sobre lo pagado.** Todo contenido patrocinado, afiliado o de creador pagado se marca como tal, visible, sin ambigüedad.
5. **Primero lo que ya existe.** Antes de construir módulos nuevos, se aprovecha lo que el backend ya soporta y el frontend todavía no muestra.
6. **Reversible y medible.** Cada cambio lleva una métrica asociada y se puede retirar si no funciona.

---

## 3. Contenido e información por sección

### 3.1 Pasaporte Digital
- **Problema:** el contenedor no explica el valor antes de mostrar las pestañas (sellos, rutas, coleccionables, temporadas).
- **Mejoras:**
  - Sección "Cómo funciona" arriba: qué es un sello, cómo se consigue (visita con QR, check-in), qué desbloquea.
  - Barra de progreso hacia el siguiente nivel con el beneficio concreto que trae.
  - Estado vacío útil para quien no tiene sellos: tres lugares cercanos o populares para empezar.
  - Vista pública compartible del pasaporte (logros, no datos personales) para difusión orgánica.

### 3.2 Fichas de destino, hotel, restaurante, playa, atracción
- **Problema:** no enlazan con ninguno de los programas de participación.
- **Mejoras:**
  - Bloque "Gana con esta visita": XP por check-in, por reseña con foto, por completar la ruta de la zona.
  - Bloque "¿Creas contenido?": invitación a subir video del lugar al programa de creadores.
  - Botón "Compartir y ganar" para embajadores con sesión (enlace con su código).
  - Misiones activas que incluyen este lugar ("Ruta del Cacao: 2 de 5").
  - Mejores reseñas y videos de creadores del lugar, con autoría visible.

### 3.3 Reglas de gamificación
- **Problema:** probable desfase con lo que el backend ya soporta (ligas, temporadas, bono de racha, madrugador, hitos, topes diarios, enfriamientos).
- **Mejoras:**
  - Auditoría página contra `/gamification/rules`, `/levels`, `/leagues`, `/seasons/current`.
  - Tabla de acciones con XP, tope diario y enfriamiento de cada una.
  - Explicación de temporadas: cuándo empiezan, qué se reinicia, qué se conserva.
  - Sección de preguntas frecuentes sobre penalizaciones y antifraude.

### 3.4 Club de Recompensas
- **Mejoras:**
  - Filtros por tipo de premio (digital, físico, experiencia, descuento) y por costo.
  - "Te faltan X monedas" en cada premio, según el saldo del usuario.
  - Estado del envío de premios físicos visible (el backend ya tiene `/gamification/shipments/me`).
  - Premios patrocinados por negocios, marcados, con enlace a la ficha del negocio.

### 3.5 Programa de Creadores e Influencers
- **Problema:** `ContratarInfluencers` (lado empresa) y `ProgramaCreadores` (lado creador) no se enlazan entre sí.
- **Mejoras:** ver [sección 7](#7-creadores-de-contenido-e-influencers).

### 3.6 Afiliados y embajadores
- **Problema:** un mismo programa repartido en `SistemaAfiliados`, `RutasEmbajadores` y `RequisitosEmbajadores`.
- **Mejoras:** ver [sección 6](#6-embajadores-y-afiliados).

### 3.7 Portada y navegación
- **Mejoras:**
  - Módulo "Participa" en la portada con las cuatro puertas: jugar, compartir, crear, anunciar.
  - Acceso persistente al saldo de XP/monedas en la cabecera para usuarios con sesión.
  - Entrada "Gana con Descubre RD" en el menú, que lleva a la página unificada de la [sección 9](#9-monetización-integrada-la-historia-de-ingresos).

### 3.8 Páginas institucionales y de ayuda
- **Mejoras:**
  - Centro de ayuda con una sección por programa (gamificación, embajadores, creadores, VIP).
  - Términos específicos: cesión de derechos de video, política de comisiones, política de premios.
  - Página de transparencia: cómo se seleccionan patrocinados, cómo se calculan comisiones, cómo se modera.

---

## 4. Gamificación

### 4.1 Ciclo completo visible
El backend soporta cinco piezas que el usuario hoy ve por separado. El objetivo es presentarlas como un solo circuito:

```
Acción (visita, reseña, compra, trivia)
   → XP y monedas
      → Nivel y liga
         → Premio canjeable
            → Nueva acción sugerida
```

- **Mejoras:**
  - Panel personal único que muestre las cinco etapas y el siguiente paso recomendado.
  - Notificación al subir de nivel o liga con el beneficio desbloqueado.
  - Sugerencia contextual tras cada acción: "Ya reseñaste; sube una foto y gana 10 XP más".

### 4.2 Ligas y temporadas
- Página o sección dedicada a la liga actual: posición, quién está cerca, cuánto falta para ascender.
- Cuenta regresiva de la temporada y recompensa de cierre.
- Historial de temporadas pasadas en el pasaporte (medallas por temporada).

### 4.3 Misiones
- Misiones por región, por temporada turística y por tipo de viajero (familia, aventura, cultura).
- Misiones patrocinadas por negocios (ya soportadas), claramente marcadas.
- Misiones colaborativas de grupo para viajes en pareja o familia.

### 4.4 Trivia y contenido educativo
- Dar a la trivia una entrada visible en la navegación (hoy tiene motor propio en el backend).
- Categorías ligadas a destinos: completar la trivia de Samaná suma a la misión de Samaná.
- Ranking semanal de trivia con premio pequeño y frecuente.

### 4.5 Rachas y hábitos
- Racha diaria/semanal visible, con aviso antes de perderla.
- Bono de "madrugador" explicado y visible cuando está disponible.
- Recuperación de racha limitada (una vez por temporada) para no desmotivar.

### 4.6 Premios
- Mezcla de premios digitales (inmediatos), descuentos de negocios aliados y experiencias.
- Premios exclusivos por liga o por nivel, no sólo por monedas.
- Catálogo rotativo por temporada para mantener interés.

---

## 5. Viajeros y comunidad

- **Perfil de viajero público** con pasaporte, reseñas, fotos y rutas completadas (sin datos personales).
- **Reseñas útiles:** formato con momento del viaje, perfil del viajero, pros y contras; votos de utilidad ya soportados.
- **Foros y preguntas por destino** con respuestas de locales certificados destacadas.
- **Planificador compartido** que sume XP al completar el viaje planificado.
- **Retos de grupo:** familias o amigos que suman XP conjunta hacia una meta.
- **Reconocimiento de locales:** insignia de "Local Certificado" con beneficios propios.
- **Guías de viajeros destacados:** colecciones creadas por usuarios de nivel alto, con autoría y moderación.

---

## 6. Embajadores y afiliados

### 6.1 Consolidar la información
- Unificar `SistemaAfiliados`, `RutasEmbajadores` y `RequisitosEmbajadores` en una sola página con secciones (qué es, requisitos, cómo ganar, niveles, preguntas), o documentar por qué deben seguir separadas (por ejemplo, SEO) y enlazarlas entre sí de forma explícita.

### 6.2 Claridad sobre cuánto se gana
- **Calculadora de comisión:** "si generas X en ventas, recibes Y", usando la tasa real del programa.
- Ejemplos concretos por tipo de producto (reserva de hotel, tour, tienda).
- Explicación del periodo de espera antes de liberar una comisión (ya existe en el backend: `ambassadors.settle`) y por qué existe (devoluciones, cancelaciones).

### 6.3 Herramientas para el embajador
- Panel con referidos, conversiones, comisiones pendientes y liberadas, y pagos solicitados (los datos ya existen en `/ambassadors/me/*`).
- Generador de enlaces por ficha y por campaña.
- Kit de materiales: imágenes, textos sugeridos, calendario de campañas.
- Niveles de embajador con tasa creciente por volumen sostenido.

### 6.4 Referidos entre viajeros
- Diferenciar "referido de viajero" (XP y monedas, `/referrals/*`) de "embajador" (dinero). Explicar ambos en la misma página para que nadie confunda uno con otro.

---

## 7. Creadores de contenido e influencers

### 7.1 Un solo camino, varias formas de ganar
El modelo definido para creadores combina tres fuentes de ingreso:

| Capa | Cómo se gana | Cuándo aplica |
|---|---|---|
| Comisión por conversión | Una venta atribuida a su video o enlace | Contenido que lleva a reservar o comprar |
| Licencia de uso | Pago fijo cuando la plataforma usa el video en una campaña | Contenido de alta calidad visual |
| Fondo de creadores | Reparto mensual por vistas/engagement | Contenido de inspiración que no vende directo |

- **Mejora:** presentar las tres capas juntas en `ProgramaCreadores`, con ejemplos, en lugar de programas que parecen competir entre sí.

### 7.2 Onboarding completo
- Flujo por pasos alineado con `/creators/onboarding`: datos, redes, muestras, aceptación de términos de cesión de derechos, verificación, datos de cobro.
- Estado de la postulación visible (pendiente, aprobada, observada).

### 7.3 Panel del creador
- Vistas, interacciones, conversiones atribuidas y ganancias por capa (los datos base ya existen: `total_views`, `total_earnings`, `balance_available`).
- Videos con estado de moderación y motivo si fue rechazado.
- Oportunidades abiertas: campañas de negocios que buscan creadores para un destino.

### 7.4 Puente con empresas
- `ContratarInfluencers` debe enlazar a `ProgramaCreadores` ("¿Eres creador? Postúlate") y viceversa ("¿Eres negocio? Contrata creadores").
- Directorio de creadores verificados por especialidad y región, con métricas públicas básicas.
- Flujo de propuesta: el negocio publica una campaña, los creadores aplican, la plataforma media el pago.

### 7.5 Calidad y derechos
- Guía de estilo de video (duración, formato vertical/horizontal, créditos, música con derechos).
- Marca de agua o crédito visible del creador en todo uso de su contenido.
- Proceso de retiro de contenido a pedido del creador, con plazos claros.

---

## 8. Negocios, patrocinio y membresía

### 8.1 Patrocinio (negocios)
- Página comercial que muestre los espacios publicitarios disponibles (`/sponsorship/slots`) con alcance estimado.
- Panel del anunciante con impresiones, clics y gasto (la telemetría ya existe).
- Paquetes combinados: espacio publicitario + misión patrocinada + campaña con creadores.

### 8.2 Membresía Pasaporte RD VIP
- Comparativa clara entre plan gratuito y planes pagos (beneficios, multiplicador de puntos, acceso anticipado).
- Beneficios tangibles de aliados (descuentos, upgrades) listados por destino.
- Prueba gratuita limitada o primer mes con descuento para medir conversión.

### 8.3 Negocios como parte de la gamificación
- Negocios que ofrecen premios canjeables a cambio de visibilidad.
- Sello "verificado" que otorga ventajas en misiones y búsquedas (con criterios públicos).

---

## 9. Monetización integrada: la historia de ingresos

### 9.1 Página "Gana con Descubre RD"
Una sola página que responda **"¿qué camino me conviene?"**, comparando lado a lado:

| Perfil | Programa | Qué gana | Esfuerzo | Enlace |
|---|---|---|---|---|
| Viajero | Gamificación y referidos | XP, monedas, premios | Bajo | Hub de gamificación |
| Promotor | Embajadores | Comisión en dinero | Medio | Programa de embajadores |
| Creador | Programa de creadores | Comisión + licencia + fondo | Medio-alto | Programa de creadores |
| Negocio | Patrocinio e influencers | Visibilidad y ventas | Inversión | Página comercial |
| Viajero frecuente | Pasaporte VIP | Beneficios y multiplicador | Suscripción | Membresías |

### 9.2 Recorridos de ascenso
- Viajero activo → invitación a embajador al alcanzar cierto nivel.
- Embajador con buen contenido → invitación a creador.
- Creador destacado → acceso prioritario a campañas pagadas por negocios.

### 9.3 Coherencia de mensajes
- Mismos términos en todas las páginas (XP, monedas, comisión, licencia, fondo).
- Un solo glosario enlazado desde cada programa.

---

## 10. Confianza, reglas y antifraude

- **Topes y enfriamientos visibles** para que las reglas se entiendan y no parezcan arbitrarias (ya aplicados en el servidor).
- **Detección de autorreferidos y abuso de comisiones** documentada en términos simples.
- **Moderación de videos y reseñas** con motivo visible al autor.
- **Marcado de contenido pagado** en todas las superficies: "Patrocinado", "Enlace de afiliado", "Colaboración pagada".
- **Canal de apelación** para creadores y embajadores ante rechazos o retenciones.
- **Privacidad:** los perfiles públicos muestran logros, nunca datos personales ni montos individuales.

---

## 11. Métricas de éxito

| Área | Métrica | Por qué importa |
|---|---|---|
| Gamificación | Usuarios activos semanales con al menos una acción | Participación real |
| Gamificación | Tasa de canje de premios | Si los premios motivan |
| Pasaporte | Sellos promedio por usuario activo | Uso del ciclo de visita |
| Embajadores | Postulantes → aprobados → con primera venta | Salud del embudo |
| Embajadores | Ingresos atribuidos por embajador activo | Valor del programa |
| Creadores | Videos publicados por mes y tasa de aprobación | Oferta de contenido |
| Creadores | Conversiones atribuidas por video | Contenido que vende |
| Patrocinio | Clics por impresión y renovación de campañas | Valor para negocios |
| VIP | Conversión de gratuito a pago y retención mensual | Ingreso recurrente |
| Contenido | Clics desde fichas hacia programas de participación | Si los puentes funcionan |

Cada mejora que se implemente debe declarar qué métrica mueve y su valor de partida.

---

## 12. Hoja de ruta por fases

### Fase A — Contenido y puentes (sin conectar backend)
- Auditoría de `ReglasGamificacion` contra reglas reales.
- "Cómo funciona" en Pasaporte Digital.
- Enlaces cruzados entre creadores ↔ empresas e influencers.
- Consolidación o enlace explícito de las páginas de embajadores.
- Página "Gana con Descubre RD" con contenido estático.
- Bloques "Gana con esta visita" en fichas, con reglas escritas (sin saldo en vivo).

### Fase B — Herramientas visibles
- Calculadora de comisión de embajadores.
- Ejemplos de ganancia de creadores por capa.
- Comparativa de planes VIP.
- Guía de estilo y términos de creadores.
- Centro de ayuda por programa.

### Fase C — Datos en vivo (requiere conectar frontend y backend)
- Panel personal único de gamificación con saldo, nivel, liga y siguiente paso.
- Paneles de embajador y creador con cifras reales.
- Estado de envíos de premios y de postulaciones.
- Panel del anunciante con telemetría real.

### Fase D — Crecimiento
- Directorio de creadores y flujo de campañas negocio-creador.
- Misiones colaborativas y retos de grupo.
- Recorridos de ascenso (viajero → embajador → creador).
- Premios exclusivos por liga y catálogo rotativo por temporada.

---

## 13. Dependencias y decisiones pendientes

| Decisión | Quién decide | Impacto |
|---|---|---|
| Cuándo conectar el frontend con el backend | Dirección del proyecto | Habilita toda la Fase C |
| Tasas de comisión y niveles de embajador | Negocio / finanzas | Calculadora y ejemplos |
| Presupuesto del fondo de creadores | Negocio / finanzas | Capa 3 de creadores |
| Términos legales de cesión de derechos | Legal | Onboarding de creadores |
| Criterios del sello verificado | Operaciones / MITUR | Negocios en gamificación |
| Consolidar o no las páginas de embajadores | Producto / SEO | Arquitectura de información |
| Premios físicos: logística y proveedores | Operaciones | Catálogo del Club |

---

## 14. Matriz de priorización

Puntuación orientativa de 1 (bajo) a 5 (alto).

| Ítem | Impacto | Esfuerzo | Riesgo | Prioridad sugerida |
|---|---|---|---|---|
| Página "Gana con Descubre RD" | 5 | 2 | 1 | Alta |
| Enlaces creadores ↔ empresas | 4 | 1 | 1 | Alta |
| "Cómo funciona" en Pasaporte | 4 | 2 | 1 | Alta |
| Auditoría de reglas de gamificación | 4 | 2 | 1 | Alta |
| Bloques "Gana con esta visita" en fichas | 5 | 3 | 2 | Alta |
| Calculadora de comisión | 4 | 2 | 2 | Media-alta |
| Consolidar páginas de embajadores | 3 | 2 | 2 | Media |
| Comparativa VIP | 3 | 2 | 1 | Media |
| Panel personal de gamificación (en vivo) | 5 | 4 | 3 | Media (depende de conectar) |
| Paneles de embajador y creador (en vivo) | 5 | 4 | 3 | Media (depende de conectar) |
| Directorio y campañas de creadores | 4 | 5 | 3 | Baja-media |
| Misiones de grupo | 3 | 4 | 2 | Baja |

**Recomendación:** empezar por la Fase A completa (alto impacto, bajo esfuerzo, sin depender de la conexión al backend) y, en paralelo, tomar las decisiones de la [sección 13](#13-dependencias-y-decisiones-pendientes) que desbloquean las fases B y C.
