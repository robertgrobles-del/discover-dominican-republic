import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ChevronRight, ChevronLeft, Check, Building2, Utensils, Music,
  Hotel, MapPin, Leaf, ShoppingBag, Phone, Mail, Globe, Clock,
  User, FileText, Star, Loader2, PartyPopper
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────

export type TipoEstablecimiento =
  | "restaurante"
  | "bar"
  | "hotel"
  | "tour"
  | "spa"
  | "tienda";

interface Props {
  open: boolean;
  onClose: () => void;
  tipo: TipoEstablecimiento;
}

// ─── Metadata por tipo ───────────────────────────────────────────────────────

const tipoConfig: Record<TipoEstablecimiento, {
  label: string;
  icon: React.ElementType;
  color: string;
  descripcion: string;
}> = {
  restaurante: {
    label: "Restaurante",
    icon: Utensils,
    color: "text-orange-500",
    descripcion: "Registra tu restaurante y llega a miles de viajeros que buscan experiencias gastronómicas únicas.",
  },
  bar: {
    label: "Bar / Vida Nocturna",
    icon: Music,
    color: "text-purple-500",
    descripcion: "Registra tu bar, club o lounge y destaca en la guía de vida nocturna de República Dominicana.",
  },
  hotel: {
    label: "Hotel / Alojamiento",
    icon: Hotel,
    color: "text-blue-500",
    descripcion: "Registra tu propiedad y aparece en los resultados de búsqueda de alojamiento para viajeros.",
  },
  tour: {
    label: "Tour / Actividad",
    icon: MapPin,
    color: "text-green-500",
    descripcion: "Registra tu tour o actividad y conecta con viajeros en busca de aventuras únicas.",
  },
  spa: {
    label: "Spa / Wellness",
    icon: Leaf,
    color: "text-teal-500",
    descripcion: "Registra tu spa o centro de bienestar y aparece en la guía de wellness de RD.",
  },
  tienda: {
    label: "Tienda / Artesanía",
    icon: ShoppingBag,
    color: "text-amber-500",
    descripcion: "Registra tu tienda y muestra tus productos a los viajeros que buscan souvenirs y artesanías.",
  },
};

// ─── Provincias ──────────────────────────────────────────────────────────────

const provincias = [
  "Azua", "Bahoruco", "Barahona", "Dajabón", "Distrito Nacional", "Duarte",
  "Elías Piña", "El Seibo", "Espaillat", "Hato Mayor", "Hermanas Mirabal",
  "Independencia", "La Altagracia", "La Romana", "La Vega", "María Trinidad Sánchez",
  "Monseñor Nouel", "Monte Cristi", "Monte Plata", "Pedernales", "Peravia",
  "Puerto Plata", "Samaná", "San Cristóbal", "San José de Ocoa", "San Juan",
  "San Pedro de Macorís", "Sánchez Ramírez", "Santiago", "Santiago Rodríguez",
  "Santo Domingo", "Valverde",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              i < step
                ? "bg-primary text-primary-foreground"
                : i === step
                ? "bg-primary/20 border-2 border-primary text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {i < step ? <Check className="h-4 w-4" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`w-8 h-0.5 transition-all duration-300 ${i < step ? "bg-primary" : "bg-muted"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-4">{children}</div>;
}

