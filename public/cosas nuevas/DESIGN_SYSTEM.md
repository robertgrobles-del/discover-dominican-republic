# DESIGN_SYSTEM.md — Descubre República Dominicana

> Colores, tipografía, espaciado, componentes y patrones del portal.
> **Fuente de los tokens en el código:** `src/index.css` (variables CSS) y `tailwind.config.ts`.
> Identidad de marca (logo, redes, fotografía): [`docs/contexto/marca.md`](docs/contexto/marca.md) · Textos de interfaz: [`docs/contexto/voz.md`](docs/contexto/voz.md)
> Estado al 2026-09-26, rama `dev`.

---

## 0. Antes de empezar: dos identidades que no coinciden

| | **Portal (código actual)** | **Marca (logo y redes)** |
|---|---|---|
| Color principal | Cian `#12BEED` (oscuro) / `#10ABD5` (claro) | Rojo `#CE1126` |
| Color de base | Verde azulado muy oscuro `#141C1F` | Azul marino `#002D62` |
| Titulares | Plus Jakarta Sans | Lora (serif) |
| Cuerpo | Noto Sans | Poppins, Montserrat o Inter |
| Tema por defecto | Oscuro | Claro en documentos; oscuro azul marino en redes |

**Decisión pendiente (P9 en `decisiones.md`):** unificar. Hay dos caminos:
- **A. Portal con la marca:** el azul marino pasa a ser la base, el rojo el color de acción y el cian queda como acento "Caribe" para mapas y datos.
- **B. Mantener el cian en el portal** y adaptar solo logo y redes.

**Recomendación: A.** Es la misma marca en todas partes y el azul marino permite mejor contraste. Hasta que se decida, **todo componente nuevo usa los tokens semánticos** (`primary`, `background`, etc.) y nunca colores escritos a mano. Así el cambio se hace en un solo lugar.

---

## 1. Principios

1. **Claridad antes que efecto.** El dato práctico debe verse primero; las animaciones acompañan, no protagonizan.
2. **Tokens, no colores sueltos.** Nada de `#hex` ni `text-cyan-400` en componentes; siempre `text-primary`, `bg-card`, etc.
3. **Accesible por defecto.** Contraste AA, foco visible, objetivos táctiles de 44 px y todo usable con teclado.
4. **Móvil primero.** Se diseña a 375 px y se amplía.
5. **Consistencia de patrones.** Una ficha de playa y una de restaurante comparten estructura (ver `docs/contexto/contenido.md`).
6. **Honestidad visual.** Lo patrocinado se distingue siempre de lo editorial.

---

## 2. Color

### 2.1 Tokens actuales (`src/index.css`)

El tema **oscuro es el predeterminado** (`:root`); el claro se activa con la clase `.light` en `<html>` (lo hace `ThemeToggle`).

| Token | Oscuro (HSL · HEX) | Claro (HSL · HEX) | Uso |
|---|---|---|---|
| `--background` | 195 22% 10% · `#141C1F` | 180 20% 98% · `#F9FBFB` | Fondo de página |
| `--foreground` | 0 0% 100% · `#FFFFFF` | 200 30% 12% · `#152228` | Texto principal |
| `--card` | 195 18% 13% · `#1B2427` | 0 0% 100% · `#FFFFFF` | Tarjetas |
| `--surface` | 195 16% 15% · `#20292C` | 0 0% 100% | Superficies |
| `--surface-elevated` | 195 14% 18% · `#273134` | 180 15% 97% | Superficies elevadas |
| `--primary` | 193 86% 50% · `#12BEED` | 193 86% 45% · `#10ABD5` | Acción principal, enlaces |
| `--primary-foreground` | `#141C1F` | `#FFFFFF` | Texto sobre primary |
| `--secondary` / `--muted` | 195 15% 18% · `#273135` | 195 15% 92% · `#E8ECEE` | Fondos secundarios |
| `--muted-foreground` | 192 20% 70% · `#A3BCC2` | 200 15% 40% · `#576B75` | Texto secundario |
| `--border` / `--input` | 195 15% 22% · `#303C41` | 200 15% 85% · `#D3DBDE` | Bordes |
| `--destructive` | 0 84% 60% · `#EF4444` | igual | Errores, borrar |
| `--gold` | 45 93% 58% · `#F8C630` | igual | Destacado, premios |
| `--emerald` | 160 84% 39% · `#10B77F` | igual | Éxito, abierto |
| `--coral` | 16 100% 66% · `#FF8052` | igual | Acento cálido |
| `--radius` | 0.5rem | igual | Radio base |

### 2.2 Problemas de contraste detectados

