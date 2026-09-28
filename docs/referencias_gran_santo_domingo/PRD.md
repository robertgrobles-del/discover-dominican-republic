# PRD.md — Descubre República Dominicana

> **Documento de requisitos de producto.** Explica qué se construye, para quién, por qué y cómo se sabe que está bien hecho.
> Versión 1.0 · 2026-09-26 · Responsable: Robert
> Contexto ampliado: [`docs/contexto/`](docs/contexto/README.md) · Estado real de cada módulo: [`docs/contexto/producto.md`](docs/contexto/producto.md)

---

## 1. Resumen

**Descubre República Dominicana** es un portal de turismo y gastronomía que reúne todo lo que un viajero puede hacer en el país (destinos, naturaleza, cultura, dónde comer, dormir y salir, servicios turísticos, movilidad y asistencia) y lo conecta directo con los negocios que lo ofrecen.

Los negocios se registran gratis en su categoría, pueden mejorar su ficha con un plan pagado y pueden pagar por aparecer destacados. El portal gana dinero con planes, paquetes comerciales, publicidad y, más adelante, comisiones por reservas y ventas.

---

## 2. Problema

**Para el viajero**
- La información está repartida entre decenas de páginas, grupos y redes; mucha está vieja o solo en uno o dos idiomas.
- No sabe qué es confiable: negocios cerrados, precios que no coinciden, operadores sin licencia.
- Fuera de los grandes polos (Punta Cana, Santo Domingo) casi no hay información práctica.

**Para el negocio turístico**
- Depende de las OTA y paga comisiones por reservas que podrían ser directas.
- El turista no lo encuentra; termina en el hotel o en el primer lugar que ve.
- No sabe cuántos clientes le llegan por cada canal.
- Tiene poco tiempo y poca capacidad digital.

---

## 3. Objetivos

| # | Objetivo | Cómo se mide | Meta del lanzamiento 1 (propuesta para validar) |
|---|---|---|---|
| O1 | Directorio real y confiable | Fichas publicadas y completas | 500 fichas verificadas; 90 % completas |
| O2 | Contactos reales para los negocios | Contactos entregados por mes (`metricas.md`) | Medición real activa; línea base del piloto |
| O3 | Probar el valor con casos | Restaurantes del piloto con informe | 12 restaurantes y 90 días de datos |
| O4 | Primeros ingresos recurrentes | Negocios pagando | 50 negocios pagando tras el piloto |
| O5 | Confianza del viajero | Datos con fecha de revisión, licencias visibles | 100 % de fichas con fecha de revisión |

## 4. Fuera de alcance del lanzamiento 1

- App nativa en tiendas (la web debe funcionar muy bien en móvil).
- Reservas de hotel con disponibilidad en tiempo real (se enlaza al motor del hotel o a WhatsApp).
- Marketplace abierto a cualquier vendedor (primero la tienda oficial o pocos vendedores invitados).
- Facturación con NCF, sello "Verificado MITUR" y soporte 24/7 hasta que existan de verdad.
- Recorridos 360, realidad aumentada y funciones experimentales.

---

## 5. Usuarios

| Usuario | Qué necesita | Detalle |
|---|---|---|
| **Viajero internacional** | Inspirarse, planificar y confiar | `cliente.md` §9 |
| **Viajero que ya está en RD** | Qué hacer hoy, cerca de mí, abierto ahora | `cliente.md` §9 |
| **Residente (turismo interno)** | Escapadas, restaurantes, planes y ofertas | `cliente.md` §9 |
| **Dueño o gerente de hotel** | Reservas directas y medición | `cliente.md` §1-A/B |
| **Dueño de restaurante** | Que el turista lo encuentre | `cliente.md` §1-C |
| **Operador, agencia o guía** | Ventas directas y licencia visible | `cliente.md` §1-E/F |
| **Editor o moderador del portal** | Cargar, revisar y moderar contenido | §7.6 |
| **Administrador** | Gestionar planes, pagos, usuarios y seguridad | §7.6 |

---

## 6. Principios de producto

