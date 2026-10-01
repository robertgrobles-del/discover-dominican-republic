import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users, Baby, MapPin, Hotel, Stethoscope, ShieldCheck,
  Star, CheckCircle, Waves, Sun, Utensils, Palmtree
} from "lucide-react";
import puntaCana from "@/assets/punta-cana.jpg";

const destinosFamilia = [
  { nombre: "Punta Cana / Bávaro", edades: "Todas", desc: "El destino #1 para familias. Resorts con kids clubs, parques acuáticos y playas de oleaje suave.", highlights: ["Playas de oleaje bajo", "Kids clubs 4-12 años", "Parques acuáticos en resorts", "Actividades para teens"] },
  { nombre: "Bayahíbe / La Romana", edades: "4+", desc: "Playas tranquilas, Isla Saona, parques naturales y Casa de Campo con actividades familiares.", highlights: ["Isla Saona apta para niños", "Altos de Chavón", "Playa poco profunda", "Resorts familiares"] },
  { nombre: "Cabarete", edades: "8+", desc: "Ideal para familias activas. Clases de surf para niños, kayak y ambiente de playa seguro.", highlights: ["Clases de surf infantil", "Comunidad expat familiar", "Restaurantes kid-friendly", "Playa Encuentro"] },
  { nombre: "Samaná", edades: "6+", desc: "Naturaleza y ballenas (ene-mar). Playas vírgenes y aventura suave.", highlights: ["Avistamiento de ballenas", "Cayo Levantado", "Playa Rincón", "Los Haitises en barco"] },
  { nombre: "Santo Domingo", edades: "Todas", desc: "La capital tiene museos interactivos, acuario, parques y la Zona Colonial.", highlights: ["Museo Trampolín (niños)", "Acuario Nacional", "Zona Colonial a pie", "Malecón al atardecer"] },
  { nombre: "Jarabacoa", edades: "10+", desc: "Montañas para familias aventureras. Ríos, cascadas y naturaleza.", highlights: ["Rafting nivel fácil", "Cascadas accesibles", "Eco-lodges familiares", "Clima fresco"] },
];

const resortsFamiliares = [
  { nombre: "Hard Rock Hotel Punta Cana", ubicacion: "Punta Cana", edades: "Todas", features: ["Kids club 4-12", "Teen lounge", "Mini parque acuático", "Shows nocturnos"] },
  { nombre: "Barceló Bávaro Palace", ubicacion: "Bávaro", edades: "Todas", features: ["Parque acuático Barcy", "Pirate Island playground", "Kids buffet", "Animación infantil"] },
  { nombre: "Club Med Punta Cana", ubicacion: "Punta Cana", edades: "4 meses+", features: ["Baby Club (4-23 meses)", "Mini Club (4-10)", "Club Med Passworld (11-17)", "Circo y trapecio"] },
  { nombre: "Dreams Macao Beach", ubicacion: "Punta Cana", edades: "Todas", features: ["Explorer's Club 3-12", "Core Zone teens", "Lazy river", "Playa privada"] },
  { nombre: "Nickelodeon Hotels & Resorts", ubicacion: "Punta Cana", edades: "Todas", features: ["Aqua Nick parque acuático", "Personajes Nickelodeon", "Slime experiences", "Splash Pad bebés"] },
  { nombre: "Iberostar Selection Bávaro", ubicacion: "Bávaro", edades: "Todas", features: ["Star Camp 4-12", "Star Teens 13-17", "Piscina infantil", "Shows de piratas"] },
];

