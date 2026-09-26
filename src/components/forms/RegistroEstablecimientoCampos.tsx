import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check } from "lucide-react";
import React from "react";

export function StepIndicator({ step, total }: { step: number; total: number }) {
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

export function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-4">{children}</div>;
}

export function FormField({
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

export function CamposRestaurante({ data, onChange }: { data: Record<string, string>; onChange: (k: string, v: string) => void }) {
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

export function CamposBar({ data, onChange }: { data: Record<string, string>; onChange: (k: string, v: string) => void }) {
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

export function CamposHotel({ data, onChange }: { data: Record<string, string>; onChange: (k: string, v: string) => void }) {
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

export function CamposTour({ data, onChange }: { data: Record<string, string>; onChange: (k: string, v: string) => void }) {
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

export function CamposSpa({ data, onChange }: { data: Record<string, string>; onChange: (k: string, v: string) => void }) {
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

export function CamposTienda({ data, onChange }: { data: Record<string, string>; onChange: (k: string, v: string) => void }) {
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
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all border ${
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
      <FormField label="¿Ofrecen Envíos Internacionales?">
        <Select value={data.envios || ""} onValueChange={v => onChange("envios", v)}>
          <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="si">Sí, enviamos a todo el mundo</SelectItem>
            <SelectItem value="nacional">Solo dentro de República Dominicana</SelectItem>
            <SelectItem value="no">Solo retiro en tienda</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
    </div>
  );
}

export function CamposGeneral({ data, onChange }: { data: Record<string, string>; onChange: (k: string, v: string) => void }) {
  return (
    <div className="space-y-4">
      <FormField label="Categoría Específica">
        <Input placeholder="Ej. Museo, Parque temático, Transporte..." value={data.categoria_especifica || ""} onChange={e => onChange("categoria_especifica", e.target.value)} />
      </FormField>
      <FormField label="Detalles o Servicios Ofrecidos">
        <Input placeholder="Describe brevemente tus servicios principales..." value={data.servicios || ""} onChange={e => onChange("servicios", e.target.value)} />
      </FormField>
    </div>
  );
}
