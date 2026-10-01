# 🇩🇴 Descubre República Dominicana — Portal Turístico Inteligente

Bienvenido al repositorio oficial de **Descubre República Dominicana**, la plataforma digital líder y ecosistema turístico inteligente diseñado para conectar a viajeros, turistas locales e internacionales con las maravillas culturales, gastronómicas, ecológicas y hoteleras de la República Dominicana.

---

## 🌟 Resumen del Ecosistema

El proyecto es una **Single Page Application (SPA)** construida con **React 18**, **TypeScript**, **Vite** y **Tailwind CSS**, complementada con **Radix UI / shadcn/ui** y **Framer Motion**. Hoy se conecta a un backend **Fastify 5 + PostgreSQL 16** organizado como monolito modular en `backend/`; el objetivo prioritario es extraer sus dominios a microservicios con contratos y datos propios, manteniendo una entrada estable para el frontend. El frontend todavía tiene un adaptador de datos de demostración en memoria mientras se migran las escrituras; por seguridad, el build de producción no permite distribuir el mock como si fuera datos reales.

El portal incluye más de **240 páginas y módulos especializados**, abarcando:
1. **Directorio Turístico Exhaustivo:** Provincias (32 provincias y Distrito Nacional), destinos, municipios, playas, ríos, montañas, parques nacionales y áreas protegidas.
2. **Alojamientos & Reservas:** Hoteles, resorts todo incluido, eco-lodges, villas y apartamentos estilo Airbnb con páginas de detalle dedicadas y reservas directas con operadores.
3. **Red de Operadores Turísticos B2B (`src/modules/operadores`):** Vitrinas independientes (*storefronts*) por operador, catálogo de excursiones y panel de autogestión de tarifas y reservas.
4. **Tienda Oficial & Comercio Turístico (`src/modules/tienda`):** Souvenirs auténticos, artesanías criollas, café de altura y merchandising con carrito global y checkout.
5. **Gastronomía & Vida Nocturna:** Guía culinaria de sabores criollos, recetas dominicanas con cálculo de ingredientes, chefs galardonados, rutas del sabor y directorio de restaurantes y bares.
6. **Salud, Farmacias & Asistencia 24 Horas:** Fichas técnicas de hospitales, clínicas odontológicas, laboratorios y farmacias con geolocalización, seguros médicos / ARS aceptadas, idiomas del personal y llamadas de emergencia directas.
7. **Gamificación & Pasaporte Digital del Viajero:** Sistema de puntos XP, insignias coleccionables (*badges*), retos por provincia, trivia turística y recompensas.
8. **Herramientas para el Viajero & Chatbot IA:** Asistente virtual inteligente para consultas de viaje, calculadora de peajes, conversor de tasas de cambio oficial y comercial (USD/EUR/DOP), reporte de sargazo y oleaje, itinerarios generados por IA, lista de empaque inteligente y audioguías.
9. **Soporte Multilingüe (i18n):** Alternancia dinámica en tiempo real entre **Español (ES)** e **Inglés (EN)**.
10. **Motor Publicitario (Ad Server Propio):** Soporte de 32 formatos IAB e interactivos, incluyendo banners de pantalla completa (*Full-Width* 1920x250 y Retina 2x), rascacielos (*skyscrapers*), popups de abandono (*exit-intent*) y cinta flash superior (*TopBar*).
11. **Panel Administrativo Centralizado (`/admin`):** Gestión y moderación de contenido, analíticas en tiempo real (CTR, visualizaciones y clics), creador visual de rutas turísticas, consola de stock y moderación de contenido generado por usuarios (UGC).

---

## 🏗️ Arquitectura Técnica y Stack Tecnológico

**Estado de arquitectura:** el backend actual es un monolito modular; la migración a microservicios es el primer frente del plan. La topología objetivo, límites iniciales, propiedad de datos y orden de extracción están en [`docs/ARQUITECTURA_MICROSERVICIOS.md`](docs/ARQUITECTURA_MICROSERVICIOS.md). La transición será incremental: primero se fijan contratos y límites; luego se extraen servicios con despliegue y almacenamiento independientes, conservando compatibilidad de `/api/v1` mediante una capa de entrada.

**Avance de la migración:** se desacoplaron auditoría, tokens opacos, correo y scheduler mediante utilidades y puertos fuera de los módulos de infraestructura; nueve módulos consumen funciones de fecha desde `backend/src/lib/dates.ts`; el CRUD genérico pasó de `modules/admin` a `backend/src/lib/table-admin.ts`; y `live` recibe puertos para jobs y lectura de eventos. El catálogo de colecciones y el snapshot del esquema actual residen ahora en `backend/src/contracts/`. `game`, `trips` y `ai` consultan `ContentReaderPort`; su adaptador PostgreSQL central conserva las reglas públicas de `content`. El flujo de Sello Verificado se encapsuló en `BusinessVerificationPort`/`OperatorVerificationService`: admin conserva endpoints y autorización, operadores concentra lecturas y escrituras, e IA recibe IDs aprobados por el puerto; contenido ya no consulta esa tabla. `discover` delega al mismo puerto la búsqueda/sugerencias, capas y entidades de mapa, cercanía, geocodificación inversa y contenido de secciones de portada. Sus lecturas de `analytics_events`, `site_settings` y `favorites` salen por puertos de `analytics`, `admin` y `me`. El servicio `content` (`backend/services/content`) expone `ContentReaderPort` por HTTP sobre una base propia que es proyección de lectura; el facade lo usa sólo si se define `CONTENT_SERVICE_URL`. `weather` tiene servicio, rutas, contrato `WeatherRepository`, entrypoint autónomo, Dockerfile y migrador en Compose, pero el corte de datos sigue pendiente. Typecheck de backend y compilación autónoma de `weather` pasan; CI build/escaneo y runtime independiente aún no se han validado. El backend continúa desplegado como un proceso con PostgreSQL compartido. El inventario ejecutado con Node 24.19.0 reporta 19 pares y 23 referencias entre módulos; CI bloquea aumentos sobre esa línea base. El [plan trazable de 150 mejoras](docs/PLAN_EJECUCION_ARQUITECTURA_150.md) y la [arquitectura objetivo](docs/ARQUITECTURA_MICROSERVICIOS.md) registran alcance y pendientes.