1. **Útil antes que bonito.** El dato práctico va primero.
2. **Verdad antes que volumen.** Mejor 500 fichas reales que 5,000 inventadas.
3. **El negocio es el protagonista** en todo lo que ve la empresa.
4. **Contacto directo.** El portal conecta; no se interpone.
5. **Todo el país.** Cada provincia cuenta.
6. **Sin promesas vacías.** Ninguna pantalla promete algo que no existe (`oferta.md` §9).
7. **Móvil primero y en el idioma del usuario.**

---

## 7. Requisitos funcionales

Prioridad: **P0** imprescindible para el lanzamiento 1 · **P1** importante, puede llegar poco después · **P2** posterior.

### 7.1 Directorio y fichas
| ID | Requisito | Prioridad | Criterio de aceptación |
|---|---|---|---|
| F-01 | Fichas por categoría con estructura común y campos propios (`contenido.md`) | P0 | Cada categoría muestra sus campos obligatorios; sin campos vacíos visibles |
| F-02 | Fecha de "Revisado el…" en cada ficha | P0 | Visible y alimentada desde la base de datos |
| F-03 | Botones de WhatsApp, llamada, cómo llegar y web | P0 | Cada clic se registra como contacto (`metricas.md`) |
| F-04 | Precios con moneda explícita (RD$ o US$) | P0 | Ningún precio con "$" solo |
| F-05 | "Abierto ahora" con zona horaria de RD y feriados | P1 | Correcto en días feriados |
| F-06 | Galería de fotos con crédito | P0 | Cada foto tiene autor y licencia |
| F-07 | Reportar dato incorrecto | P1 | El reporte llega a la bandeja de moderación |
| F-08 | Fichas en 6 idiomas con respaldo al español | P0 | Nunca se muestra una clave de traducción sin texto |

### 7.2 Búsqueda y descubrimiento
| ID | Requisito | Prioridad | Criterio de aceptación |
|---|---|---|---|
| B-01 | Búsqueda global con autocompletado | P0 | Resultados agrupados por categoría en menos de 300 ms |
| B-02 | Filtros por provincia, categoría, precio y abierto ahora | P0 | Los filtros se reflejan en la URL |
| B-03 | Mapa con capas por categoría | P1 | Pines agrupados; se puede usar con teclado |
| B-04 | "Cerca de mí" | P1 | Solo con permiso de ubicación; funciona sin él con búsqueda manual |
| B-05 | Búsquedas sin resultados registradas | P1 | Visibles en el panel de admin |

### 7.3 Cuentas del viajero
| ID | Requisito | Prioridad | Criterio de aceptación |
|---|---|---|---|
| U-01 | Registro e inicio de sesión reales (correo verificado y Google) | P0 | Contraseña incorrecta = acceso denegado; correo verificado antes de usar funciones sensibles |
| U-02 | Favoritos sincronizados | P1 | Persisten entre dispositivos |
| U-03 | Reseñas con moderación | P1 | Nunca se autoverifican; el negocio puede responder, no ocultar |
| U-04 | Mi viaje e itinerarios | P2 | Guardar y compartir |
| U-05 | Exportar y eliminar mi cuenta (Ley 172-13) | P0 | Disponible desde el perfil |

### 7.4 Empresas
| ID | Requisito | Prioridad | Criterio de aceptación |
|---|---|---|---|
| E-01 | Alta de establecimiento con revisión | P0 | La solicitud se guarda, el solicitante recibe correo y aparece en la bandeja del admin |
| E-02 | "Reclama tu ficha" con verificación de propiedad | P0 | Se guarda de verdad; se verifica por un canal del negocio (teléfono o correo publicados) |
| E-03 | Formulario de anunciantes (`/partners`) | P0 | El lead se guarda y notifica al equipo; nunca se muestra "enviado" sin guardar |
| E-04 | Planes: Básica, Premium, Destacado | P0 | Beneficios coinciden con `oferta.md`; lo que no existe se marca "Próximamente" |
| E-05 | Pago recurrente de planes | P0 | Por la pasarela; el plan solo se activa por el webhook confirmado |
| E-06 | Panel de empresa con contactos reales | P0 | Si no hay datos reales, el panel lo dice |
| E-07 | Edición de ficha por el negocio con aprobación | P1 | Los cambios quedan pendientes hasta que el admin los apruebe (o el negocio es de confianza) |
| E-08 | Destacados con fecha de inicio y fin | P1 | Se apagan solos al vencer |
| E-09 | Informe mensual por correo | P1 | Lo recibe el dueño del plan cada mes |