| Combinación | Contraste | AA (4.5:1) | Corrección |
|---|---|---|---|
| Botón primario claro: blanco sobre `#10ABD5` | 2.69 : 1 | ❌ | Oscurecer primary claro a `#0A7290` (HSL 193 87% 30%): 5.49 : 1 con blanco |
| Enlace primario claro `#10ABD5` sobre `#F9FBFB` | 2.59 : 1 | ❌ | Mismo cambio |
| Dorado `#F8C630` como texto sobre blanco | 1.6 : 1 | ❌ | Usar el dorado solo como fondo de insignia con texto oscuro |
| Botón primario oscuro: `#141C1F` sobre `#12BEED` | 7.91 : 1 | ✅ | — |
| Texto secundario claro `#576B75` sobre `#F9FBFB` | 5.37 : 1 | ✅ | — |
| Texto secundario oscuro `#A3BCC2` sobre `#141C1F` | 8.66 : 1 | ✅ | — |

### 2.3 Paleta propuesta si se elige la opción A (unificar con la marca)

| Token | Claro | Oscuro | Nota |
|---|---|---|---|
| `--background` | `#F4F6F9` | `#0B1A2E` | El oscuro deriva del azul marino |
| `--foreground` | `#0F1B2D` | `#F4F6F9` | |
| `--card` | `#FFFFFF` | `#11243D` | |
| `--primary` (acción) | `#CE1126` | `#CE1126` | Rojo de marca en ambos temas (contra el fondo oscuro: 3.1 : 1, válido para botones) |
| `--primary-foreground` | `#FFFFFF` | `#FFFFFF` | Blanco sobre `#CE1126`: 5.63 : 1 ✅ |
| `--brand-navy` | `#002D62` | `#002D62` | Encabezados, pie, fondos de sección (blanco encima: 13.5 : 1) |
| `--accent` (Caribe) | `#0A7290` | `#12BEED` | Mapas, datos, enlaces (claro: 5.07 : 1 · oscuro: 8.0 : 1) |
| `--muted-foreground` | `#5B6778` | `#A7B4C6` | |
| `--border` | `#DCE2EA` | `#1F3450` | |
| `--success` / `--warning` / `--destructive` | `#1E7B4D` / `#8F5A00` / `#B42318` | `#4CC38A` / `#F2C46B` / `#FF7A6E` | Todos ≥ 4.5 : 1 sobre su fondo |

> Contrastes verificados para los pares de texto principales. Antes de aplicarla, probarla en las 10 páginas más visitadas y en ambos temas.

### 2.4 Colores semánticos (no son la marca)

| Significado | Token | Uso |
|---|---|---|
| Éxito, abierto, verificado | `emerald` | Siempre con icono y texto, nunca solo color |
| Advertencia, bandera amarilla | `gold` | Fondo de insignia con texto oscuro |
| Error, cerrado, bandera roja | `destructive` | |
| Destacado (pagado) | `gold` + etiqueta "Destacado" | |
| Patrocinado | Neutro + etiqueta "Patrocinado" | Nunca con el color de acción |

---

## 3. Tipografía

### 3.1 Actual

| Rol | Fuente | Tailwind | Carga |
|---|---|---|---|
| Títulos | **Plus Jakarta Sans** (200–800) | `font-display` | Google Fonts en `index.css` e `index.html` |
| Cuerpo | **Noto Sans** (100–900) | `font-body` | Igual |

> La fuente se importa dos veces (en `index.css` y en `index.html`). Dejar solo una.

### 3.2 Escala (definida en `@layer base` de `index.css`)

| Elemento | Estilo actual | Recomendación |
|---|---|---|
| `h1` | `font-display font-black tracking-tight` | 36/40 px móvil · 48/52 px escritorio |
| `h2` | `font-display font-bold tracking-tight` | 28/34 · 36/42 |
| `h3` | `font-display font-bold` | 22/28 · 26/32 |
| `h4` | `font-display font-semibold text-base md:text-lg` | 18/26 |
| `h5` | `font-display font-semibold text-sm md:text-base` | 16/24 |
| `h6` / antetítulo | `font-medium text-xs md:text-sm uppercase tracking-wider text-muted-foreground` | 12–14 px |
| Párrafo | `leading-relaxed text-muted-foreground` | 16 px mínimo en móvil, 65–75 caracteres por línea |
| Datos en columnas | — | `tabular-nums` |

**Reglas**
- Máximo **dos familias**. Si se unifica con la marca (opción A): Lora solo para titulares editoriales grandes (portadas, revista) y una sans para todo lo demás.
- Las fuentes deben incluir los acentos de francés, alemán y portugués.
- `text-wrap: balance` en titulares.
- No usar `font-black` en textos largos.

---

## 4. Espaciado y layout