**Decisiones para la transición:** mantener el monorepo durante el piloto con paquetes, imágenes y despliegues independientes por servicio; conservar la API Fastify actual como facade/gateway compatible para `/api/v1`; posponer la elección de un broker hasta medir los requisitos de eventos. Hosting productivo y autenticación servicio-a-servicio siguen pendientes.

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
| **CMS actual / destino** | El contenido autoritativo reside hoy en `backend/`; `cms/` (Strapi) es origen editorial de transición. Su extracción se define en el plan de microservicios |
| **Datos del frontend** | `VITE_DATA_SOURCE=mock` es sólo demostración; el modo `api` se mantiene cerrado hasta completar las escrituras de producción |
| **SEO & Metadatos** | Metadatos del frontend y rutas SEO del backend; revisar generación dinámica al avanzar el plan |
| **Enrutamiento** | React Router v6 |
| **Mapas & Geolocalización** | Leaflet (`react-leaflet`) + `leaflet.markercluster` + Google Maps API |
| **Pruebas Automatizadas** | Vitest (frontend) + Vitest (backend con 480+ pruebas de integración) |
| **Internacionalización** | Sistema nativo i18n extensible (Español / Inglés) |

---

## 📂 Estructura de Directorios

```text
├── .github/workflows/        # CI del frontend: verificaciones y artefacto de despliegue `frontend-dist-<sha>`
├── docs/                     # Documentación técnica, de seguridad y de operación
├── public/
│   ├── _headers              # Política de caché (assets con hash `immutable`, `index.html` sin caché)
│   ├── banners/              # Catálogo de 32 imágenes oficiales de banners (Desktop, Mobile, Full-Width)
│   ├── placeholder.svg       # Fallbacks optimizados
│   └── favicon.ico
├── src/
│   ├── assets/               # Recursos estáticos, fotografías de destinos y texturas
│   ├── components/
│   │   ├── admin/            # Paneles del Admin (Dashboard, Analytics, UGC, Banners, NPS, Rutas)
│   │   ├── promo/            # Sistema Ad Server (BannerAd, Billboard, Skyscraper, FullWidthScreenAd)
│   │   ├── ui/               # Componentes del sistema de diseño (shadcn/ui + Tailwind)
│   │   ├── accommodation/    # Componentes de hoteles, servicios, habitaciones y menús
│   │   ├── destination/      # Secciones editoriales, zonas, galerías y clima de destinos
│   │   ├── forms/            # Formularios de contacto, cotizaciones y sorteos
│   │   ├── privacy/          # Banners de consentimiento de cookies y políticas
│   │   ├── ChatbotTuristico.tsx # Asistente conversacional inteligente flotante
│   │   └── Header.tsx / Footer.tsx
│   ├── data/                 # Bases de datos enriquecidas y catálogos locales
│   │   ├── officialBanners.ts# Catálogo de los 32 banners oficiales con dimensiones exactas
│   │   ├── healthCenters.ts  # Directorio nacional de centros de salud 24h
│   │   ├── hotelDetailData.ts# Fichas técnicas, amenidades y habitaciones de alojamientos
│   │   ├── restaurantDetailData.ts # Fichas de restaurantes, menús y precios
│   │   └── mockDestinations.ts, mockProvinces.ts, etc.
│   ├── hooks/                # Custom hooks (useAuth, useCart, useFavorites, useI18n, useAdBanners)
│   ├── integrations/         # Adaptador de demostración y límites de integraciones
│   ├── modules/
│   │   ├── operadores/       # Directorio B2B, vitrinas y panel de tour operadores
│   │   └── tienda/           # Tienda oficial de productos dominicanos, carrito y checkout
│   ├── pages/                # Más de 240 vistas y rutas de la aplicación
│   ├── lib/                  # Utilidades comunes (formateadores, cn, sanitización)
│   └── App.tsx               # Enrutador central y proveedores de contexto
```

---

## 🚀 Funcionalidades Principales

### 1. Directorio Turístico de Alta Fidelidad
- **32 Provincias & Regiones:** Fichas históricas, atractivos principales, gastronomía típica, galerías fotográficas y mapa interactivo.
- **Playas, Ríos y Montañas:** Información de oleaje, cómo llegar, nivel de acceso y recomendaciones de seguridad vial y ambiental.
- **Detalle de Parques Nacionales:** Rutas de senderismo, normativas del Ministerio de Medio Ambiente y fauna endémica.

### 2. Ecosistema de Alojamientos y Hoteles
- Fichas completas para resorts todo incluido, hoteles boutique y eco-alojamientos.
- Visualización de habitaciones por categoría, gastronomía interna, amenidades (piscinas, spas, deportes acuáticos) y políticas de cancelación.
- Comparador inteligente de hoteles y enlace a reservas directas.

### 3. Red de Operadores Turísticos (`src/modules/operadores`)
- **Directorio y Vitrina B2B:** Directorio certificado de tour operadores locales clasificados por región y especialidad.
- **Storefront Personalizado:** Cada operador cuenta con su propia página de catálogo (`OperadorStorefront`) y ficha de servicio (`OperadorServicio`).
- **Panel del Operador (`OperatorPanel`):** Consola privada donde los operadores configuran disponibilidades, precios, promociones y atienden solicitudes de reserva.

### 4. Tienda Oficial de Souvenirs & Artesanías (`src/modules/tienda`)
- Catálogo de productos auténticos dominicanos (café gourmet, artesanías taínas, larimar, gorras y textiles).
- Carrito de compras reactivo (`CartProvider`) persistente entre sesiones con flujo de checkout intuitivo.

### 5. Asistente Conversacional Inteligente & Chatbot Turístico
- Chatbot flotante accesible en todo el portal (`ChatbotTuristico.tsx`).
- Respuestas instantáneas sobre recomendaciones de itinerarios, gastronomía típica, requerimientos aduanales, vacunas y consejos para viajeros.

### 6. Salud, Clínicas & Emergencias 24h (`/salud-24h`)
- Buscador y filtrado por región (Norte, Sur, Este, Santo Domingo) y tipo de centro (hospitales, farmacias 24h, laboratorios, clínicas dentales).
- Tarjetas con fotografía panorámica, badges de certificación y pulso de atención 24 horas.
- Acceso directo a llamadas telefónicas de urgencia (`tel:`), botón directo para ruta en Google Maps y formulario de solicitud de citas para turistas bilingües.