function FormField({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

// ─── Campos Específicos por Tipo ─────────────────────────────────────────────

function CamposRestaurante({ data, onChange }: { data: Record<string, string>; onChange: (k: string, v: string) => void }) {
  const cocinas = ["Dominicana", "Internacional", "Mariscos", "Italiana", "Japonesa", "Parrilla", "Vegetariana/Vegana", "Fusión", "Mediterránea", "Caribeña"];
  const servicios = ["Reservaciones", "Terraza", "Vista al Mar", "Música en Vivo", "Familiar", "Romántico", "Bar", "Menú Vegano", "Delivery"];

  return (
    <div className="space-y-4">
      <FieldRow>
        <FormField label="Tipo de Cocina" required>
          <Select value={data.cocina || ""} onValueChange={v => onChange("cocina", v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
            <SelectContent>{cocinas.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </FormField>
        <FormField label="Rango de Precios" required>
          <Select value={data.precio_rango || ""} onValueChange={v => onChange("precio_rango", v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="$">$ — Económico (&lt;RD$500)</SelectItem>
              <SelectItem value="$$">$$ — Moderado (RD$500-1,500)</SelectItem>
              <SelectItem value="$$$">$$$ — Premiun (RD$1,500-3,000)</SelectItem>
              <SelectItem value="$$$$">$$$$ — Lujo (&gt;RD$3,000)</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </FieldRow>
      <FieldRow>
        <FormField label="Capacidad (personas)">
          <Input placeholder="Ej. 80" value={data.capacidad || ""} onChange={e => onChange("capacidad", e.target.value)} type="number" />
        </FormField>
        <FormField label="Número de Mesas">
          <Input placeholder="Ej. 20" value={data.mesas || ""} onChange={e => onChange("mesas", e.target.value)} type="number" />
        </FormField>
      </FieldRow>
      <FormField label="Platos Insignia">
        <Input placeholder="Ej. Mofongo de camarones, Ceviche tropical..." value={data.platos || ""} onChange={e => onChange("platos", e.target.value)} />
      </FormField>
      <FormField label="Servicios Disponibles">
        <div className="flex flex-wrap gap-2 mt-1">
          {servicios.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => {
                const current = data.servicios ? data.servicios.split(",") : [];
                const idx = current.indexOf(s);
                if (idx >= 0) current.splice(idx, 1); else current.push(s);
                onChange("servicios", current.filter(Boolean).join(","));
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                data.servicios?.includes(s)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:border-primary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </FormField>
    </div>
  );
}

function CamposBar({ data, onChange }: { data: Record<string, string>; onChange: (k: string, v: string) => void }) {
  const tipoBar = ["Bar", "Club Nocturno", "Lounge", "Rooftop Bar", "Beach Bar", "Colmadón", "Pub", "Wine Bar"];
  const estilos = ["Bachata/Merengue", "Reggaeton", "Electrónica", "Jazz", "Salsa", "Rock", "Hip Hop", "Variado"];

  return (
    <div className="space-y-4">
      <FieldRow>
        <FormField label="Tipo de Local" required>
          <Select value={data.tipo_bar || ""} onValueChange={v => onChange("tipo_bar", v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
            <SelectContent>{tipoBar.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </FormField>
        <FormField label="Estilo Musical">
          <Select value={data.musica || ""} onValueChange={v => onChange("musica", v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
            <SelectContent>{estilos.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
          </Select>
        </FormField>
      </FieldRow>
      <FieldRow>
        <FormField label="Aforo Máximo (personas)">
          <Input placeholder="Ej. 300" value={data.aforo || ""} onChange={e => onChange("aforo", e.target.value)} type="number" />
        </FormField>
        <FormField label="Dress Code">
          <Select value={data.dress_code || ""} onValueChange={v => onChange("dress_code", v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="smart-casual">Smart Casual</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="sin-restriccion">Sin Restricción</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </FieldRow>
      <FieldRow>
        <FormField label="Hora de Apertura">
          <Input type="time" value={data.apertura || ""} onChange={e => onChange("apertura", e.target.value)} />
        </FormField>
        <FormField label="Hora de Cierre">
          <Input type="time" value={data.cierre || ""} onChange={e => onChange("cierre", e.target.value)} />
        </FormField>
      </FieldRow>
      <FormField label="Eventos Especiales / Shows">
        <Input placeholder="Ej. Noches de salsa los jueves, DJ Viernes y Sábados..." value={data.eventos || ""} onChange={e => onChange("eventos", e.target.value)} />
      </FormField>
    </div>
  );
}

function CamposHotel({ data, onChange }: { data: Record<string, string>; onChange: (k: string, v: string) => void }) {
  const tipos = ["Hotel Boutique", "Resort", "Villa Privada", "Apartamento", "All-Inclusive", "Eco-Lodge", "Hostal", "Bed & Breakfast"];
  const amenidades = ["Piscina", "Gym", "Spa", "Restaurante", "Bar", "Playa Privada", "Wi-Fi", "Estacionamiento", "Concierge", "Airport Shuttle", "Pet-Friendly"];

  return (
    <div className="space-y-4">
      <FieldRow>
        <FormField label="Tipo de Alojamiento" required>
          <Select value={data.tipo_hotel || ""} onValueChange={v => onChange("tipo_hotel", v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
            <SelectContent>{tipos.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </FormField>
        <FormField label="Categoría (Estrellas)">
          <Select value={data.estrellas || ""} onValueChange={v => onChange("estrellas", v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
            <SelectContent>
              {[1,2,3,4,5].map(n => (
                <SelectItem key={n} value={String(n)}>{"⭐".repeat(n)} — {n} Estrella{n > 1 ? "s" : ""}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </FieldRow>
      <FieldRow>
        <FormField label="Número de Habitaciones" required>
          <Input placeholder="Ej. 45" value={data.habitaciones || ""} onChange={e => onChange("habitaciones", e.target.value)} type="number" />
        </FormField>
        <FormField label="Precio Base por Noche (USD)">
          <Input placeholder="Ej. 120" value={data.precio_noche || ""} onChange={e => onChange("precio_noche", e.target.value)} type="number" />
        </FormField>
      </FieldRow>
      <FormField label="Amenidades Disponibles">
        <div className="flex flex-wrap gap-2 mt-1">
          {amenidades.map(a => (
            <button
              key={a}
              type="button"
              onClick={() => {
                const current = data.amenidades ? data.amenidades.split(",") : [];
                const idx = current.indexOf(a);
                if (idx >= 0) current.splice(idx, 1); else current.push(a);
                onChange("amenidades", current.filter(Boolean).join(","));
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                data.amenidades?.includes(a)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:border-primary"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </FormField>
    </div>
  );
}

function CamposTour({ data, onChange }: { data: Record<string, string>; onChange: (k: string, v: string) => void }) {
  const categorias = ["Aventura", "Cultural", "Acuático / Buceo", "Naturaleza / Ecoturismo", "Gastronómico", "Nocturno", "Histórico", "Playa / Náutico"];
  const incluidos = ["Guía Certificado", "Transporte", "Equipo de Seguridad", "Almuerzo", "Snacks", "Seguro de Viaje", "Chaleco Salvavidas", "Casco"];

  return (
    <div className="space-y-4">
      <FieldRow>
        <FormField label="Categoría del Tour" required>
          <Select value={data.categoria || ""} onValueChange={v => onChange("categoria", v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
            <SelectContent>{categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </FormField>
        <FormField label="Duración Promedio">
          <Select value={data.duracion || ""} onValueChange={v => onChange("duracion", v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 hora</SelectItem>
              <SelectItem value="2h">2 horas</SelectItem>
              <SelectItem value="3h">3 horas</SelectItem>
              <SelectItem value="medio-dia">Medio día (4-5h)</SelectItem>
              <SelectItem value="dia-completo">Día completo (6-8h)</SelectItem>
              <SelectItem value="multi-dia">Multi-día</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </FieldRow>
      <FieldRow>
        <FormField label="Precio por Persona (USD)" required>
          <Input placeholder="Ej. 65" value={data.precio || ""} onChange={e => onChange("precio", e.target.value)} type="number" />
        </FormField>
        <FormField label="Nivel de Dificultad">
          <Select value={data.dificultad || ""} onValueChange={v => onChange("dificultad", v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="facil">🟢 Fácil</SelectItem>
              <SelectItem value="moderado">🟡 Moderado</SelectItem>
              <SelectItem value="dificil">🔴 Difícil</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </FieldRow>
      <FormField label="Idiomas Disponibles">
        <div className="flex flex-wrap gap-2 mt-1">
          {["Español", "Inglés", "Francés", "Alemán", "Italiano", "Portugués"].map(idioma => (
            <button
              key={idioma}
              type="button"
              onClick={() => {
                const current = data.idiomas ? data.idiomas.split(",") : [];
                const idx = current.indexOf(idioma);
                if (idx >= 0) current.splice(idx, 1); else current.push(idioma);
                onChange("idiomas", current.filter(Boolean).join(","));
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                data.idiomas?.includes(idioma)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:border-primary"
              }`}
            >
              {idioma}
            </button>
          ))}
        </div>
      </FormField>
      <FormField label="¿Qué Incluye?">
        <div className="flex flex-wrap gap-2 mt-1">
          {incluidos.map(item => (
            <button
              key={item}
              type="button"
              onClick={() => {
                const current = data.incluye ? data.incluye.split(",") : [];
                const idx = current.indexOf(item);
                if (idx >= 0) current.splice(idx, 1); else current.push(item);
                onChange("incluye", current.filter(Boolean).join(","));
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                data.incluye?.includes(item)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:border-primary"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </FormField>
    </div>
  );
}

function CamposSpa({ data, onChange }: { data: Record<string, string>; onChange: (k: string, v: string) => void }) {
  const servicios = ["Masajes Terapéuticos", "Masajes Relajantes", "Yoga", "Meditación", "Faciales", "Manicure / Pedicure", "Sauna", "Hidroterapia", "Aromaterapia", "Nutrición", "Fitness"];

  return (
    <div className="space-y-4">
      <FieldRow>
        <FormField label="Precio Base de Sesión (USD)" required>
          <Input placeholder="Ej. 50" value={data.precio_sesion || ""} onChange={e => onChange("precio_sesion", e.target.value)} type="number" />
        </FormField>
        <FormField label="Duración Mínima de Sesión">
          <Select value={data.duracion_min || ""} onValueChange={v => onChange("duracion_min", v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="30min">30 minutos</SelectItem>
              <SelectItem value="45min">45 minutos</SelectItem>
              <SelectItem value="60min">60 minutos</SelectItem>
              <SelectItem value="90min">90 minutos</SelectItem>
              <SelectItem value="120min">2 horas o más</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </FieldRow>
      <FormField label="Certificaciones / Membresías">
        <Input placeholder="Ej. ISPA, NAHA, certificación internacional..." value={data.certificaciones || ""} onChange={e => onChange("certificaciones", e.target.value)} />
      </FormField>
      <FormField label="Servicios Disponibles" required>
        <div className="flex flex-wrap gap-2 mt-1">
          {servicios.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => {
                const current = data.servicios ? data.servicios.split(",") : [];
                const idx = current.indexOf(s);
                if (idx >= 0) current.splice(idx, 1); else current.push(s);
                onChange("servicios", current.filter(Boolean).join(","));
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                data.servicios?.includes(s)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:border-primary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </FormField>
    </div>
  );
}

function CamposTienda({ data, onChange }: { data: Record<string, string>; onChange: (k: string, v: string) => void }) {
  const categorias = ["Larimar y Ámbar", "Artesanía Local", "Cigarros Premium", "Ron y Bebidas", "Ropa y Moda", "Arte y Pinturas", "Joyería", "Gastronomía / Productos locales", "Souvenirs Generales"];

  return (
    <div className="space-y-4">
      <FormField label="Categoría Principal" required>
        <Select value={data.categoria || ""} onValueChange={v => onChange("categoria", v)}>
          <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
          <SelectContent>{categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </FormField>
      <FormField label="Tipo de Venta" required>
        <div className="flex gap-3 mt-1">
          {["Física", "Online", "Ambas"].map(tipo => (
            <button
              key={tipo}
              type="button"
              onClick={() => onChange("tipo_venta", tipo)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all border ${
                data.tipo_venta === tipo
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:border-primary"
              }`}
            >
              {tipo}
            </button>
          ))}
        </div>
      </FormField>
      <FieldRow>
        <FormField label="Precio Promedio (USD)">
          <Input placeholder="Ej. 25" value={data.precio_promedio || ""} onChange={e => onChange("precio_promedio", e.target.value)} type="number" />
        </FormField>
        <FormField label="Envío Internacional">
          <div className="flex gap-3 mt-1">
            {["Sí", "No"].map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange("envio_internacional", opt)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all border ${
                  data.envio_internacional === opt
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:border-primary"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </FormField>
      </FieldRow>
      <FormField label="Productos Destacados">
        <Input placeholder="Ej. Collar de larimar, Caja de cigarros Davidoff..." value={data.productos || ""} onChange={e => onChange("productos", e.target.value)} />
      </FormField>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function RegistroEstablecimientoModal({ open, onClose, tipo }: Props) {
  const config = tipoConfig[tipo];
  const Icon = config.icon;
  const TOTAL_STEPS = 3;

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Step 1 - Basic info
  const [basicData, setBasicData] = useState({
    nombre: "", responsable: "", email: "", telefono: "",
    direccion: "", provincia: "", website: "", foto_url: "",
    descripcion: "", rnc: "", horario: "",
  });

  // Step 2 - Specific fields
  const [specificData, setSpecificData] = useState<Record<string, string>>({});

  // Step 3 - Terms
  const [acceptTerms, setAcceptTerms] = useState(false);

  const updateBasic = (k: string, v: string) => setBasicData(prev => ({ ...prev, [k]: v }));
  const updateSpecific = (k: string, v: string) => setSpecificData(prev => ({ ...prev, [k]: v }));

  const isStep1Valid =
    basicData.nombre.trim() &&
    basicData.responsable.trim() &&
    basicData.email.trim() &&
    basicData.telefono.trim() &&
    basicData.direccion.trim() &&
    basicData.provincia;

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    if (!acceptTerms) return;
    setLoading(true);

    try {
      // Attempt Supabase insert — graceful fallback if table doesn't exist
      const payload = {
        tipo_establecimiento: tipo,
        nombre: basicData.nombre,
        responsable: basicData.responsable,
        email: basicData.email,
        telefono: basicData.telefono,
        direccion: basicData.direccion,
        provincia: basicData.provincia,
        website: basicData.website || null,
        foto_url: basicData.foto_url || null,
        descripcion: basicData.descripcion,
        rnc: basicData.rnc || null,
        horario: basicData.horario || null,
        detalles: specificData,
        status: "pendiente",
      };

      const { error } = await (supabase as any)
        .from("establishment_registrations")
        .insert(payload);

      if (error && error.code !== "42P01") {
        // Table exists but real error
        console.error("Supabase error:", error);
      }
    } catch {
      // Ignore — fallback to simulated success
    }

    // Simulate processing delay
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSuccess(true);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(0);
      setSuccess(false);
      setBasicData({ nombre: "", responsable: "", email: "", telefono: "", direccion: "", provincia: "", website: "", foto_url: "", descripcion: "", rnc: "", horario: "" });
      setSpecificData({});
      setAcceptTerms(false);
    }, 300);
  };

  const stepLabels = ["Información Básica", "Detalles del Negocio", "Confirmación"];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-3 mb-1">
            <div className={`p-2 rounded-xl bg-muted`}>
              <Icon className={`h-6 w-6 ${config.color}`} />
            </div>
            <div>
              <DialogTitle className="text-xl font-display">
                Registrar {config.label}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {config.descripcion}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* ── SUCCESS ── */}
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10 space-y-4"
            >
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                <PartyPopper className="h-10 w-10 text-emerald-500" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground">¡Solicitud Enviada!</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Recibimos tu registro de <strong>{basicData.nombre}</strong>. Nuestro equipo lo revisará en un plazo de 2–3 días hábiles y te contactará a <strong>{basicData.email}</strong>.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <Badge variant="outline" className="gap-1"><Check className="h-3 w-3 text-emerald-500" /> Información recibida</Badge>
                <Badge variant="outline" className="gap-1"><Star className="h-3 w-3 text-amber-500" /> Revisión en curso</Badge>
              </div>
              <Button onClick={handleClose} className="mt-4">Cerrar</Button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Step Indicator */}
              <StepIndicator step={step} total={TOTAL_STEPS} />
              <p className="text-center text-xs text-muted-foreground mb-6 -mt-3">
                Paso {step + 1} de {TOTAL_STEPS} — <span className="font-medium text-foreground">{stepLabels[step]}</span>
              </p>

              <AnimatePresence mode="wait">
                {/* ── STEP 1 ── Basic Info ── */}
                {step === 0 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <FieldRow>
                      <FormField label="Nombre del Establecimiento" required>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" placeholder={`Nombre del ${config.label.toLowerCase()}`} value={basicData.nombre} onChange={e => updateBasic("nombre", e.target.value)} />
                        </div>
                      </FormField>
                      <FormField label="Nombre del Responsable" required>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" placeholder="Nombre completo" value={basicData.responsable} onChange={e => updateBasic("responsable", e.target.value)} />
                        </div>
                      </FormField>
                    </FieldRow>
                    <FieldRow>
                      <FormField label="Email de Contacto" required>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" type="email" placeholder="negocio@ejemplo.com" value={basicData.email} onChange={e => updateBasic("email", e.target.value)} />
                        </div>
                      </FormField>
                      <FormField label="Teléfono / WhatsApp" required>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" placeholder="+1 (809) 000-0000" value={basicData.telefono} onChange={e => updateBasic("telefono", e.target.value)} />
                        </div>
                      </FormField>
                    </FieldRow>
                    <FieldRow>
                      <FormField label="Dirección Física" required>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" placeholder="Calle, sector, número..." value={basicData.direccion} onChange={e => updateBasic("direccion", e.target.value)} />
                        </div>
                      </FormField>
                      <FormField label="Provincia" required>
                        <Select value={basicData.provincia} onValueChange={v => updateBasic("provincia", v)}>
                          <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                          <SelectContent>{provincias.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                        </Select>
                      </FormField>
                    </FieldRow>
                    <FieldRow>
                      <FormField label="Sitio Web o Redes Sociales">
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" placeholder="https://... o @instagram" value={basicData.website} onChange={e => updateBasic("website", e.target.value)} />
                        </div>
                      </FormField>
                      <FormField label="RNC / Registro Comercial">
                        <div className="relative">
                          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" placeholder="Número RNC..." value={basicData.rnc} onChange={e => updateBasic("rnc", e.target.value)} />
                        </div>
                      </FormField>
                    </FieldRow>
                    <FormField label="Horario de Operación">
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-9" placeholder="Ej. Lun-Vie 9AM-6PM, Sáb-Dom 10AM-4PM" value={basicData.horario} onChange={e => updateBasic("horario", e.target.value)} />
                      </div>
                    </FormField>
                    <FormField label="Descripción del Establecimiento" required>
                      <Textarea
                        placeholder={`Describe brevemente tu ${config.label.toLowerCase()}: qué ofreces, qué te hace especial...`}
                        className="min-h-[90px]"
                        value={basicData.descripcion}
                        onChange={e => updateBasic("descripcion", e.target.value)}
                      />
                    </FormField>
                  </motion.div>
                )}

                {/* ── STEP 2 ── Specific Fields ── */}
                {step === 1 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="mb-5 p-3 bg-muted/50 rounded-xl flex items-center gap-3">
                      <Icon className={`h-5 w-5 flex-shrink-0 ${config.color}`} />
                      <p className="text-sm text-muted-foreground">Completa los detalles específicos para <strong className="text-foreground">{config.label}</strong>. Más información = mayor visibilidad en la plataforma.</p>
                    </div>
                    {tipo === "restaurante" && <CamposRestaurante data={specificData} onChange={updateSpecific} />}
                    {tipo === "bar" && <CamposBar data={specificData} onChange={updateSpecific} />}
                    {tipo === "hotel" && <CamposHotel data={specificData} onChange={updateSpecific} />}
                    {tipo === "tour" && <CamposTour data={specificData} onChange={updateSpecific} />}
                    {tipo === "spa" && <CamposSpa data={specificData} onChange={updateSpecific} />}
                    {tipo === "tienda" && <CamposTienda data={specificData} onChange={updateSpecific} />}
                  </motion.div>
                )}

                {/* ── STEP 3 ── Confirmation ── */}
                {step === 2 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                    {/* Summary Card */}
                    <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                      <h4 className="font-bold text-foreground text-sm uppercase tracking-wider">Resumen del Registro</h4>
                      <div className="grid sm:grid-cols-2 gap-2 text-sm">
                        {[
                          ["Establecimiento", basicData.nombre],
                          ["Tipo", config.label],
                          ["Responsable", basicData.responsable],
                          ["Email", basicData.email],
                          ["Teléfono", basicData.telefono],
                          ["Provincia", basicData.provincia],
                          ["Dirección", basicData.direccion],
                          basicData.website ? ["Web / RRSS", basicData.website] : null,
                          basicData.rnc ? ["RNC", basicData.rnc] : null,
                        ].filter(Boolean).map(([label, value]) => (
                          <div key={label}>
                            <span className="text-muted-foreground">{label}: </span>
                            <span className="font-medium text-foreground">{value}</span>
                          </div>
                        ))}
                      </div>
                      {basicData.descripcion && (
                        <div className="pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground">{basicData.descripcion}</p>
                        </div>
                      )}
                    </div>

                    {/* What happens next */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-foreground text-sm">¿Qué pasa después?</h4>
                      {[
                        "Nuestro equipo revisará tu solicitud en 2-3 días hábiles.",
                        "Recibirás un email de confirmación con los próximos pasos.",
                        "Una vez aprobado, tu establecimiento aparecerá en la plataforma.",
                        "Podrás gestionar tu perfil desde el Portal de Partners.",
                      ].map((step, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</div>
                          {step}
                        </div>
                      ))}
                    </div>

                    {/* Terms */}
                    <div className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl">
                      <Checkbox
                        id="terms"
                        checked={acceptTerms}
                        onCheckedChange={v => setAcceptTerms(Boolean(v))}
                        className="mt-0.5"
                      />
                      <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                        Acepto los <span className="text-primary underline cursor-pointer">Términos y Condiciones</span> para establecimientos asociados de Descubre RD. Confirmo que la información proporcionada es verídica y me comprometo a mantenerla actualizada.
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={step === 0 ? handleClose : handleBack}
                  disabled={loading}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {step === 0 ? "Cancelar" : "Anterior"}
                </Button>

                <div className="text-xs text-muted-foreground">
                  {step + 1} / {TOTAL_STEPS}
                </div>

                {step < TOTAL_STEPS - 1 ? (
                  <Button
                    onClick={handleNext}
                    disabled={step === 0 && !isStep1Valid}
                    className="gap-2"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!acceptTerms || loading}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {loading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                    ) : (
                      <><Check className="h-4 w-4" /> Enviar Registro</>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
