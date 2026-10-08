# 🇩🇴 Descubre República Dominicana — Portal Turístico Inteligente & Ecosistema Digital

Bienvenido al repositorio oficial de **Descubre República Dominicana**, la plataforma digital líder y ecosistema turístico inteligente diseñado para conectar a viajeros, turistas locales e internacionales con las maravillas culturales, gastronómicas, ecológicas y hoteleras de la República Dominicana.

---

## 🌟 1. Resumen Ejecutivo del Ecosistema

El proyecto es una **Single Page Application (SPA / PWA)** de alto rendimiento construida con **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, **Radix UI / shadcn/ui** y **Framer Motion**, conectada a un backend de alto desempeño en **Fastify 5 + PostgreSQL 16**.

El portal abarca **258 páginas y 316 rutas**, con una API de **1 013 operaciones**, integrando:
1. **Directorio Turístico Nacional Exhaustivo:** Cobertura de las 32 provincias y Distrito Nacional, destinos principales, municipios, playas, ríos, montañas, áreas protegidas y parques nacionales.
2. **Alojamientos, Resorts & Villas:** Directorio de resorts todo incluido, hoteles boutique, eco-lodges, villas privadas y apartamentos con reservas directas y sin comisiones abusivas.
3. **Ecosistema B2B & Portal de Operadores (`/para-empresas`, `/operadores`, `/operadores/panel`):** Vitrinas comerciales (*storefronts*), catálogo de excursiones, autogestión de tarifas, creación de retos patrocinados y gestión de estancias para creadores de contenido.
4. **Gamificación, Pasaporte Digital & Club de Recompensas (`/pasaporte-digital`, `/club-recompensas`):** Pasaporte digital interactivo con sellos por provincia, puntos XP, misiones en vivo, canje de recompensas y programa de embajadores.
5. **Tienda Oficial & Comercio Autóctono (`/tienda`):** Souvenirs auténticos, artesanías dominicanas, café de altura y productos certificados con carrito global persistente y checkout.
6. **Gastronomía, Rutas del Sabor & Vida Nocturna:** Guía culinaria de platos típicos, recetario criollo interactivo, chefs galardonados, rutas del cacao, café, tabaco y ron, y directorio nocturno a 100vh.
7. **Salud, Farmacias 24h & Asistencia al Viajero (`/salud-24h`):** Fichas técnicas de hospitales, clínicas odontológicas, laboratorios y farmacias de turno con geolocalización, seguros/ARS aceptadas y botón directo de urgencias POLITUR 911.
8. **Herramientas Inteligentes para el Viajero (Smart Travel Utilities):** Planificador con IA, itinerarios sugeridos, calculadora de presupuesto, calculadora de peajes, conversor de divisas, sargazo en vivo, estado de playas, eSIM Dominicana 5G y audioguías accesibles.
9. **Motor Publicitario (Ad Server Propio):** Soporte de 32 formatos IAB e interactivos, incluyendo banners de pantalla completa (*Full-Width* 1920x250), rascacielos (*skyscrapers*), popups y espacios nativos en el mega menú.
10. **Panel Administrativo Centralizado (`/admin`):** Gestión y moderación de contenido, analíticas en tiempo real (CTR, visualizaciones y clics), módulo de gamificación y patrocinios, consola de stock y moderación de contenido generado por usuarios (UGC).

---

## 🏛️ 2. Arquitectura Técnica y Stack Tecnológico

| Capa / Módulo | Tecnologías Utilizadas |
| :--- | :--- |
| **Frontend Web** | React 18 (Hooks, Suspense, Lazy Loading) + Vite |
| **Lenguaje** | TypeScript 5 (tipado estricto en datos y contratos de API) |
| **Estilos & UI** | Tailwind CSS + Radix UI + shadcn/ui + Lucide Icons |
| **Animaciones** | Framer Motion (transiciones fluidas optimizadas) |
| **Gestión de Estado & Cache** | TanStack Query v5 + Context API (`useAuth`, `useCart`, `useFavorites`, `useI18n`) |
| **Backend API** | Fastify 5 + TypeScript + Zod (validación de esquemas y OpenAPI / Swagger) |
| **Base de Datos** | PostgreSQL 16; migraciones SQL versionadas en `backend/migrations/` |
| **API actual** | Monolito modular Fastify 5 + Zod; auth, JWT/JWKS, roles y TOTP en `backend/` |
| **Arquitectura objetivo** | Microservicios por dominio con despliegue, contratos y propiedad de datos definidos por servicio |
| **Enrutamiento** | React Router v6 |
| **Mapas & Geolocalización** | Leaflet (`react-leaflet`) + `leaflet.markercluster` + Google Maps API |
| **Pruebas Automatizadas** | Vitest (frontend) + Vitest (backend sobre PostgreSQL) |
| **Internacionalización** | Sistema nativo i18n extensible (Español / Inglés) |

