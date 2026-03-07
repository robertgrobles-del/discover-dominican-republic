import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Accessibility, Heart, MapPin, Star, Stethoscope, Car, Sun, ShieldCheck, Phone, CheckCircle } from "lucide-react";

const destinosRecomendados = [
  {
    nombre: "Punta Cana — Bávaro",
    porque: "Resorts todo incluido con infraestructura accesible, playas suaves, transporte puerta a puerta.",
    ideal: "Primer viaje, movilidad reducida, parejas",
    estrellas: 5,
  },
  {
    nombre: "Santo Domingo — Zona Colonial",
    porque: "Cultura e historia a ritmo pausado. Museos, restaurantes, plaza España. Calles empedradas (considerar movilidad).",
    ideal: "Amantes de la historia, caminatas suaves",
    estrellas: 4,
  },
  {
    nombre: "Samaná",
    porque: "Avistamiento de ballenas (enero-marzo), paisajes, tranquilidad. Excursiones en bote sin esfuerzo físico.",
    ideal: "Naturaleza, fotografía, paz",
    estrellas: 5,
  },
  {
    nombre: "Jarabacoa",
    porque: "Clima fresco de montaña (18-25°C). Menos calor, paisajes verdes, rancho temáticos accesibles.",
    ideal: "Escapar del calor, agroturismo",
    estrellas: 4,
  },
  {
    nombre: "Casa de Campo — La Romana",
    porque: "Resort de lujo con golf, spa, playa privada. Transporte en carrito por todo el resort.",
    ideal: "Lujo, golf, actividades relajadas",
    estrellas: 5,
  },
];

const resortsAdaptados = [
  { nombre: "Barceló Bávaro Palace", zona: "Punta Cana", features: ["Habitaciones adaptadas", "Sillas de ruedas disponibles", "Piscina con acceso rampa", "Servicio médico 24h"] },
  { nombre: "Hard Rock Hotel", zona: "Punta Cana", features: ["Acceso universal", "Spa con tratamientos senior", "Transporte interno", "Rock Doc servicio médico"] },
  { nombre: "Iberostar Grand Bávaro", zona: "Punta Cana", features: ["Solo adultos", "Servicio de mayordomo", "Restaurantes sin escalones", "Ambiente tranquilo"] },
  { nombre: "Casa de Campo", zona: "La Romana", features: ["Villas privadas con asistente", "Transporte en golf cart", "Hospital en resort", "Actividades a medida"] },
];

const saludBienestar = [
  { titulo: "Seguro de viaje", descripcion: "IMPRESCINDIBLE. Contrata un seguro que cubra condiciones preexistentes y evacuación médica. Aseguradoras recomendadas: World Nomads, Allianz, IMG.", icono: ShieldCheck, color: "text-green-500" },
  { titulo: "Medicamentos", descripcion: "Lleva medicamentos en su envase original con receta médica. Farmacias Carol y GBC tienen productos internacionales.", icono: Stethoscope, color: "text-blue-500" },
  { titulo: "Climas extremos", descripcion: "Evita la exposición solar directa entre 10am-3pm. Usa SPF 50+, sombrero y ropa ligera. El golpe de calor es un riesgo real.", icono: Sun, color: "text-amber-500" },
  { titulo: "Hospitales recomendados", descripcion: "CEDIMAT y HOMS son hospitales de clase mundial. Centro Médico Punta Cana para la zona este. Todos con servicios en inglés.", icono: Heart, color: "text-red-500" },
];

const transporteSenior = [
  { medio: "Transfer privado", descripcion: "La mejor opción. Servicio puerta a puerta desde el aeropuerto. Vehículos con aire acondicionado. Desde US$35.", recomendado: true },
  { medio: "Excursiones organizadas", descripcion: "Tours con recogida en hotel, guía bilingüe y almuerzo incluido. Ritmo adaptado.", recomendado: true },
  { medio: "Taxis turísticos", descripcion: "Negocia el precio antes. Pide al hotel que te llame uno de confianza.", recomendado: true },
  { medio: "Metro de Santo Domingo", descripcion: "Moderno y con acceso para sillas de ruedas. Solo RD$20 (~US$0.35). Cómodo y seguro.", recomendado: true },
  { medio: "Guaguas públicas", descripcion: "No recomendadas: sin aire acondicionado, paradas frecuentes, poco espacio.", recomendado: false },
  { medio: "Motoconchos", descripcion: "No recomendados para mayores. Riesgo de caídas y sin protección.", recomendado: false },
];