### 7. Sistema Publicitario & Monetización (Ad Engine Propio)
El portal dispone de un sistema nativo para la comercialización de espacios publicitarios turísticos con soporte de 32 formatos estandarizados:
- **Pantalla Completa (*Full-Width Screen*):** Formatos de 1920 × 250 px (`FullWidthScreenAd` y `FullWidthScreenAd2x`) que se extienden al 100% del viewport.
- **Panorámicos & Cabeceras:** `Billboard` (980x120), `Large Leaderboard` (970x90), `Leaderboard Estándar` (728x90) y `Top Banner` (930x180).
- **Rascacielos (*Skyscrapers*):** `120x600`, `160x600 Wide Skyscraper`, `300x600 Half-Page` y `300x1050 Portrait` para barras laterales y secciones inmersivas (ej. sección de Bares en Inicio a 100vh).
- **Formatos Móviles:** `320x50 Leaderboard Móvil`, `320x100 Large Banner`, `320x480 Intersticial` y `MobileStickyFooterAd` con cierre opcional.
- **Rastreo Automático:** Medición en tiempo real de impresiones visibles y clics únicos por banner.

### 8. Gamificación & Pasaporte Digital
- Registro de sellos digitales por cada provincia o atractivo visitado.
- Perfil del explorador con acumulación de puntos de experiencia (XP), niveles turísticos y tablas de clasificación.
- Retos y trivias con recompensas aplicables en operadores locales.
- Notificaciones de logros en tiempo real con `GamificationToastOverlay`.

### 9. Panel Administrativo (`/admin`)
Acceso administrativo respaldado por los roles y permisos del backend (Fastify), con interfaz que incluye:
- **Dashboard & Analíticas:** Métricas de visitas, interacción y tasas de conversión.
- **Banners & Anuncios (`AdminMockupBanners`):** Simulador de campañas en vivo, control de modo (fijo o rotativo dinámico), asignación por página y catálogo visual con copia de rutas.
- **Gestión de Entidades:** Moderación de usuarios, operadores turísticos registrados y reservas directas.
- **Creador de Rutas & Itinerarios:** Interfaz visual para diseñar circuitos turísticos interprovinciales.
- **Moderación de Reseñas y Contenido (UGC):** Aprobación de fotos y comentarios de la comunidad.

---

## 🧭 Catálogo de Páginas y Módulos del Portal (Más de 240 Rutas)

El portal está estructurado en 12 áreas principales de navegación y módulos funcionales:

### 1. Territorio, Provincias y Destinos
- **Destinos Principales y Regiones:** `/destinos`, `/destinos/regiones`, `/destinos/region/:regionId`, `/destinos/categoria/:categoriaId`, `/destinos/:id` (Punta Cana, Santo Domingo, Samaná, Puerto Plata, Jarabacoa, Barahona, Montecristi, etc.).
- **32 Provincias & Municipios:** `/provincias`, `/provincias/:slug`, `/municipio/:slug` (cobertura total de provincias con datos históricos, municipios, atractivos y gastronomía local).
- **Playas y Ríos:** `/playas`, `/playa/:id`, `/rios`, `/rio/:id` (directorio hidrográfico con nivel de oleaje, tipo de arena, accesos, seguridad y mapas).
- **Montañas y Senderismo:** `/montanas`, `/montana/:id`, `/pico-duarte` (guías de alta montaña, altimetría, temperaturas medias y recomendaciones de senderismo).
- **Áreas Protegidas y Reservas:** `/areas-protegidas`, `/reservas-naturales`, `/parque-nacional/:id`, `/cueva/:id` (fauna endémica, cuevas taínas, normativas ecológicas y senderos).
- **Mapas y Georreferenciación:** `/mapa-interactivo`, `/mapas-tematicos`, `/mapa-misiones` (mapas con Leaflet, clusters y filtros por categoría).

### 2. Alojamientos, Hospitalidad & Bienestar
- **Hoteles y Resorts:** `/alojamientos`, `/alojamiento/:id` (resorts todo incluido, hoteles boutique y eco-lodges con fichas de habitaciones, amenidades y reservas).
- **Airbnb y Estancias Vacacionales:** `/airbnb/:id` (apartamentos, villas y chalets con normas, capacidad y fotos de alta resolución).
- **Comparador de Hoteles:** `/comparador-hoteles` (comparativa interactiva de características, tarifas estimadas y amenidades).
- **Spas, Retiros y Bienestar:** `/spas-wellness`, `/wellness`, `/spa/:id` (circuitos hidrotermales, masajes y centros de relajación).
- **Manantiales y Aguas Termales:** `/aguas-termales` (inventario hidrotermal con propiedades minerales y ubicación).

### 3. Gastronomía, Rutas del Sabor y Vida Nocturna
- **Guía Culinaria & Restaurantes:** `/guia-gastronomica`, `/restaurantes`, `/restaurante/:id` (fichas detalladas con cartas de menú, especialidades, rangos de precio y reservas).
- **Perfiles de Chefs Destacados:** `/chef/:id` (biografía culinaria, creaciones emblemáticas y restaurantes asociados).
- **Recetario Tradicional Dominicano:** `/recetas`, `/receta/:id` (ingredientes con calculadora interactiva de porciones, instrucciones paso a paso e historia del plato).
- **Identificador de Platos Típicos:** `/identificador-comida` (buscador inteligente y visual de platos tradicionales dominicanos).
- **Vida Nocturna y Bares:** `/vida-nocturna`, `/bar/:id`, `/bebidas-rd` (discotecas, lounges, coctelería tropical, mamajuana y rones con layout inmersivo a 100vh).
- **Rutas Agro-Gastronómicas:** `/rutas-sabor`, `/cultura-cafe`, `/cultura-tabaco`, `/ruta-ron-tabaco`, `/ruta-larimar`, `/suscripciones-sabores`.