---

## 🧭 3. Catálogo Exhaustivo de Módulos y Puntos del Portal

### 🗺️ 1. Territorio, Provincias y Destinos
- **Destinos Principales & Regiones:** `/destinos`, `/destinos/regiones`, `/destinos/region/:regionId`, `/destinos/categoria/:categoriaId`, `/destinos/:id` (Punta Cana, Santo Domingo, Samaná, Puerto Plata, Jarabacoa, Barahona, Montecristi, etc.).
- **Actividades por destino:** `/destino/:slug/actividades` (todas las actividades de un destino, con filtro por categoría; la sección «Lo que no te puedes perder» de cada destino muestra las categorías que tienen actividades publicadas).
- **32 Provincias & Municipios:** `/provincias`, `/provincias/:slug`, `/municipio/:slug` (cobertura total de provincias con datos históricos, municipios, atractivos y gastronomía local).
- **Playas y Ríos:** `/playas`, `/playa/:id`, `/rios`, `/rio/:id` (directorio hidrográfico con nivel de oleaje, tipo de arena, accesos, seguridad y mapas).
- **Montañas y Senderismo:** `/montanas`, `/montana/:id`, `/pico-duarte` (guías de alta montaña, altimetría, temperaturas medias y recomendaciones de senderismo).
- **Áreas Protegidas y Reservas:** `/areas-protegidas`, `/reservas-naturales`, `/parque-nacional/:id`, `/cueva/:id` (fauna endémica, cuevas taínas, normativas ecológicas y senderos).
- **Mapas y Georreferenciación:** `/mapa-interactivo`, `/mapas-tematicos`, `/mapa-misiones` (mapas con Leaflet, clusters y filtros por categoría).

### 🏨 2. Alojamientos, Hospitalidad & Bienestar
- **Hoteles y Resorts:** `/alojamientos`, `/alojamiento/:id` (resorts all-inclusive, hoteles boutique y eco-lodges con fichas de habitaciones, amenidades y reservas).
- **Airbnb y Estancias Vacacionales:** `/airbnb/:id` (apartamentos, villas y chalets con normas, capacidad y fotos de alta resolución).
- **Comparador de Hoteles:** `/comparador-hoteles` (comparativa interactiva de características, tarifas estimadas y amenidades).
- **Spas, Retiros y Bienestar:** `/spas-wellness`, `/wellness`, `/spa/:id` (circuitos hidrotermales, masajes y centros de relajación).
- **Manantiales y Aguas Termales:** `/aguas-termales` (inventario hidrotermal con propiedades minerales y ubicación).

### 🍽️ 3. Gastronomía, Rutas del Sabor y Vida Nocturna
- **Guía Culinaria & Restaurantes:** `/guia-gastronomica`, `/restaurantes`, `/restaurante/:id` (fichas detalladas con cartas de menú, especialidades, rangos de precio y reservas).
- **Perfiles de Chefs Destacados:** `/chef/:id` (biografía culinaria, creaciones emblemáticas y restaurantes asociados).
- **Recetario Tradicional Dominicano:** `/recetas`, `/receta/:id` (ingredientes con calculadora interactiva de porciones, instrucciones paso a paso e historia del plato).
- **Identificador de Platos Típicos:** `/identificador-comida` (buscador inteligente y visual de platos tradicionales dominicanos).
- **Vida Nocturna y Bares:** `/vida-nocturna`, `/bar/:id`, `/bebidas-rd` (discotecas, lounges, coctelería tropical, mamajuana y rones con layout inmersivo a 100vh).
- **Rutas Agro-Gastronómicas:** `/rutas-sabor`, `/cultura-cafe`, `/cultura-tabaco`, `/ruta-ron-tabaco`, `/ruta-larimar`, `/suscripciones-sabores`.

