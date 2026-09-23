import React from "react";
import { 
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
  Crown,
  MessageSquare,
  Percent,
  CloudRain,
  PhoneCall,
  Activity,
  Mail,
  Lock,
  ShoppingBag,
  DollarSign,
  Clock,
  Ticket,
  Droplet,
  Star,
} from "lucide-react";

export type EntityType = 
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
  | 'beaches'
  | 'spas_wellness'
  | 'ad_banners'
  | 'historical_figures'
  | 'historical_events'
  | 'tour_packages'
  | 'job_vacancies'
  | 'establishment_registrations'
  | 'site_settings'
  | 'newsletter_subscribers'
  | 'marketing_leads'
  | 'offers'
  | 'ambassadors'
  | 'ambassador_referrals'
  | 'achievements'
  | 'gamification_levels'
  | 'profiles'
  | 'partner_profiles'
  | 'routes'
  | 'route_stops'
  | 'audio_guides'
  | 'ugc_reports'
  | 'event_tickets'
  | 'reward_inventory'
  | 'reward_shipments'
  | 'survey_templates'
  | 'survey_responses'
  | 'admin_activity_logs'
  | 'seo_redirections'
  | 'system_webhooks'
  | 'ugc_media'
  | 'user_suspensions'
  | 'support_tickets'
  | 'support_messages'
  | 'marketing_campaigns'
  | 'points_transactions'
  | 'marketplace_orders'
  | 'marketplace_order_items'
  | 'vendor_payments'
  | 'discount_coupons'
  | 'weather_alerts'
  | 'emergency_contacts'
  | 'system_cron_jobs'
  | 'ip_rules'
  | 'lotteries'
  | 'lottery_draws'
  | 'lottery_results'
  | 'exchange_rates'
  | 'fuel_prices'
  | 'reservations'
  | 'protected_areas'
  | 'bird_species'
  | 'hot_springs'
  | 'offset_projects'
  | 'toll_routes'
  | 'marine_reports';

export interface EntityConfig {
  name: string;
  icon: React.ReactNode;
  description: string;
  fields: string[];
  requiredFields: string[];
}

