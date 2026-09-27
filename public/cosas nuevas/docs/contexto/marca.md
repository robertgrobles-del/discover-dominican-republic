# marca.md — Identidad visual de Descubre República Dominicana

> Nombre público: **Descubre República Dominicana**.
> Tagline principal: **Descubre · Explora · Disfruta**. Tagline de redes: **El mejor destino del Caribe**.
> Instagram: **@descubrerep.dom** (va en todas las piezas de redes).

---

## Logo

| Versión | Uso |
|---|---|
| **Color:** "Descubre" en rojo y "REPÚBLICA DOMINICANA" en azul marino, sobre transparente | Fondos claros |
| **Blanca**, con tagline "El mejor destino del Caribe" | Fondos oscuros, azules o fotos |
| **Logo IG:** wordmark blanco sobre transparente, 4000 × 4000 px | Redes; en fondos claros se tiñe de azul marino |

**Reglas**
- En fondos oscuros, el logo blanco va **sin recuadro ni fondo**.
- El logo va en **tamaño prominente**. En portadas de posts, en el encabezado.
- No deformar, no rotar, no cambiar colores fuera de estas versiones, no añadir sombras ni contornos.
- Espacio libre alrededor: como mínimo la altura de la "D" de "Descubre".
- En portadas y cierres de carruseles con mucho texto, el logo puede reducirse para dejar respirar el contenido.
- Logo asociado disponible: **Santo Domingo 2026** (color y blanco), solo para contenido de ese evento.

---

## Colores

> ⚠️ **Decisión pendiente:** hoy se usan dos juegos de códigos. Esta guía propone el segundo como oficial porque son códigos exactos y coinciden con la bandera. Confirmar en `decisiones.md`.

| Rol | Oficial propuesto | Variante en uso (retirar) |
|---|---|---|
| **Rojo** (acento, llamadas a la acción) | `#CE1126` | `#C91E2D` |
| **Azul marino** (texto principal, fondos oscuros) | `#002D62` | `#122656` |
| **Blanco** | `#FFFFFF` | — |

> **El portal hoy usa otra paleta** (cian `#12BEED` sobre verde azulado oscuro y las fuentes Plus Jakarta Sans y Noto Sans). La unificación está pendiente (P9 en `decisiones.md`). Tokens de interfaz y detalle en [`DESIGN_SYSTEM.md`](../../DESIGN_SYSTEM.md).

**Colores de apoyo propuestos** (para interfaz y gráficos, sin competir con el rojo):
| Rol | Color |
|---|---|
| Fondo claro | `#F4F6F9` |
| Gris de texto secundario | `#5B6778` |
| Líneas y bordes | `#DCE2EA` |
| Éxito | `#1E7B4D` |
| Advertencia | `#8F5A00` |
| Error | `#B42318` |

**Reglas de uso**
- El rojo se reserva para **una sola acción principal** por pantalla o pieza. Nunca para párrafos largos.
- Texto sobre fotos: degradado azul marino al 60–80 % para cumplir contraste AA.
- No usar el rojo y el azul de la bandera juntos en franjas o composiciones que imiten la bandera, por respeto a la Ley de símbolos patrios.

---

## Tipografía

| Rol | Fuente | Uso |
|---|---|---|
| Titulares | **Lora** (serif) | Portadas, títulos de secciones y posts |
| Cuerpo | **Poppins**, **Montserrat** o **Inter** | Texto corrido, botones, interfaz |

> Recomendación: elegir **una sola** fuente de cuerpo (hoy hay tres opciones) y usar siempre la misma en el portal y en redes.

- Tamaño mínimo de cuerpo en móvil: 16 px.
- Las fuentes deben tener todos los acentos de francés, alemán y portugués.

---

## Redes sociales

| Formato | Tamaño | Notas |
|---|---|---|
| Feed (carrusel o post) | 1080 × 1350 px | Portada con título gancho; logo en el encabezado |
| Historias | 1080 × 1920 px | Zonas muertas de 250 px arriba y abajo |

**Estilo que ha funcionado**
- Composición editorial sobre azul marino, con motivo de **sello circular tipo pasaporte**.
- Portadas y cierres: contenido centrado, sin insignias, antetítulo grande.
- Gráficos de barras, embudos e íconos para datos.
- Correcciones típicas: ubicación del logo, espaciado, escala tipográfica y quitar decoración que sobra.

**Producción:** las piezas se generan con Python, Playwright/Chromium y Pillow para mantener la consistencia.

---

## Fotografía

- Luz natural, gente local y lugares reales. Nada de stock genérico.
- Cada foto lleva crédito y licencia registrados (ver `contenido.md`).
- No repetir la misma foto en fichas distintas.
