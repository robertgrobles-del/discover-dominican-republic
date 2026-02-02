# Sistema de Contenido Estático - Guía de Implementación

Este documento explica cómo funciona el sistema de páginas estáticas y cómo crear nuevo contenido manualmente.

## Estructura de Carpetas

```
src/
├── data/                    # Archivos de datos TypeScript
│   ├── destinations.ts      # Destinos (provincias, municipios, destinos)
│   ├── beaches.ts           # Playas
│   ├── rivers.ts            # Ríos y cascadas
│   ├── hotels.ts            # Hoteles y resorts
│   ├── restaurants.ts       # Restaurantes
│   ├── bars.ts              # Bares y discotecas
│   └── experiences.ts       # Experiencias turísticas
│
├── pages/
│   ├── destinos/            # Páginas individuales de destinos
│   │   ├── PuntaCana.tsx
│   │   ├── SantoDomingo.tsx
│   │   └── ...
│   ├── playas/              # Páginas individuales de playas (por crear)
│   ├── rios/                # Páginas individuales de ríos (por crear)
│   ├── alojamientos/        # Páginas individuales de hoteles (por crear)
│   ├── restaurantes/        # Páginas individuales de restaurantes (por crear)
│   └── bares/               # Páginas individuales de bares (por crear)
│
└── components/
    └── StaticDestinationPage.tsx  # Componente template para destinos
```

## Rutas del Sistema

| Tipo | Ruta | Ejemplo |
|------|------|---------|
| Destino | `/destino/{slug}` | `/destino/punta-cana` |
| Alojamiento | `/alojamiento/{slug}` | `/alojamiento/hard-rock-punta-cana` |
| Restaurante | `/restaurante/{slug}` | `/restaurante/pat-e-palo` |
| Bar | `/bar/{slug}` | `/bar/coco-bongo-punta-cana` |
| Experiencia | `/experiencia/{slug}` | `/experiencia/rafting-jarabacoa` |
| Playa | `/playa/{slug}` | `/playa/bavaro` |
| Río | `/rio/{slug}` | `/rio/yaque-del-norte` |

## Sistema de Jerarquía Geográfica

```
Provincia → Municipio → Destino → Contenido (hoteles, restaurantes, etc.)
```

### Campos de Jerarquía

- `provinceId`: ID de la provincia padre
- `municipalityId`: ID del municipio padre (opcional)
- `destinationId`: ID del destino donde está ubicado

### Ejemplo de Jerarquía

```
La Altagracia (provincia)
├── Higüey (municipio)
│   ├── Basílica de la Altagracia (destino religioso)
│   └── Restaurantes locales
├── Punta Cana (destino)
│   ├── Hard Rock Hotel
│   ├── Playa Bávaro
│   └── Restaurantes
└── Cap Cana (destino)
    ├── Marina Cap Cana
    └── Juanillo Beach Club
```

## Cómo Crear una Nueva Página de Destino

### Paso 1: Agregar datos en `src/data/destinations.ts`

```typescript
// En el array destinations[], agregar:
{
  id: 'nuevo-destino',              // ID único
  slug: 'nuevo-destino',            // URL-friendly (sin espacios, minúsculas)
  name: 'Nuevo Destino',            // Nombre para mostrar
  province: 'Nombre Provincia',     // Nombre de la provincia (para mostrar)
  provinceSlug: 'slug-provincia',   // Slug de la provincia
  provinceId: 'id-provincia',       // ID de la provincia padre
  municipalityId: 'id-municipio',   // ID del municipio (opcional)
  region: 'norte',                  // 'norte' | 'sur' | 'este' | 'santo-domingo'
  type: 'destino',                  // 'provincia' | 'municipio' | 'destino'
  categories: ['playa', 'aventura'],// Categorías del destino
  shortDescription: 'Descripción corta para tarjetas.',
  description: 'Descripción larga completa del destino...',
  imageUrl: '/ruta/imagen.jpg',
  gallery: ['/img1.jpg', '/img2.jpg'],
  highlights: ['Punto 1', 'Punto 2'],
  bestTimeToVisit: 'Diciembre a Abril',
  howToGetThere: 'Cómo llegar...',
  weatherInfo: 'Información del clima...',
  typicalDishes: ['Plato 1', 'Plato 2'],
  latitude: 18.5601,
  longitude: -68.3725,
  isPopular: true,
  isRecommended: true,
  isFeatured: false
}
```