export const entityConfigs: Record<EntityType, EntityConfig> = {
  provinces: {
    name: "Provincias",
    icon: React.createElement(MapPin, { className: "h-5 w-5" }),
    description: "Provincias de República Dominicana",
    fields: ["name", "region", "description", "image_url"],
    requiredFields: ["name"]
  },
  destinations: {
    name: "Destinos",
    icon: React.createElement(Map, { className: "h-5 w-5" }),
    description: "Destinos turísticos",
    fields: ["name", "slug", "province_id", "description", "short_description", "image_url", "gallery", "highlights", "typical_dishes", "latitude", "longitude", "weather_info", "best_time_to_visit", "how_to_get_there"],
    requiredFields: ["name"]
  },
  hotels: {
    name: "Hoteles",
    icon: React.createElement(Hotel, { className: "h-5 w-5" }),
    description: "Alojamientos y resorts",
    fields: ["name", "slug", "destination_id", "category", "stars", "description", "short_description", "image_url", "gallery", "address", "phone", "email", "website", "price_range", "amenities", "latitude", "longitude", "rating", "is_featured"],
    requiredFields: ["name"]
  },
  restaurants: {
    name: "Restaurantes",
    icon: React.createElement(UtensilsCrossed, { className: "h-5 w-5" }),
    description: "Restaurantes y gastronomía",
    fields: ["name", "slug", "destination_id", "category", "cuisine_type", "description", "short_description", "image_url", "gallery", "address", "phone", "email", "website", "price_range", "opening_hours", "services", "signature_dishes", "latitude", "longitude", "rating", "is_featured"],
    requiredFields: ["name"]
  },
  bars: {
    name: "Bares y Discotecas",
    icon: React.createElement(Wine, { className: "h-5 w-5" }),
    description: "Vida nocturna",
    fields: ["name", "slug", "destination_id", "bar_type", "ambiance", "music_style", "description", "short_description", "image_url", "gallery", "address", "phone", "email", "website", "price_range", "opening_hours", "dress_code", "minimum_age", "services", "latitude", "longitude", "rating", "is_featured"],
    requiredFields: ["name"]
  },
  tour_guides: {
    name: "Guías Turísticos",
    icon: React.createElement(Users, { className: "h-5 w-5" }),
    description: "Guías certificados",
    fields: ["name", "slug", "destination_id", "specialties", "languages", "description", "image_url", "phone", "email", "website", "years_experience", "certifications", "price_range", "rating", "is_certified"],
    requiredFields: ["name"]
  },
  travel_agencies: {
    name: "Agencias de Viaje",
    icon: React.createElement(Building2, { className: "h-5 w-5" }),
    description: "Agencias de viajes",
    fields: ["name", "slug", "destination_id", "agency_type", "description", "short_description", "image_url", "logo_url", "address", "phone", "email", "website", "services", "specialties", "languages", "certifications", "rating", "is_featured"],
    requiredFields: ["name"]
  },
  tour_operators: {
    name: "Tour Operadores",
    icon: React.createElement(Building2, { className: "h-5 w-5" }),
    description: "Operadores turísticos",
    fields: ["name", "slug", "destination_id", "operator_type", "description", "short_description", "image_url", "logo_url", "address", "phone", "email", "website", "services", "tour_types", "languages", "certifications", "rating", "is_featured"],
    requiredFields: ["name"]
  },
  experiences: {
    name: "Experiencias",
    icon: React.createElement(Heart, { className: "h-5 w-5" }),
    description: "Actividades y experiencias",
    fields: ["name", "slug", "destination_id", "category", "experience_type", "description", "short_description", "image_url", "gallery", "duration", "difficulty", "price_range", "best_season", "included", "requirements", "highlights", "rating", "is_featured"],
    requiredFields: ["name"]
  },
  events: {
    name: "Eventos",
    icon: React.createElement(Calendar, { className: "h-5 w-5" }),
    description: "Eventos y festivales",
    fields: ["name", "slug", "destination_id", "event_type", "description", "short_description", "image_url", "gallery", "start_date", "end_date", "start_time", "end_time", "venue", "address", "price_range", "ticket_url", "organizer", "is_recurring", "recurrence_pattern", "is_featured"],
    requiredFields: ["name"]
  },
  clinics: {
    name: "Clínicas",
    icon: React.createElement(Stethoscope, { className: "h-5 w-5" }),
    description: "Clínicas y centros médicos",
    fields: ["name", "slug", "destination_id", "clinic_type", "specialties", "description", "short_description", "image_url", "gallery", "address", "phone", "emergency_phone", "email", "website", "opening_hours", "services", "certifications", "insurance_accepted", "languages", "latitude", "longitude", "rating", "is_24_hours", "is_featured"],
    requiredFields: ["name"]
  },
  ports_marinas: {
    name: "Puertos y Marinas",
    icon: React.createElement(Ship, { className: "h-5 w-5" }),
    description: "Puertos de cruceros y marinas",
    fields: ["name", "slug", "destination_id", "port_type", "description", "short_description", "image_url", "gallery", "address", "phone", "email", "website", "cruise_lines", "facilities", "services", "capacity", "latitude", "longitude", "rating", "is_featured"],
    requiredFields: ["name"]
  },
  stadiums: {
    name: "Estadios",
    icon: React.createElement(Trophy, { className: "h-5 w-5" }),
    description: "Estadios y complejos deportivos",
    fields: ["name", "slug", "destination_id", "stadium_type", "sport_types", "description", "short_description", "image_url", "gallery", "address", "phone", "email", "website", "capacity", "home_teams", "facilities", "services", "latitude", "longitude", "rating", "is_featured"],
    requiredFields: ["name"]
  },
  theme_parks: {
    name: "Parques Temáticos",
    icon: React.createElement(Heart, { className: "h-5 w-5" }),
    description: "Parques de diversiones y temáticos",
    fields: ["name", "slug", "destination_id", "park_type", "description", "short_description", "image_url", "gallery", "address", "phone", "email", "website", "price_adult", "price_child", "price_range", "opening_hours", "attractions", "services", "includes", "age_restrictions", "duration_recommended", "latitude", "longitude", "rating", "is_featured"],
    requiredFields: ["name"]
  },
  caves: {
    name: "Cuevas",
    icon: React.createElement(Mountain, { className: "h-5 w-5" }),
    description: "Cuevas y formaciones geológicas",
    fields: ["name", "slug", "destination_id", "cave_type", "description", "short_description", "image_url", "gallery", "address", "phone", "email", "website", "difficulty", "tour_duration", "opening_hours", "highlights", "flora_fauna", "historical_info", "price_adult", "price_child", "latitude", "longitude", "rating", "is_featured"],
    requiredFields: ["name"]
  },
  rivers: {
    name: "Ríos",
    icon: React.createElement(Waves, { className: "h-5 w-5" }),
    description: "Ríos y actividades acuáticas",
    fields: ["name", "slug", "destination_id", "description", "short_description", "image_url", "gallery", "address", "difficulty", "activities", "best_season", "duration", "price_range", "safety_tips", "adrenaline_level", "certified_guides", "latitude", "longitude", "rating", "is_featured"],
    requiredFields: ["name"]
  },
  coffee_experiences: {
    name: "Experiencias de Café",
    icon: React.createElement(Coffee, { className: "h-5 w-5" }),
    description: "Tours de café y experiencias",
    fields: ["name", "slug", "destination_id", "experience_type", "description", "short_description", "image_url", "gallery", "address", "phone", "email", "website", "coffee_varieties", "altitude", "tour_duration", "price_range", "includes", "production_process", "tasting_notes", "opening_hours", "latitude", "longitude", "rating", "is_featured"],
    requiredFields: ["name"]
  },
  airbnb_listings: {
    name: "Airbnb",
    icon: React.createElement(Home, { className: "h-5 w-5" }),
    description: "Alojamientos tipo Airbnb",
    fields: ["name", "slug", "destination_id", "property_type", "description", "short_description", "image_url", "gallery", "address", "guests", "bedrooms", "beds", "bathrooms", "price_per_night", "cleaning_fee", "service_fee", "amenities", "house_rules", "check_in_time", "check_out_time", "cancellation_policy", "host_name", "host_image", "host_description", "is_superhost", "min_nights", "max_nights", "instant_book", "latitude", "longitude", "rating", "is_featured"],
    requiredFields: ["name"]
  },
  artisanal_workshops: {
    name: "Talleres Artesanales",
    icon: React.createElement(Sparkles, { className: "h-5 w-5" }),
    description: "Talleres de artesanía local",
    fields: ["name", "slug", "destination_id", "workshop_type", "description", "short_description", "image_url", "gallery", "address", "phone", "email", "website", "craft_types", "duration", "price_range", "includes", "skill_level", "languages", "max_participants", "opening_hours", "latitude", "longitude", "rating", "is_featured"],
    requiredFields: ["name"]
  },
  municipalities: {
    name: "Municipios",
    icon: React.createElement(MapPin, { className: "h-5 w-5" }),
    description: "Municipios y distritos",
    fields: ["name", "slug", "province_id", "municipality_type", "description", "short_description", "image_url", "gallery", "highlights", "population", "area_km2", "is_tourist_destination", "latitude", "longitude"],
    requiredFields: ["name"]
  },
  ad_banners: {
    name: "Banners Publicitarios",
    icon: React.createElement(Image, { className: "h-5 w-5" }),
    description: "Gestión de banners y publicidad",
    fields: ["name", "slug", "image_url", "alt_text", "target_url", "headline", "subtext", "cta_text", "sponsor", "banner_type", "placement", "section", "page", "start_date", "end_date", "priority", "is_active", "is_featured"],
    requiredFields: ["name", "banner_type", "placement"]
  },
  historical_figures: {
    name: "Personajes Históricos",
    icon: React.createElement(BookOpen, { className: "h-5 w-5" }),
    description: "Biografías de personajes históricos",
    fields: ["name", "slug", "title", "birth_date", "death_date", "birth_place", "era", "category", "short_description", "description", "biography", "achievements", "quotes", "image_url", "gallery", "is_featured"],
    requiredFields: ["name"]
  },
  historical_events: {
    name: "Eventos Históricos",
    icon: React.createElement(Landmark, { className: "h-5 w-5" }),
    description: "Hechos y eventos históricos de RD",
    fields: ["name", "slug", "event_date", "end_date", "year", "era", "category", "location", "short_description", "description", "significance", "key_figures", "consequences", "image_url", "gallery", "sources", "is_featured"],
    requiredFields: ["name"]
  },
  tour_packages: {
    name: "Paquetes Turísticos",
    icon: React.createElement(Compass, { className: "h-5 w-5" }),
    description: "Tours y paquetes de viaje",
    fields: ["name", "slug", "destination_id", "description", "short_description", "image_url", "gallery", "duration", "difficulty", "price_from", "price_range", "max_group_size", "min_age", "included", "not_included", "highlights", "requirements", "languages", "departure_point", "best_season", "category", "rating", "is_featured", "is_sponsored"],
    requiredFields: ["name"]
  },
  job_vacancies: {
    name: "Vacantes de Empleo",
    icon: React.createElement(Briefcase, { className: "h-5 w-5" }),
    description: "Ofertas de trabajo en turismo",
    fields: ["title", "slug", "company_name", "company_logo", "company_description", "description", "short_description", "location", "address", "province", "salary_range", "salary_min", "salary_max", "job_type", "experience_level", "education", "category", "department", "languages", "responsibilities", "requirements", "benefits", "skills", "application_url", "application_email", "deadline", "is_urgent", "is_remote", "is_featured"],
    requiredFields: ["title", "company_name"]
  },
  establishment_registrations: {
    name: "Registros de Negocios (Leads B2B)",
    icon: React.createElement(Building2, { className: "h-5 w-5" }),
    description: "Solicitudes de registro de establecimientos turísticos",
    fields: ["nombre", "responsable", "email", "telefono", "direccion", "provincia", "tipo_establecimiento", "website", "foto_url", "descripcion", "rnc", "horario", "detalles", "status"],
    requiredFields: ["nombre", "responsable", "email", "telefono", "direccion", "provincia", "tipo_establecimiento", "descripcion"]
  },
  beaches: {
    name: "Playas",
    icon: React.createElement(Waves, { className: "h-5 w-5" }),
    description: "Gestión de playas turísticas de la isla",
    fields: ["name", "slug", "destination_id", "province_id", "beach_type", "description", "short_description", "image_url", "gallery", "activities", "amenities", "water_color", "sand_type", "wave_intensity", "crowd_level", "access_type", "parking_available", "lifeguard_on_duty", "how_to_get_there", "best_time_to_visit", "address", "latitude", "longitude", "rating", "is_popular", "is_featured", "is_active"],
    requiredFields: ["name"]
  },
  spas_wellness: {
    name: "Spas & Wellness",
    icon: React.createElement(Sparkles, { className: "h-5 w-5" }),
    description: "Centros de bienestar, spas y retiros espirituales",
    fields: ["name", "slug", "destination_id", "spa_type", "description", "short_description", "image_url", "gallery", "services", "treatments", "amenities", "address", "phone", "email", "website", "opening_hours", "price_range", "latitude", "longitude", "rating", "is_featured", "is_active"],
    requiredFields: ["name"]
  },
  site_settings: {
    name: "Configuraciones",
    icon: React.createElement(Shield, { className: "h-5 w-5" }),
    description: "Configuración global del portal y variables generales",
    fields: ["key", "value", "description"],
    requiredFields: ["key", "value"]
  },
  newsletter_subscribers: {
    name: "Suscriptores",
    icon: React.createElement(Users, { className: "h-5 w-5" }),
    description: "Suscriptores del boletín y campañas de marketing",
    fields: ["email", "nombre", "intereses", "frecuencia", "is_active"],
    requiredFields: ["email"]
  },
  marketing_leads: {
    name: "Leads y Campañas",
    icon: React.createElement(Briefcase, { className: "h-5 w-5" }),
    description: "Leads comerciales y contactos del portal",
    fields: ["nombre", "email", "telefono", "empresa", "mensaje", "source", "status"],
    requiredFields: ["nombre", "email"]
  },
  offers: {
    name: "Ofertas Especiales",
    icon: React.createElement(Compass, { className: "h-5 w-5" }),
    description: "Cupones de descuento y ofertas geolocalizados",
    fields: ["title", "description", "discount_code", "discount_percentage", "original_price", "price", "start_time", "end_time", "latitude", "longitude", "radius_meters", "is_flash", "image_url"],
    requiredFields: ["title", "original_price", "price"]
  },
  ambassadors: {
    name: "Afiliados / Embajadores",
    icon: React.createElement(Users, { className: "h-5 w-5" }),
    description: "Afiliados del programa de comisiones Descubre RD",
    fields: ["id", "referral_code", "clicks_count", "sales_count", "total_earned", "pending_payout", "tier"],
    requiredFields: ["id", "referral_code"]
  },
  ambassador_referrals: {
    name: "Conversiones / Comisiones",
    icon: React.createElement(Compass, { className: "h-5 w-5" }),
    description: "Ventas y comisiones generadas por afiliados",
    fields: ["ambassador_id", "referred_email", "sale_amount", "commission_earned", "status"],
    requiredFields: ["ambassador_id", "referred_email", "sale_amount", "commission_earned"]
  },
  achievements: {
    name: "Gamificación (Medallas)",
    icon: React.createElement(Trophy, { className: "h-5 w-5" }),
    description: "Logros y medallas del club de recompensas",
    fields: ["name", "slug", "description", "short_description", "icon", "badge_color", "category", "achievement_type", "xp_reward", "coin_reward", "min_level", "unlock_condition", "unlock_requirement", "display_order", "total_unlocked", "is_hidden", "is_active"],
    requiredFields: ["name", "category", "achievement_type"]
  },
  gamification_levels: {
    name: "Gamificación (Niveles)",
    icon: React.createElement(Star, { className: "h-5 w-5" }),
    description: "Niveles del club y descuentos de tienda",
    fields: ["level_number", "title", "icon", "color", "xp_required", "marketplace_discount", "perks"],
    requiredFields: ["level_number", "title", "xp_required"]
  },
  profiles: {
    name: "Usuarios (Viajeros)",
    icon: React.createElement(Users, { className: "h-5 w-5" }),
    description: "Perfiles generales de viajeros registrados",
    fields: ["id", "display_name", "avatar_url", "bio", "travel_interests"],
    requiredFields: ["id", "display_name"]
  },
  partner_profiles: {
    name: "Usuarios (Socios B2B)",
    icon: React.createElement(Crown, { className: "h-5 w-5" }),
    description: "Perfiles comerciales y afiliados comerciales",
    fields: ["id", "business_name", "business_type", "phone", "email", "description", "rating"],
    requiredFields: ["id", "business_name", "business_type", "email"]
  },
  routes: {
    name: "Rutas y Circuitos",
    icon: React.createElement(Compass, { className: "h-5 w-5" }),
    description: "Circuitos turísticos sugeridos",
    fields: ["title", "slug", "description", "duration_hours", "distance_km", "difficulty", "gpx_track_url", "is_active"],
    requiredFields: ["title", "slug"]
  },
  route_stops: {
    name: "Paradas de Rutas",
    icon: React.createElement(MapPin, { className: "h-5 w-5" }),
    description: "Paradas intermedias de los circuitos turísticos",
    fields: ["route_id", "stop_order", "destination_id", "place_name", "latitude", "longitude", "notes"],
    requiredFields: ["route_id", "stop_order", "place_name"]
  },
  audio_guides: {
    name: "Audioguías",
    icon: React.createElement(Coffee, { className: "h-5 w-5" }),
    description: "Librería de audioguías para monumentos e historia",
    fields: ["title", "description", "audio_url", "language", "associated_entity_type", "associated_entity_id", "duration_seconds"],
    requiredFields: ["title", "audio_url", "associated_entity_type", "associated_entity_id"]
  },
  ugc_reports: {
    name: "Reportes UGC (Denuncias)",
    icon: React.createElement(AlertTriangle, { className: "h-5 w-5" }),
    description: "Denuncias de reseñas o fotos falsas",
    fields: ["user_id", "target_type", "target_id", "reason", "status"],
    requiredFields: ["target_type", "target_id", "reason"]
  },
  event_tickets: {
    name: "Entradas Digitales (Tickets)",
    icon: React.createElement(Calendar, { className: "h-5 w-5" }),
    description: "Pases y entradas digitales generadas",
    fields: ["reservation_id", "ticket_code", "status", "scanned_at"],
    requiredFields: ["reservation_id", "ticket_code"]
  },
  reward_inventory: {
    name: "Premios del Club",
    icon: React.createElement(Trophy, { className: "h-5 w-5" }),
    description: "Premios y merchandising canjeables",
    fields: ["title", "description", "coins_cost", "stock", "is_physical", "image_url"],
    requiredFields: ["title", "coins_cost"]
  },
  reward_shipments: {
    name: "Envíos de Premios",
    icon: React.createElement(Briefcase, { className: "h-5 w-5" }),
    description: "Logística y entrega de regalos físicos canjeados",
    fields: ["user_id", "reward_id", "recipient_name", "recipient_phone", "shipping_address", "courier_name", "tracking_number", "status", "shipped_at"],
    requiredFields: ["user_id", "reward_id", "recipient_name", "recipient_phone", "shipping_address"]
  },
  survey_templates: {
    name: "Plantillas de Encuesta",
    icon: React.createElement(List, { className: "h-5 w-5" }),
    description: "Configuración de encuestas de calidad",
    fields: ["title", "questions", "is_active"],
    requiredFields: ["title", "questions"]
  },
  survey_responses: {
    name: "Respuestas de Encuestas",
    icon: React.createElement(List, { className: "h-5 w-5" }),
    description: "Respuestas y opiniones enviadas por viajeros",
    fields: ["template_id", "user_id", "reservation_id", "nps_score", "answers"],
    requiredFields: ["template_id", "answers"]
  },
  admin_activity_logs: {
    name: "Auditoría (Logs)",
    icon: React.createElement(Shield, { className: "h-5 w-5" }),
    description: "Historial inmutable de acciones administrativas",
    fields: ["admin_id", "action_type", "entity_name", "entity_id", "ip_address", "user_agent", "old_data", "new_data"],
    requiredFields: ["action_type", "entity_name"]
  },
  seo_redirections: {
    name: "Redirecciones SEO",
    icon: React.createElement(Compass, { className: "h-5 w-5" }),
    description: "Gestor de redirecciones 301/302 para buscadores",
    fields: ["source_path", "target_path", "redirect_type", "is_active"],
    requiredFields: ["source_path", "target_path"]
  },
  system_webhooks: {
    name: "Webhooks del Sistema",
    icon: React.createElement(Compass, { className: "h-5 w-5" }),
    description: "Integraciones de datos hacia herramientas externas",
    fields: ["url", "event_type", "secret_token", "is_active"],
    requiredFields: ["url", "event_type"]
  },
  ugc_media: {
    name: "UGC Media (Aprobación)",
    icon: React.createElement(Image, { className: "h-5 w-5" }),
    description: "Fotos y videos aportados por viajeros con control de estado",
    fields: ["user_id", "media_url", "media_type", "associated_entity_type", "associated_entity_id", "status"],
    requiredFields: ["media_url", "media_type", "associated_entity_type", "associated_entity_id"]
  },
  user_suspensions: {
    name: "Suspensiones de Usuarios",
    icon: React.createElement(Shield, { className: "h-5 w-5" }),
    description: "Bloqueos y suspensiones de cuentas de usuario",
    fields: ["user_id", "reason", "suspended_by", "expires_at", "is_active"],
    requiredFields: ["user_id", "reason"]
  },
  support_tickets: {
    name: "Tickets de Soporte",
    icon: React.createElement(List, { className: "h-5 w-5" }),
    description: "Tickets de soporte y ayuda abiertos por usuarios",
    fields: ["user_id", "subject", "description", "status", "priority", "assigned_to"],
    requiredFields: ["subject", "description"]
  },
  support_messages: {
    name: "Respuestas de Soporte",
    icon: React.createElement(MessageSquare, { className: "h-5 w-5" }),
    description: "Mensajes y comunicación dentro de los tickets de soporte",
    fields: ["ticket_id", "sender_id", "message", "is_admin_reply"],
    requiredFields: ["ticket_id", "message"]
  },
  marketing_campaigns: {
    name: "Campañas de Marketing",
    icon: React.createElement(Mail, { className: "h-5 w-5" }),
    description: "Planificación y envío de boletines y promociones",
    fields: ["title", "subject", "body_template", "segment_interests", "sent_count", "status", "scheduled_for"],
    requiredFields: ["title", "subject", "body_template"]
  },
  points_transactions: {
    name: "Transacciones de Puntos",
    icon: React.createElement(Activity, { className: "h-5 w-5" }),
    description: "Historial y libro contable de XP y Monedas del club",
    fields: ["user_id", "transaction_type", "amount", "reason", "reference_entity_type", "reference_entity_id"],
    requiredFields: ["user_id", "transaction_type", "amount", "reason"]
  },
  marketplace_orders: {
    name: "Órdenes de Marketplace",
    icon: React.createElement(ShoppingBag, { className: "h-5 w-5" }),
    description: "Órdenes de compra del marketplace de excursiones y tours",
    fields: ["user_id", "total_amount", "status", "payment_method", "payment_intent_id"],
    requiredFields: ["total_amount"]
  },
  marketplace_order_items: {
    name: "Ítems de Órdenes",
    icon: React.createElement(List, { className: "h-5 w-5" }),
    description: "Detalle de los artículos comprados en las órdenes",
    fields: ["order_id", "item_type", "item_id", "quantity", "price_unit"],
    requiredFields: ["order_id", "item_type", "item_id", "quantity", "price_unit"]
  },
  vendor_payments: {
    name: "Pagos a Proveedores",
    icon: React.createElement(DollarSign, { className: "h-5 w-5" }),
    description: "Liquidaciones y comisiones a socios locales (B2B)",
    fields: ["partner_id", "amount", "status", "payout_method", "payout_reference", "paid_at"],
    requiredFields: ["partner_id", "amount"]
  },
  discount_coupons: {
    name: "Cupones de Descuento",
    icon: React.createElement(Percent, { className: "h-5 w-5" }),
    description: "Códigos promocionales de descuento para órdenes",
    fields: ["code", "discount_percentage", "discount_amount", "expires_at", "max_uses", "uses_count", "is_active"],
    requiredFields: ["code"]
  },
  weather_alerts: {
    name: "Alertas de Clima/Sargazo",
    icon: React.createElement(CloudRain, { className: "h-5 w-5" }),
    description: "Alertas de sargazo y clima adverso por provincia",
    fields: ["province_id", "alert_type", "severity", "title", "description", "expires_at", "is_active"],
    requiredFields: ["alert_type", "severity", "title", "description"]
  },
  emergency_contacts: {
    name: "Contactos de Emergencia",
    icon: React.createElement(PhoneCall, { className: "h-5 w-5" }),
    description: "Directorio de emergencias y primeros auxilios locales",
    fields: ["province_id", "institution", "phone_number", "address", "latitude", "longitude"],
    requiredFields: ["institution", "phone_number"]
  },
  system_cron_jobs: {
    name: "Tareas Automatizadas (Cron)",
    icon: React.createElement(Clock, { className: "h-5 w-5" }),
    description: "Registro y control de tareas programadas del sistema",
    fields: ["job_name", "schedule_cron", "last_run_at", "next_run_at", "status", "error_log"],
    requiredFields: ["job_name", "schedule_cron"]
  },
  ip_rules: {
    name: "Reglas de Firewall (IP)",
    icon: React.createElement(Lock, { className: "h-5 w-5" }),
    description: "Lista negra y blanca de direcciones IP para antispam",
    fields: ["ip_address", "rule_type", "notes"],
    requiredFields: ["ip_address", "rule_type"]
  },
  lotteries: {
    name: "Loterías",
    icon: React.createElement(Ticket, { className: "h-5 w-5" }),
    description: "Marcas y empresas de lotería por país",
    fields: ["name", "country", "logo_url", "is_active"],
    requiredFields: ["name"]
  },
  lottery_draws: {
    name: "Sorteos de Lotería",
    icon: React.createElement(Calendar, { className: "h-5 w-5" }),
    description: "Configuración de cada sorteo de lotería",
    fields: ["lottery_id", "name", "draw_days", "draw_time", "ball_range_min", "ball_range_max", "number_of_balls", "tombolas_count", "has_bonus", "is_active"],
    requiredFields: ["lottery_id", "name", "draw_days", "draw_time"]
  },
  lottery_results: {
    name: "Resultados de Lotería",
    icon: React.createElement(Trophy, { className: "h-5 w-5" }),
    description: "Resultados históricos de números ganadores",
    fields: ["draw_id", "draw_date", "winning_numbers", "bonus_number", "jackpot_amount", "is_active"],
    requiredFields: ["draw_id", "draw_date", "winning_numbers"]
  },
  exchange_rates: {
    name: "Tasas de Cambio",
    icon: React.createElement(DollarSign, { className: "h-5 w-5" }),
    description: "Histórico de tasas de cambio de divisas",
    fields: ["rate_date", "currency_code", "buy_rate", "sell_rate"],
    requiredFields: ["rate_date", "currency_code", "buy_rate", "sell_rate"]
  },
  fuel_prices: {
    name: "Precios de Combustibles",
    icon: React.createElement(Droplet, { className: "h-5 w-5" }),
    description: "Registro de precios de combustibles por semana",
    fields: ["effective_date", "gasolina_premium", "gasolina_regular", "gasoil_optimo", "gasoil_regular", "glp", "gnv"],
    requiredFields: ["effective_date", "gasolina_premium", "gasolina_regular", "gasoil_optimo", "gasoil_regular", "glp", "gnv"]
  },
  reservations: {
    name: "Reservas de Viajeros",
    icon: React.createElement(ShoppingBag, { className: "h-5 w-5" }),
    description: "Reservas y bookings de viajeros en establecimientos",
    fields: ["partner_id", "user_id", "entity_type", "entity_id", "contact_name", "contact_email", "contact_phone", "check_in", "check_out", "total_price", "status", "notes"],
    requiredFields: ["entity_type", "entity_id", "contact_name", "contact_email", "check_in", "total_price"]
  },
  protected_areas: {
    name: "Áreas Protegidas",
    icon: React.createElement(Mountain, { className: "h-5 w-5" }),
    description: "Parques nacionales y santuarios naturales",
    fields: ["name", "slug", "category", "location", "size", "fee", "hours", "attractions", "rules", "description"],
    requiredFields: ["name", "category", "location"]
  },
  bird_species: {
    name: "Especies de Aves",
    icon: React.createElement(Coffee, { className: "h-5 w-5" }),
    description: "Aves endémicas de La Española",
    fields: ["name", "scientific_name", "status", "conservation", "description", "best_locations", "avatar"],
    requiredFields: ["name", "scientific_name", "status", "conservation"]
  },
  hot_springs: {
    name: "Aguas Termales",
    icon: React.createElement(Droplet, { className: "h-5 w-5" }),
    description: "Balnearios y manantiales termales",
    fields: ["name", "location", "province", "temp_celsius", "properties", "description", "access", "price", "avatar"],
    requiredFields: ["name", "location", "province", "temp_celsius"]
  },
  offset_projects: {
    name: "Proyectos del Carbono",
    icon: React.createElement(Sparkles, { className: "h-5 w-5" }),
    description: "Proyectos locales de reforestación y conservación",
    fields: ["title", "location", "category", "description", "cost_info"],
    requiredFields: ["title", "location", "category"]
  },
  toll_routes: {
    name: "Rutas y Peajes",
    icon: React.createElement(Map, { className: "h-5 w-5" }),
    description: "Configuración de precios de peajes de autopistas",
    fields: ["name", "description", "tolls_data"],
    requiredFields: ["name", "tolls_data"]
  },
  marine_reports: {
    name: "Reportes Marinos",
    icon: React.createElement(Waves, { className: "h-5 w-5" }),
    description: "Condiciones de oleaje y viento para deportes acuáticos",
    fields: ["location", "wind_speed", "wind_direction", "wave_height", "wave_period", "water_temp", "condition_rating", "recommendation"],
    requiredFields: ["location", "wind_speed", "wave_height", "condition_rating"]
  }
};

