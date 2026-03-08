import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { 
  Upload, 
  FileSpreadsheet, 
  Hotel, 
  UtensilsCrossed, 
  Wine, 
  Users, 
  Building2, 
  Map, 
  MapPin,
  Calendar,
  Heart,
  Ship,
  Trophy,
  Stethoscope,
  Download,
  CheckCircle,
  XCircle,
  Loader2,
  Shield,
  AlertTriangle,
  List,
  Coffee,
  Mountain,
  Waves,
  Sparkles,
  Home,
  Image,
  BookOpen,
  Landmark,
  Briefcase,
  Compass,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EntityList } from "@/components/admin/EntityList";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { EntityType as AdminEntityType } from "@/hooks/useAdminEntities";

type EntityType = 
  | 'provinces' 
  | 'destinations' 
  | 'hotels' 
  | 'restaurants' 
  | 'bars' 
  | 'tour_guides' 
  | 'travel_agencies' 
  | 'tour_operators' 
  | 'experiences' 
  | 'events' 
  | 'clinics' 
  | 'ports_marinas' 
  | 'stadiums'
  | 'theme_parks'
  | 'caves'
  | 'rivers'
  | 'coffee_experiences'
  | 'airbnb_listings'
  | 'artisanal_workshops'
  | 'municipalities'
  | 'ad_banners'
  | 'historical_figures'
  | 'historical_events'
  | 'tour_packages'
  | 'job_vacancies';

interface EntityConfig {
  name: string;
  icon: React.ReactNode;
  description: string;
  fields: string[];
  requiredFields: string[];
}