### 🏛️ 4. Cultura, Historia, Tradiciones y Folclore
- **Monumentos y Museos:** `/patrimonio`, `/museos-monumentos`, `/cultura` (joyas de la Ciudad Colonial de Santo Domingo, fortalezas y museos).
- **Historia Dominicana:** `/historia`, `/historia/:slug`, `/historia-rd`, `/personaje-historico/:id`, `/evento-historico/:id` (línea cronológica desde la época prehispánica taína hasta la República contemporánea).
- **Historia Viva en Realidad Aumentada:** `/historia-viva-ar` (experiencia interactiva con reconstrucciones patrimoniales).
- **Carnaval & Ritmos Nacionales:** `/carnaval`, `/escuela-ritmos` (caretas tradicionales, personajes carnavalescos, merengue, bachata y son).
- **Turismo Religioso:** `/turismo-religioso`, `/destino-religioso/:id` (Basílica Catedral Nuestra Señora de la Altagracia, Santo Cerro e iglesias históricas).
- **Glosario e Idioma:** `/diccionario-dominicano`, `/espanol-viajero`, `/guia-etiqueta` (dominicanismos, modismos y normas de cortesía cultural).

### 🏥 5. Asistencia, Salud 24 Horas & Seguridad al Viajero
- **Salud y Clínicas 24 Horas:** `/salud-24h`, `/centro-salud/:id` (hospitales de trauma, clínicas turísticas, farmacias 24h, laboratorios y dentistas con ARS/seguros aceptados y botón de llamada de urgencia).
- **Seguridad y Contactos de Emergencia:** `/contactos-emergencia`, `/leyes-turista`, `/info-seguridad` (POLITUR, 911, asistencia vial de MOPC y marco legal para visitantes extranjeros).
- **Cuerpo Diplomático:** `/embajadas-consulados` (directorio de embajadas y consulados extranjeros en República Dominicana).
- **Asistencia Médica y Seguros:** `/seguro-viaje` (guía de pólizas de viaje y coberturas para repatriación o emergencias médicas).

### ✈️ 6. Movilidad, Transporte, Vuelos, Puertos y Migración
- **Directorio de Vuelos & Aerolíneas:** `/vuelos-aerolineas`, `/aerolineas`, `/rutas-aereas` (rutas sin escalas, aerolíneas dominicanas como Arajet y Air Century, y aerolíneas internacionales con tiempos de vuelo).
- **Aeropuertos Internacionales:** `/aeropuerto`, `/aeropuerto/:slug` (terminales de Punta Cana PUJ, Las Américas SDQ, Cibao STI, Puerto Plata POP, vuelos en vivo y traslados oficiales).
- **Puertos de Cruceros y Marinas:** `/puertos-marinas`, `/puerto/:slug`, `/marina/:slug` (Amber Cove, Taino Bay, Port Cabo Rojo, Sans Souci, La Romana y guías *"Qué hacer en 8 horas de escala"*).
- **Transporte Masivo y Terrestre:** `/transporte-urbano`, `/metro-santo-domingo`, `/teleferico-santo-domingo`, `/monoriel-santiago`, `/seguridad-vial`.
- **Renta de Vehículos & Traslados:** `/rent-a-car`, `/alquiler-vehiculos` (flota, requisitos para extranjeros, cobertura de colisión y peajes).
- **Trámites de Entrada al País:** `/e-ticket`, `/requisitos-viaje`, `/aduanas`, `/zonas-horarias`.

### 🧰 7. Herramientas Prácticas para el Viajero (Smart Travel Utilities)
- **Asistente Inteligente e Itinerarios con IA:** `/itinerario-ia`, `/planifica`, `/itinerarios-recomendados`, `/planificador-grupal`.
- **Calculadoras y Finanzas:**
  - Calculadora de Presupuesto de Viaje: `/calculadora-presupuesto`
  - Calculadora de Peajes: `/calculadora-peajes` (cálculo por tramos de autopistas dominicanas)
  - Precios de Combustibles: `/precios-combustible` (actualizaciones semanales oficiales)
  - Conversor de Divisas: `/conversor-moneda`, `/tasas-cambio` (tasa del Banco Central y divisas turísticas)
  - Calculadoras de Inversión y CONFOTUR: `/calculadora-tributaria`, `/calculadora-confotur` (incentivos fiscales ley 158-01)
  - Calculadora de Huella de Carbono: `/calculadora-carbono`