// Mapeo global de tipos de campos para formularios CRUD y procesamiento CSV
export const fieldTypeMap: Record<string, 'text' | 'textarea' | 'number' | 'boolean' | 'array' | 'url' | 'email' | 'date' | 'time'> = {
  id: 'text',
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
  priority: 'text',
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
  is_sponsored: 'boolean',
  descripcion: 'textarea',
  detalles: 'textarea',
  // New fields mapping
  key: 'text',
  value: 'textarea',
  intereses: 'array',
  frecuencia: 'text',
  empresa: 'text',
  mensaje: 'textarea',
  source: 'text',
  discount_code: 'text',
  discount_percentage: 'number',
  original_price: 'number',
  price: 'number',
  radius_meters: 'number',
  is_flash: 'boolean',
  referral_code: 'text',
  clicks_count: 'number',
  sales_count: 'number',
  total_earned: 'number',
  pending_payout: 'number',
  tier: 'text',
  referred_email: 'email',
  sale_amount: 'number',
  commission_earned: 'number',
  ambassador_id: 'text',
  badge_color: 'text',
  achievement_type: 'text',
  xp_reward: 'number',
  coin_reward: 'number',
  min_level: 'number',
  unlock_condition: 'text',
  unlock_requirement: 'textarea',
  display_order: 'number',
  total_unlocked: 'number',
  is_hidden: 'boolean',
  level_number: 'number',
  xp_required: 'number',
  marketplace_discount: 'number',
  perks: 'array',
  display_name: 'text',
  avatar_url: 'url',
  bio: 'textarea',
  travel_interests: 'array',
  business_name: 'text',
  business_type: 'text',
  beach_type: 'text',
  sand_type: 'text',
  water_color: 'text',
  wave_intensity: 'text',
  crowd_level: 'text',
  access_type: 'text',
  parking_available: 'boolean',
  lifeguard_on_duty: 'boolean',
  how_to_get_there: 'text',
  best_time_to_visit: 'text',
  spa_type: 'text',
  treatments: 'array',
  is_popular: 'boolean',
  duration_hours: 'number',
  distance_km: 'number',
  gpx_track_url: 'url',
  route_id: 'text',
  stop_order: 'number',
  place_name: 'text',
  notes: 'textarea',
  audio_url: 'url',
  language: 'text',
  associated_entity_type: 'text',
  associated_entity_id: 'text',
  duration_seconds: 'number',
  user_id: 'text',
  target_type: 'text',
  target_id: 'text',
  reason: 'textarea',
  reservation_id: 'text',
  ticket_code: 'text',
  scanned_at: 'date',
  coins_cost: 'number',
  stock: 'number',
  is_physical: 'boolean',
  recipient_name: 'text',
  recipient_phone: 'text',
  shipping_address: 'textarea',
  courier_name: 'text',
  tracking_number: 'text',
  shipped_at: 'date',
  questions: 'textarea',
  template_id: 'text',
  nps_score: 'number',
  answers: 'textarea',
  admin_id: 'text',
  action_type: 'text',
  entity_name: 'text',
  entity_id: 'text',
  ip_address: 'text',
  user_agent: 'text',
  old_data: 'textarea',
  new_data: 'textarea',
  source_path: 'text',
  target_path: 'text',
  redirect_type: 'number',
  url: 'url',
  event_type: 'text',
  secret_token: 'text',
  difficulty: 'text',
  media_url: 'url',
  media_type: 'text',
  suspended_by: 'text',
  expires_at: 'date',
  subject: 'text',
  assigned_to: 'text',
  ticket_id: 'text',
  sender_id: 'text',
  message: 'textarea',
  is_admin_reply: 'boolean',
  body_template: 'textarea',
  segment_interests: 'array',
  sent_count: 'number',
  scheduled_for: 'date',
  transaction_type: 'text',
  amount: 'number',
  reference_entity_type: 'text',
  reference_entity_id: 'text',
  total_amount: 'number',
  payment_method: 'text',
  payment_intent_id: 'text',
  order_id: 'text',
  item_type: 'text',
  item_id: 'text',
  quantity: 'number',
  price_unit: 'number',
  partner_id: 'text',
  payout_method: 'text',
  payout_reference: 'text',
  paid_at: 'date',
  code: 'text',
  discount_amount: 'number',
  max_uses: 'number',
  uses_count: 'number',
  alert_type: 'text',
  severity: 'text',
  institution: 'text',
  phone_number: 'text',
  job_name: 'text',
  schedule_cron: 'text',
  last_run_at: 'date',
  next_run_at: 'date',
  error_log: 'textarea',
  rule_type: 'text',
  lottery_id: 'text',
  draw_days: 'array',
  draw_time: 'time',
  ball_range_min: 'number',
  ball_range_max: 'number',
  number_of_balls: 'number',
  tombolas_count: 'number',
  has_bonus: 'boolean',
  draw_id: 'text',
  draw_date: 'date',
  winning_numbers: 'array',
  bonus_number: 'number',
  jackpot_amount: 'text',
  rate_date: 'date',
  currency_code: 'text',
  buy_rate: 'number',
  sell_rate: 'number',
  effective_date: 'date',
  gasolina_premium: 'number',
  gasolina_regular: 'number',
  gasoil_optimo: 'number',
  gasoil_regular: 'number',
  glp: 'number',
  gnv: 'number',
  entity_type: 'text',
  contact_name: 'text',
  contact_email: 'email',
  contact_phone: 'text',
  check_in: 'date',
  check_out: 'date',
  total_price: 'number',
  is_eco_guide: 'boolean',
  eco_license: 'text',
  scientific_name: 'text',
  conservation: 'text',
  best_locations: 'array',
  temp_celsius: 'number',
  properties: 'array',
  access: 'text',
  cost_info: 'text',
  tolls_data: 'textarea',
  wind_speed: 'number',
  wind_direction: 'text',
  wave_height: 'number',
  wave_period: 'number',
  water_temp: 'number',
  condition_rating: 'text',
  recommendation: 'textarea'
};