const entityConfigs: Record<EntityType, EntityConfig> = {
  provinces: {
    name: "Provincias",
    icon: <MapPin className="h-5 w-5" />,
    description: "Provincias de República Dominicana",
    fields: ["name", "region", "description", "image_url"],
    requiredFields: ["name"]
  },
  destinations: {
    name: "Destinos",
    icon: <Map className="h-5 w-5" />,
    description: "Destinos turísticos",
    fields: ["name", "slug", "province_id", "description", "short_description", "image_url", "gallery", "highlights", "typical_dishes", "latitude", "longitude", "weather_info", "best_time_to_visit", "how_to_get_there"],
    requiredFields: ["name"]
  },
  hotels: {
    name: "Hoteles",
    icon: <Hotel className="h-5 w-5" />,
    description: "Alojamientos y resorts",
    fields: ["name", "slug", "destination_id", "category", "stars", "description", "short_description", "image_url", "gallery", "address", "phone", "email", "website", "price_range", "amenities", "latitude", "longitude", "rating", "is_featured"],
    requiredFields: ["name"]
  },
  restaurants: {
    name: "Restaurantes",
    icon: <UtensilsCrossed className="h-5 w-5" />,
    description: "Restaurantes y gastronomía",
    fields: ["name", "slug", "destination_id", "category", "cuisine_type", "description", "short_description", "image_url", "gallery", "address", "phone", "email", "website", "price_range", "opening_hours", "services", "signature_dishes", "latitude", "longitude", "rating", "is_featured"],
    requiredFields: ["name"]
  },
  bars: {
    name: "Bares y Discotecas",
    icon: <Wine className="h-5 w-5" />,
    description: "Vida nocturna",
    fields: ["name", "slug", "destination_id", "bar_type", "ambiance", "music_style", "description", "short_description", "image_url", "gallery", "address", "phone", "email", "website", "price_range", "opening_hours", "dress_code", "minimum_age", "services", "latitude", "longitude", "rating", "is_featured"],
    requiredFields: ["name"]
  },
  tour_guides: {
    name: "Guías Turísticos",
    icon: <Users className="h-5 w-5" />,
    description: "Guías certificados",
    fields: ["name", "slug", "destination_id", "specialties", "languages", "description", "image_url", "phone", "email", "website", "years_experience", "certifications", "price_range", "rating", "is_certified"],
    requiredFields: ["name"]
  },
  travel_agencies: {
    name: "Agencias de Viaje",
    icon: <Building2 className="h-5 w-5" />,
    description: "Agencias de viajes",
    fields: ["name", "slug", "destination_id", "agency_type", "description", "short_description", "image_url", "logo_url", "address", "phone", "email", "website", "services", "specialties", "languages", "certifications", "rating", "is_featured"],
    requiredFields: ["name"]
  },
  tour_operators: {
    name: "Tour Operadores",
    icon: <Building2 className="h-5 w-5" />,
    description: "Operadores turísticos",
    fields: ["name", "slug", "destination_id", "operator_type", "description", "short_description", "image_url", "logo_url", "address", "phone", "email", "website", "services", "tour_types", "languages", "certifications", "rating", "is_featured"],
    requiredFields: ["name"]
  },
  experiences: {
    name: "Experiencias",
    icon: <Heart className="h-5 w-5" />,
    description: "Actividades y experiencias",
    fields: ["name", "slug", "destination_id", "category", "experience_type", "description", "short_description", "image_url", "gallery", "duration", "difficulty", "price_range", "best_season", "included", "requirements", "highlights", "rating", "is_featured"],
    requiredFields: ["name"]
  },
  events: {
    name: "Eventos",
    icon: <Calendar className="h-5 w-5" />,
    description: "Eventos y festivales",
    fields: ["name", "slug", "destination_id", "event_type", "description", "short_description", "image_url", "gallery", "start_date", "end_date", "start_time", "end_time", "venue", "address", "price_range", "ticket_url", "organizer", "is_recurring", "recurrence_pattern", "is_featured"],
    requiredFields: ["name"]
  },
  clinics: {
    name: "Clínicas",
    icon: <Stethoscope className="h-5 w-5" />,
    description: "Clínicas y centros médicos",
    fields: ["name", "slug", "destination_id", "clinic_type", "specialties", "description", "short_description", "image_url", "gallery", "address", "phone", "emergency_phone", "email", "website", "opening_hours", "services", "certifications", "insurance_accepted", "languages", "latitude", "longitude", "rating", "is_24_hours", "is_featured"],
    requiredFields: ["name"]
  },
  ports_marinas: {
    name: "Puertos y Marinas",
    icon: <Ship className="h-5 w-5" />,
    description: "Puertos de cruceros y marinas",
    fields: ["name", "slug", "destination_id", "port_type", "description", "short_description", "image_url", "gallery", "address", "phone", "email", "website", "cruise_lines", "facilities", "services", "capacity", "latitude", "longitude", "rating", "is_featured"],
    requiredFields: ["name"]
  },
  stadiums: {
    name: "Estadios",
    icon: <Trophy className="h-5 w-5" />,
    description: "Estadios y complejos deportivos",
    fields: ["name", "slug", "destination_id", "stadium_type", "sport_types", "description", "short_description", "image_url", "gallery", "address", "phone", "email", "website", "capacity", "home_teams", "facilities", "services", "latitude", "longitude", "rating", "is_featured"],
    requiredFields: ["name"]
  },
  theme_parks: {
    name: "Parques Temáticos",
    icon: <Heart className="h-5 w-5" />,
    description: "Parques de diversiones y temáticos",
    fields: ["name", "slug", "destination_id", "park_type", "description", "short_description", "image_url", "gallery", "address", "phone", "email", "website", "price_adult", "price_child", "price_range", "opening_hours", "attractions", "services", "includes", "age_restrictions", "duration_recommended", "latitude", "longitude", "rating", "is_featured"],
    requiredFields: ["name"]
  },
  caves: {
    name: "Cuevas",
    icon: <Mountain className="h-5 w-5" />,
    description: "Cuevas y formaciones geológicas",
    fields: ["name", "slug", "destination_id", "cave_type", "description", "short_description", "image_url", "gallery", "address", "phone", "email", "website", "difficulty", "tour_duration", "opening_hours", "highlights", "flora_fauna", "historical_info", "price_adult", "price_child", "latitude", "longitude", "rating", "is_featured"],
    requiredFields: ["name"]
  },
  rivers: {
    name: "Ríos",
    icon: <Waves className="h-5 w-5" />,
    description: "Ríos y actividades acuáticas",
    fields: ["name", "slug", "destination_id", "description", "short_description", "image_url", "gallery", "address", "difficulty", "activities", "best_season", "duration", "price_range", "safety_tips", "adrenaline_level", "certified_guides", "latitude", "longitude", "rating", "is_featured"],
    requiredFields: ["name"]
  },
  coffee_experiences: {
    name: "Experiencias de Café",
    icon: <Coffee className="h-5 w-5" />,
    description: "Tours de café y experiencias",
    fields: ["name", "slug", "destination_id", "experience_type", "description", "short_description", "image_url", "gallery", "address", "phone", "email", "website", "coffee_varieties", "altitude", "tour_duration", "price_range", "includes", "production_process", "tasting_notes", "opening_hours", "latitude", "longitude", "rating", "is_featured"],
    requiredFields: ["name"]
  },
  airbnb_listings: {
    name: "Airbnb",
    icon: <Home className="h-5 w-5" />,
    description: "Alojamientos tipo Airbnb",
    fields: ["name", "slug", "destination_id", "property_type", "description", "short_description", "image_url", "gallery", "address", "guests", "bedrooms", "beds", "bathrooms", "price_per_night", "cleaning_fee", "service_fee", "amenities", "house_rules", "check_in_time", "check_out_time", "cancellation_policy", "host_name", "host_image", "host_description", "is_superhost", "min_nights", "max_nights", "instant_book", "latitude", "longitude", "rating", "is_featured"],
    requiredFields: ["name"]
  },
  artisanal_workshops: {
    name: "Talleres Artesanales",
    icon: <Sparkles className="h-5 w-5" />,
    description: "Talleres de artesanía local",
    fields: ["name", "slug", "destination_id", "workshop_type", "description", "short_description", "image_url", "gallery", "address", "phone", "email", "website", "craft_types", "duration", "price_range", "includes", "skill_level", "languages", "max_participants", "opening_hours", "latitude", "longitude", "rating", "is_featured"],
    requiredFields: ["name"]
  },
  municipalities: {
    name: "Municipios",
    icon: <MapPin className="h-5 w-5" />,
    description: "Municipios y distritos",
    fields: ["name", "slug", "province_id", "municipality_type", "description", "short_description", "image_url", "gallery", "highlights", "population", "area_km2", "is_tourist_destination", "latitude", "longitude"],
    requiredFields: ["name"]
  },
  ad_banners: {
    name: "Banners Publicitarios",
    icon: <Image className="h-5 w-5" />,
    description: "Gestión de banners y publicidad",
    fields: ["name", "slug", "image_url", "alt_text", "target_url", "headline", "subtext", "cta_text", "sponsor", "banner_type", "placement", "section", "page", "start_date", "end_date", "priority", "is_active", "is_featured"],
    requiredFields: ["name", "banner_type", "placement"]
  },
  historical_figures: {
    name: "Personajes Históricos",
    icon: <BookOpen className="h-5 w-5" />,
    description: "Biografías de personajes históricos",
    fields: ["name", "slug", "title", "birth_date", "death_date", "birth_place", "era", "category", "short_description", "description", "biography", "achievements", "quotes", "image_url", "gallery", "is_featured"],
    requiredFields: ["name"]
  },
  historical_events: {
    name: "Eventos Históricos",
    icon: <Landmark className="h-5 w-5" />,
    description: "Hechos y eventos históricos de RD",
    fields: ["name", "slug", "event_date", "end_date", "year", "era", "category", "location", "short_description", "description", "significance", "key_figures", "consequences", "image_url", "gallery", "sources", "is_featured"],
    requiredFields: ["name"]
  },
  tour_packages: {
    name: "Paquetes Turísticos",
    icon: <Compass className="h-5 w-5" />,
    description: "Tours y paquetes de viaje",
    fields: ["name", "slug", "destination_id", "description", "short_description", "image_url", "gallery", "duration", "difficulty", "price_from", "price_range", "max_group_size", "min_age", "included", "not_included", "highlights", "requirements", "languages", "departure_point", "best_season", "category", "rating", "is_featured", "is_sponsored"],
    requiredFields: ["name"]
  },
  job_vacancies: {
    name: "Vacantes de Empleo",
    icon: <Briefcase className="h-5 w-5" />,
    description: "Ofertas de trabajo en turismo",
    fields: ["title", "slug", "company_name", "company_logo", "company_description", "description", "short_description", "location", "address", "province", "salary_range", "salary_min", "salary_max", "job_type", "experience_level", "education", "category", "department", "languages", "responsibilities", "requirements", "benefits", "skills", "application_url", "application_email", "deadline", "is_urgent", "is_remote", "is_featured"],
    requiredFields: ["title", "company_name"]
  }
};