- **Condiciones Ambientales en Vivo:**
  - Observatorio de Sargazo: `/observatorio-sargazo` (monitoreo costero y estado de playas)
  - Reporte de Olas y Viento: `/reporte-olas-viento`, `/estado-playas`
  - Webcams en Directo: `/webcams`
  - Clima y Temporadas Turísticas: `/clima-temporadas`
- **Logística del Viajero:** `/lista-empaque`, `/check-in-digital`, `/conectividad`, `/esim-turista`, `/tarjeta-prepago`.
- **Inclusión y Accesibilidad:** `/audio-guias`, `/silent-guide` (guías accesibles para personas con discapacidad visual o auditiva), `/accesibilidad`.

### 🏄 8. Turismo de Nicho, Deportes y Segmentos
- **Viajeros con Necesidades Especiales:** `/viajera-sola`, `/familia-con-ninos`, `/viajeros-senior`, `/viajar-con-mascotas`, `/guia-lgbtq`, `/guia-vegana`, `/guia-halal-kosher`.
- **Deportes y Aventura:** `/turismo-deportivo`, `/golf-rd` (circuitos PGA Teeth of the Dog, Punta Espada, Corales), `/turismo-buceo`, `/avistamiento-aves`, `/avistamiento-ballenas` (ballenas jorobadas en Samaná), `/astroturismo`, `/lidom` (béisbol invernal dominicano con estadios `/estadio/:id`).
- **Sostenibilidad y Comunidad:** `/sostenible`, `/turismo-comunitario`, `/volunturismo`, `/guardian-caribe`, `/vive-local`.
- **Eventos MICE, Bodas y Negocios:** `/mice`, `/bodas`, `/mice-bodas`, `/eventos-grupo`, `/turismo-medico`, `/clinica/:id`.
- **Nómadas Digitales e Inversión:** `/nomadas-digitales`, `/bienes-raices`, `/inversion`, `/proyectos-inversion`.

### 📰 9. Medios, Editorial, Agenda y Comunidad
- **Revista y Artículos de Tendencia:** `/revista`, `/blog`, `/articulo/:id`.
- **Calendario y Eventos Culturales:** `/eventos`, `/evento/:id`, `/calendario-mensual`, `/eventos-vivo`.
- **Contenido Social y Multimedia:** `/rd-social`, `/feed-social`, `/podcast-rd`, `/tours-360`, `/rd-en-movimiento`, `/cine-rd`.
- **Comunidad de Creadores:** `/concursos-fotografia`, `/programa-creadores`, `/contratar-influencers`, `/autor-invitado`, `/diario-viaje`.
- **Red de Talento Local:** `/guias-locales`, `/fotografos-locales`.

---

## 🏢 4. Portal para Empresas y Operadores Turísticos (`/para-empresas` & `/operadores/panel`)

El ecosistema B2B está concebido para empoderar a la industria turística dominicana (hoteles, tour operadores, restaurantes, transportistas y guías certificados), permitiéndoles comercializar sus servicios de manera directa:

### 1. Flujo de Reclamo y Verificación (*Claim & Verify*)
- Cada ficha pública en el portal incluye el botón interactivo **"¿Eres el propietario? Reclama tu ficha"** (`ClaimBusinessModal`).
- Proceso formal de validación mediante **RNC**, datos fiscales y **Licencia Oficial MITUR / SIGTUR**.
- Una vez verificado, el operador obtiene el Sello Oficial de Calidad y acceso a su consola de autogestión.

### 2. Panel de Autogestión del Operador (`/operadores/panel`)
- **Perfil Comercial & Vitrina (*Storefront*):** Edición de descripción, logotipos, fotos en alta resolución, redes sociales y contacto directo vía WhatsApp y teléfono.
- **Catálogo de Servicios & Excursiones:** Publicación de tours con itinerarios, idiomas, puntos de encuentro, elementos incluidos/excluidos y políticas de cancelación.
- **Gestión de Tarifas & Disponibilidad:** Control de precios por adulto/niño, descuentos por temporada y cupos por salida.
- **Buzón de Reservas & Leads en Vivo:** Recepción de solicitudes de cotización directa sin comisiones de intermediarios.

### 3. Módulo de Retos & Recompensas Patrocinadas (`/operadores/panel/recompensas`)
- Las empresas pueden crear y patrocinar **Premios y Retos** para turistas en el portal:
  - Creación de cupones de descuento, *day passes*, cócteles de bienvenida o tours de cortesía.
  - Asignación de costo en puntos/monedas para el **Club de Recompensas** del usuario.
  - Definición de retos geolocalizados (ej. *"Visita nuestro restaurante en la Zona Colonial y haz check-in para ganar 150 monedas"*).
  - Trazabilidad y validación de códigos de canje presentados por los turistas en el establecimiento.