### 4. Cultura, Historia, Tradiciones y Folclore
- **Monumentos y Museos:** `/patrimonio`, `/museos-monumentos`, `/cultura` (joyas de la Ciudad Colonial de Santo Domingo, fortalezas y museos).
- **Historia Dominicana:** `/historia`, `/historia/:slug`, `/historia-rd`, `/personaje-historico/:id`, `/evento-historico/:id` (línea cronológica desde la época prehispánica taína hasta la República contemporánea).
- **Historia Viva en Realidad Aumentada:** `/historia-viva-ar` (experiencia interactiva con reconstrucciones patrimoniales).
- **Carnaval & Ritmos Nacionales:** `/carnaval`, `/escuela-ritmos` (caretas tradicionales, personajes carnavalescos, merengue, bachata y son).
- **Turismo Religioso:** `/turismo-religioso`, `/destino-religioso/:id` (Basílica Catedral Nuestra Señora de la Altagracia, Santo Cerro e iglesias históricas).
- **Glosario e Idioma:** `/diccionario-dominicano`, `/espanol-viajero`, `/guia-etiqueta` (dominicanismos, modismos y normas de cortesía cultural).

### 5. Asistencia, Salud 24 Horas & Seguridad al Viajero
- **Salud y Clínicas 24 Horas:** `/salud-24h`, `/centro-salud/:id` (hospitales de trauma, clínicas turísticas, farmacias 24h, laboratorios y dentistas con ARS/seguros aceptados y botón de llamada de urgencia).
- **Seguridad y Contactos de Emergencia:** `/contactos-emergencia`, `/leyes-turista`, `/info-seguridad` (POLITUR, 911, asistencia vial de MOPC y marco legal para visitantes extranjeros).
- **Cuerpo Diplomático:** `/embajadas-consulados` (directorio de embajadas y consulados extranjeros en República Dominicana).
- **Asistencia Médica y Seguros:** `/seguro-viaje` (guía de pólizas de viaje y coberturas para repatriación o emergencias médicas).

### 6. Movilidad, Transporte, Vuelos, Puertos y Migración
- **Directorio de Vuelos & Aerolíneas (Nuevo):** `/vuelos-aerolineas`, `/aerolineas`, `/rutas-aereas` (rutas sin escalas, aerolíneas dominicanas como Arajet y Air Century, y aerolíneas internacionales con tiempos de vuelo).
- **Aeropuertos Internacionales:** `/aeropuerto`, `/aeropuerto/:slug` (terminales de Punta Cana PUJ, Las Américas SDQ, Cibao STI, Puerto Plata POP, vuelos en vivo y traslados oficiales).
- **Puertos de Cruceros y Marinas:** `/puertos-marinas`, `/puerto/:slug`, `/marina/:slug` (Amber Cove, Taino Bay, Port Cabo Rojo, Sans Souci, La Romana y guías *"Qué hacer en 8 horas de escala"*).
- **Transporte Masivo y Terrestre:** `/transporte-urbano`, `/metro-santo-domingo`, `/teleferico-santo-domingo`, `/monoriel-santiago`, `/seguridad-vial`.
- **Renta de Vehículos & Traslados:** `/rent-a-car`, `/alquiler-vehiculos` (flota, requisitos para extranjeros, cobertura de colisión y peajes).
- **Trámites de Entrada al País:** `/e-ticket`, `/requisitos-viaje`, `/aduanas`, `/zonas-horarias`.

### 7. Monetización, Planes Comerciales & Verificación
- **Portal para Empresas Turísticas:** `/para-empresas`, `/planes`, `/anunciate` (Planes Gratis, Premium y Destacado con facturación con NCF, soporte DGII y sin comisiones abusivas).
- **Reclamar Ficha ("¿Es tu negocio?"):** Botón y modal interactivo en todas las fichas de establecimientos para reclamo verificado con RNC y registro de licencia MITUR.
- **Transparencia y Reseñas Verificadas:** Política explícita anti-fraude que garantiza que ninguna suscripción puede ocultar o alterar reseñas legítimas.
- **Preparación para IA (Agentic Ready):** Archivo público `/llms.txt` con la estructura semántica de rutas y entidades del turismo dominicano.

### 7. Herramientas Prácticas para el Viajero (Smart Travel Utilities)
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

### 8. Turismo de Nicho, Deportes y Segmentos
- **Viajeros con Necesidades Especiales:** `/viajera-sola`, `/familia-con-ninos`, `/viajeros-senior`, `/viajar-con-mascotas`, `/guia-lgbtq`, `/guia-vegana`, `/guia-halal-kosher`.
- **Deportes y Aventura:** `/turismo-deportivo`, `/golf-rd` (circuitos PGA Teeth of the Dog, Punta Espada, Corales), `/turismo-buceo`, `/avistamiento-aves`, `/astroturismo`, `/lidom` (béisbol invernal dominicano con estadios `/estadio/:id`).
- **Sostenibilidad y Comunidad:** `/sostenible`, `/turismo-comunitario`, `/volunturismo`, `/guardian-caribe`, `/vive-local`.
- **Eventos MICE, Bodas y Negocios:** `/mice`, `/bodas`, `/mice-bodas`, `/eventos-grupo`, `/turismo-medico`, `/clinica/:id`.
- **Nómadas Digitales e Inversión:** `/nomadas-digitales`, `/bienes-raices`, `/inversion`, `/proyectos-inversion`.

### 9. Gamificación & Pasaporte del Explorador
- **Pasaporte Digital & Hub:** `/pasaporte-digital`, `/gamificacion-hub`, `/gamificacion-turistica`.
- **Misiones & Desafíos:** `/retos-turisticos`, `/reto-top-100` (`Top100`), `/trivia-turistica`.
- **Perfil de Juego y Recompensas:** `/perfil-jugador`, `/explorer-profile`, `/mis-logros`, `/badges`, `/club-recompensas`, `/sorteos-premios`.

### 10. Red B2B de Operadores & Tienda Oficial
- **Módulo de Operadores Turísticos (`src/modules/operadores`):**
  - Portal de bienvenida B2B: `/operadores`
  - Explicación del modelo directo: `/operadores/como-funciona`
  - Directorio de agencias certificadas: `/operadores/directorio`, `/agencias`, `/agencia/:id`
  - Tienda virtual de cada operador (*Storefront*): `/operador/:id`
  - Detalle de excursiones/servicios: `/operador/:id/servicio/:servicioId`
  - Panel de control para tour operadores: `/operador/panel`
