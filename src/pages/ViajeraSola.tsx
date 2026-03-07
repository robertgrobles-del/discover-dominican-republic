import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldCheck, MapPin, Hotel, Phone, Users, Sun, Star,
  CheckCircle, AlertTriangle, Heart, Camera, Compass
} from "lucide-react";
import relaxBeach from "@/assets/relax-beach.jpg";

const destinosSeguros = [
  { nombre: "Punta Cana / Bávaro", seguridad: "⭐⭐⭐⭐⭐", desc: "Zona más segura para turistas. Resorts cerrados, policía turística activa, playas vigiladas.", tips: ["Quédate en zonas de resorts", "Usa transfer del hotel", "Playa Bávaro es perfecta para caminar"] },
  { nombre: "Cabarete", seguridad: "⭐⭐⭐⭐⭐", desc: "Pueblo pequeño, comunidad expat grande, ambiente de playa seguro y social.", tips: ["Kitesurf con instructores certificados", "Muchas mujeres viajan solas aquí", "Hostales con ambiente comunitario"] },
  { nombre: "Las Terrenas", seguridad: "⭐⭐⭐⭐", desc: "Comunidad francesa e internacional. Muy tranquilo, ideal para estancias largas.", tips: ["Alquila una moto para moverte", "Pueblo caminable", "Restaurants seguros de noche"] },
  { nombre: "Zona Colonial (Santo Domingo)", seguridad: "⭐⭐⭐⭐", desc: "Zona turística bien patrullada. Rica en cultura, arte y gastronomía.", tips: ["De noche quédate en calles principales", "Taxi de apps (Uber/DiDi)", "Tours de día son muy seguros"] },
  { nombre: "Samaná / Las Galeras", seguridad: "⭐⭐⭐⭐⭐", desc: "Remoto y tranquilo. Comunidad pequeña donde todos se conocen.", tips: ["Ideal para desconectarse", "Playas poco concurridas", "Hospedajes boutique seguros"] },
  { nombre: "Jarabacoa", seguridad: "⭐⭐⭐⭐", desc: "Montañas tranquilas. Actividades de aventura con guías certificados.", tips: ["Aventuras siempre con guía", "Eco-lodges acogedores", "Comunidad local amable"] },
];

const consejosSeguridad = [
  { icon: Phone, titulo: "Apps de transporte", desc: "Usa Uber o DiDi en lugar de taxis callejeros. Comparte tu ubicación en tiempo real con alguien de confianza." },
  { icon: Hotel, titulo: "Alojamiento", desc: "Elige hoteles/hostales con buenas reseñas de mujeres viajeras. Verifica cerraduras y pide habitación en pisos superiores." },
  { icon: MapPin, titulo: "Ubicación", desc: "Comparte tu itinerario diario con alguien. Usa Google Maps offline. Evita zonas no turísticas de noche." },
  { icon: Users, titulo: "Socializa con precaución", desc: "Los dominicanos son muy amables. Acepta invitaciones en grupo, no individuales con desconocidos." },
  { icon: Camera, titulo: "Fotos y pertenencias", desc: "No exhibas equipos costosos innecesariamente. Usa una riñonera/bolso cruzado en ciudades." },
  { icon: Sun, titulo: "De día vs de noche", desc: "De día RD es muy seguro para caminar sola. De noche, usa transporte de apps o transfer del hotel." },
  { icon: Heart, titulo: "Acoso callejero", desc: "Los piropos son culturalmente comunes pero generalmente inofensivos. Un 'No, gracias' firme suele funcionar." },
  { icon: ShieldCheck, titulo: "Números útiles", desc: "911 (emergencia), POLITUR: 809-200-3500 (policía turística), línea de la mujer: 809-200-2000." },
];

const comunidades = [
  { nombre: "Solo Female Travelers RD (Facebook)", desc: "Grupo activo con tips y compañeras de viaje" },
  { nombre: "Girls LOVE Travel", desc: "Comunidad global con hilo dedicado a RD" },
  { nombre: "Worldpackers / Workaway", desc: "Voluntariados donde conoces otros viajeros" },
  { nombre: "Hostales con ambiente social", desc: "Dreamy Punta Cana, Cabarete Surf Camp, Bohio Hostel" },
];

export default function ViajeraSola() {
  return (
    <PageTransition>
      <SEOHead
        title="Guía para Viajera Sola en República Dominicana"
        description="Guía completa para mujeres que viajan solas a RD: destinos seguros, consejos de seguridad, alojamiento recomendado y comunidades de viajeras."
        keywords="viajera sola dominicana, mujer viaja sola RD, seguridad mujer turista, destinos seguros dominicana"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <section className="relative min-h-[40vh] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <img src={relaxBeach} alt="Viajera sola en playa" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          </div>
          <div className="container mx-auto px-4 relative z-10 py-16">
            <Badge className="mb-4 bg-white/10 text-white border-white/20 backdrop-blur-sm">
              👩 Para Viajeras Independientes
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 max-w-2xl">
              Guía para <span className="text-primary">Viajera Sola</span>
            </h1>
            <p className="text-lg text-white/80 max-w-xl">
              Tips de seguridad, destinos recomendados y comunidades para que tu aventura en RD sea inolvidable.
            </p>
          </div>
        </section>

        {/* Consejos */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">🛡️ Consejos de Seguridad</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {consejosSeguridad.map(c => (
                <Card key={c.titulo}>
                  <CardContent className="p-5 flex gap-4">
                    <c.icon className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground text-sm mb-1">{c.titulo}</h3>
                      <p className="text-xs text-muted-foreground">{c.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Destinos */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">📍 Destinos Más Seguros</h2>
            <div className="space-y-4">
              {destinosSeguros.map(d => (
                <Card key={d.nombre}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{d.nombre}</h3>
                      <span className="text-xs">{d.seguridad}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{d.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {d.tips.map(t => (
                        <Badge key={t} variant="secondary" className="text-[10px]">
                          <CheckCircle className="h-2.5 w-2.5 mr-1" /> {t}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Comunidades */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-display text-xl font-bold text-foreground mb-6 text-center">🤝 Comunidades de Viajeras</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {comunidades.map(c => (
                <div key={c.nombre} className="bg-card rounded-xl p-4 border border-border">
                  <h3 className="font-semibold text-foreground text-sm mb-1">{c.nombre}</h3>
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
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
