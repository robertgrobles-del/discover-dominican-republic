# Guía de diseño — Descubre RD

Guía práctica para quien toque la interfaz: personas o agentes de IA. Dice qué usar, cómo combinarlo y qué evitar,
tanto en el sitio público como en el panel `/admin`. Para los detalles de marca y logotipo, ver
[docs/MANUAL_Y_BRIEF_IDENTIDAD_DESCUBRE_RD.md](docs/MANUAL_Y_BRIEF_IDENTIDAD_DESCUBRE_RD.md). Para el estado de la
migración de tokens, ver [docs/DISENO_VISUAL_FRONTEND.md](docs/DISENO_VISUAL_FRONTEND.md).

**Eslogan:** «El mejor destino del Caribe».
**Stack:** React + Vite, Tailwind 3, componentes shadcn/ui (`src/components/ui`) e iconos `lucide-react`.

---

## 1. Principios

1. **Primero el destino.** La foto real del lugar, el dato útil (fecha, precio, cómo llegar) y la acción. El adorno va después.
2. **Que no parezca hecho por IA.** Aquí no se usan:
   - degradados violeta o azul;
   - tres tarjetas iguales en fila como bloque estrella;
   - iconos en círculos de colores;
   - textos huecos como «descubre experiencias inolvidables»;
   - exclamaciones y emojis como adorno.

   Se usan un estilo editorial, jerarquía clara, fotos propias y datos concretos.
3. **Una sola paleta.** El turquesa caribe es la única marca de acción. Los demás colores son acentos con un significado (sección 3).
4. **Accesible por defecto.** Contraste AA, foco visible, texto alternativo en cada imagen y nada que dependa solo del color.
5. **Nada visible sin pedirlo.** Una sección, tarjeta o página pública nueva solo sale cuando el responsable lo pide. Las provincias del panel siguen ocultas hasta nueva orden.

## 2. Temas

El sitio tiene **tema oscuro** (`:root`, azul profundo) y **tema claro** (`.light`). Todo color sale de un token, así
que funciona en los dos.

- Nunca escribas colores a mano (`#0b7290`, `bg-[#…]`, `text-white` sobre un fondo que cambia de tema). Usa `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`.
- Excepción: texto sobre una foto. Ahí el blanco va sobre un degradado oscuro (`--gradient-card`) que le asegura el contraste.

## 3. Color

Los tokens viven en [src/index.css](src/index.css) (HSL) y se exponen en [tailwind.config.ts](tailwind.config.ts).

| Token | Clase | Para qué |
|---|---|---|
| `--primary` / `--brand-caribbean` | `bg-primary`, `text-primary` | Botones principales, enlaces, foco, elemento activo. **El único color de acción.** |
| `--background`, `--card`, `--surface-elevated` | `bg-background`, `bg-card` | Fondos y superficies, de la más baja a la más alta. |
| `--muted`, `--muted-foreground` | `bg-muted`, `text-muted-foreground` | Fondos suaves, metadatos y textos de ayuda. |
| `--brand-sand` (oro) | `text-brand-sand` | Acento editorial puntual: destacados y premios. |
| `--brand-coral` | `text-brand-coral` | Acento cálido: gastronomía, fiesta. Nunca para errores. |
| `--brand-forest` | `text-brand-forest` | Naturaleza, confirmaciones. |
| `--destructive` | `text-destructive` | Solo errores y acciones de borrar. |
| `--sponsored-*` | `SponsoredBadge` | Contenido patrocinado. Siempre lleva su etiqueta visible. |
| `--region-este/cibao/sur/norte` | — | Etiquetas de región. No son colores de marca. |

**Reglas:**
- En una vista, un solo color protagonista (`primary`). Los acentos, a lo sumo en un 10 % de la superficie.
- Un estado (error, éxito, seleccionado) se distingue también por texto, icono o forma.
- Lo comercial usa `surface-commercial` y lo editorial `surface-editorial` (o `Card variant`). Así el lector distingue un anuncio de una noticia.

## 4. Tipografía

| Familia | Clase | Uso |
|---|---|---|
| **Plus Jakarta Sans** | `font-display` | Títulos, cifras grandes, botones destacados. |
| **Noto Sans** | `font-body` (por defecto) | Lectura, formularios, interfaz. |
| Monoespaciada del sistema | `font-utility` | Slugs, códigos, datos técnicos. |

