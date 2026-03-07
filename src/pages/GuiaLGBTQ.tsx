import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart, MapPin, Hotel, UtensilsCrossed, Music, ShieldCheck,
  Sun, PartyPopper, Users, Sparkles, CheckCircle, AlertTriangle, Star
} from "lucide-react";
import relaxBeach from "@/assets/relax-beach.jpg";

const destinos = [
  { nombre: "Santo Domingo — Zona Colonial", rating: "Muy Friendly", desc: "La capital ofrece la escena LGBTQ+ más desarrollada del país. Bares, clubs y cultura queer vibrante.", highlights: ["Bares LGBTQ+ en Zona Colonial", "Comunidad activa y visible", "Eventos de pride anuales", "Restaurantes inclusivos"] },
  { nombre: "Cabarete", rating: "Muy Friendly", desc: "Pueblo de playa cosmopolita con ambiente bohemio e internacional. Abierto y tolerante.", highlights: ["Comunidad expat diversa", "Beach bars inclusivos", "Deportes acuáticos", "Ambiente relajado"] },
  { nombre: "Las Terrenas", rating: "Friendly", desc: "Pueblo franco-dominicano con mentalidad europea. Ambiente internacional.", highlights: ["Comunidad francesa abierta", "Restaurantes variados", "Playas tranquilas", "Vida nocturna cosmopolita"] },
  { nombre: "Punta Cana / Bávaro", rating: "Resort Friendly", desc: "Los resorts internacionales mantienen políticas inclusivas. Bodas LGBTQ+ disponibles en varios hoteles.", highlights: ["Resorts con políticas inclusivas", "Bodas same-sex en algunos hoteles", "Spas para parejas", "Ambiente privado y seguro"] },
  { nombre: "Puerto Plata", rating: "Friendly", desc: "Ciudad portuaria con creciente apertura. Buenos restaurantes y playas.", highlights: ["Creciente escena inclusiva", "Teleférico y naturaleza", "Resorts inclusivos", "Comunidad creciente"] },
];

const hotelesFriendly = [
  { nombre: "Casa de Campo", ubicacion: "La Romana", tipo: "Resort de lujo", nota: "Políticas inclusivas, bodas same-sex" },
  { nombre: "Eden Roc Cap Cana", ubicacion: "Cap Cana", tipo: "Resort boutique", nota: "Ambiente exclusivo y discreto" },
  { nombre: "Hodelpa Nicolas de Ovando", ubicacion: "Zona Colonial", tipo: "Hotel boutique", nota: "En el corazón de la vida nocturna" },
  { nombre: "Sublime Samana", ubicacion: "Las Terrenas", tipo: "Hotel boutique", nota: "Romance y privacidad" },
  { nombre: "Sanctuary Cap Cana", ubicacion: "Cap Cana", tipo: "Resort adultos", nota: "Solo adultos, ambiente sofisticado" },
  { nombre: "Excellence El Carmen", ubicacion: "Punta Cana", tipo: "Resort adultos", nota: "Solo adultos, all-inclusive premium" },
];

const consejos = [
  { icon: ShieldCheck, titulo: "Contexto Legal", desc: "La homosexualidad NO es ilegal en RD. No hay leyes contra las personas LGBTQ+. Sin embargo, el matrimonio igualitario aún no está legalizado." },
  { icon: Heart, titulo: "Afecto Público", desc: "En zonas turísticas internacionales hay gran aceptación. En zonas rurales, la cultura es más conservadora. Usa el mismo criterio que en cualquier país caribeño." },
  { icon: Hotel, titulo: "Alojamiento", desc: "Hoteles internacionales y boutique no discriminan. Solicita habitaciones doble cama (king) al reservar sin problemas." },
  { icon: PartyPopper, titulo: "Vida Nocturna", desc: "Santo Domingo tiene bares y clubs LGBTQ+ activos. Cabarete y Las Terrenas tienen ambiente inclusivo sin locales específicos." },
  { icon: Users, titulo: "Comunidad", desc: "Existen organizaciones locales como DIVERSA y Amigos Siempre Amigos que promueven derechos e información." },
  { icon: Sparkles, titulo: "Bodas & Eventos", desc: "Varios resorts ofrecen ceremonias simbólicas y paquetes de boda para parejas del mismo sexo." },
];

export default function GuiaLGBTQ() {
  return (
    <PageTransition>
      <SEOHead
        title="Guía LGBTQ+ de República Dominicana - Viaje Inclusivo"
        description="Guía de viaje LGBTQ+ para RD: destinos friendly, hoteles inclusivos, vida nocturna, consejos de seguridad y bodas para parejas del mismo sexo."
        keywords="LGBTQ dominicana, viaje gay RD, hoteles gay friendly punta cana, bodas same sex dominicana"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <section className="relative min-h-[40vh] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <img src={relaxBeach} alt="Playa inclusiva RD" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          </div>
          <div className="container mx-auto px-4 relative z-10 py-16">
            <Badge className="mb-4 bg-white/10 text-white border-white/20 backdrop-blur-sm">
              🏳️‍🌈 Viaje Inclusivo
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 max-w-2xl">
              Guía LGBTQ+ de <span className="text-primary">República Dominicana</span>
            </h1>
            <p className="text-lg text-white/80 max-w-xl">
              Destinos friendly, hoteles inclusivos, vida nocturna y todo lo que necesitas para un viaje seguro y memorable.
            </p>
          </div>
        </section>

        {/* Consejos */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">Lo que Debes Saber</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {consejos.map(c => (
                <Card key={c.titulo}>
                  <CardContent className="p-5">
                    <c.icon className="h-6 w-6 text-primary mb-2" />
                    <h3 className="font-semibold text-foreground mb-1 text-sm">{c.titulo}</h3>
                    <p className="text-xs text-muted-foreground">{c.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Destinos */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">🌈 Destinos LGBTQ+ Friendly</h2>
            <div className="space-y-4">
              {destinos.map(d => (
                <Card key={d.nombre}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{d.nombre}</h3>
                      <Badge variant="outline" className="text-xs">{d.rating}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{d.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {d.highlights.map(h => (
                        <Badge key={h} variant="secondary" className="text-[10px]">
                          <CheckCircle className="h-2.5 w-2.5 mr-1" /> {h}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Hoteles */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">🏨 Hoteles LGBTQ+ Friendly</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {hotelesFriendly.map(h => (
                <div key={h.nombre} className="bg-card rounded-xl p-4 border border-border">
                  <h3 className="font-semibold text-foreground text-sm">{h.nombre}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {h.ubicacion} · {h.tipo}
                  </div>
                  <p className="text-xs text-primary mt-1">{h.nota}</p>
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
