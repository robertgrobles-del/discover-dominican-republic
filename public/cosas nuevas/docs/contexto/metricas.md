# metricas.md — Qué medimos y cómo se cuenta

> Una métrica solo sirve si todos la cuentan igual. Aquí está la definición oficial de cada una.
> Toda medición de usuarios respeta el consentimiento de cookies y la Ley 172-13.

---

## Métrica principal

**Contactos entregados a negocios por mes.** Es lo que justifica que un negocio pague y renueve.

---

## Para negocios (lo que ve el cliente en su panel)

| Métrica | Cómo se cuenta | No cuenta |
|---|---|---|
| **Vistas de ficha** | Una por visitante y ficha cada 30 minutos | Bots, personal del portal, el propio negocio |
| **Contacto por WhatsApp** | Clic en el botón de WhatsApp de la ficha | Clics repetidos del mismo visitante en 24 h |
| **Llamada** | Clic en el botón de llamar | Clics repetidos del mismo visitante en 24 h |
| **Cómo llegar** | Clic en "Cómo llegar" | Clics repetidos del mismo visitante en 24 h |
| **Visita a la web** | Clic en el enlace a la web del negocio | — |
| **Solicitud de reserva o cotización** | Formulario enviado y guardado | Formularios incompletos |
| **Reserva** | Reserva pagada o confirmada | Reservas canceladas antes de la fecha |
| **Contactos totales** | Suma de WhatsApp, llamada, cómo llegar, web y solicitudes | — |
| **Tasa de contacto** | Contactos totales ÷ vistas de ficha | — |

> Estas cifras se muestran al negocio **solo cuando son reales**. Mientras el panel use datos de ejemplo, debe decirlo en pantalla.

---

## Para el portal (tablero interno)

| Área | Métrica | Definición |
|---|---|---|
| Audiencia | Visitantes únicos | Por mes, con consentimiento |
| Audiencia | Visitantes por idioma y país | Idioma del sitio y país aproximado |
| Contenido | Fichas publicadas | Con estado "publicada" |
| Contenido | Fichas completas | Con foto, descripción, horario, contacto y fecha de revisión |
| Contenido | Fichas vencidas | Revisión más antigua que lo que marca `contenido.md` |
| Búsqueda | Búsquedas sin resultados | Términos buscados que no devolvieron nada |
| Negocio | Negocios registrados | Altas aprobadas |
| Negocio | Negocios pagando | Con plan o paquete activo |
| Negocio | Ingreso mensual recurrente | Suma mensual de planes y paquetes activos |
| Negocio | Bajas | Negocios que cancelaron en el mes ÷ negocios pagando al inicio del mes |
| Piloto | Contactos por restaurante del piloto | Mismo cálculo que el panel del negocio |
| Gamificación | Sellos verificados | Solo sellos validados por GPS o QR en el servidor |
| Gamificación | Monedas emitidas y canjeadas | Pasivo pendiente = emitidas − canjeadas − vencidas |
| Redes | Seguidores y alcance | Instagram @descubrerep.dom, por mes |

---

## Reglas

1. **Ninguna cifra inventada ni proyectada se presenta como real.** Las proyecciones se etiquetan como tal.
2. **Se excluyen bots y tráfico interno** en todas las métricas.
3. **Las definiciones no cambian sin registrarlo** en `decisiones.md`, porque cambian las comparaciones.
4. **Las cifras públicas** (pitch, planes, prensa) salen de este tablero, con fecha.