### 7.5 Gamificación
| ID | Requisito | Prioridad | Criterio de aceptación |
|---|---|---|---|
| G-01 | Pasaporte con sellos verificados por GPS o QR en el servidor | P1 | Radio de 300 m, precisión mínima de 150 m, rechazo de desplazamientos imposibles |
| G-02 | Monedas y XP solo por reglas del servidor, con topes diarios | P1 | Ningún cliente puede fijar sus propias monedas |
| G-03 | Canje de premios con saldo, nivel y stock validados en el servidor | P1 | Operación atómica; código único |
| G-04 | Reglamento, valor y caducidad de monedas publicados | P1 | Página de reglamento enlazada desde el pasaporte |

### 7.6 Administración
| ID | Requisito | Prioridad | Criterio de aceptación |
|---|---|---|---|
| A-01 | Roles reales (admin, editor, moderador, finanzas, soporte) | P0 | Verificados en el servidor; MFA obligatorio para el personal |
| A-02 | CMS con borrador, revisión y publicación | P0 | Historial de versiones |
| A-03 | Bandeja única de moderación (reseñas, fotos, reclamos, leads, altas) | P1 | Cada elemento tiene estado y responsable |
| A-04 | Registro de auditoría | P0 | Toda acción sensible queda registrada |

### 7.7 Tienda y reservas (lanzamiento 2)
| ID | Requisito | Prioridad | Criterio de aceptación |
|---|---|---|---|
| T-01 | Checkout con la pasarela (sin campos de tarjeta propios) | P2 | Precio calculado en el servidor; pedido "pagado" solo por webhook |
| T-02 | Reservas de excursiones con depósito | P2 | Disponibilidad y cancelación visibles antes de pagar |

---

## 8. Requisitos no funcionales

| Área | Requisito |
|---|---|
| **Rendimiento** | LCP < 2.5 s en móvil 4G en las páginas principales; imágenes en WebP en varios tamaños |
| **SEO** | Páginas públicas indexables (prerender o SSR), sitemap, hreflang, datos estructurados por tipo |
| **Idiomas** | es, en, fr, de, it, pt; sin claves duplicadas; respaldo al español |
| **Accesibilidad** | WCAG 2.1 AA: contraste, teclado, textos alternativos, foco visible |
| **Seguridad** | Validación en el servidor, roles en el servidor, límites de tasa, cabeceras seguras, sin secretos en el frontend (`docs/BACKEND_SEGURIDAD.md`) |
| **Privacidad** | Ley 172-13: consentimiento, exportación, eliminación, retención definida |
| **Disponibilidad** | Monitoreo con alertas; respaldos verificados (`docs/BACKEND_OPERACION.md`) |
| **Calidad** | CI con tipos, lint, pruebas y build en cada push a `dev` y `main` |

---

## 9. Lanzamientos

| Lanzamiento | Contenido | Condición de salida |
|---|---|---|
| **0. Estabilizar** | Arreglar el build, traer `main` a `dev`, corregir la migración de seguridad, CI del frontend | El proyecto compila y pasa pruebas en CI |
| **1. Base real** | F-01 a F-08, B-01, B-02, U-01, U-05, E-01 a E-06, A-01, A-02, A-04 | 500 fichas reales; contactos medidos; formularios que guardan de verdad |
| **1.1 Piloto** | Informe de piloto, E-07 a E-09, B-03 a B-05, U-02, U-03 | 12 restaurantes con 90 días de datos |
| **2. Transacción** | T-01, T-02, gamificación completa (G-01 a G-04) | Primeras reservas y ventas cobradas por el portal |
| **3. Escala** | Mercados internacionales, alianzas institucionales, app | Tráfico relevante de los mercados emisores |

---

## 10. Dependencias

- Decisión del backend definitivo (`decisiones.md` P1).
- Pasarela de pago y cuenta comercial.
- Contenido real: fichas, fotos con licencia y traducciones revisadas.
- Integración con SIGTUR (para el sello de verificación).

## 11. Riesgos

Ver `negocio.md` §10. El principal: vender antes de tener resultados medidos.

## 12. Preguntas abiertas

Ver `decisiones.md` → Pendientes (P1 a P8).