### 4. Módulo de Estancias para Creadores de Contenido (`/operadores/panel/estancias`)
- Los establecimientos (hoteles, resorts y eco-lodges) pueden publicar **ofertas de estancias gratuitas o patrocinadas** para influencers:
  - Requisitos por nivel de creador (seguidores mínimos, engagement rate, nicho de audiencia).
  - Paquete ofrecido (noches de hospedaje, todo incluido, traslados o actividades).
  - Entregables exigidos (ej. *1 Reel de Instagram + 1 Video de TikTok + 5 Fotos en 4K*).
  - Recepción y aprobación de postulaciones de creadores verificados.
  - Invitación directa a creadores específicos desde el directorio de talento.

### 5. Escalera de Planes Comerciales para Empresas
| Beneficio / Característica | Plan Básico (Gratis) | Plan Premium ($39–$49/mes) | Plan Destacado Exclusivo ($149–$189/mes) |
| :--- | :---: | :---: | :---: |
| **Ficha pública en el directorio nacional** | ✅ | ✅ | ✅ |
| **Datos de contacto, dirección y mapa GPS** | ✅ | ✅ | ✅ |
| **Fotografías y galerías** | Hasta 3 fotos | Ilimitadas en HD | Ilimitadas + Video Tour 4K |
| **Botón de contacto directo a WhatsApp / Llamada** | ❌ | ✅ (1 clic sin intermediarios) | ✅ (Prioritario) |
| **Catálogo de servicios autogestionable** | ❌ | ✅ Completo | ✅ Completo + Destacados |
| **Sello oficial "Verificado MITUR"** | ❌ | ✅ (Con validación de licencia) | ✅ (Dorado Prominente) |
| **Métricas de leads (WhatsApp, Tel, GPS)** | ❌ | ✅ Panel en tiempo real | ✅ + Reporte de Demanda Trimestral |
| **Posicionamiento #1 en su categoría** | ❌ | ❌ | ✅ (Cupo limitado por destino) |
| **Banners publicitarios incluidos** | ❌ | ❌ | ✅ (Billboard 980x120 & Skyscraper) |
| **Creación de Retos y Estancias para Creadores** | ❌ | ✅ | ✅ (Destacadas en Home y App) |
| **Facturación fiscal dominicana con NCF** | ❌ | ✅ | ✅ |

---

## 🎮 5. Sistema de Gamificación, Pasaporte Digital & Recompensas

El sistema de gamificación de Descubre RD transforma la experiencia del turista en un juego interactivo de exploración cultural:

### 1. Pasaporte Digital de 32 Provincias (`/pasaporte-digital`)
- Sellos digitales coleccionables por cada una de las 32 provincias y Distrito Nacional.
- Validación de visitas mediante geolocalización GPS, escaneo de códigos QR en puntos turísticos o check-in interactivo.
- Progreso porcentual del país explorado con insignias (*badges*) de explorador.

### 2. Puntos de Experiencia (XP), Niveles & Ranking
- Sistema de acumulación de XP por cada acción: visitar destinos, completar misiones, escribir reseñas verificadas, participar en trivias culturales o subir fotos.
- Niveles de explorador: *Turista Curioso*, *Aventurero Criollo*, *Explorador Maestro* y *Embajador Dominicano*.
- Tablas de clasificación (*Leaderboards*) mensuales con reconocimientos oficiales.

### 3. Misiones & Retos en Vivo (`/gamificacion-turistica/retos`)
- Misiones temáticas: *Ruta Taína*, *Explorador del Cacao*, *Conquistador de Cascadas*, *Gourmet Dominicano*, *Top 100 Atractivos*.
- Retos diarios y de fin de semana con multiplicadores de puntos y recompensas especiales.

### 4. Club de Recompensas Patrocinadas (`/club-recompensas`)
- Catálogo interactivo donde los usuarios canjean sus monedas/XP ganadas por premios reales ofrecidos por empresas aliadas:
  - *Day passes* en resorts todo incluido.
  - Descuentos en excursiones y buggies.
  - Cenas de cortesía y cócteles de autor en restaurantes asociados.
  - Souvenirs oficiales y productos artesanales en la tienda.

