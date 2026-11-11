# Reglas del proyecto (para todos los agentes)

Estas reglas valen desde ahora para todo el trabajo. Cada regla nueva que pida el dueño del proyecto se añade aquí.

## Publicar y mostrar contenido
- No publicar ni mostrar en la web nada nuevo sin que el dueño lo pida o lo apruebe antes: ni secciones, ni tarjetas, ni páginas. Los cambios dentro de `/admin` no cuentan.
- Lo que se crea en Turso desde el panel sale en la web al publicarse (noticias, eventos, provincias…). Las provincias se publicaron el 2026-11-10 en `/provincias` y `/provincia/<slug>`: solo salen las que están «Publicadas» en el panel.
- **Sitemap y `llms.txt` siempre al día.** Cada página que se publique, desde el código o como contenido del panel, entra en el sitemap y en `llms.txt` en el mismo cambio:
  - **Página del código:** se añade a `STATIC_PAGES` en `api/index.ts` y al arreglo `PUBLISHED` de `src/App.tsx`. Si es una sección, también lleva su línea en «Guías» de `llmsTxt`.
  - **Tipo de contenido nuevo del panel** (playas, hoteles, municipios…): sus fichas publicadas se añaden en `publicExtras()` (`api/index.ts`), con su URL en `sitemap()` y su sección en `llmsTxt()`. Se suma una prueba que compruebe que la publicada sale y el borrador no.
  - Lo que está en `<StaffPreview>` o en borrador **no** entra.
- `llms.txt`, `llms-full.txt` y `sitemap.xml` los genera la API con datos reales. No crear versiones fijas en `public/`, que taparían las dinámicas, y nunca publicar contenido de ejemplo o inventado como si fuera real.
- El dominio canónico es `https://descubrerepdom.com`, sin `www`, porque `www` redirige a él.

## Base de datos
- Antes de crear una tabla o una migración, leer «Regla para crear una tabla nueva» en `docs/MAPA_DATOS.md`. Decidir su base (1 Contenido, 2 Usuarios, 3 Dinero, 4 Registros) y anotarla allí.
- El crecimiento de usuarios es la base del proyecto. Una persona tiene una sola cuenta con varios roles, no una tabla por tipo de usuario. Ver «Tipos de usuario» en `docs/MAPA_DATOS.md`.
- Las tablas de las bases 2, 3 y 4 guardan el `slug` del contenido, no solo el ID. No unir con JOIN tablas de bases distintas.
- Turso (staging) usa migraciones en `staging/migrations/NNN_*.sql`. No renombrar migraciones ya aplicadas. Turso por HTTP no hace cumplir las claves foráneas: se comprueban a mano en `TABLES[...].refs`.
- Supabase es histórico: todas sus tablas están en `backend/migrations` (Postgres).
- **Ubicación del contenido:** toda tabla de contenido con lugar (playas, recintos, eventos, hoteles…) lleva `province_id`, `municipality_id` y `destination_id`, y su editor usa `<LocationPicker>`. Elegir el municipio o el destino completa la provincia, y la API (`checkLocation`) rechaza combinaciones que no encajan. Así el contenido sale en la página de la provincia, del municipio y del destino. Para activarlo en una tabla nueva: añadir `...locationSpec(b)` a su spec, `LOCATION_REFS` a sus refs y su nombre a `LOCATED` en `api/index.ts`.
- **Página de provincia:** sus componentes se editan en el panel (Provincias). Los catálogos (monumentos, parques, hoteles, restaurantes, bares) no se cargan a mano: salen solos por provincia.

## Panel de administración
- Todo contenido nuevo del panel usa el diseño tipo WordPress, como Noticias: una lista (Todos | Publicados | Borradores, búsqueda, acciones al pasar el ratón) y un editor de dos columnas. Plantillas: `ProvinceList`/`ProvinceEditor`, `EventList`/`EventEditor`, pasadas a `StagingCrudManager` con `renderList` y `renderEditor`.
- Diseño general: seguir `DESIGN.md`.
- Todo formulario público lleva el campo trampa `<Honeypot />` y pasa por `formGuard()` en la API.

## Rutas y contenido
- Todo cambio de URL lleva redirección de la ruta vieja a la nueva (`<Navigate replace>` en `src/App.tsx` o un redirect en `vercel.json`). Nunca borrar una ruta publicada sin redirigirla.
- Al fusionar páginas, el contenido de la página eliminada (textos, datos, secciones) se pasa completo a la página destino.
- Las páginas en preparación se envuelven en `<StaffPreview>` (`src/App.tsx`): solo las ven admin y editor con sesión, y el público recibe una 404. Hoy no hay ninguna en vista previa.
- Las páginas que leen de Turso ponen la ficha del panel encima de los datos locales de `src/data`: lo que se rellena en el panel manda, y lo vacío sigue saliendo de `src/data`. Así se migra sección a sección sin dejar páginas vacías.
- Fotos nuevas en `public/img`: el nombre del archivo indica el lugar y el fotógrafo. Sustituir con ellas las fotos de stock de la portada según el área, conservar el crédito del fotógrafo y optimizar el peso.

## Infraestructura
- Proyecto personal: vive en Vercel + Turso (rama `staging`) hasta que facture para un VPS. Nada que necesite un proceso permanente, Postgres o Docker en lo que se publique.
- Cloudflare solo hace el DNS del dominio (nube gris); Vercel sirve el sitio.
- Analítica (GTM, GA4, Clarity, Cloudflare): se carga solo con consentimiento de cookies, con IDs en variables `VITE_*` de Vercel. No pegar los fragmentos de código de Google en `index.html`. Cada dominio nuevo de terceros se añade a la Content Security Policy de `index.html`.
- Strapi y `cms/` están descartados: no integrarlos ni tocarlos.

## Git y trabajo en paralelo
- Hay varios agentes trabajando a la vez. Confirmar solo archivos propios y preguntar antes de incluir trabajo ajeno.
- Los mensajes de commit terminan con la línea `Co-Authored-By` del agente, y sus líneas no pasan de 100 caracteres.
- Antes de push, pasar lo mismo que el CI de staging (`.github/workflows/staging.yml`): `tsc` del frontend y de la API, eslint, `npm test` y construir el esquema de Turso.
- El build local de Vite falla en este equipo con «Access is denied» de esbuild. Es un límite del equipo, no del código: se valida en el CI.

## Datos privados y seguridad
- No escribir contraseñas ni tokens en archivos del repositorio.
- No poner el correo del dueño en cabeceras, User-Agent ni servicios externos.
- No matar todos los procesos de Node ni tocar los Postgres del dueño: cerrar procesos por puerto o PID.

## Marketing y envíos
- Antes de cada tanda de correos o publicaciones, el dueño tiene que dar el visto bueno. Los envíos masivos van por Brevo con dominio verificado, no por Gmail.
- Los correos deducidos por patrón (`contactos_inferidos.csv`) no se envían de forma automática.