- **Módulo de Tienda Oficial (`src/modules/tienda`):**
  - Portada de la tienda: `/tienda`
  - Detalle de producto con galería y variantes: `/tienda/producto/:id`
  - Carrito global persistente y checkout: `/tienda/checkout`
  - Catálogo de productos autóctonos: `/hecho-en-rd`, `/souvenirs-digitales`, `/marketplace`.

### 11. Medios, Editorial, Agenda y Comunidad
- **Revista y Artículos de Tendencia:** `/revista`, `/blog`, `/articulo/:id`.
- **Calendario y Eventos Culturales:** `/eventos`, `/evento/:id`, `/calendario-mensual`, `/eventos-vivo`.
- **Contenido Social y Multimedia:** `/rd-social`, `/feed-social`, `/podcast-rd`, `/tours-360`, `/rd-en-movimiento`, `/cine-rd`.
- **Comunidad de Creadores:** `/concursos-fotografia`, `/programa-creadores`, `/contratar-influencers`, `/autor-invitado`, `/diario-viaje`.
- **Red de Talento Local:** `/guias-locales`, `/fotografos-locales`.

### 12. Administración, B2B Partners y Soporte
- **Panel Administrativo Central:** `/admin` (control global del ecosistema, métricas, analíticas, moderación UGC y creador de rutas).
- **Portal de Partners Comerciales:** `/partners`, `/partner/login`, `/partner/dashboard`, `/sistema-afiliados`.
- **Gestión de Identidad y Cuentas:** `/login`, `/registro`, `/reset-password`, `/perfil`.
- **Políticas, Transparencia y Legal:** `/terminos`, `/sello-calidad`, `/centro-ayuda`, `/sobre-nosotros`, `/prensa-comunicacion`, `/opiniones`, `/sugerencias`, `/sitemap`.

---

## 📦 Tipos de Contenidos Gestionados en el Ecosistema

El portal maneja múltiples modelos y formatos de datos enriquecidos, tipados estrictamente en TypeScript:

| Tipo de Contenido | Estructura & Datos Principales | Ejemplos Representativos |
| :--- | :--- | :--- |
| **Destinos Turísticos** | Nombre, provincia, coordenadas GPS, mejor temporada para visitar, galería de imágenes 4K, atractivos destacados, tips de seguridad y etiquetas de accesibilidad. | Punta Cana, Bahía de las Águilas, Cayo Arena, Las Terrenas. |
| **Fichas de Alojamiento** | Tipo (resort all-inclusive, boutique, eco-lodge, villa), estrellas, amenidades (piscinas infinity, spas, wifi, restaurantes), habitaciones con fotos, precios de referencia y reservas directas. | Casa de Campo, Tortuga Bay, Eden Roc Cap Cana, Camp David. |
| **Fichas Médicas & Salud 24h** | Nombre, especialidad (hospital, clínica, farmacia 24h, odontología), guardia continua 24/7, teléfono de urgencias, enlace directo a Google Maps, idiomas del personal y seguros/ARS autorizados. | CEDIMAT, HOMS, Hospiten Bávaro, Centro Médico Punta Cana. |
| **Restaurantes & Bares** | Especialidad gastronómica, rango de precios ($ a $$$$), horario de atención, carta de menú con precios, selección de bebidas y cócteles, opciones veganas/sin gluten y fotos de ambientación. | Pat'e Palo, Mesón de Bari, SBG, Buche Perico. |
| **Recetario Criollo Dominicano** | Ingredientes con reescalado dinámico según número de personas, tiempo de preparación, nivel de complejidad, pasos ilustrados e historia del origen del plato. | Mangú con los tres golpes, Sancocho 7 carnes, Pescado frito de Boca Chica. |
| **Excursiones y Tours B2B** | Itinerario por horas, operador verificado, punto de recogida, idiomas disponibles, elementos incluidos/excluidos, políticas de cancelación y tarifas por adulto/niño. | Buggies en Macao, Excursión Isla Saona VIP, Senderismo Pico Duarte. |
| **Productos de Tienda & Artesanías** | Fotos multieje, maestro artesano productor, certificación de origen, precio en DOP/USD, variantes de color/talla y gestión de inventario. | Joyería en Larimar y Ámbar, Café orgánico de Jarabacoa, Muñecas Limé. |
| **Banners Publicitarios (32 Formatos)** | Medidas IAB estandarizadas (desde Full-Width 1920x250 hasta Skyscraper 120x600), URL de destino, medición de impresiones visibles y clics únicos, modo rotativo o fijo. | Billboard 980x120, Full-Width 1920x250, Skyscraper 120x600. |
| **Misiones & Retos Gamificados** | Título, descripción de la misión, provincia asociada, puntos de experiencia (XP), insignia coleccionable y validación por GPS o código de visita. | Explorador Colonial, Conquistador del Pico Duarte, Aventurero del Este. |
| **Indicadores Ambientales en Vivo** | Nivel de sargazo (bajo, moderado, severo), altura del oleaje, velocidad del viento en nudos y banderas de seguridad en playas (verde, amarilla, roja). | Costas de Punta Cana, Playa Dorada, Cabarete Kitesurf. |
| **Contenido Editorial & Artículos** | Título, subtítulo, autor, fecha, tiempo de lectura, contenido en Markdown, galerías fotográficas y metadatos SEO enriquecidos con OpenGraph. | Ediciones de la Revista Descubre RD, crónicas de viaje y reportajes de temporada. |

---

## 💼 Modelo de Negocio, Monetización B2B y Captación de Empresas

El ecosistema de **Descubre República Dominicana** integra un modelo de negocio sostenible basado en la captación de establecimientos locales e internacionales, eliminando intermediarios y maximizando el retorno de inversión (ROI) para las empresas turísticas:

### 1. Flujo Universal de Reclamo de Fichas (*Claim & Verify*)
- Todos los establecimientos del directorio nacional (hoteles, resorts, restaurantes, bares de vida nocturna, centros de salud y operadores) cuentan con el botón interactivo: **"¿Eres el propietario? Reclama tu ficha"** (`ClaimBusinessModal`).
- Permite a los dueños y gerentes validar su titularidad indicando su RNC, datos de contacto y número de licencia oficial ante el Ministerio de Turismo (MITUR).
- Una vez verificado, el establecimiento adquiere control directo sobre sus datos, fotografías, menús/habitaciones y métricas en el portal.

