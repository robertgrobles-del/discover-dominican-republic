import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, FileText, Plane, MapPin, Phone, ShieldCheck, AlertTriangle, CheckCircle, Info } from "lucide-react";

const requisitosEntrada = [
  { label: "Certificado de salud", value: "Emitido por veterinario autorizado, máximo 15 días antes del viaje", obligatorio: true },
  { label: "Vacuna antirrábica", value: "Vigente, mínimo 30 días y máximo 12 meses antes del viaje", obligatorio: true },
  { label: "Desparasitación", value: "Certificado de desparasitación interna y externa reciente", obligatorio: true },
  { label: "Microchip", value: "Recomendado (ISO 11784/11785). No obligatorio pero muy recomendado", obligatorio: false },
  { label: "Permiso de importación", value: "Solicitar al Ministerio de Agricultura de RD (online o en aeropuerto)", obligatorio: true },
  { label: "Inspección en aeropuerto", value: "Tu mascota será revisada por un veterinario del Ministerio de Agricultura", obligatorio: true },
];

const hotelesPetFriendly = [
  { nombre: "Casa de Campo Resort & Villas", zona: "La Romana", politica: "Acepta perros pequeños y medianos (<20 kg). Depósito reembolsable US$150.", telefono: "+1 809-523-3333" },
  { nombre: "The Westin Puntacana", zona: "Punta Cana", politica: "Programa Westin Pet-Friendly. Cama, platos y snacks incluidos. Máx 18 kg.", telefono: "+1 809-959-2222" },
  { nombre: "Hodelpa Nicolas de Ovando", zona: "Santo Domingo", politica: "Acepta mascotas pequeñas con aviso previo. Cargo adicional por noche.", telefono: "+1 809-685-9955" },
  { nombre: "Airbnb / Villas privadas", zona: "Todo el país", politica: "Muchas propiedades privadas aceptan mascotas. Filtra por 'Pet Friendly' al buscar.", telefono: "N/A" },
];

const playas = [
  { nombre: "Playa Encuentro", zona: "Cabarete", nota: "Playa relajada donde los perros son bienvenidos, especialmente temprano en la mañana" },
  { nombre: "Playa Grande", zona: "Río San Juan", nota: "Amplia y con pocas restricciones. Ideal para perros activos" },
  { nombre: "Playa Frontón", zona: "Las Galeras", nota: "Playa remota accesible por bote. Muy pocos visitantes, perfecta para mascotas" },
  { nombre: "Juan Dolio (zonas no privadas)", zona: "San Pedro", nota: "Secciones públicas donde los perros pueden correr libremente" },
];

const veterinarios = [
  { nombre: "Hospital Veterinario Central", zona: "Santo Domingo", telefono: "+1 809-567-3535", servicio: "Emergencias 24h, cirugía, diagnóstico" },
  { nombre: "Pet's Paradise", zona: "Santiago", telefono: "+1 809-582-4567", servicio: "Consultas, vacunación, estética canina" },
  { nombre: "Clínica Veterinaria del Este", zona: "Punta Cana", telefono: "+1 809-455-1234", servicio: "Atención general, emergencias" },
  { nombre: "Animal Care RD", zona: "La Romana", telefono: "+1 809-556-7890", servicio: "Internamiento, cirugía, laboratorio" },
];

const consejosViaje = [
  { emoji: "💧", texto: "Lleva siempre agua fresca para tu mascota — el calor tropical deshidrata rápido" },
  { emoji: "🌡️", texto: "Evita paseos entre 11am-3pm — el asfalto puede quemar las patas" },
  { emoji: "🦟", texto: "Usa repelente para mascotas — hay mosquitos y garrapatas en zonas rurales" },
  { emoji: "🏖️", texto: "Enjuaga a tu mascota después del mar — la sal irrita la piel" },
  { emoji: "🚗", texto: "En taxis, confirma que aceptan mascotas antes de abordar" },
  { emoji: "📋", texto: "Lleva copias de todos los documentos veterinarios en tu teléfono" },
];

