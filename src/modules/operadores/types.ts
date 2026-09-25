// Tipos del módulo "Operadores RD" (reservas directas para operadores turísticos).
// La organización del operador vive en `partner_profiles` y sus reservas en
// `reservations`, para integrarse con el PartnerDashboard y el admin existentes.

export type ListingCategory = "experiencia" | "voluntariado" | "alojamiento" | "transporte";
export type ListingStatus = "draft" | "published" | "paused";
export type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "partial" | "paid" | "refunded";
export type OrgVerification = "unverified" | "pending" | "verified" | "rejected";
export type MessageChannel = "web" | "whatsapp" | "instagram" | "email";

export interface OperatorOrg {
  id: string; // = auth user id para organizaciones propias, o id semilla
  business_name: string;
  slug: string;
  description?: string;
  phone?: string;
  email?: string;
  business_type?: string;
  logo_url?: string;
  cover_url?: string;
  province?: string;
  verification: OrgVerification;
  commission_rate: number; // porcentaje sobre reservas pagadas en la web del operador
  payout_method?: string;
  website_enabled: boolean;
  created_at?: string;
}

export interface Room {
  id: string;
  name: string;
  price: number; // por noche
  guests: number; // huéspedes máximos por habitación
  quantity: number; // unidades disponibles de este tipo
  beds?: string;
  amenities: string[];
  image?: string;
  weekend_price?: number; // noches de viernes y sábado
  min_nights?: number;
  seasons?: { id: string; name: string; from: string; to: string; price: number }[];
  blocked?: { id: string; from: string; to: string; reason?: string }[];
}

export type ExtraUnit = "person" | "booking" | "night";
export interface Extra {
  id: string;
  name: string;
  price: number;
  unit: ExtraUnit; // se cobra por persona, por reserva o por noche (alojamientos)
  description?: string;
}
export interface BookingExtra { id: string; name: string; qty: number; price: number; }

export interface Listing {
  child_price?: number; // niños de 3 a 11 años; sin valor = pagan como adultos
  infants_free?: boolean; // bebés de 0 a 2 años gratis (no ocupan cupo)
  min_guests?: number; // personas mínimas para que salga la excursión
  extras?: Extra[];
  deposit_percent?: number; // 0/undefined = pago completo; 10-90 = se puede reservar con depósito
  rooms?: Room[]; // solo alojamientos: cada habitación tiene su propio enlace de reserva
  id: string;
  org_id: string;
  category: ListingCategory;
  title: string;
  slug: string;
  summary: string;
  description: string;
  destination: string;
  price: number;
  currency: "USD" | "DOP";
  duration: string;
  capacity: number;
  min_age?: number;
  languages: string[];
  includes: string[];
  meeting_point?: string;
  cancellation_policy: "flexible" | "moderada" | "estricta";
  images: string[];
  time_slots: string[];
  status: ListingStatus;
  rating?: number;
  reviews_count?: number;
  created_at: string;
}

export interface Booking {
  id: string;
  org_id: string;
  listing_id: string;
  listing_title?: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  date: string; // YYYY-MM-DD (en alojamientos: check-in)
  check_out?: string; // solo alojamientos
  room_id?: string;
  room_name?: string;
  time?: string;
  guests: number;
  total_price: number;
  currency: "USD" | "DOP";
  status: BookingStatus;
  payment_status: PaymentStatus;
  extras?: BookingExtra[];
  guest_mix?: { adults: number; children: number; infants: number };
  amount_paid?: number; // cobrado hasta ahora (pago parcial); si payment_status = paid equivale al total
  promo_code?: string;
  notes?: string;
  source: "web" | "manual" | "marketplace";
  review_pending?: boolean;
  created_at: string;
}

export interface OperatorMessage {
  id: string;
  org_id: string;
  thread_id: string; // agrupa mensajes por viajero
  traveler_name: string;
  sender: "traveler" | "operator";
  channel: MessageChannel;
  body: string;
  booking_id?: string;
  read: boolean;
  created_at: string;
}

export interface Promotion {
  id: string;
  org_id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  listing_id?: string | null;
  starts_at?: string;
  ends_at?: string;
  max_uses?: number;
  uses: number;
  active: boolean;
  created_at: string;
}

export interface OperatorReview {
  id: string;
  org_id: string;
  listing_id: string;
  author: string;
  rating: number;
  comment: string;
  reply?: string;
  created_at: string;
}