### 2. Escalera de Planes Comerciales (`/para-empresas` / `/planes`)

| Beneficio / Característica | Plan Básico (Gratis) | Plan Premium ($39–$49/mes) | Plan Destacado Exclusivo ($149–$189/mes) |
| :--- | :---: | :---: | :---: |
| **Ficha pública en el directorio nacional** | ✅ | ✅ | ✅ |
| **Datos de contacto, dirección y mapa GPS** | ✅ | ✅ | ✅ |
| **Fotografías y galerías** | Hasta 3 fotos | Ilimitadas en Alta Definición | Ilimitadas + Video Tour 4K |
| **Botón de contacto directo a WhatsApp / Llamada** | ❌ | ✅ (1 clic sin intermediarios) | ✅ (Prioritario) |
| **Catálogo de habitaciones, menú o excursiones** | ❌ | ✅ Completo y autogestionable | ✅ Completo + Destacados |
| **Ficha bilingüe optimizada (Español / Inglés)** | ❌ | ✅ | ✅ |
| **Protección contra competidores en su ficha** | ❌ | ✅ (Sin publicidad rival) | ✅ (Sin publicidad rival) |
| **Sello oficial "Verificado MITUR"** | ❌ | ✅ (Con validación de licencia) | ✅ (Dorado Prominente) |
| **Métricas de conversión y analítica de leads** | ❌ | ✅ (Llamadas, WhatsApp, GPS) | ✅ + Reporte de Demanda Trimestral |
| **Posicionamiento #1 en su destino y categoría** | ❌ | ❌ | ✅ (Cupo limitado por destino) |
| **Campañas de banners publicitarios incluidos** | ❌ | ❌ | ✅ (Billboard 980x120 & Skyscraper) |
| **Reportaje editorial en la Revista Descubre RD** | ❌ | ❌ | ✅ |
| **Recomendación prioritaria en Chatbot IA** | ❌ | ❌ | ✅ |
| **Facturación fiscal dominicana con NCF** | ❌ | ✅ | ✅ |

### 3. Medición de Leads (Lo que vende el Plan Premium)
A diferencia de los portales tradicionales que solo miden impresiones gráficas, Descubre RD mide y reporta acciones comerciales de alto valor:

### 4. Arquitectura de Monetización Digital Integral (21 Modelos de Negocio Activos en Backend)
El backend implementa de forma completa y desacoplada del frontend los 21 modelos de monetización previstos:
1. **Marketplace de Experiencias & Tours:** Catálogo extendido con liquidación y reservas directas (`/marketplace`).
2. **Posiciones Patrocinadas en Búsqueda:** Ad server con subasta y rotación ponderada (`/sponsorship/serve/search_top`).
3. **Suscripción para Operadores Turísticos:** Tiers `destacado`, `premium_partner` y `corporativo` (`/org/subscription`).
4. **Comisiones en Alojamientos y Reservas:** Gestión transparente con webhooks y trazabilidad contable.
5. **API B2B de Datos Agregados y Tendencias:** Claves API SHA-256 y endpoint de analíticas agregadas (`/api/v1/b2b/analytics/aggregate`).
6. **Misiones Gamificadas Patrocinadas:** Retos con patrocinadores institucionales y comerciales (`/admin/gamification/missions`).
7. **Espacios Publicitarios Nativos:** Integración modular a través de slots dinámicos.
8. **Banners Display IAB:** 32 formatos con telemetría de impresiones y CTR (`/sponsorship/telemetry`).
9. **Contenido Patrocinado y Publi-reportajes:** Marcado nativo y tracking de lectura.
10. **Campañas de Email Patrocinadas:** Segmentación por destino e intereses.
11. **Notificaciones Push Geolocalizadas Patrocinadas:** Campañas en tiempo real por ubicación.
12. **Seguros de Asistencia al Viajero:** Cotización y emisión inmediata (`POST /insurance/quote-and-issue`).
13. **Reservas de Traslados y Movilidad:** Traslados privados, chofer y rent-a-car (`POST /transport/book`).
14. **Licenciamiento de Activos Multimedia:** Banco de fotos y videos oficiales de RD con permisos de uso.
15. **Sello Oficial "Verificado":** Workflow con auditoría administrativa y auto-aprobación institucional (`/admin/verifications`).
16. **Acceso a Datos e Inteligencia Turística:** Monetización de reportes de demanda y estacionalidad.
17. **Paquetes Turísticos Dinámicos Multidestino:** Catálogo combinado de vuelos, hoteles y tours (`GET /packages/dynamic`).
18. **Fidelización y Puntos Canjeables:** Ledger transaccional de puntos por compras y misiones (`loyalty_points_ledger`).
19. **Pasaporte RD VIP (Membresía Anual Recurrente):** Descuentos exclusivos, concierge y multiplicador x2 en puntos (`/memberships`).
20. **Ticketing de Eventos en Vivo & Streaming:** Emisión de entradas con QR único y check-in criptográfico (`/events/:id/tickets`).
21. **Programa de Creadores UGC:** 3 capas de monetización (comisión por ventas, licenciamiento de videos y creator fund con `/creators`).
1. **Clics a WhatsApp:** Turistas iniciando una conversación directa de reserva o cotización.
2. **Llamadas telefónicas directas:** Clics en números `tel:` desde dispositivos móviles.
3. **Peticiones de ruta GPS:** Usuarios abriendo la ubicación en Google Maps / Waze.
4. **Solicitudes de reserva / Citas médicas:** Formularios de contacto directo enviados al buzón corporativo del establecimiento.

### 4. Sello de Confianza y Verificación Institucional (MITUR / SIGTUR)
- **Validación con Licencia de Turismo:** Integración prevista con la API de consulta de licencias del Ministerio de Turismo de la República Dominicana (SIGTUR) para validar agencias de viajes, guías certificados y tour operadores.
- **Regulación de Rentas Cortas:** Soporte para registro y número de licencia en alojamientos tipo Airbnb (`/airbnb/:id`), promoviendo el cumplimiento del marco regulatorio nacional.
- **Transparencia en Reseñas:** Los planes de pago **no permiten** ocultar ni alterar las calificaciones de los usuarios, garantizando la honestidad del directorio ante Pro Consumidor y el turista internacional.