### Paso 2: Crear archivo de página en `src/pages/destinos/`

```typescript
// src/pages/destinos/NuevoDestino.tsx
import { StaticDestinationPage } from "@/components/StaticDestinationPage";
import { getDestinationBySlug } from "@/data/destinations";

export default function NuevoDestino() {
  const destination = getDestinationBySlug('nuevo-destino');
  
  if (!destination) {
    return <div>Destino no encontrado</div>;
  }

  return <StaticDestinationPage destination={destination} />;
}
```

### Paso 3: Registrar ruta en `src/App.tsx`

```typescript
// 1. Importar con lazy loading (al inicio del archivo)
const NuevoDestino = lazy(() => import("./pages/destinos/NuevoDestino"));

// 2. Agregar la ruta (dentro de AnimatedRoutes)
<Route path="/destino/nuevo-destino" element={<NuevoDestino />} />
```

## Cómo Crear una Nueva Página de Hotel

### Paso 1: Agregar datos en `src/data/hotels.ts`

```typescript
{
  id: 'hotel-ejemplo',
  slug: 'hotel-ejemplo',
  name: 'Hotel Ejemplo Resort',
  destinationId: 'punta-cana',      // ID del destino
  destinationName: 'Punta Cana',
  province: 'La Altagracia',
  provinceId: 'la-altagracia',      // ID de la provincia
  category: 'all-inclusive',
  stars: 5,
  shortDescription: 'Descripción corta...',
  description: 'Descripción completa...',
  imageUrl: '/hotel.jpg',
  gallery: ['/img1.jpg', '/img2.jpg'],
  amenities: ['Piscina', 'Spa', 'Gimnasio'],
  priceRange: '$$$$',
  rating: 4.7,
  reviewCount: 1500,
  address: 'Dirección completa',
  phone: '+1 809-XXX-XXXX',
  website: 'https://hotel.com',
  latitude: 18.5280,
  longitude: -68.3680,
  isFeatured: true
}
```

### Paso 2: Crear página (cuando se implemente StaticHotelPage)

```typescript
// src/pages/alojamientos/HotelEjemplo.tsx
import { StaticHotelPage } from "@/components/StaticHotelPage";
import { getHotelBySlug } from "@/data/hotels";

export default function HotelEjemplo() {
  const hotel = getHotelBySlug('hotel-ejemplo');
  if (!hotel) return <div>Hotel no encontrado</div>;
  return <StaticHotelPage hotel={hotel} />;
}
```

### Paso 3: Registrar ruta

```typescript
const HotelEjemplo = lazy(() => import("./pages/alojamientos/HotelEjemplo"));
<Route path="/alojamiento/hotel-ejemplo" element={<HotelEjemplo />} />
```

## Funciones de Utilidad Disponibles

### Destinos

```typescript
import { 
  getDestinationBySlug,           // Buscar por slug
  getDestinationById,             // Buscar por ID
  getDestinationsByProvince,      // Destinos de una provincia
  getMunicipalitiesByProvince,    // Municipios de una provincia
  getDestinationsByMunicipality,  // Destinos de un municipio
  getDestinationsByRegion,        // Por región (norte, sur, este, santo-domingo)
  getDestinationsByCategory,      // Por categoría (playa, montaña, etc.)
  getPopularDestinations,         // Destinos populares
  getRecommendedDestinations,     // Destinos recomendados
  getFeaturedDestinations,        // Destinos destacados
  getProvinces,                   // Todas las provincias
  getMunicipalities,              // Todos los municipios
  getTouristDestinations,         // Todos los destinos turísticos
  searchDestinations,             // Buscar por texto
  getDestinationUrl               // Obtener URL del destino
} from "@/data/destinations";
```

### Hoteles, Restaurantes, Bares, Experiencias

```typescript
// Hoteles
import { getHotelsByDestination, getHotelBySlug, getFeaturedHotels } from "@/data/hotels";

// Restaurantes  
import { getRestaurantsByDestination, getRestaurantBySlug } from "@/data/restaurants";

// Bares
import { getBarsByDestination, getBarBySlug, getNightclubs } from "@/data/bars";

// Experiencias
import { getExperiencesByDestination, getExperienceBySlug } from "@/data/experiences";
```

## Tips de Implementación

