# Contexto del negocio

Estos documentos explican **qué es Descubre República Dominicana, para quién es, qué vende, cómo habla y en qué estado está**. Son la fuente de verdad para cualquier persona o asistente de IA que escriba textos, diseñe pantallas o tome decisiones de producto en este repositorio.

## Documentos de la raíz del proyecto

| Archivo | Qué contiene |
|---|---|
| [AGENTS.md](../../AGENTS.md) | Instrucciones para asistentes de IA y el equipo: qué leer, reglas, verificación y convenciones |
| [PRD.md](../../PRD.md) | Qué se construye, para quién, objetivos, requisitos con prioridad y lanzamientos |
| [ARCHITECTURE.md](../../ARCHITECTURE.md) | Cómo se conectan frontend, backend, base de datos y servicios |
| [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md) | Colores, tipografía, espaciado, componentes y patrones del portal |

## Catálogo de mejoras

| Archivo | Qué contiene |
|---|---|
| [../mejoras/estado-y-mejoras.html](../mejoras/estado-y-mejoras.html) | Revisión de la rama `dev` y las 1500 mejoras con su estado (hecho, listo en la API, solo interfaz, roto, pendiente, nueva). Se abre en el navegador |

## Documentos de contexto

| Archivo | Qué contiene | Úsalo cuando… |
|---|---|---|
| [negocio.md](negocio.md) | Qué hacemos, a quién ayudamos, cómo, de dónde entra el dinero, en qué somos distintos, etapas y riesgos | Planifiques una función o necesites entender el modelo |
| [cliente.md](cliente.md) | Perfiles, dolores, miedos, objeciones, preguntas, recorrido de compra y lenguaje | Escribas para empresas o para viajeros |
| [oferta.md](oferta.md) | Planes, paquetes, piloto, precios, pruebas, promesas y guion de venta | Toques planes, precios, checkout o beneficios |
| [voz.md](voz.md) | Tono, palabras permitidas y prohibidas, microcopy, ejemplos por canal | Escribas cualquier texto visible |
| [marca.md](marca.md) | Logo, colores, tipografía, redes y fotografía | Diseñes pantallas o piezas gráficas |
| [contenido.md](contenido.md) | Fuentes, fechas de revisión, estructura de fichas, idiomas y derechos | Crees o edites fichas, guías o artículos |
| [glosario.md](glosario.md) | Términos del portal y su traducción a 6 idiomas | Nombres una función o traduzcas |
| [metricas.md](metricas.md) | Qué se mide y cómo se cuenta | Construyas paneles, informes o cifras públicas |
| [producto.md](producto.md) | Estado real de cada módulo y bloqueantes | Empieces a trabajar en un módulo |
| [decisiones.md](decisiones.md) | Decisiones vigentes y pendientes | Tomes o cambies una decisión |
| [competencia.md](competencia.md) | Alternativas con las que nos compara el cliente (incompleto) | Prepares ventas o posicionamiento |

## Reglas

1. **Son documentos vivos.** Si cambia un precio, un plan, una decisión o el estado de un módulo, actualiza el archivo en el mismo cambio que modifica el código.
2. **El código obedece a estos documentos.** Si una pantalla contradice `oferta.md`, `voz.md` o `glosario.md`, se corrige la pantalla o primero se actualiza el documento con la decisión nueva.
3. **Nada inventado.** Cifras con fuente y fecha; testimonios solo reales y con permiso. Lo que no está confirmado se marca como "propuesta para validar".
4. **Registra los cambios** en la tabla de abajo, y las decisiones en `decisiones.md`.

## Historial

| Fecha | Cambio |
|---|---|
| 2026-09-26 | Primera versión de los 11 documentos de contexto |
| 2026-09-26 | PRD.md, ARCHITECTURE.md y DESIGN_SYSTEM.md; AGENTS.md ampliado; P9 en decisiones |