export default function ViajarConMascotas() {
  return (
    <PageTransition>
      <SEOHead
        title="Viajar con Mascotas a República Dominicana"
        description="Guía completa para traer tu mascota a RD: requisitos de entrada, hoteles pet-friendly, playas para perros, veterinarios y consejos prácticos."
        keywords="mascotas dominicana, perros playa caribe, pet friendly punta cana, viajar con perro RD, veterinarios dominicana"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Heart className="h-3 w-3 mr-1" /> Pet-Friendly
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Viajar con <span className="text-primary">Mascotas</span> a RD
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Tu compañero peludo también merece unas vacaciones caribeñas. Guía completa con requisitos, alojamientos y playas pet-friendly.
            </p>
          </div>
        </section>

        {/* Tips rápidos */}
        <section className="py-8 bg-card/50 border-b border-border">
          <div className="container mx-auto px-4">
            <h2 className="font-semibold text-foreground mb-4 text-center text-sm uppercase tracking-wide">🐾 Tips Rápidos</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {consejosViaje.map(c => (
                <Badge key={c.texto} variant="outline" className="py-2 px-3 text-sm">
                  {c.emoji} {c.texto}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Requisitos de entrada */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">📋 Requisitos de Entrada</h2>
            <div className="space-y-4">
              {requisitosEntrada.map(r => (
                <div key={r.label} className="flex items-start gap-4 bg-card rounded-xl p-5 border border-border">
                  <div className="mt-0.5">
                    {r.obligatorio ? (
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Info className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{r.label}</h3>
                      {r.obligatorio && <Badge variant="destructive" className="text-xs">Obligatorio</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{r.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hoteles */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">🏨 Alojamientos Pet-Friendly</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {hotelesPetFriendly.map(h => (
                <Card key={h.nombre}>
                  <CardContent className="p-6">
                    <h3 className="font-display font-bold text-foreground mb-1">{h.nombre}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-3 w-3" /> {h.zona}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{h.politica}</p>
                    {h.telefono !== "N/A" && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" /> {h.telefono}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Playas */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">🏖️ Playas donde tu Mascota es Bienvenida</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {playas.map(p => (
                <div key={p.nombre} className="bg-card rounded-xl p-5 border border-border">
                  <h3 className="font-semibold text-foreground mb-1">{p.nombre}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3" /> {p.zona}
                  </div>
                  <p className="text-sm text-muted-foreground">{p.nota}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Veterinarios */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">🏥 Veterinarios de Emergencia</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {veterinarios.map(v => (
                <Card key={v.nombre}>
                  <CardContent className="p-6">
                    <h3 className="font-display font-bold text-foreground mb-1">{v.nombre}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3" /> {v.zona}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{v.servicio}</p>
                    <div className="flex items-center gap-1 text-sm text-primary font-medium">
                      <Phone className="h-3 w-3" /> {v.telefono}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Aerolíneas */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">✈️ Aerolíneas con Servicio de Mascotas a RD</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { nombre: "JetBlue", politica: "Cabina: mascotas <9 kg. Cargo ~US$125", icono: "🇺🇸" },
                { nombre: "American Airlines", politica: "Cabina y bodega. Cargo ~US$125-200", icono: "🇺🇸" },
                { nombre: "United Airlines", politica: "PetSafe program. Cabina y bodega", icono: "🇺🇸" },
                { nombre: "Copa Airlines", politica: "Cabina: <7 kg. Bodega: >7 kg", icono: "🇵🇦" },
                { nombre: "Air Canada", politica: "Cabina: mascotas pequeñas. Reservar con anticipación", icono: "🇨🇦" },
                { nombre: "Iberia", politica: "Cabina: <8 kg con transportín. Bodega disponible", icono: "🇪🇸" },
              ].map(a => (
                <div key={a.nombre} className="bg-card rounded-xl p-5 border border-border">
                  <h3 className="font-semibold text-foreground mb-1">{a.icono} {a.nombre}</h3>
                  <p className="text-sm text-muted-foreground">{a.politica}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
