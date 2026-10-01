# Sistema visual del frontend

## Identidad y alcance

Descubre RD conserva la identidad que ya usa el portal: azul turquesa caribeño sobre azul profundo, acentos inspirados en arena, coral y vegetación, con códigos cromáticos regionales reservados para identificar territorios. El propósito es ayudar a elegir y planificar viajes por República Dominicana; los recursos visuales deben priorizar destino, orientación y confianza.

Este documento formaliza una base común para el portal público, la tienda y el panel de empresas. No significa que todas las páginas existentes ya hayan sido migradas; las superficies heredadas se deben actualizar por grupos y revisar visualmente antes de declararlas consistentes.

## Tokens implementados

Los valores viven en `src/index.css` y se exponen en `tailwind.config.ts`:

| Uso | Token / clase | Regla |
|---|---|---|
| Acción y orientación | `brand-caribbean`, `primary` | CTA, foco y enlaces interactivos; mantener contraste con su texto. |
| Superficie de marca | `brand-deep-sea`, `background` | Navegación y superficies oscuras; respetar el tema claro. |
| Acentos | `brand-sand`, `brand-coral`, `brand-forest` | Detalles editoriales o categorías; no codificar estado solo con color. |
| Editorial y comercial | `surface-editorial`, `surface-commercial` | Separar lectura/inspiración de oferta/transacción. Patrocinios siempre etiquetados. |
| Transparencia comercial | `SponsoredBadge`, `badge-sponsored` | Identificar anuncios y contenido patrocinado con una etiqueta semántica legible en temas claro y oscuro. |
| Borde y foco | `border-strong`, `ring`, `:focus-visible` | Delimitar controles y conservar foco visible con teclado. |
| Composición | `rounded-card`, `spacing-section`, `--page-gutter` | Radios, ritmo entre secciones y márgenes responsivos compartidos. |
| Tipografía | `font-display`, `font-body`, `font-utility` | Plus Jakarta Sans para jerarquía, Noto Sans para lectura y monoespaciada del sistema para datos técnicos. |

Las variantes `.light` reemplazan fondos, superficies, bordes y foco sin cambiar el significado de cada token. Los colores regionales (`region-este`, `region-cibao`, `region-sur`, `region-norte`) son etiquetas territoriales, no colores de marca alternativos.

## Reglas de composición

- Mantener `Header` y `Footer` compartidos; una página nueva no debe crear navegación institucional paralela.
- Usar una jerarquía de títulos única y bloques de lectura breves. En guías largas, separar por tareas y permitir saltar a secciones.
- Reutilizar tarjetas por contenido: destino, proveedor, evento, artículo o producto. Las ofertas usan `surface-commercial` y un rótulo de patrocinio/afiliación; lo editorial usa `surface-editorial`.
- El componente compartido `Card` ofrece `variant="editorial"` y `variant="commercial"`; la tienda ya distingue las fichas transaccionales y el panel de operadores mantiene las tarjetas editoriales de gestión.
- Usar iconos de `lucide-react` con un significado funcional claro. No mezclar paquetes de iconos dentro de una misma sección ni usar emoji como único indicador de acción.
- Preferir fotografía propia/licenciada y contextual al territorio; conservar créditos, texto alternativo y recorte que no oculte información importante. Evitar fotos decorativas en fichas transaccionales si no representan el producto.
- Estados hover, foco, seleccionado y deshabilitado deben distinguirse también por forma/texto, no solo por tono. El movimiento respeta `prefers-reduced-motion`.
- Páginas extensas alternan explicación, evidencia útil y acción. No repetir el mismo hero, mosaico de tarjetas o llamada comercial en todas las páginas.

La portada integra `HomeDiscoveryHub` con colecciones estacionales, accesos por región, atajos por tarea, preparación del viaje y un enlace al mapa que no descarga ni monta el mapa hasta navegar. El widget de clima del encabezado identifica sus temperaturas como datos de ejemplo; no se presentan como pronóstico en vivo.

## Aplicación pendiente

La configuración Tailwind y estilos globales ya exponen los tokens, el contenedor usa márgenes responsivos, `Card` separa superficies editoriales/comerciales, `SponsoredBadge` unifica la identificación de patrocinios en fichas de destinos, alojamientos, tours y restaurantes, y el foco/reducción de movimiento tiene una regla base. La tienda y el panel de operadores ya usan variantes explícitas; Blog y Artículo usan `surface-editorial` con `rounded-card`, y el catálogo de tours usa `surface-commercial` con `rounded-card`; falta migrar valores directos heredados, normalizar encabezados/tarjetas en las demás páginas y revisar portal, tienda y paneles con capturas y aprobación editorial de fotografía. La implementación queda parcial hasta completar esa migración y revisión visual por superficie.