### 5. Portal de Creadores & Estancias (`/creadores` & `/estancias-creadores`)
- Plataforma donde creadores de contenido e influencers turísticos pueden:
  - Explorar estancias publicadas por hoteles en todo el país.
  - Postular a hospedajes de cortesía enviando su propuesta de contenido y métricas.
  - Aceptar invitaciones directas de establecimientos turísticos.
  - Subir entregables multimedia y contratos de cesión de derechos con trazabilidad legal.

### 6. Consola de Administración de Gamificación (`/admin` -> Pestaña Gamificación)
- Los administradores del portal pueden:
  - Crear y editar misiones, retos y trivias culturales.
  - Monitorear y aprobar las recompensas creadas por las empresas.
  - Supervisar las aplicaciones de estancias para creadores y resolver disputas.
  - Analizar métricas de engagement, sellos otorgados y redenciones de premios.

### 7. Panel de Administración (`/admin`)

Navegación por barra lateral con buscador y cinco grupos. Cada cuenta ve solo las secciones que le permiten sus capacidades; sin ninguna, el panel muestra acceso denegado. Con sesión real (`VITE_AUTH_SOURCE=api`) estas secciones leen y escriben en el backend:

| Grupo | Secciones |
| :--- | :--- |
| Visión general | Dashboard con pendientes de moderación, analítica web, indicadores y finanzas, NPS |
| Editorial y catálogo | CRUD de las colecciones del catálogo con traducciones, editorial y magazine, contenido del sitio, páginas fijas, rutas gamificadas, generador con IA |
| Comunidad y operadores | Usuarios y roles (suspensión, XP, historial), negocios y operadores (verificación), reservas directas de todo el sistema, aprobaciones, campañas de creadores, moderación |
| Comercio y fidelización | Gamificación y pasaporte, envíos de premios, tienda, loterías y tasas |
| Sistema | Importación de establecimientos y de colecciones, bitácora de auditoría, auditoría de accesos |

El simulador de banners es una maqueta y solo aparece con datos de demostración.

---

## 📦 6. Tipos de Contenido Gestionados en la Plataforma

| Tipo de Contenido | Estructura & Datos Principales | Ejemplos Representativos |
| :--- | :--- | :--- |
| **Destinos Turísticos** | Nombre, provincia, coordenadas GPS, mejor temporada, galería 4K, atractivos destacados, tips de seguridad y etiquetas de accesibilidad. | Punta Cana, Bahía de las Águilas, Cayo Arena, Las Terrenas. |
| **Fichas de Alojamiento** | Tipo (resort all-inclusive, boutique, eco-lodge, villa), estrellas, amenidades, habitaciones, precios y reservas directas. | Casa de Campo, Tortuga Bay, Eden Roc Cap Cana, Camp David. |
| **Fichas Médicas 24h** | Nombre, especialidad (hospital, farmacia 24h, odontología), guardia 24/7, teléfono `tel:`, ruta en Maps, idiomas y ARS/seguros. | CEDIMAT, HOMS, Hospiten Bávaro, Centro Médico Punta Cana. |
| **Restaurantes & Bares** | Especialidad gastronómica, precios ($ a $$$$), carta de menú con precios, cócteles, opciones veganas y fotos. | Pat'e Palo, Mesón de Bari, SBG, Buche Perico. |
| **Recetas Criollas** | Ingredientes con reescalado dinámico de porciones, tiempo, dificultad, pasos ilustrados e historia del plato. | Mangú con los tres golpes, Sancocho 7 carnes, Pescado de Boca Chica. |
| **Excursiones y Tours** | Itinerario por horas, operador verificado, recogida, idiomas, elementos incluidos, políticas de cancelación y tarifas. | 27 Charcos de Damajagua, Excursión Isla Saona VIP, Buggies Macao. |
| **Productos de Tienda** | Fotos multieje, artesano productor, origen certificado, precio en DOP/USD, variantes y control de inventario. | Joyería en Larimar y Ámbar, Café orgánico, Muñecas Limé. |
| **Banners Publicitarios** | 32 formatos IAB y nativos, URL de destino, telemetría de impresiones visibles y clics únicos, modo rotativo o fijo. | Billboard 980x120, Full-Width 1920x250, Skyscraper 120x600. |
| **Retos & Recompensas** | Título, empresa patrocinadora, provincia, costo en monedas/XP, cupo de canjes, requisitos y código de verificación. | Day Pass en Punta Cana, 20% off en Buggies, Cóctel de Bienvenida. |
| **Estancias de Creadores** | Hotel/resort anfitrión, noches incluidas, requisitos de audiencia, entregables solicitados y estado de postulación. | 3 Noches All-Inclusive en Samaná, Fin de Semana Eco-Lodge Jarabacoa. |
| **Indicadores en Vivo** | Nivel de sargazo (bajo, moderado, severo), oleaje, viento en nudos y banderas de seguridad en playas. | Costas de Punta Cana, Playa Dorada, Cabarete Kitesurf. |
| **Artículos & Revista** | Título, autor, tiempo de lectura, contenido Markdown, galerías y metadatos OpenGraph SEO. | Revista Descubre RD, crónicas de viaje y reportajes de temporada. |