const salud = [
  { titulo: "Pediatras y clínicas", desc: "Hospitales privados en Punta Cana, Santo Domingo y Santiago tienen servicio pediátrico 24/7. HOMS, Cedimat y clínicas en zona hotelera." },
  { titulo: "Protección solar", desc: "SPF 50+ resistente al agua para niños. Reaplicar cada 2 horas. Rash guards son excelentes para protección UV." },
  { titulo: "Hidratación", desc: "Los niños se deshidratan más rápido en el trópico. Agua embotellada siempre. Evita hielo fuera de hoteles." },
  { titulo: "Repelente", desc: "Usa repelente apto para niños (DEET-free para menores de 3 años). Especialmente al atardecer." },
  { titulo: "Farmacias", desc: "Cadenas Carol, GBC están en todas partes. Tienen medicinas pediátricas básicas (paracetamol, ibuprofeno, suero oral)." },
  { titulo: "Alergias alimentarias", desc: "Informa al resort sobre alergias al hacer la reserva. La mayoría tienen menús especiales para niños." },
];

const actividadesPorEdad = [
  { rango: "0 a 3 años", titulo: "Rutinas tranquilas", enfoque: "Planea trayectos breves, descansos frecuentes y acceso sencillo a sombra, agua y servicios.", actividades: ["Paseos cortos", "Tiempo de playa con sombra cercana", "Espacios de descanso", "Piscina solo si hay supervisión adecuada"] },
  { rango: "4 a 7 años", titulo: "Explorar acompañados", enfoque: "Busca actividades guiadas, con instrucciones sencillas y opción de retirarse cuando necesiten una pausa.", actividades: ["Juegos de playa", "Visitas cortas a museos o jardines", "Actividades de naturaleza para familias", "Talleres culturales"] },
  { rango: "8 a 12 años", titulo: "Curiosidad y movimiento", enfoque: "Combina experiencias activas con tiempo libre; revisa edad mínima, equipo, duración y supervisión.", actividades: ["Recorridos guiados", "Kayak o snorkel con operador y equipo apropiados", "Rutas de naturaleza", "Talleres de cocina o artesanía"] },
  { rango: "13 a 17 años", titulo: "Autonomía con acuerdos claros", enfoque: "Incluye a adolescentes en las decisiones y acuerden traslados, acompañamiento y puntos de encuentro.", actividades: ["Aventura con requisitos y supervisión confirmados", "Rutas culturales", "Deportes acuáticos según edad y condiciones", "Tiempo libre con plan de comunicación"] },
];

const planMultigeneracional = [
  { titulo: "Alojamiento y movilidad", detalle: "Pregunta por ascensores, distancias dentro del alojamiento, escalones, duchas, asientos y disponibilidad de ayudas de movilidad. Pide confirmar cada necesidad directamente al proveedor." },
  { titulo: "Ritmo compartido", detalle: "Alterna una actividad principal con pausas y tiempo libre. Acuerden de antemano quién acompaña a niños o adultos que prefieran descansar." },
  { titulo: "Traslados y accesos", detalle: "Confirma duración puerta a puerta, entradas y salidas, espacio para equipaje y sillas de ruedas, paradas y baños disponibles durante el trayecto." },
  { titulo: "Salud y comunicación", detalle: "Comparte contactos de emergencia y necesidades relevantes con el grupo; identifica cómo reunirse si alguien se separa y dónde pedir ayuda." },
];