- **Escala:**
  - Titular de portada: `text-4xl md:text-6xl font-display font-bold tracking-tight`.
  - Título de sección: `text-2xl md:text-3xl font-display font-bold`.
  - Cuerpo: `text-base leading-relaxed`.
  - Metadatos: `text-sm text-muted-foreground`.
- **Mínimo de 10 px** (`text-3xs`), y solo en etiquetas y metadatos. `text-2xs` (11 px) para microtexto.
- Párrafos de 65 a 75 caracteres como máximo (`max-w-prose`). Los titulares, con `text-balance`.
- Mayúsculas sostenidas solo en etiquetas cortas (`uppercase tracking-wider text-xs`), nunca en párrafos ni títulos largos.
- Las cifras de tablas y KPIs van con `tabular-nums`.
- **Antetítulo o resumen de una noticia:** `text-primary font-bold italic`.

## 5. Espacio y composición

- Contenedor: `container`, con margen lateral `--page-gutter` (16 a 40 px) y un ancho máximo de 1400 px. En la portada, `HOME_SECTION_FRAME`.
- Entre secciones: `--space-section` (48 a 96 px; clase `py-16` o `spacing-section`).
- **Radios:**
  - Tarjeta: `rounded-card` (16 px) o `rounded-2xl`.
  - Botones y campos: `rounded-md`.
  - Lo interior lleva un radio menor que su contenedor.
- **Rejillas:** prefiere composiciones asimétricas. Por ejemplo, la noticia destacada en `lg:col-span-2` con su columna lateral a la misma altura (ver «Mantente informado»). Las columnas de un mismo bloque deben quedar a la misma altura, sin huecos.
- **Móvil primero:** todo debe funcionar a 360 px de ancho, sin desplazamiento horizontal y con objetivos táctiles de al menos 44 px.

## 6. Imágenes

- **Fotos reales y propias** del lugar del que se habla. Las nuevas llegan a `public/img/` y sustituyen las de la portada según el nombre del archivo y el título de la sección. Se optimizan a WebP o JPG antes de pasarlas a `src/assets/`.
- Cada imagen lleva un `alt` que la describe («Playa de Las Terrenas al atardecer»), no `alt="imagen"`. Si es decorativa, `alt=""`.
- Si la foto es de terceros, se pone el crédito (`image_credit` en noticias).
- Usa `LazyImage` y relaciones de aspecto fijas (`aspect-[16/9]`, `aspect-[4/3]`) para que la página no salte mientras carga.
- Sobre una foto con texto: `--gradient-card` desde abajo, y el texto en la zona oscura.
- **Nunca** subas a la interfaz pública una ruta interna como `/api/v1/media/<id>.webp` en forma de texto visible.

## 7. Componentes

Primero se reutiliza lo que existe en `src/components/ui` (shadcn) y en `src/components/`. No se añaden librerías de
componentes ni de iconos.

- **Botones:** `Button` por defecto para la acción principal (una por bloque), `variant="outline"` para la secundaria y un enlace de texto para la terciaria. Evita poner siempre un botón relleno y otro fantasma juntos.
- **Iconos:** `lucide-react`, un solo grosor y siempre con un significado. Si el icono va solo, lleva `aria-label`.
- **Tarjetas:** solo cuando el contenido es un objeto (destino, evento, noticia). Una tarjeta es una foto, una etiqueta corta, un título y un dato; el resto va en la ficha.
- **Preguntas frecuentes:** como lista visible (`<dl>`). No uses acordeón, que esconde contenido a lectores y a buscadores.
- **Estados:**
  - Carga: esqueletos (`Skeleton`) con la forma del contenido, no un spinner en mitad de la página.
  - Vacío: una frase útil y la acción para salir de ahí.
  - Error: un mensaje directo, como «No se pudo cargar. Inténtalo de nuevo».
- **Formularios públicos:**
  - Siempre con `<Honeypot />` ([src/components/forms/Honeypot.tsx](src/components/forms/Honeypot.tsx)).
  - Etiquetas visibles y validación en línea.
  - El enlace a la política de privacidad junto al botón de envío.
- **Enlaces externos:** se abren en una pestaña nueva (lo hace `ExternalLinksNewTab` en `App.tsx`).

## 8. Panel `/admin` — estilo WordPress

**Todo contenido nuevo del panel usa el diseño de WordPress**, el mismo que Noticias. No se usa el formulario genérico
de una columna.