| Token | Valor | Uso |
|---|---|---|
| Escala base | 4 px (Tailwind: `1` = 4 px) | Todo espaciado sale de la escala |
| Entre elementos de un grupo | `gap-2` a `gap-4` (8–16 px) | |
| Relleno de tarjeta | `p-4` móvil · `p-6` escritorio | |
| Entre secciones | `py-12` móvil · `py-20` escritorio | |
| Contenedor | `container` centrado, relleno 2rem, máximo 1400 px | Definido en `tailwind.config.ts` |
| Margen lateral mínimo | 16 px | En cualquier ancho |

**Puntos de quiebre** (Tailwind por defecto): `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1400 (contenedor).

**Rejillas**
- Listados de tarjetas: 1 columna en móvil, 2 en `md`, 3 en `lg`, 4 en `xl` solo si las tarjetas son pequeñas.
- Fichas: contenido principal + columna lateral fija (reservar, contactar) desde `lg`.

---

## 5. Forma y profundidad

| Token | Valor |
|---|---|
| `rounded-sm` / `md` / `lg` | `--radius` − 4 px / − 2 px / 0.5rem |
| `rounded-xl` / `2xl` / `3xl` | 0.75rem / 1rem / 1.5rem |
| `shadow-elegant` | `0 10px 40px -10px primary/20%` |
| `shadow-glow`, `shadow-glow-lg` | Halo del color primario |
| `shadow-float` | `0 20px 50px -15px background/50%` |

**Reglas**
- Radio por rol: botones e inputs `rounded-lg`; tarjetas `rounded-2xl`; modales `rounded-3xl`.
- Los halos (`glow`) solo en el elemento principal de una sección, no en todas las tarjetas.
- Efecto vidrio (`.glass`, `.glass-card`) solo sobre fotos o mapas, nunca sobre texto largo.

---

## 6. Movimiento

**Disponibles** (`tailwind.config.ts` e `index.css`): `fade-in`, `fade-in-up`, `scale-in`, `slide-in-right`, `slide-in-left`, `shimmer`, `.reveal`, `.card-lift`, `.tilt-card`, `.parallax*`, `.ripple`, `.image-shine`.

**Reglas**
- Duración: 150–250 ms para interacciones; hasta 500 ms para entradas de sección.
- Respetar `prefers-reduced-motion`: sin parallax ni desplazamientos, solo cambios de opacidad.
- El contenido debe ser visible aunque la animación no se ejecute (nada que empiece en `opacity: 0` esperando al scroll sin alternativa).
- Framer Motion está en ≈240 archivos: usarlo para transiciones con sentido, no en cada tarjeta.

---

## 7. Iconografía e imágenes

- **Íconos:** lucide-react, un solo grosor. Tamaños 16, 20 y 24 px. Los botones de solo icono llevan `aria-label`.
- **Imágenes:** proporción fija por tipo (tarjetas 3:2, héroes 16:9, avatares 1:1), `loading="lazy"` fuera de la primera pantalla, texto alternativo descriptivo, crédito visible en galerías.
- **Componentes existentes:** `lazy-image` y `lightbox` en `components/ui/`, `useLightbox` en `hooks/`.

---

## 8. Componentes

### 8.1 Base (shadcn/ui, en `src/components/ui/`)

accordion · alert · alert-dialog · aspect-ratio · avatar · badge · breadcrumb · button · calendar · card · carousel · chart · checkbox · collapsible · command · context-menu · dialog · drawer · dropdown-menu · form · hover-card · input · input-otp · label · menubar · navigation-menu · pagination · popover · progress · radio-group · resizable · scroll-area · select · separator · sheet · sidebar · skeleton · slider · sonner · switch · table · tabs · textarea · toast · toggle · toggle-group · tooltip

**Propios en `ui/`:** animated-counter · export-pdf · floating-input · lazy-image · lightbox · progress-bar · section-skeleton · star-rating · testimonial-carousel · timeline

**Regla:** antes de crear un componente, buscar si ya existe en `ui/`. Si hay que modificar uno de shadcn, hacerlo en el archivo existente, no duplicarlo.

### 8.2 Componentes de dominio (a estandarizar)

| Componente | Contenido obligatorio | Variantes |
|---|---|---|
| **Tarjeta de ficha** | Foto 3:2, categoría, nombre, provincia, precio con moneda, estado (abierto o cerrado), insignias | Compacta (lista), normal (rejilla), destacada |
| **Insignia** | Texto + icono | Verificado · Destacado · Patrocinado · Nuevo · Abierto · Cerrado |
| **Barra de contacto** | WhatsApp, llamar, cómo llegar, web | Fija abajo en móvil; columna lateral en escritorio |
| **Bloque de datos prácticos** | Horario, precio, acceso, fecha de revisión | |
| **Encabezado de ficha** | Foto principal + miniaturas, nombre, migas de pan, insignias | |
| **Estado vacío** | Ilustración o icono, frase útil, acción sugerida | |
| **Banner publicitario** | Etiqueta "Patrocinado", tamaño IAB, carga diferida | 8 formatos principales |
| **Tarjeta de plan** | Nombre, precio con periodo, beneficios, llamada a la acción | "Próximamente" para beneficios aún no disponibles |

**Orden de insignias:** Verificado → Destacado → Patrocinado → Nuevo. Máximo tres por tarjeta.

### 8.3 Botones

| Variante | Uso | Máximo por vista |
|---|---|---|
| Primario (`default`) | La acción principal | 1 |
| Secundario (`secondary`, `outline`) | Acciones alternativas | Sin límite razonable |
| Texto (`ghost`, `link`) | Acciones terciarias | — |
| Destructivo | Borrar o cancelar algo irreversible | Siempre con confirmación en pantalla |

Texto de botón: verbo + objeto ("Escribir por WhatsApp", "Guardar cambios"). Ver `voz.md` §7.

### 8.4 Formularios

- Etiqueta visible siempre (no solo placeholder).
- Error debajo del campo, en `destructive`, con cómo corregirlo.
- Campos obligatorios marcados.
- Validación con react-hook-form + Zod; la validación real se repite en el servidor.
- Estado de envío en el botón ("Enviando…") y confirmación **solo si se guardó**.
- Formularios largos en pasos con barra de progreso.

---

## 9. Patrones

| Patrón | Regla |
|---|---|
| Carga | Esqueleto con la forma real del contenido (`skeleton`, `section-skeleton`) |
| Vacío | Explicar por qué y ofrecer una acción |
| Error | Qué pasó + qué hacer + reintentar |
| Confirmación | Aviso breve (`sonner`) con el resultado real |
| Datos de ejemplo | Aviso visible "Datos de ejemplo" mientras el sitio use la base simulada |
| Destructivo | Confirmación dentro de la página, nunca `confirm()` del navegador |
| Filtros | En hoja inferior en móvil; reflejados en la URL |
| Mapas | Lista y mapa sincronizados; alternativa en lista para lectores de pantalla |

---

## 10. Accesibilidad (mínimos)

- Contraste AA en texto (4.5:1) y en elementos grandes y controles (3:1).
- Foco visible en todo elemento interactivo (`ring`).
- Navegación completa con teclado, incluidos mapas, carruseles y modales.
- `aria-label` en botones de solo icono.
- Estados comunicados con texto o icono, no solo con color.
- Objetivos táctiles de 44 × 44 px.
- Texto alternativo descriptivo en imágenes informativas; vacío (`alt=""`) en decorativas.
- `prefers-reduced-motion` respetado.

---

## 11. Temas claro y oscuro

- Oscuro por defecto; el claro se aplica con `.light` en `<html>`.
- Todo componente se prueba en ambos temas.
- Mapas, gráficos y banners también deben adaptarse (suelen quedarse claros en el tema oscuro).
- Las imágenes con texto superpuesto llevan degradado (`--gradient-hero`, `--gradient-card`) para mantener el contraste en ambos temas.

---

## 12. Organización del código de componentes

**Duplicados a unificar:** `gamificacion` / `gamification` / `gamificacion-hub` / `gamificacion-turistica`, `beach` / `playas`, `river` / `rios`, `destination` / `destinations`, `province` / `provinces`, `experience` / `experiences`.

**Convención propuesta**
```
src/components/
├─ ui/          base (shadcn + propios genéricos)
├─ layout/      Header, Footer, navegación
├─ listing/     tarjeta de ficha, insignias, barra de contacto, datos prácticos
├─ <dominio>/   un nombre por dominio, en español o en inglés, pero no ambos
└─ promo/       banners y publicidad
```

---

## 13. Qué hacer y qué no

| Hacer | No hacer |
|---|---|
| `bg-primary text-primary-foreground` | `bg-[#12BEED] text-white` |
| Reutilizar `Button`, `Card`, `Badge` | Crear un botón nuevo por página |
| Una acción principal por vista | Tres botones rojos juntos |
| Moneda explícita (RD$ o US$) | "$" solo |
| Etiqueta "Patrocinado" visible | Anuncio que parece contenido editorial |
| Probar en móvil y en ambos temas | Diseñar solo en escritorio oscuro |

---

## 14. Cómo cambiar un token

1. Cambiar el valor en `src/index.css`, en `:root` (oscuro) y en `.light` (claro).
2. Si es un token nuevo, agregarlo también en `tailwind.config.ts`.
3. Verificar el contraste de los pares afectados.
4. Actualizar este documento y, si es una decisión de marca, `docs/contexto/decisiones.md`.