---

## 🗺️ Hoja de Ruta de Arquitectura y 150 Mejoras

La arquitectura vigente es un backend Fastify modular desplegado como una aplicación. La meta aprobada es migrar a microservicios por dominios, comenzando con límites, contratos, dependencias y propiedad de datos. El diseño evita compartir tablas entre servicios y contempla un gateway compatible con las rutas públicas actuales. El barrido inicial encontró 61 pares entre módulos; los contratos de correo, jobs, catálogo, lecturas de lugares/provincias y visibilidad pública redujeron la medición a 19 pares y 23 referencias. `ContentReaderPort` ya separa lecturas de `game`, `trips`, candidatos de `ai` y consultas de catálogo/geo de `discover`; `BusinessVerificationPort` concentra la lectura y actualización de auditorías, aunque sus adaptadores siguen en PostgreSQL compartido. `discover` ya no ejecuta SQL propio. El catálogo tiene un servicio de lectura con base propia (`content`), poblada como proyección desde el monolito, que sigue siendo el único escritor; está configurado en Compose y apagado por omisión. `weather` tiene entrypoint independiente, CRUD interno con aserciones JWT HMAC de un solo uso y scheduler opcional, pero el proxy continúa apagado y el corte de datos pendiente. El avance por fases está en [`docs/PLAN_EJECUCION_ARQUITECTURA_150.md`](docs/PLAN_EJECUCION_ARQUITECTURA_150.md).

Después de fijar la plataforma base y extraer el primer servicio, se migran las escrituras de reservas, carrito y pedidos. Esa etapa requiere sesiones JWT válidas, asociar los productos visibles con entidades/listings de la API y configurar una pasarela tokenizada. La decisión sobre tickets gratuitos de eventos también debe cerrarse antes de declarar completa la migración.

**Seguimiento:** se actualizarán este README y la matriz del plan en cada fase, indicando cambios, evidencia, dependencias y riesgos que sigan abiertos.

---

## 📚 Documentación del Proyecto

- [`PLAN_MAESTRO_MEJORAS.md`](PLAN_MAESTRO_MEJORAS.md): las 100 mejoras del frontend y del backend, organizadas por áreas, con estado y evidencia de cada una.
- [`docs/OPERACION_FRONTEND.md`](docs/OPERACION_FRONTEND.md): despliegue atómico y rollback, política de caché y retirada del service worker.
- [`docs/DEUDA_FRONTEND.md`](docs/DEUDA_FRONTEND.md): catálogo de deuda técnica con evidencia reproducible, responsable funcional y fecha propuesta.
- [`docs/MIGRACION_ESCRITURAS_BACKEND.md`](docs/MIGRACION_ESCRITURAS_BACKEND.md): contrato de transición para mover reservas, checkout y pedidos al backend autoritativo.
- [`docs/BACKEND_OPERACION.md`](docs/BACKEND_OPERACION.md): checklist de salida a producción, respaldo y restauración, monitoreo, rotación de secretos, contenedor endurecido y verificación de SBOM/procedencia.
- [`docs/BACKEND_SEGURIDAD.md`](docs/BACKEND_SEGURIDAD.md): controles de autenticación, sesiones, autorización y datos, cada uno con su evidencia de prueba, más los riesgos residuales declarados.
- [`docs/FUENTE_DE_VERDAD.md`](docs/FUENTE_DE_VERDAD.md): autoridad actual de cada dominio y límites del mock, Strapi y el backend retirado.
- [`docs/PLAN_EJECUCION_ARQUITECTURA_150.md`](docs/PLAN_EJECUCION_ARQUITECTURA_150.md): fases y seguimiento del catálogo maestro de 150 mejoras.
- [`docs/ARQUITECTURA_MICROSERVICIOS.md`](docs/ARQUITECTURA_MICROSERVICIOS.md): estado actual, topología objetivo y plan incremental de extracción del monolito modular.

---

## ⚙️ Variables de Entorno

Crea un archivo `.env` en la raíz tomando como referencia [`.env.example`](.env.example). Los valores `VITE_*` se publican en el navegador: no pongas secretos de servidor allí. La API usa su configuración privada en `backend/.env` (consulta [`backend/.env.example`](backend/.env.example)).

```env
# URL de la API Fastify; en desarrollo puede dejarse vacía para usar el proxy local
VITE_API_URL=

# Fuente de datos del frontend: "mock" (por defecto) usa los catálogos simulados locales;
# "api" exige la API real (`backend/`) y el build falla cerrado si queda algo acoplado al mock.
# VITE_DATA_SOURCE=api
```

---

## 🛠️ Instalación y Ejecución Local

### Prerrequisitos
- **Node.js** v22 o superior (requisito de `backend/`; usar la misma versión para frontend y API)
- **npm** v9.0.0 o superior

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/robertgrobles-del/discover-dominican-republic.git

# 2. Entrar a la carpeta del proyecto
cd "Descubre RD"

# 3. Instalar las dependencias
npm install

# 4. Configurar variables de entorno
# Copiar .env.example a .env; los secretos de la API van en backend/.env

# 5. Iniciar el servidor de desarrollo
npm run dev
```

El servidor local se iniciará típicamente en `http://localhost:8080` o `http://localhost:8081`.

---