1. **Slugs**: Siempre usar minúsculas, guiones en lugar de espacios, sin caracteres especiales
2. **IDs**: Usar el mismo valor que el slug para consistencia
3. **Imágenes**: Colocar en `public/images/` y referenciar como `/images/nombre.jpg`
4. **Validación**: Siempre verificar si el objeto existe antes de renderizar
5. **Lazy Loading**: Usar `lazy()` para todas las páginas individuales

## Relación con Servicios

Cuando agregas un hotel/restaurante/bar a un destino, automáticamente aparecerá en la página de ese destino gracias a las funciones `getXByDestination()`.

Ejemplo: Si creas un hotel con `destinationId: 'punta-cana'`, aparecerá automáticamente en la pestaña "Hoteles" de la página de Punta Cana.

## Cómo Crear una Nueva Página de Playa

### Paso 1: Agregar datos en `src/data/beaches.ts`

```typescript
{
  id: 'playa-ejemplo',
  slug: 'playa-ejemplo',
  name: 'Playa Ejemplo',
  province: 'La Altagracia',
  provinceId: 'la-altagracia',
  provinceSlug: 'la-altagracia',
  destinationId: 'punta-cana',           // Opcional
  destinationName: 'Punta Cana',         // Opcional
  beachType: 'arena-blanca',             // 'arena-blanca' | 'arena-dorada' | 'virgen' | 'bahia' | 'deportiva' | 'urbana'
  shortDescription: 'Descripción corta...',
  description: 'Descripción completa...',
  imageUrl: '/playa.jpg',
  gallery: ['/img1.jpg', '/img2.jpg'],
  activities: ['Snorkel', 'Natación'],
  amenities: ['Restaurantes', 'Duchas'],
  rating: 4.8,
  waterColor: 'Turquesa cristalino',
  sandType: 'Arena blanca fina',
  waveIntensity: 'calma',                // 'calma' | 'moderada' | 'fuerte'
  crowdLevel: 'media',                   // 'baja' | 'media' | 'alta'
  accessType: 'publico',                 // 'publico' | 'semi-privado' | 'privado'
  parkingAvailable: true,
  lifeguardOnDuty: true,
  howToGetThere: 'Cómo llegar...',
  bestTimeToVisit: 'Todo el año',
  isPopular: true,
  isFeatured: true
}
```

### Funciones de utilidad para playas

```typescript
import { 
  getBeachBySlug,
  getBeachesByProvince,
  getBeachesByDestination,
  getPopularBeaches,
  getFeaturedBeaches,
  getVirginBeaches,
  getCalmBeaches
} from "@/data/beaches";
```

## Cómo Crear una Nueva Página de Río

### Paso 1: Agregar datos en `src/data/rivers.ts`

```typescript
{
  id: 'rio-ejemplo',
  slug: 'rio-ejemplo',
  name: 'Río Ejemplo',
  provinces: [
    { id: 'la-vega', name: 'La Vega', slug: 'la-vega' }
  ],
  mainProvinceId: 'la-vega',
  mainProvinceName: 'La Vega',
  destinationId: 'jarabacoa',
  destinationName: 'Jarabacoa',
  riverType: 'cascada',                  // 'montaña' | 'cascada' | 'charco' | 'cañon' | 'manantial'
  shortDescription: 'Descripción corta...',
  description: 'Descripción completa...',
  imageUrl: '/rio.jpg',
  gallery: ['/img1.jpg', '/img2.jpg'],
  activities: ['Rafting', 'Natación'],
  waterTemperature: 'fria',              // 'fria' | 'templada' | 'fresca'
  currentIntensity: 'moderada',          // 'suave' | 'moderada' | 'fuerte'
  difficulty: 'moderado',                // 'facil' | 'moderado' | 'dificil' | 'experto'
  adrenalineLevel: 3,                    // 1-5
  guidesRequired: true,
  safetyTips: ['Tip 1', 'Tip 2'],
  duration: '2-3 horas',
  bestSeason: 'Todo el año',
  priceRange: '$$',
  rating: 4.7,
  reviewCount: 500,
  howToGetThere: 'Cómo llegar...',
  isPopular: true,
  isFeatured: true
}
```

### Funciones de utilidad para ríos

```typescript
import { 
  getRiverBySlug,
  getRiversByProvince,
  getRiversByDestination,
  getRiversByDifficulty,
  getRiversByAdrenaline,
  getCascadas,
  getRaftingRivers
} from "@/data/rivers";
```