---

## 💰 7. Modelos de Ingresos y Vías de Monetización (21+ Formas de Generar Ingresos)

El portal cuenta con una arquitectura de monetización diversificada y escalable que abarca 21 vías de generación de ingresos:

1. **Suscripciones para Empresas y Operadores Turísticos (`/para-empresas`):** Planes mensuales y anuales (Básico Gratis, Premium a $39-$49/mes, Destacado Exclusivo a $149-$189/mes) con facturación fiscal dominicana (NCF).
2. **Motor Publicitario Display (Ad Server Propio):** Comercialización de 32 formatos IAB (Billboard, Full-Width 1920x250, Skyscraper, Mobile Sticky, Banners en Mega Menú) con medición de impresiones y CTR.
3. **Posiciones Patrocinadas en Búsqueda & Directorios:** Subasta y rotación ponderada de establecimientos en los primeros resultados de búsqueda y categorías (`/sponsorship/serve/search_top`).
4. **Retos y Misiones Gamificadas Patrocinadas:** Cobro a marcas y empresas por crear misiones geolocalizadas que dirigen tráfico físico a sus instalaciones.
5. **Club de Recompensas & Cuponera Comercial:** Tarifa por publicación y comisión por redención de cupones y premios promocionales de empresas aliadas.
6. **Marketplace & Comisiones por Excursiones Directas (`/marketplace`):** Comisión porcentual transparente sobre reservas de tours y actividades procesadas en la plataforma.
7. **Tienda Oficial de Souvenirs & Artesanías (`/tienda`):** Margen de ganancia directo sobre la venta de artesanías criollas, larimar, ámbar, café de altura y merchandising oficial.
8. **Afiliación y Venta de Asistencia Médica / Seguros de Viaje (`/seguro-viaje`):** Comisión por cotización y emisión inmediata de pólizas internacionales de asistencia turística.
9. **Conectividad Móvil y Venta de eSIMs Dominicanas 5G (`/esim`):** Comisión recurrente por venta de planes de datos móviles prepago para turistas al aterrizar.
10. **Tarjeta Prepago y Descuentos Turísticos (RD Pass):** Tarifa de emisión y comisiones por uso en la red de comercios y transporte afiliados.
11. **Ticketing & Venta de Entradas para Eventos Culturales y Deportivos:** Comisión por emisión de boletos con QR criptográfico para conciertos, festivales y partidos de béisbol invernal (LIDOM).
12. **Plataforma de Matching para Creadores & Estancias:** Fee de servicio cobrado a hoteles por la intermediación y gestión contractual de campañas con influencers verificados.
13. **API B2B de Inteligencia Turística y Datos Agregados:** Suscripción mensual para agencias, inversionistas y cadenas hoteleras para acceder a analíticas de demanda, tendencias y búsquedas (`/api/v1/b2b/analytics/aggregate`).
14. **Publi-reportajes y Contenido Patrocinado en la Revista Oficial:** Venta de artículos editoriales dedicados, reportajes fotográficos y menciones en el podcast oficial de Descubre RD.
15. **Campañas de Email Marketing y Newsletters Segmentadas:** Inserción de banners y promociones destacadas en el boletín turístico enviado a viajeros registrados.
16. **Notificaciones Push Patrocinadas por Geolocalización:** Envío de alertas y ofertas promocionales en tiempo real a turistas cuando ingresan a una provincia o destino específico.
17. **Sello Oficial "Verificado MITUR" & Auditoría de Calidad:** Tarifa administrativa por el proceso de inspección, verificación documental y otorgamiento del distintivo de confianza.
18. **Paquetes Turísticos Dinámicos Multidestino:** Margen comercial por la combinación inteligente de vuelos, alojamientos y excursiones en un solo paquete.
19. **Membresía Anual Pasaporte RD VIP:** Suscripción para viajeros frecuentes con acceso a descuentos exclusivos, concierge digital y multiplicador x2 en puntos XP.
20. **Licenciamiento de Activos Audiovisuales:** Venta de licencias de uso comercial del banco oficial de fotografías 4K y videos de destinos dominicanos para agencias y productoras.
21. **Asesoría de Inversión y Trámites CONFOTUR:** Honorarios por servicios de orientación e intermediación para desarrollos turísticos acogidos a la Ley de Incentivo Turístico 158-01.

