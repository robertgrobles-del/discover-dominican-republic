import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FieldRow } from "./RegistroFormHelpers";

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
  const tipos = ["Resort All-Inclusive", "Hotel Boutique", "Hotel Colonial", "Hotel de Negocios / Ciudad", "Eco-Lodge & Resort", "Hostal", "Aparta-Hotel"];
  const amenidades = ["Piscina", "Gym", "Spa", "Restaurante", "Bar", "Playa Privada", "Wi-Fi", "Estacionamiento", "Concierge", "Airport Shuttle", "Salones para Eventos", "Recepción 24/7"];

  return (
    <div className="space-y-4">
      <FieldRow>
        <FormField label="Tipo de Alojamiento Hotelero" required>
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
        <FormField label="Total de Habitaciones / Unidades" required>
          <Input placeholder="Ej. 65" value={data.habitaciones || ""} onChange={e => onChange("habitaciones", e.target.value)} type="number" />
        </FormField>
        <FormField label="Tarifa Promedio por Noche (USD)">
          <Input placeholder="Ej. 180" value={data.precio_noche || ""} onChange={e => onChange("precio_noche", e.target.value)} type="number" />
        </FormField>
      </FieldRow>
      <FieldRow>
        <FormField label="Régimen de Hospedaje Principal">
          <Select value={data.regimen || ""} onValueChange={v => onChange("regimen", v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all-inclusive">Todo Incluido (All-Inclusive)</SelectItem>
              <SelectItem value="desayuno">Solo Desayuno (Bed & Breakfast)</SelectItem>
              <SelectItem value="solo-habitacion">Solo Habitación (European Plan)</SelectItem>
              <SelectItem value="media-pension">Media Pensión</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Licencia de Operación MITUR">
          <Input placeholder="Ej. MITUR-AL-2026-894" value={data.licencia_mitur || ""} onChange={e => onChange("licencia_mitur", e.target.value)} />
        </FormField>
      </FieldRow>
      <FormField label="Amenidades e Infraestructura">
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

export function CamposAirbnb({ data, onChange }: { data: Record<string, string>; onChange: (k: string, v: string) => void }) {
  const tiposPropiedad = ["Villa Privada", "Apartamento Completo", "Penthouse Frente al Mar", "Cabaña de Montaña", "Casa de Playa", "Loft Urbano", "Glamping de Lujo", "Habitación Privada"];
  const amenidadesAirbnb = ["Piscina Privada", "Jacuzzi", "Vista al Mar", "Cocina Completa", "Wi-Fi Alta Velocidad", "Aire Acondicionado", "Cerradura Inteligente (Self Check-in)", "Estacionamiento Privado", "Área de BBQ", "Planta Eléctrica / Inversor", "Pet-Friendly", "Lavadora / Secadora"];

  return (
    <div className="space-y-4">
      <FieldRow>
        <FormField label="Tipo de Propiedad" required>
          <Select value={data.tipo_propiedad || ""} onValueChange={v => onChange("tipo_propiedad", v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
            <SelectContent>{tiposPropiedad.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </FormField>
        <FormField label="Capacidad Máxima de Huéspedes" required>
          <Input placeholder="Ej. 6" value={data.capacidad || ""} onChange={e => onChange("capacidad", e.target.value)} type="number" />
        </FormField>
      </FieldRow>
      <FieldRow>
        <FormField label="Habitaciones">
          <Input placeholder="Ej. 3" value={data.habitaciones || ""} onChange={e => onChange("habitaciones", e.target.value)} type="number" />
        </FormField>
        <FormField label="Camas Totales">
          <Input placeholder="Ej. 4" value={data.camas || ""} onChange={e => onChange("camas", e.target.value)} type="number" />
        </FormField>
      </FieldRow>
      <FieldRow>
        <FormField label="Baños Completos">
          <Input placeholder="Ej. 2.5" value={data.banos || ""} onChange={e => onChange("banos", e.target.value)} />
        </FormField>
        <FormField label="Precio por Noche (USD)" required>
          <Input placeholder="Ej. 145" value={data.precio_noche || ""} onChange={e => onChange("precio_noche", e.target.value)} type="number" />
        </FormField>
      </FieldRow>
      <FieldRow>
        <FormField label="Enlace de tu anuncio (Airbnb / VRBO / Booking)">
          <Input placeholder="https://airbnb.com/rooms/..." value={data.enlace_airbnb || ""} onChange={e => onChange("enlace_airbnb", e.target.value)} />
        </FormField>
        <FormField label="Tipo de Check-in">
          <Select value={data.tipo_checkin || ""} onValueChange={v => onChange("tipo_checkin", v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="self">Cerradura inteligente / Caja de llaves</SelectItem>
              <SelectItem value="personal">Recibimiento en persona por el anfitrión</SelectItem>
              <SelectItem value="conserje">Lobby / Conserjería del edificio</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </FieldRow>
      <FormField label="Amenidades de la Propiedad">
        <div className="flex flex-wrap gap-2 mt-1">
          {amenidadesAirbnb.map(a => (
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
                  ? "bg-rose-500 text-white border-rose-500"
                  : "bg-muted text-muted-foreground border-border hover:border-rose-400"
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

// ---------- Tipos sin componente propio: sus campos salen de esta tabla ----------
type Campo = { key: string; label: string; required?: boolean; placeholder?: string; options?: string[] };
const CAMPOS_POR_TIPO: Record<string, Campo[]> = {
  cafe: [
    { key: "tipo_cafe", label: "Tipo de negocio", required: true, options: ["Cafetería de especialidad", "Tostador", "Finca con recorrido", "Cooperativa"] },
    { key: "variedades", label: "Variedades de café", placeholder: "Típica, Caturra, Bourbon…" },
    { key: "duracion_recorrido", label: "Duración del recorrido o cata", placeholder: "Ej. 2 horas" },
    { key: "precio_persona", label: "Precio por persona", placeholder: "Ej. US$ 25" },
  ],
  agencia: [
    { key: "tipo_agencia", label: "Tipo de empresa", required: true, options: ["Agencia de viajes", "Operador receptivo", "Tour operador mayorista", "Agencia en línea"] },
    { key: "licencia_mitur", label: "Licencia MITUR", placeholder: "Número de licencia" },
    { key: "zonas", label: "Zonas que cubre", placeholder: "Punta Cana, Samaná…" },
    { key: "especialidades", label: "Especialidades", placeholder: "Excursiones, traslados, bodas…" },
    { key: "idiomas", label: "Idiomas de atención", placeholder: "Español, inglés, francés…" },
  ],
  guia: [
    { key: "licencia_guia", label: "Carné o licencia de guía", placeholder: "Número de carné" },
    { key: "idiomas", label: "Idiomas", required: true, placeholder: "Español, inglés…" },
    { key: "zonas", label: "Zonas donde guía", required: true, placeholder: "Ciudad Colonial, Jarabacoa…" },
    { key: "especialidad", label: "Especialidad", options: ["Historia y cultura", "Naturaleza y senderismo", "Aves", "Gastronomía", "Aventura", "General"] },
    { key: "tarifa", label: "Tarifa orientativa", placeholder: "Ej. US$ 60 por medio día" },
  ],
  transporte: [
    { key: "tipo_servicio", label: "Tipo de servicio", required: true, options: ["Alquiler de vehículos", "Traslados aeropuerto", "Taxi turístico", "Autobuses y excursiones", "Motos y scooters"] },
    { key: "flota", label: "Tamaño de la flota", placeholder: "Ej. 12 vehículos" },
    { key: "zonas", label: "Zonas de servicio", placeholder: "Aeropuertos y ciudades que cubre" },
    { key: "seguro", label: "Seguro incluido", options: ["Sí, a todo riesgo", "Sí, básico", "Opcional", "No"] },
    { key: "servicio_24h", label: "Servicio 24 horas", options: ["Sí", "No"] },
  ],
  nautica: [
    { key: "tipo_servicio", label: "Tipo de servicio", required: true, options: ["Marina", "Chárter de yate", "Catamarán y excursiones", "Buceo y snorkel", "Pesca deportiva", "Deportes acuáticos"] },
    { key: "capacidad", label: "Capacidad por salida", placeholder: "Ej. 20 personas" },
    { key: "puerto_salida", label: "Puerto o playa de salida", required: true },
    { key: "certificaciones", label: "Certificaciones", placeholder: "PADI, Armada, seguros…" },
    { key: "precio_persona", label: "Precio por persona", placeholder: "Ej. US$ 85" },
  ],
  salud: [
    { key: "tipo_centro", label: "Tipo de centro", required: true, options: ["Hospital o clínica general", "Clínica dental", "Cirugía estética", "Laboratorio", "Centro de rehabilitación", "Farmacia"] },
    { key: "especialidades", label: "Especialidades", required: true, placeholder: "Odontología, cardiología…" },
    { key: "emergencias_24h", label: "Emergencias 24 horas", options: ["Sí", "No"] },
    { key: "seguros", label: "Seguros que acepta", placeholder: "Nacionales e internacionales" },
    { key: "idiomas", label: "Idiomas de atención", placeholder: "Español, inglés…" },
    { key: "acreditaciones", label: "Acreditaciones", placeholder: "JCI, ISO…" },
  ],
  taller: [
    { key: "oficio", label: "Oficio o técnica", required: true, placeholder: "Larimar, cerámica, tabaco, carnaval…" },
    { key: "duracion", label: "Duración de la clase", placeholder: "Ej. 3 horas" },
    { key: "max_participantes", label: "Máximo de participantes", placeholder: "Ej. 8" },
    { key: "precio_persona", label: "Precio por persona", placeholder: "Ej. US$ 45" },
    { key: "incluye", label: "Qué incluye", placeholder: "Materiales, pieza terminada…" },
  ],
  otro: [
    { key: "actividad", label: "¿A qué se dedica tu negocio?", required: true, placeholder: "Describe la actividad principal" },
    { key: "servicios", label: "Servicios que ofrece", placeholder: "Sepáralos con comas" },
    { key: "publico", label: "Público al que se dirige", placeholder: "Familias, parejas, grupos, empresas…" },
  ],
};

/** ¿Tiene este tipo campos propios en el paso 2? */
export const tieneCamposGenericos = (tipo: string) => tipo in CAMPOS_POR_TIPO;
/** Campos obligatorios del paso 2 que faltan por rellenar. */
export const camposRequeridosPendientes = (tipo: string, data: Record<string, string>) => (CAMPOS_POR_TIPO[tipo] ?? []).filter((c) => c.required && !data[c.key]?.trim()).map((c) => c.label);

export function CamposGenericos({ tipo, data, onChange }: { tipo: string; data: Record<string, string>; onChange: (k: string, v: string) => void }) {
  const campos = CAMPOS_POR_TIPO[tipo] ?? [];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {campos.map((c) => (
        <FormField key={c.key} label={c.label} required={c.required}>
          {c.options ? (
            <Select value={data[c.key] || ""} onValueChange={(v) => onChange(c.key, v)}>
              <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
              <SelectContent>{c.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          ) : (
            <Input maxLength={200} placeholder={c.placeholder} value={data[c.key] || ""} onChange={(e) => onChange(c.key, e.target.value)} />
          )}
        </FormField>
      ))}
    </div>
  );
}