const actividadesRelajadas = [
  { nombre: "Spa y Wellness", descripcion: "Masajes con cacao dominicano, terapias con larimar, yoga frente al mar", dificultad: "Baja" },
  { nombre: "Avistamiento de Ballenas", descripcion: "Excursión en bote en Samaná (enero-marzo). Asientos cómodos, experiencia única", dificultad: "Baja" },
  { nombre: "Tour Zona Colonial", descripcion: "Recorrido guiado por 500 años de historia. Se puede hacer en coche de caballos", dificultad: "Baja-Media" },
  { nombre: "Clase de Cocina Dominicana", descripcion: "Aprende a preparar mangú, sancocho y morir soñando. Actividad sentada", dificultad: "Baja" },
  { nombre: "Catamaran Sunset", descripcion: "Navegación al atardecer con open bar. Sin esfuerzo físico, vistas increíbles", dificultad: "Baja" },
  { nombre: "Golf en Teeth of the Dog", descripcion: "Campo #1 del Caribe. Carritos motorizados, caddie incluido", dificultad: "Media" },
  { nombre: "Visita a Plantación de Cacao", descripcion: "Tour guiado con degustación de chocolate artesanal. Paseo tranquilo", dificultad: "Baja" },
  { nombre: "Pesca Deportiva", descripcion: "Botes equipados con asientos cómodos, sombra y refrigerios", dificultad: "Baja" },
];

export default function ViajerosSenior() {
  return (
    <PageTransition>
      <SEOHead
        title="Guía para Viajeros Senior - República Dominicana"
        description="Destinos accesibles, resorts adaptados, transporte cómodo, actividades relajadas y servicios de salud para viajeros mayores en República Dominicana."
        keywords="viajeros senior dominicana, turismo tercera edad caribe, resorts accesibles punta cana, vacaciones mayores RD"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Accessibility className="h-3 w-3 mr-1" /> Confort y Accesibilidad
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              RD para <span className="text-primary">Viajeros Senior</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              República Dominicana tiene todo para unas vacaciones cómodas y seguras: resorts adaptados, actividades relajadas, excelente atención médica y el mejor clima del Caribe.
            </p>
          </div>
        </section>

        {/* Destinos recomendados */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">🌴 Destinos Ideales para Senior</h2>
            <div className="space-y-4">
              {destinosRecomendados.map(d => (
                <Card key={d.nombre}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-display font-bold text-foreground text-lg">{d.nombre}</h3>
                      <div className="flex gap-0.5">
                        {Array.from({ length: d.estrellas }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-amber-500 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{d.porque}</p>
                    <Badge variant="outline" className="text-xs">Ideal para: {d.ideal}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Resorts adaptados */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">🏨 Resorts con Facilidades Senior</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {resortsAdaptados.map(r => (
                <Card key={r.nombre}>
                  <CardContent className="p-6">
                    <h3 className="font-display font-bold text-foreground mb-1">{r.nombre}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-3 w-3" /> {r.zona}
                    </div>
                    <ul className="space-y-2">
                      {r.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Salud */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">🏥 Salud y Bienestar</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {saludBienestar.map(s => (
                <Card key={s.titulo}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <s.icono className={`h-5 w-5 ${s.color}`} />
                      </div>
                      <h3 className="font-display font-bold text-foreground">{s.titulo}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{s.descripcion}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Transporte */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">🚗 Transporte Recomendado</h2>
            <div className="space-y-3">
              {transporteSenior.map(t => (
                <div key={t.medio} className="flex items-start gap-4 bg-background rounded-xl p-5 border border-border">
                  <div className="mt-0.5">
                    {t.recomendado ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Car className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{t.medio}</h3>
                    <p className="text-sm text-muted-foreground">{t.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Actividades */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">🎯 Actividades Relajadas</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {actividadesRelajadas.map(a => (
                <div key={a.nombre} className="bg-card rounded-xl p-5 border border-border">
                  <h3 className="font-semibold text-foreground mb-2 text-sm">{a.nombre}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{a.descripcion}</p>
                  <Badge variant="outline" className="text-xs">Dificultad: {a.dificultad}</Badge>
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