export default function FamiliaConNinos() {
  return (
    <PageTransition>
      <SEOHead
        title="Viaje en Familia a República Dominicana - Guía con Niños"
        description="Guía completa para viajar en familia a RD: resorts con kids club, actividades por edad, destinos seguros, salud infantil y consejos prácticos."
        keywords="viaje familia dominicana, vacaciones niños RD, resorts kids club punta cana, actividades niños caribe"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <section className="relative min-h-[40vh] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <img src={puntaCana} alt="Familia en playa" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          </div>
          <div className="container mx-auto px-4 relative z-10 py-16">
            <Badge className="mb-4 bg-white/10 text-white border-white/20 backdrop-blur-sm">
              👨‍👩‍👧‍👦 Vacaciones en Familia
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 max-w-2xl">
              RD en <span className="text-primary">Familia</span>
            </h1>
            <p className="text-lg text-white/80 max-w-xl">
              Resorts con kids club, playas seguras, actividades para todas las edades y consejos para padres viajeros.
            </p>
          </div>
        </section>

        {/* Destinos */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">📍 Mejores Destinos para Familias</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {destinosFamilia.map(d => (
                <Card key={d.nombre}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{d.nombre}</h3>
                      <Badge variant="outline" className="text-[10px]">Edades: {d.edades}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{d.desc}</p>
                    <div className="flex flex-wrap gap-1">
                      {d.highlights.map(h => (
                        <Badge key={h} variant="secondary" className="text-[10px]">
                          <CheckCircle className="h-2.5 w-2.5 mr-0.5" /> {h}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Resorts */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">🏨 Resorts Familiares Top</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resortsFamiliares.map(r => (
                <Card key={r.nombre}>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-foreground text-sm mb-1">{r.nombre}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                      <MapPin className="h-3 w-3" /> {r.ubicacion} · Edades: {r.edades}
                    </p>
                    <ul className="space-y-1">
                      {r.features.map(f => (
                        <li key={f} className="text-xs text-muted-foreground flex items-center gap-1">
                          <Star className="h-2.5 w-2.5 text-primary" /> {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Colecciones familiares por edad */}
        <section className="py-16" aria-labelledby="age-collections-heading">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="mx-auto mb-8 max-w-3xl text-center">
              <Badge variant="outline" className="mb-3 gap-2 border-primary/40 text-primary">
                <Baby className="h-4 w-4" aria-hidden="true" /> Colecciones para cada etapa
              </Badge>
              <h2 id="age-collections-heading" className="font-display text-3xl font-bold text-foreground md:text-4xl">
                Elige ideas según la edad de tu familia
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                Son puntos de partida, no recomendaciones ni garantías de seguridad. Confirma edad mínima, condiciones, accesibilidad, equipo y supervisión con el proveedor antes de reservar.
              </p>
            </div>
            <ul className="grid gap-4 md:grid-cols-2">
              {actividadesPorEdad.map((coleccion, index) => (
                <li key={coleccion.rango}>
                  <Card className="h-full border-border/80 transition-colors hover:border-primary/40">
                    <CardContent className="p-6 md:p-7">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{coleccion.rango}</p>
                          <h3 className="mt-2 font-display text-xl font-bold">{coleccion.titulo}</h3>
                        </div>
                        <span className="font-mono text-sm text-muted-foreground" aria-label={`Colección ${index + 1}`}>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{coleccion.enfoque}</p>
                      <ul className="mt-5 space-y-2">
                        {coleccion.actividades.map((actividad) => (
                          <li key={actividad} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                            <span>{actividad}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Planificación multigeneracional */}
        <section className="py-16 bg-card/50" aria-labelledby="multigenerational-heading">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="mx-auto mb-8 max-w-3xl text-center">
              <Badge variant="outline" className="mb-3 gap-2 border-primary/40 text-primary">
                <Users className="h-4 w-4" aria-hidden="true" /> Viajar en varias generaciones
              </Badge>
              <h2 id="multigenerational-heading" className="font-display text-3xl font-bold text-foreground md:text-4xl">
                Un plan flexible para disfrutar juntos
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                Conversen sobre comodidad, ritmo y preferencias antes de reservar. Las condiciones varían por proveedor: confirma por escrito las características que sean necesarias para tu grupo.
              </p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {planMultigeneracional.map((paso) => (
                <li key={paso.titulo}>
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <h3 className="font-display text-lg font-bold text-foreground">{paso.titulo}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{paso.detalle}</p>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Salud */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-display text-xl font-bold text-foreground mb-6 text-center">🏥 Salud y Seguridad Infantil</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {salud.map(s => (
                <div key={s.titulo} className="bg-background rounded-xl p-4 border border-border">
                  <h3 className="font-semibold text-foreground text-sm mb-1">{s.titulo}</h3>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
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