## 🧪 Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo con Hot Module Replacement (HMR).
- `npm run build`: Compila la aplicación optimizada para producción en la carpeta `dist/`.
- `npm run preview`: Previsualiza localmente el build de producción.
- `npm run lint`: Ejecuta el análisis de código estático con ESLint.
- `npm run test`: Ejecuta la suite de pruebas unitarias y de integración con **Vitest**.
- `npm run test:watch`: Inicia el runner de pruebas en modo interactivo/observador.
- `npm run check:data-source`: Compila en modo simulado y en modo API, y verifica que el build de API no contenga los datos simulados (`VITE_DATA_SOURCE`).
- `npm run check:bundle-budget`: Comprueba que el bundle inicial y el mayor fragmento diferido respeten los presupuestos de tamaño.
- `cd backend && npm run architecture:dependencies`: Inventaría dependencias estáticas entre dominios para orientar la extracción a microservicios.
- `cd backend && npm run weather:migrate` / `weather:migrate:check`: Aplica migraciones versionadas de la base propietaria weather o valida que esté al día sin alterarla.
- `cd backend && npm run weather:build` / `weather:start`: Compila e inicia el proceso autónomo meteorológico (GET públicos, health/readiness y CRUD administrativo privado); necesita su `WEATHER_DATABASE_URL` propia y migraciones aplicadas.
- Para desarrollo aislado, genera un token con `node -p "require('node:crypto').randomBytes(48).toString('base64url')"` y configura en `backend/.env` `WEATHER_SERVICE_TOKEN=<token>` junto con `WEATHER_DATABASE_URL=postgres://weather:weather@localhost:5435/descubre_weather`. Luego `cd backend && docker compose --profile weather up -d weather-postgres weather` inicia la DB en `localhost:5435` y el servicio en `localhost:3001`, ambos ligados a loopback y sin activar el proxy del monolito. El paso one-shot `weather-migrate` aplica el SQL versionado antes de que arranque `weather`; comprueba `/health/ready`. Los contenedores de servicio corren sin root, con sistema de archivos de sólo lectura, sin capabilities y con `no-new-privileges`.
- `cd backend && docker build -f services/weather/Dockerfile -t descubre-weather .`: Construye la imagen dedicada de `weather` (el daemon Docker debe estar activo).
- `cd backend && npm run content:build` / `content:start` / `content:dev`: Compila e inicia el proceso autónomo de contenido (lecturas de `ContentReaderPort` en `POST /internal/content/read/:method`, health/readiness). Necesita `CONTENT_DATABASE_URL` y `CONTENT_SERVICE_TOKEN` (>=32 caracteres).
- `cd backend && npm run content:tables` / `content:tables:check`: Regenera o verifica `services/content/content-tables.txt`, la lista de tablas del catálogo que se proyecta.
- Servicio de contenido en Docker (configurado; no se ha levantado todavía). Con `CONTENT_SERVICE_TOKEN` en `backend/.env`: (1) `docker compose --profile content up -d content-postgres` crea la base propia en `localhost:5438`; (2) `docker compose --profile content-sync run --rm content-sync` inspecciona conteos y con `--apply` reconstruye la proyección desde el monolito y la verifica; (3) `docker compose --profile content up -d content` inicia el servicio en `localhost:3002`. El origen por omisión es el servicio `postgres` de Compose; para el PostgreSQL embebido del host define `CONTENT_SOURCE_DATABASE_URL=postgres://postgres:postgres@host.docker.internal:5434/descubre_rd` y `CONTENT_PG_IMAGE=postgres:18-alpine` (el embebido es v18 y `pg_dump` debe ser de la misma versión mayor o superior).
- Para enrutar el facade al servicio de contenido: define `CONTENT_SERVICE_URL=http://localhost:3002` y el mismo `CONTENT_SERVICE_TOKEN` en el backend. Rollback: quita ambas variables y el facade vuelve a leer su propia base. La proyección es una foto: lo publicado en el CMS no aparece en el servicio hasta repetir `content-sync --apply`, por lo que aún no es apta para producción.
- `cd backend && npm run weather:reconcile` / `weather:reconcile:apply` / `weather:reconcile:verify`: Inspecciona, reconcilia o verifica los snapshots entre bases, respectivamente.
- `cd backend && npm run weather:reconcile:replace`: Sólo para rollback planificado; reemplaza transaccionalmente el destino (incluye borrados) y exige `WEATHER_REPLACE_TARGET_CONFIRM` con el nombre exacto de la base destino.
- Para enrutar el facade al servicio: configura `WEATHER_SERVICE_URL` y `WEATHER_SERVICE_TOKEN` en el backend; configura el mismo token en weather. Los comandos administrativos y el refresh manual se firman con JWT HMAC breve y se aceptan una sola vez. Para la copia final, despliega primero el facade con `WEATHER_WRITES_FROZEN=true`: pausa escrituras y refresh, pero mantiene lecturas desde el origen. Tras reconciliar, activa el proxy y quita el freeze en un mismo despliegue. Con el proxy activo, el job `weather.refresh` deja de registrarse en el monolito; el scheduler propietario se configura sólo en weather mediante `WEATHER_REFRESH_ENABLED=true`. Un advisory lock por refresh serializa solicitudes manuales y automáticas en todas las instancias. Configura `WEATHER_DATABASE_URL` como conexión dedicada del proceso weather.
- `npm run check:client-secrets`: Escanea el frontend en busca de secretos que nunca deben publicarse.
- `npm run check:import-cycles` / `npm run check:i18n-keys`: Detectan ciclos de importación y claves de traducción usadas sin definir.
- `npm run audit:local-storage`: Lista cada acceso al almacenamiento del navegador con archivo y línea (ver [`docs/ALMACENAMIENTO_LOCAL.md`](docs/ALMACENAMIENTO_LOCAL.md)).
- `npm run typecheck:strict-pilot`: Verifica con el modo estricto de TypeScript el conjunto piloto de archivos.

El flujo de CI (`.github/workflows/frontend.yml`) ejecuta estas verificaciones en cada cambio y publica el artefacto validado `frontend-dist-<sha>`, que sirve tanto para desplegar como para revertir una revisión. El procedimiento completo está en [`docs/OPERACION_FRONTEND.md`](docs/OPERACION_FRONTEND.md).

---

## 🎨 Guía de Estilo y Filosofía de Diseño

- **Anti-Fatiga Visual:** Espaciados armónicos (`gap-6`, `p-6` a `p-10`), contenedores redondeados `rounded-2xl` y `rounded-3xl`, y transiciones suaves de `300ms` a `500ms`.
- **Fondos Limpios:** Eliminación de capas grises o recortes oscuros innecesarios; uso de transparencias (`bg-transparent`) y degradados sutiles en overlays de texto para legibilidad WCAG AA/AAA.
- **Micro-interacciones:** Escala suave en hover (`group-hover:scale-105`), elevación de sombras y estados de carga pulidos con esqueletos (*skeletons*).

---

## 📄 Licencia

Este proyecto está desarrollado para la promoción y digitalización del turismo en la **República Dominicana**. Todos los derechos reservados.