export const labelMap: Record<string, string> = {
  id: 'ID de Fila / Usuario',
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
  workshop_type: 'Tipo de Taller',
  municipality_type: 'Tipo de Municipio',
  property_type: 'Tipo de Propiedad',
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
  not_included: 'No incluido',
  nombre: 'Nombre del Establecimiento / Lead',
  responsable: 'Nombre del Responsable',
  tipo_establecimiento: 'Tipo de Establecimiento',
  descripcion: 'Descripción',
  rnc: 'RNC',
  detalles: 'Detalles Específicos (JSON)',
  status: 'Estado de Aprobación',
  // New labels mapping
  key: 'Clave',
  value: 'Valor (JSON)',
  frecuencia: 'Frecuencia de Envío',
  empresa: 'Empresa',
  mensaje: 'Mensaje de Contacto',
  source: 'Origen / Campaña',
  discount_code: 'Código de Descuento',
  discount_percentage: 'Porcentaje de Descuento',
  original_price: 'Precio Original',
  price: 'Precio Final',
  radius_meters: 'Radio (Metros)',
  is_flash: 'Oferta Relámpago',
  referral_code: 'Código de Referido',
  clicks_count: 'Cantidad de Clics',
  sales_count: 'Cantidad de Reservas',
  total_earned: 'Ingresos Totales',
  pending_payout: 'Retiro Pendiente',
  tier: 'Nivel / Categoría',
  referred_email: 'Email Referido',
  sale_amount: 'Monto de la Venta',
  commission_earned: 'Comisión Ganada',
  ambassador_id: 'ID del Embajador',
  badge_color: 'Color de Medalla',
  achievement_type: 'Tipo de Logro',
  xp_reward: 'Recompensa XP',
  coin_reward: 'Recompensa Monedas',
  min_level: 'Nivel Mínimo',
  unlock_condition: 'Condición de Desbloqueo',
  unlock_requirement: 'Requisitos Desbloqueo (JSON)',
  display_order: 'Orden de Lista',
  total_unlocked: 'Veces Desbloqueado',
  is_hidden: 'Oculto',
  level_number: 'Nivel',
  xp_required: 'XP Necesario',
  marketplace_discount: 'Descuento (%)',
  perks: 'Privilegios / Perks',
  display_name: 'Nombre para Mostrar',
  avatar_url: 'Avatar (URL)',
  bio: 'Biografía',
  travel_interests: 'Intereses del Viajero',
  business_name: 'Razón Social / Comercial',
  business_type: 'Tipo de Negocio B2B',
  beach_type: 'Tipo de Playa',
  sand_type: 'Tipo de Arena',
  water_color: 'Color del Agua',
  wave_intensity: 'Intensidad de Olas',
  crowd_level: 'Gente en Playa',
  access_type: 'Acceso Público/Privado',
  parking_available: 'Parqueo Disponible',
  lifeguard_on_duty: 'Salvavidas en Servicio',
  is_popular: 'Es Popular',
  spa_type: 'Tipo de Spa',
  treatments: 'Tratamientos Disponibles',
  duration_hours: 'Duración (Horas)',
  distance_km: 'Distancia (KM)',
  gpx_track_url: 'Ruta GPX (URL)',
  route_id: 'ID Ruta',
  stop_order: 'Orden de Parada',
  place_name: 'Nombre del Lugar',
  notes: 'Notas de la Parada',
  audio_url: 'Archivo de Audio (URL)',
  language: 'Idioma',
  associated_entity_type: 'Tipo Entidad Asociada',
  associated_entity_id: 'ID Entidad Asociada',
  duration_seconds: 'Duración (Segundos)',
  user_id: 'ID Usuario',
  target_type: 'Tipo de Contenido',
  target_id: 'ID de Contenido',
  reason: 'Motivo del Reporte',
  reservation_id: 'ID Reserva',
  ticket_code: 'Código de Ticket',
  scanned_at: 'Fecha de Escaneo',
  coins_cost: 'Costo en Monedas',
  stock: 'Stock Disponible',
  is_physical: 'Es Premio Físico',
  recipient_name: 'Nombre del Destinatario',
  recipient_phone: 'Teléfono del Destinatario',
  shipping_address: 'Dirección de Envío',
  courier_name: 'Empresa de Courier',
  tracking_number: 'Número de Guía',
  shipped_at: 'Fecha de Envío',
  questions: 'Preguntas (JSON)',
  template_id: 'ID Plantilla de Encuesta',
  nps_score: 'Puntuación NPS',
  answers: 'Respuestas (JSON)',
  admin_id: 'ID Administrador',
  action_type: 'Acción Realizada',
  entity_name: 'Nombre de Tabla',
  entity_id: 'ID de Entidad (UUID) / Registro',
  ip_address: 'Dirección IP',
  user_agent: 'User Agent',
  old_data: 'Datos Anteriores (JSON)',
  new_data: 'Datos Nuevos (JSON)',
  source_path: 'Ruta de Origen',
  target_path: 'Ruta de Destino',
  redirect_type: 'Tipo de Redirección (301/302)',
  url: 'URL Webhook',
  secret_token: 'Token Secreto',
  media_url: 'URL del Archivo (Multimedia)',
  media_type: 'Tipo de Archivo (photo/video)',
  suspended_by: 'Suspendido Por (ID Administrador)',
  expires_at: 'Fecha de Expiración',
  subject: 'Asunto / Tema',
  assigned_to: 'Asignado A (ID Soporte)',
  ticket_id: 'ID del Ticket',
  sender_id: 'ID del Remitente',
  message: 'Mensaje de Soporte',
  is_admin_reply: 'Es Respuesta de Admin',
  body_template: 'Plantilla del Mensaje (HTML/Text)',
  segment_interests: 'Intereses de Segmentación',
  sent_count: 'Cantidad Enviada',
  scheduled_for: 'Programado Para',
  transaction_type: 'Tipo de Transacción',
  amount: 'Monto / Cantidad',
  reference_entity_type: 'Tipo de Entidad Referenciada',
  reference_entity_id: 'ID de Entidad Referenciada',
  total_amount: 'Monto Total de Orden',
  payment_method: 'Método de Pago',
  payment_intent_id: 'ID Intención de Pago',
  order_id: 'ID Orden',
  item_type: 'Tipo de Item',
  item_id: 'ID Item',
  quantity: 'Cantidad',
  price_unit: 'Precio Unitario',
  partner_id: 'ID Proveedor / Socio',
  payout_method: 'Método de Transferencia',
  payout_reference: 'Referencia de Transferencia',
  paid_at: 'Fecha de Pago / Liquidación',
  code: 'Código Promocional / Cupón',
  discount_amount: 'Monto Fijo de Descuento',
  max_uses: 'Usos Máximos Permitidos',
  uses_count: 'Cantidad de Veces Usado',
  alert_type: 'Tipo de Alerta (sargazo/clima/etc)',
  severity: 'Severidad Alerta',
  institution: 'Institución (Ej. POLITUR)',
  phone_number: 'Número Telefónico de Emergencia',
  job_name: 'Nombre de Tarea Programada',
  schedule_cron: 'Expresión Cron (Schedule)',
  last_run_at: 'Última Ejecución',
  next_run_at: 'Próxima Ejecución',
  error_log: 'Registro de Errores (Log)',
  rule_type: 'Tipo de Regla (blacklist/whitelist)',
  lottery_id: 'ID de Lotería (UUID)',
  draw_days: 'Días de Sorteo',
  draw_time: 'Hora de Sorteo',
  ball_range_min: 'Bolo Mínimo',
  ball_range_max: 'Bolo Máximo',
  number_of_balls: 'Cantidad de Bolos',
  tombolas_count: 'Cantidad de Tómbolas',
  has_bonus: 'Tiene Bolo Extra',
  draw_id: 'ID de Sorteo (UUID)',
  draw_date: 'Fecha de Sorteo',
  winning_numbers: 'Números Ganadores (Separados por coma)',
  bonus_number: 'Bolo Extra / Adicional',
  jackpot_amount: 'Monto Acumulado / Loto Más',
  rate_date: 'Fecha de Tasa',
  currency_code: 'Código de Moneda (USD/EUR/GBP/etc)',
  buy_rate: 'Tasa de Compra',
  sell_rate: 'Tasa de Venta',
  effective_date: 'Fecha de Vigencia (Sábado)',
  gasolina_premium: 'Gasolina Premium (RD$)',
  gasolina_regular: 'Gasolina Regular (RD$)',
  gasoil_optimo: 'Gasoil Óptimo (RD$)',
  gasoil_regular: 'Gasoil Regular (RD$)',
  glp: 'GLP (Gas Licuado de Petróleo) (RD$)',
  gnv: 'GNV (Gas Natural Vehicular) (RD$)',
  logo_url: 'URL del Logo',
  country: 'País',
  contact_name: 'Nombre de Contacto',
  contact_email: 'Correo de Contacto',
  contact_phone: 'Teléfono de Contacto',
  check_in: 'Fecha de Entrada / Inicio',
  check_out: 'Fecha de Salida / Fin',
  total_price: 'Precio Total (RD$)',
  entity_type: 'Tipo de Entidad (hotel/restaurante/etc)',
  is_eco_guide: '¿Es Guía Ecológico?',
  eco_license: 'Licencia Ecológica (Medio Ambiente)',
  scientific_name: 'Nombre Científico',
  conservation: 'Estado de Conservación',
  best_locations: 'Mejores Lugares de Avistamiento',
  temp_celsius: 'Temperatura (°C)',
  properties: 'Propiedades Terapéuticas',
  access: 'Tipo de Acceso',
  cost_info: 'Información de Costos',
  tolls_data: 'Datos de Peajes (JSON)',
  wind_speed: 'Velocidad del Viento (Nudos)',
  wind_direction: 'Dirección del Viento',
  wave_height: 'Altura de Olas (Metros)',
  wave_period: 'Período de Olas (Segundos)',
  water_temp: 'Temperatura del Agua (°C)',
  condition_rating: 'Calificación de Condiciones',
  recommendation: 'Recomendación Deportiva'
};

// Configuración de campos para el formulario CRUD
export const getFieldsConfig = (entity: EntityType) => {
  const config = entityConfigs[entity];
  return config.fields.map(field => ({
    name: field,
    label: labelMap[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    type: fieldTypeMap[field] || 'text',
    required: config.requiredFields.includes(field),
    showInList: ['rating', 'category', 'price_range', 'is_featured', 'status', 'tipo_establecimiento', 'responsable', 'company_name', 'placement', 'job_type', 'era', 'key', 'email', 'title', 'level_number', 'referral_code', 'location', 'scientific_name'].includes(field)
  }));
};