**Lista** (plantillas: `NewsList`, `EventList`, `VenueList`, `ProvinceList`):
- Título y botón «Añadir …» en `outline` y color primario.
- Filtros por estado como texto: `Todos (n) | Publicados (n) | Borradores (n)`, más filtros propios del contenido y un buscador a la derecha.
- Tabla con filas alternas (`bg-muted/40`). El nombre es un enlace en color primario.
- Las acciones (Editar | Eliminar | Ver) aparecen al pasar el ratón o con el foco.

**Editor** (plantillas: `NewsEditor`, `EventEditor`, `VenueEditor`, `ProvinceEditor`):
- Rejilla `lg:grid-cols-[minmax(0,1fr)_300px]`.
- **Columna izquierda:** título grande (`h-12 text-xl`), enlace permanente con el slug editable, `ClassicEditor` (pestañas Visual/Texto, guarda Markdown) y cajas de contenido.
- **Columna derecha:** cajas `Box`. **Publicar** va siempre primero, con estado, Guardar borrador, Publicar o Actualizar, y Eliminar. Después Imagen destacada y las cajas propias del contenido.
- Al guardar, un aviso con la acción «Nuevo …». Las listas JSON (galerías, municipios) se editan con `Repeater`, `PhotoList` o etiquetas.
- El Escritorio (`dashboard`) es la primera sección para todos los roles. Los permisos siguen los roles de WordPress: admin, editor, autor y colaborador.
- La barra lateral es estrecha (`w-52`), sin buscador ni etiquetas técnicas.

## 9. Textos y tono

- Se trata de tú al lector, en un español dominicano neutro, claro y cercano. Frases cortas y en voz activa: «No se pudo guardar», no «Ha ocurrido un error».
- Los títulos van con mayúscula solo al inicio («Cómo llegar», no «Cómo Llegar»).
- Se dan datos concretos (fechas, precios en RD$, teléfonos reales) en lugar de cifras redondas inventadas.
- Palabras vetadas: «sumérgete en una experiencia única», «inolvidable», «de otro nivel», «elevar», «sin igual» y otros clichés turísticos o de IA. Excepción: los nombres de secciones que ya existen, como «Sumérgete en nuestros paraísos».
- **Idiomas:** el sitio sale en 6 (es, en, fr, de, it, pt). Cada texto nuevo de la interfaz pública:
  - va en su propio nodo del DOM;
  - se añade al diccionario automático con `node scripts/merge-auto-translations.mjs <lote.json>`.

## 10. Movimiento

- Transiciones de 150 a 300 ms sobre `transform` y `opacity`, nunca sobre `width`, `height` o `top`.
- Al pasar el ratón, un cambio leve (zoom de 1.05 en la foto, cambio de tono en el botón). Al pulsar, `active:scale-[0.98]`.
- Las entradas escalonadas son discretas (`framer-motion`) y se respeta `prefers-reduced-motion`.

## 11. Accesibilidad (mínimos)

- Contraste AA: 4.5:1 en texto y 3:1 en componentes. El rojo de error del tema oscuro lleva texto oscuro por eso.
- Foco visible en todo lo interactivo (`ring` con `--focus-ring`).
- Un solo `h1` por página y títulos en orden.
- Los modales y menús se cierran con Escape y devuelven el foco al elemento que los abrió.
- Los formularios llevan `<Label htmlFor>` y los errores se anuncian con `role="alert"`.

## 12. SEO y agentes de IA

- Cada página pública tiene un `SEOHead` con su título (60 caracteres como máximo) y descripción (155 como máximo). La meta keywords no se usa.
- Las guías largas, como `/e-ticket`, tienen su versión en Markdown en `public/` y su JSON-LD (FAQPage, HowTo), y se enlazan desde `llms.txt`.
- Las noticias usan el análisis SEO del editor: hasta 3 palabras clave y una puntuación de 0 a 100.

## 13. Lista de revisión antes de publicar

- [ ] Funciona en el tema claro y en el oscuro, y a 360 px de ancho.
- [ ] Solo hay colores de token y un único color de acción.
- [ ] Las imágenes son reales, tienen `alt` y su relación de aspecto es fija.
- [ ] Los textos nuevos están en el diccionario de los 6 idiomas.
- [ ] Hay estados de carga, vacío y error.
- [ ] Los formularios tienen honeypot, etiquetas y validación.
- [ ] En el panel, sigue el patrón WordPress de lista + editor.
- [ ] No se muestra en público nada que no se haya pedido.
- [ ] Lint y `tsc` pasan, y se revisó en el navegador.