// Configuración de campos para el formulario CRUD
const getFieldsConfig = (entity: EntityType) => {
  const fieldTypeMap: Record<string, 'text' | 'textarea' | 'number' | 'boolean' | 'array' | 'url' | 'email' | 'date' | 'time'> = {
    name: 'text',
    slug: 'text',
    description: 'textarea',
    short_description: 'textarea',
    image_url: 'url',
    gallery: 'array',
    address: 'text',
    phone: 'text',
    email: 'email',
    website: 'url',
    price_range: 'text',
    opening_hours: 'text',
    rating: 'number',
    latitude: 'number',
    longitude: 'number',
    is_featured: 'boolean',
    is_active: 'boolean',
    is_certified: 'boolean',
    is_24_hours: 'boolean',
    is_superhost: 'boolean',
    instant_book: 'boolean',
    is_tourist_destination: 'boolean',
    certified_guides: 'boolean',
    stars: 'number',
    minimum_age: 'number',
    years_experience: 'number',
    capacity: 'number',
    guests: 'number',
    bedrooms: 'number',
    beds: 'number',
    bathrooms: 'number',
    price_per_night: 'number',
    cleaning_fee: 'number',
    service_fee: 'number',
    min_nights: 'number',
    max_nights: 'number',
    price_adult: 'number',
    price_child: 'number',
    adrenaline_level: 'number',
    population: 'number',
    area_km2: 'number',
    max_participants: 'number',
    review_count: 'number',
    priority: 'number',
    year: 'number',
    salary_min: 'number',
    salary_max: 'number',
    price_from: 'number',
    max_group_size: 'number',
    min_age: 'number',
    impressions: 'number',
    clicks: 'number',
    applicants_count: 'number',
    views_count: 'number',
    amenities: 'array',
    services: 'array',
    facilities: 'array',
    highlights: 'array',
    typical_dishes: 'array',
    signature_dishes: 'array',
    specialties: 'array',
    languages: 'array',
    certifications: 'array',
    tour_types: 'array',
    included: 'array',
    requirements: 'array',
    insurance_accepted: 'array',
    cruise_lines: 'array',
    sport_types: 'array',
    home_teams: 'array',
    attractions: 'array',
    includes: 'array',
    activities: 'array',
    safety_tips: 'array',
    flora_fauna: 'array',
    coffee_varieties: 'array',
    craft_types: 'array',
    house_rules: 'array',
    achievements: 'array',
    quotes: 'array',
    related_events: 'array',
    key_figures: 'array',
    consequences: 'array',
    sources: 'array',
    responsibilities: 'array',
    benefits: 'array',
    skills: 'array',
    not_included: 'array',
    start_date: 'date',
    end_date: 'date',
    deadline: 'date',
    start_time: 'time',
    end_time: 'time',
    check_in_time: 'time',
    check_out_time: 'time',
    biography: 'textarea',
    significance: 'textarea',
    company_description: 'textarea',
    is_urgent: 'boolean',
    is_remote: 'boolean',
    is_sponsored: 'boolean'
  };

  const labelMap: Record<string, string> = {
    name: 'Nombre',
    slug: 'Slug (URL)',
    description: 'Descripción',
    short_description: 'Descripción corta',
    image_url: 'Imagen principal (URL)',
    gallery: 'Galería de imágenes',
    address: 'Dirección',
    phone: 'Teléfono',
    email: 'Email',
    website: 'Sitio web',
    price_range: 'Rango de precios',
    opening_hours: 'Horario',
    rating: 'Calificación',
    latitude: 'Latitud',
    longitude: 'Longitud',
    is_featured: 'Destacado',
    is_active: 'Activo',
    destination_id: 'ID Destino',
    province_id: 'ID Provincia',
    category: 'Categoría',
    cuisine_type: 'Tipo de cocina',
    bar_type: 'Tipo de bar',
    ambiance: 'Ambiente',
    music_style: 'Estilo musical',
    dress_code: 'Código de vestimenta',
    minimum_age: 'Edad mínima',
    agency_type: 'Tipo de agencia',
    operator_type: 'Tipo de operador',
    experience_type: 'Tipo de experiencia',
    event_type: 'Tipo de evento',
    clinic_type: 'Tipo de clínica',
    port_type: 'Tipo de puerto',
    stadium_type: 'Tipo de estadio',
    park_type: 'Tipo de parque',
    cave_type: 'Tipo de cueva',
    workshop_type: 'Tipo de taller',
    municipality_type: 'Tipo de municipio',
    property_type: 'Tipo de propiedad',
    stars: 'Estrellas',
    amenities: 'Amenidades',
    services: 'Servicios',
    facilities: 'Instalaciones',
    highlights: 'Puntos destacados',
    typical_dishes: 'Platos típicos',
    signature_dishes: 'Platos estrella',
    specialties: 'Especialidades',
    languages: 'Idiomas',
    certifications: 'Certificaciones',
    guests: 'Huéspedes',
    bedrooms: 'Habitaciones',
    beds: 'Camas',
    bathrooms: 'Baños',
    price_per_night: 'Precio por noche',
    host_name: 'Nombre del anfitrión',
    is_superhost: 'Superanfitrión',
    difficulty: 'Dificultad',
    duration: 'Duración',
    tour_duration: 'Duración del tour',
    best_season: 'Mejor temporada',
    capacity: 'Capacidad',
    start_date: 'Fecha inicio',
    end_date: 'Fecha fin',
    venue: 'Lugar',
    ticket_url: 'URL de tickets',
    organizer: 'Organizador',
    is_recurring: 'Recurrente',
    coffee_varieties: 'Variedades de café',
    altitude: 'Altitud',
    tasting_notes: 'Notas de cata',
    // Banner fields
    alt_text: 'Texto alternativo',
    target_url: 'URL destino',
    headline: 'Titular',
    subtext: 'Subtexto',
    cta_text: 'Texto del botón (CTA)',
    sponsor: 'Patrocinador',
    banner_type: 'Tipo de banner',
    placement: 'Ubicación',
    section: 'Sección',
    page: 'Página',
    priority: 'Prioridad',
    impressions: 'Impresiones',
    clicks: 'Clics',
    // Historical fields
    title: 'Título',
    birth_date: 'Fecha de nacimiento',
    death_date: 'Fecha de fallecimiento',
    birth_place: 'Lugar de nacimiento',
    era: 'Época',
    biography: 'Biografía',
    achievements: 'Logros',
    quotes: 'Frases célebres',
    event_date: 'Fecha del evento',
    year: 'Año',
    location: 'Ubicación',
    significance: 'Significado histórico',
    key_figures: 'Figuras clave',
    consequences: 'Consecuencias',
    sources: 'Fuentes',
    // Job fields
    company_name: 'Empresa',
    company_logo: 'Logo empresa (URL)',
    company_description: 'Descripción empresa',
    salary_range: 'Rango salarial',
    salary_min: 'Salario mínimo',
    salary_max: 'Salario máximo',
    job_type: 'Tipo de empleo',
    experience_level: 'Nivel de experiencia',
    education: 'Educación requerida',
    department: 'Departamento',
    responsibilities: 'Responsabilidades',
    benefits: 'Beneficios',
    skills: 'Habilidades',
    application_url: 'URL para aplicar',
    application_email: 'Email para aplicar',
    deadline: 'Fecha límite',
    is_urgent: 'Urgente',
    is_remote: 'Remoto',
    is_sponsored: 'Patrocinado',
    province: 'Provincia',
    // Tour package fields
    price_from: 'Precio desde',
    max_group_size: 'Tamaño máx. grupo',
    min_age: 'Edad mínima',
    departure_point: 'Punto de salida',
    not_included: 'No incluido'
  };

  const config = entityConfigs[entity];
  return config.fields.map(field => ({
    name: field,
    label: labelMap[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    type: fieldTypeMap[field] || 'text',
    required: config.requiredFields.includes(field),
    showInList: ['rating', 'category', 'price_range', 'is_featured'].includes(field)
  }));
};

const AdminPanel = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<EntityType>('hotels');
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ success: 0, failed: 0 });
  const [entityCounts, setEntityCounts] = useState<Record<EntityType, number>>({} as Record<EntityType, number>);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setCheckingRole(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });

        if (error) throw error;
        setIsAdmin(data);
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setCheckingRole(false);
      }
    };

    if (!authLoading) {
      checkAdminRole();
    }
  }, [user, authLoading]);

  useEffect(() => {
    const fetchEntityCounts = async () => {
      const counts: Record<EntityType, number> = {} as Record<EntityType, number>;
      
      for (const entity of Object.keys(entityConfigs) as EntityType[]) {
        const { count } = await supabase
          .from(entity)
          .select('*', { count: 'exact', head: true });
        counts[entity] = count || 0;
      }
      
      setEntityCounts(counts);
    };

    if (isAdmin) {
      fetchEntityCounts();
    }
  }, [isAdmin]);

  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }

    return data;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const data = parseCSV(text);
      setCsvData(data);
      toast({
        title: "Archivo cargado",
        description: `Se encontraron ${data.length} registros para importar.`
      });
    };
    reader.readAsText(file);
  };

  const processArrayField = (value: string): string[] | null => {
    if (!value || value === '') return null;
    return value.split('|').map(v => v.trim()).filter(v => v);
  };

  const processData = (row: Record<string, string>, entityType: EntityType) => {
    const config = entityConfigs[entityType];
    const processedRow: Record<string, unknown> = {};

    config.fields.forEach(field => {
      if (row[field] !== undefined && row[field] !== '') {
        // Handle array fields
        if (['gallery', 'highlights', 'typical_dishes', 'amenities', 'services', 'signature_dishes', 
             'specialties', 'languages', 'certifications', 'tour_types', 'included', 'requirements',
             'insurance_accepted', 'cruise_lines', 'facilities', 'sport_types', 'home_teams'].includes(field)) {
          processedRow[field] = processArrayField(row[field]);
        }
        // Handle boolean fields
        else if (['is_featured', 'is_active', 'is_certified', 'is_recurring', 'is_24_hours'].includes(field)) {
          processedRow[field] = row[field].toLowerCase() === 'true' || row[field] === '1';
        }
        // Handle numeric fields
        else if (['stars', 'minimum_age', 'years_experience', 'capacity', 'review_count'].includes(field)) {
          const num = parseInt(row[field]);
          processedRow[field] = isNaN(num) ? null : num;
        }
        // Handle decimal fields
        else if (['latitude', 'longitude', 'rating'].includes(field)) {
          const num = parseFloat(row[field]);
          processedRow[field] = isNaN(num) ? null : num;
        }
        else {
          processedRow[field] = row[field];
        }
      }
    });

    return processedRow;
  };

  const handleImport = async () => {
    if (csvData.length === 0) {
      toast({
        title: "Error",
        description: "No hay datos para importar.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadProgress({ success: 0, failed: 0 });

    let successCount = 0;
    let failedCount = 0;

    for (const row of csvData) {
      try {
        const processedData = processData(row, selectedEntity);
        const { error } = await supabase
          .from(selectedEntity)
          .insert([processedData as never]);

        if (error) throw error;
        successCount++;
      } catch (error) {
        console.error('Error inserting row:', error);
        failedCount++;
      }
      setUploadProgress({ success: successCount, failed: failedCount });
    }

    setUploading(false);
    setCsvData([]);
    
    toast({
      title: "Importación completada",
      description: `${successCount} registros importados exitosamente. ${failedCount > 0 ? `${failedCount} fallidos.` : ''}`
    });

    // Refresh counts
    const { count } = await supabase
      .from(selectedEntity)
      .select('*', { count: 'exact', head: true });
    setEntityCounts(prev => ({ ...prev, [selectedEntity]: count || 0 }));
  };

  const downloadTemplate = (entityType: EntityType) => {
    const config = entityConfigs[entityType];
    const csvContent = config.fields.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${entityType}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading || checkingRole) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageTransition>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <PageTransition>
        <Header />
        <main className="min-h-screen bg-background pt-24 pb-16">
          <div className="container mx-auto px-4">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-destructive" />
                  <CardTitle>Acceso Denegado</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No tienes permisos de administrador para acceder a esta sección.
                  Contacta al administrador del sistema si crees que esto es un error.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SEOHead
        title="Panel Administrativo | Descubre RD"
        description="Panel de administración para gestionar contenido turístico"
      />
      <Header />
      
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Panel Administrativo</h1>
            </div>
            <p className="text-muted-foreground">
              Gestiona el contenido del portal turístico mediante carga masiva de datos CSV
            </p>
          </div>

          {/* Dashboard Overview */}
          <AdminDashboard />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8 mt-8">
            {(Object.entries(entityConfigs) as [EntityType, EntityConfig][]).slice(0, 6).map(([key, config]) => (
              <Card key={key} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setSelectedEntity(key)}>
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center mb-2 text-primary">
                    {config.icon}
                  </div>
                  <p className="text-2xl font-bold">{entityCounts[key] || 0}</p>
                  <p className="text-xs text-muted-foreground">{config.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Entity Selection */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Entidades</CardTitle>
                  <CardDescription>Selecciona el tipo de datos a importar</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <div className="p-4 space-y-1">
                      {(Object.entries(entityConfigs) as [EntityType, EntityConfig][]).map(([key, config]) => (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedEntity(key);
                            setCsvData([]);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            selectedEntity === key 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-muted'
                          }`}
                        >
                          {config.icon}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{config.name}</p>
                            <p className={`text-xs truncate ${selectedEntity === key ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                              {entityCounts[key] || 0} registros
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Selected Entity Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {entityConfigs[selectedEntity].icon}
                      </div>
                      <div>
                        <CardTitle>{entityConfigs[selectedEntity].name}</CardTitle>
                        <CardDescription>{entityConfigs[selectedEntity].description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">{entityCounts[selectedEntity] || 0} registros</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="manage">
                    <TabsList className="mb-4">
                      <TabsTrigger value="manage">
                        <List className="h-4 w-4 mr-2" />
                        Gestionar
                      </TabsTrigger>
                      <TabsTrigger value="upload">
                        <Upload className="h-4 w-4 mr-2" />
                        Cargar CSV
                      </TabsTrigger>
                      <TabsTrigger value="template">
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Plantilla
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="manage">
                      <EntityList 
                        entity={selectedEntity as AdminEntityType}
                        entityName={entityConfigs[selectedEntity].name.slice(0, -1)}
                        fields={getFieldsConfig(selectedEntity)}
                      />
                    </TabsContent>

                    <TabsContent value="upload" className="space-y-4">
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Formato de archivo</AlertTitle>
                        <AlertDescription>
                          El archivo CSV debe contener las columnas definidas en la plantilla. 
                          Para campos múltiples (arrays), separa los valores con el caracter "|".
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-2">
                        <Label htmlFor="csv-file">Archivo CSV</Label>
                        <Input
                          id="csv-file"
                          type="file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          disabled={uploading}
                        />
                      </div>

                      {csvData.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                              {csvData.length} registros listos para importar
                            </p>
                            <Button onClick={handleImport} disabled={uploading}>
                              {uploading ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Importando...
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Importar Datos
                                </>
                              )}
                            </Button>
                          </div>

                          {uploading && (
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1 text-primary">
                                <CheckCircle className="h-4 w-4" />
                                {uploadProgress.success} exitosos
                              </span>
                              <span className="flex items-center gap-1 text-destructive">
                                <XCircle className="h-4 w-4" />
                                {uploadProgress.failed} fallidos
                              </span>
                            </div>
                          )}

                          <ScrollArea className="h-[300px] border rounded-lg">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  {Object.keys(csvData[0] || {}).map(header => (
                                    <TableHead key={header} className="whitespace-nowrap">
                                      {header}
                                    </TableHead>
                                  ))}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {csvData.slice(0, 10).map((row, index) => (
                                  <TableRow key={index}>
                                    {Object.values(row).map((value, i) => (
                                      <TableCell key={i} className="max-w-[200px] truncate">
                                        {value}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </ScrollArea>
                          {csvData.length > 10 && (
                            <p className="text-xs text-muted-foreground text-center">
                              Mostrando 10 de {csvData.length} registros
                            </p>
                          )}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="template" className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Campos disponibles:</h4>
                          <div className="flex flex-wrap gap-2">
                            {entityConfigs[selectedEntity].fields.map(field => (
                              <Badge 
                                key={field} 
                                variant={entityConfigs[selectedEntity].requiredFields.includes(field) ? "default" : "secondary"}
                              >
                                {field}
                                {entityConfigs[selectedEntity].requiredFields.includes(field) && " *"}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">* Campos obligatorios</p>
                        </div>

                        <Alert>
                          <FileSpreadsheet className="h-4 w-4" />
                          <AlertTitle>Campos con valores múltiples</AlertTitle>
                          <AlertDescription>
                            Para campos como "amenities", "services", "languages", etc., separa los valores con "|".
                            Ejemplo: WiFi|Piscina|Spa|Gimnasio
                          </AlertDescription>
                        </Alert>

                        <Button onClick={() => downloadTemplate(selectedEntity)} variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Descargar Plantilla CSV
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </PageTransition>
  );
};

export default AdminPanel;