---

## 🛠️ 8. Instalación y Ejecución Local

### Prerrequisitos
- **Node.js** v22 o superior y **npm** v9 o superior
- **Docker Desktop** (PostgreSQL, Redis, PgBouncer y Mailpit de desarrollo)

### Pasos

```bash
# 1. Clonar e instalar
git clone https://github.com/robertgrobles-del/discover-dominican-republic.git
cd "Descubre RD"
npm install
npm --prefix backend install

# 2. Variables de entorno: copiar .env.example a .env (sitio) y backend/.env.example a backend/.env (API)

# 3. Servicios de desarrollo (PostgreSQL en el puerto 5433)
docker compose -f backend/docker-compose.yml up -d

# 4. Base de datos: migraciones y datos iniciales
npm --prefix backend run db:migrate
npm --prefix backend run db:seed

# 5. API (puerto 3000) y sitio (puerto 8080), cada uno en su terminal
npm --prefix backend run dev
npm run dev
```

El sitio queda en `http://localhost:8080` y reenvía `/api` a la API local.

### Modos del sitio (`.env`)

| Variable | Valor habitual en desarrollo | Qué decide |
| :--- | :--- | :--- |
| `VITE_AUTH_SOURCE` | `api` | Sesión real contra el backend (`mock` = sesión de demostración) |
| `VITE_CATALOG_SOURCE` | `api` | El catálogo público se lee del backend |
| `VITE_DATA_SOURCE` | `mock` | Escrituras del sitio; `api` sigue bloqueado hasta terminar la migración |

Administrador de desarrollo (lo crea `db:seed`, nunca en producción): `admin@descubre.local` / `Admin-Descubre-2026!`.

---

## 🧪 9. Scripts de Desarrollo, Testing y Calidad

**Sitio (raíz)**
- `npm run dev`: servidor de desarrollo con recarga en caliente.
- `npm run build` / `npm run preview`: compila a `dist/` y previsualiza el resultado.
- `npm run lint`: análisis estático con ESLint.
- `npm run test`: pruebas del frontend con Vitest.
- `npx tsc --noEmit -p tsconfig.app.json`: comprobación de tipos.

**API (`backend/`)**
- `npm run dev`: API Fastify 5 con recarga.
- `npm test`: pruebas de integración sobre PostgreSQL (`TEST_DATABASE_URL` apunta a la base de pruebas).
- `npm run db:migrate` / `db:seed` / `db:gen-manifest`: migraciones, datos iniciales y manifiesto del esquema de contenido.
- `npm run docs:api` / `docs:capabilities`: regeneran `docs/BACKEND_API_IMPLEMENTADO.md` y `docs/CATALOGO_CAPACIDADES.md`.
- `npm run architecture:dependencies` / `architecture:tables`: límites entre dominios y propiedad de tablas.

---

## 📚 10. Documentación

El índice completo, con un resumen de cada documento, está en [`docs/README.md`](docs/README.md). Por dónde empezar:

- [`docs/ESTADO_DEL_PROYECTO.md`](docs/ESTADO_DEL_PROYECTO.md): qué funciona hoy, qué se comprobó y qué falta.
- [`docs/TAREAS_CONEXION_BACKEND_PENDIENTES.md`](docs/TAREAS_CONEXION_BACKEND_PENDIENTES.md): trabajo en curso para conectar el sitio y el panel al backend.
- [`docs/BACKEND_API_IMPLEMENTADO.md`](docs/BACKEND_API_IMPLEMENTADO.md): todas las rutas de la API (generado).
- [`backend/README.md`](backend/README.md): módulos y operación de la API.

---

## 📄 Licencia

Este proyecto está desarrollado para la promoción, digitalización y desarrollo sostenible del turismo en la **República Dominicana**. Todos los derechos reservados.
