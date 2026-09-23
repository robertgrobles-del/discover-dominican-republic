import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Heart, MapPin, Hotel, UtensilsCrossed, Music, ShieldCheck,
  Sun, PartyPopper, Users, Sparkles, CheckCircle, AlertTriangle, Star,
  Compass, Calendar
} from "lucide-react";
import { PanoramaAd } from "@/components/promo";
import relaxBeach from "@/assets/relax-beach.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import puertoPlataImg from "@/assets/puerto-plata.jpg";
import samanaImg from "@/assets/samana.jpg";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import laRomanaImg from "@/assets/la-romana.jpg";

const destinos = [
  { 
    nombre: "Santo Domingo — Zona Colonial", 
    rating: "Muy Friendly", 
    desc: "La capital ofrece la escena LGBTQ+ más consolidada del Caribe hispano. Bares emblemáticos, galerías de arte inclusivas y vida nocturna bohemia.", 
    image: santoDomingoImg,
    highlights: ["Bares de coctelería y rooftop en Zona Colonial", "Comunidad activa y eventos culturales", "Marcha del Orgullo LGBT Santo Domingo", "Restaurantes de autor inclusivos"] 
  },
  { 
    nombre: "Cabarete & Sosúa", 
    rating: "Muy Friendly", 
    desc: "Pueblo costero con vibrante comunidad de expatriados de todo el mundo. Mentalidad abierta, deportes acuáticos y beach clubs cosmopolitas.", 
    image: puertoPlataImg,
    highlights: ["Comunidad internacional diversa", "Beach bars tolerantes y relajados", "Kitesurf, surf y vida al aire libre", "Ambiente bohemio sin etiquetas"] 
  },
  { 
    nombre: "Las Terrenas (Samaná)", 
    rating: "Friendly", 
    desc: "Refugio franco-europeo en la costa atlántica con atmósfera 'chic & chill'. Ideal para parejas en busca de privacidad, gastronomía y playas vírgenes.", 
    image: samanaImg,
    highlights: ["Ambiente cosmopolita de influencia francesa", "Restaurantes frente al mar de alta gama", "Playas privadas y villas exclusivas", "Privacidad y discreción"] 
  },
  { 
    nombre: "Punta Cana & Cap Cana", 
    rating: "Resort Friendly", 
    desc: "Cadenas hoteleras 5 estrellas con rigurosos códigos internacionales de no discriminación, spas para parejas y ceremonias simbólicas de bodas.", 
    image: puntaCanaImg,
    highlights: ["Resorts solo adultos de ultra lujo", "Bodas simbólicas same-sex", "Servicios de spa y mayordomía privada", "Entorno cerrado y seguro 24/7"] 
  },
  { 
    nombre: "La Romana & Casa de Campo", 
    rating: "Resort Friendly", 
    desc: "Destino de lujo internacional que acoge a personalidades y turistas globales bajo estándares de hospitalidad premium y absoluta confidencialidad.", 
    image: laRomanaImg,
    highlights: ["Villas privadas con servicio completo", "Altos de Chavón y marina deportiva", "Eventos privados de etiqueta", "Máxima privacidad y seguridad"] 
  }
];

const hotelesFriendly = [
  { nombre: "Eden Roc Cap Cana", ubicacion: "Cap Cana", tipo: "Relais & Châteaux de Lujo", nota: "Villas privadas con piscina propia y discreción absoluta" },
  { nombre: "Casa de Campo Resort & Villas", ubicacion: "La Romana", tipo: "Resort Icónico", nota: "Políticas globales inclusivas y eventos privados" },
  { nombre: "Hodelpa Nicolás de Ovando", ubicacion: "Zona Colonial, SD", tipo: "Hotel Boutique Histórico", nota: "En el corazón de la vida cultural y nocturna" },
  { nombre: "Sublime Samaná Hotel & Residences", ubicacion: "Las Terrenas", tipo: "Boutique & Spa", nota: "Romance junto al océano en entorno natural" },
  { nombre: "Sanctuary Cap Cana", ubicacion: "Cap Cana", tipo: "All-Inclusive Solo Adultos", nota: "Ambiente sofisticado y suites frente al mar" },
  { nombre: "Excellence El Carmen", ubicacion: "Uvero Alto, Punta Cana", tipo: "Resort Solo Adultos", nota: "Tratamientos de bienestar y gastronomía internacional" }
];

const consejos = [
  { icon: ShieldCheck, titulo: "Marco Legal y Social", desc: "La homosexualidad NO está penada por la ley en República Dominicana. Si bien el matrimonio igualitario no está reconocido en el código civil local, el país acoge con calidez y hospitalidad al turismo internacional." },
  { icon: Heart, titulo: "Manifestaciones de Afecto", desc: "En los principales polos turísticos (Punta Cana, Las Terrenas, Zona Colonial, Cabarete) existe una atmósfera abierta y tolerante. En poblados rurales tradicionales, se recomienda mantener la discreción habitual que se tendría en cualquier destino del Caribe." },
  { icon: Hotel, titulo: "Alojamiento y Reservas", desc: "Los resorts y hoteles boutique están acostumbrados a recibir parejas del mismo sexo; no hay ningún inconveniente al solicitar camas matrimoniales (King size) en el check-in." },
  { icon: PartyPopper, titulo: "Vida Nocturna y Ocio", desc: "Santo Domingo alberga bares y discotecas gay de gran popularidad. En las costas como Cabarete y Samaná, la fiesta es mixta e inclusiva en todos los bares de playa." },
  { icon: Users, titulo: "Redes y Organizaciones", desc: "Entidades locales como DIVERSA y Amigos Siempre Amigos organizan actividades culturales y festivales a lo largo del año." },
  { icon: Sparkles, titulo: "Bodas Simbólicas y Lunas de Miel", desc: "La mayoría de cadenas hoteleras internacionales en Punta Cana y La Romana ofrecen coordinadores dedicados para bodas simbólicas same-sex." }
];

export default function GuiaLGBTQ() {
  return (
    <PageTransition>
      <SEOHead
        title="Guía LGBTQ+ de República Dominicana - Destinos Inclusivos"
        description="Descubre los mejores destinos gay friendly en República Dominicana: Zona Colonial, Cabarete, Punta Cana, hoteles inclusivos, vida nocturna y consejos de viaje."
        keywords="LGBTQ dominicana, viaje gay caribe, hoteles gay friendly punta cana, bodas same sex dominicana, turismo inclusivo rd"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Hero Banner */}
          <section className="relative min-h-[42vh] flex items-center overflow-hidden border-b border-border/60">
            <div className="absolute inset-0">
              <img src={relaxBeach} alt="Turismo Inclusivo en República Dominicana" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
            </div>
            <div className="container mx-auto px-4 relative z-10 py-14">
              <div className="max-w-2xl">
                <Badge className="mb-3 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 text-foreground border-purple-500/30 backdrop-blur-md">
                  🏳️‍🌈 Guía de Turismo Inclusivo
                </Badge>
                <h1 className="font-display text-3xl md:text-5xl font-black text-foreground tracking-tight mb-3">
                  Viajes & Experiencias <span className="text-primary">LGBTQ+ Friendly</span>
                </h1>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Destinos seguros y cosmopolitas, resorts con políticas de no discriminación, bodas simbólicas y las mejores recomendaciones para disfrutar de la hospitalidad dominicana con total tranquilidad.
                </p>
              </div>
            </div>
          </section>

          {/* Practical Tips */}
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <Badge variant="outline" className="mb-2 text-xs">Información Clave</Badge>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Lo que Debes Saber Antes de Viajar</h2>
                <p className="text-xs text-muted-foreground mt-1">Recomendaciones culturales, legales y de hospitalidad en República Dominicana</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {consejos.map(c => (
                  <Card key={c.titulo} className="rounded-3xl border border-border hover:border-primary/40 transition-colors shadow-xs">
                    <CardContent className="p-6">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                        <c.icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-display font-bold text-foreground mb-2 text-base">{c.titulo}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Friendly Destinations */}
          <section className="py-12 bg-card/40 border-y border-border">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <Badge variant="outline" className="mb-2 text-xs">Polos Turísticos</Badge>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">🌈 Destinos Recomendados</h2>
                <p className="text-xs text-muted-foreground mt-1">Zonas del país con la mayor apertura y ambiente cosmopolita</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinos.map(d => (
                  <Card key={d.nombre} className="overflow-hidden rounded-3xl border border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between group">
                    <div>
                      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                        <img 
                          src={d.image} 
                          alt={d.nombre} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <Badge className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold border-none">
                          {d.rating}
                        </Badge>
                        <h3 className="absolute bottom-3 left-3 font-display font-bold text-white text-base">
                          {d.nombre}
                        </h3>
                      </div>

                      <CardContent className="p-5 space-y-3 text-xs">
                        <p className="text-muted-foreground leading-relaxed">{d.desc}</p>
                        
                        <div className="space-y-1.5 pt-2 border-t border-border/60">
                          {d.highlights.map((h, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-foreground/90 font-medium">
                              <CheckCircle className="h-3 w-3 text-primary shrink-0" />
                              <span>{h}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Recommended Hotels */}
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <Badge variant="outline" className="mb-2 text-xs">Hospedaje de Calidad</Badge>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Hoteles & Resorts Inclusivos</h2>
                <p className="text-xs text-muted-foreground mt-1">Establecimientos con políticas certificadas de hospitalidad y bodas same-sex</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {hotelesFriendly.map(h => (
                  <div key={h.nombre} className="bg-card rounded-3xl p-5 border border-border hover:border-primary/40 transition-colors shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary" /> {h.ubicacion}</span>
                        <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-none">{h.tipo}</Badge>
                      </div>
                      <h4 className="font-display font-bold text-foreground text-base mb-2">{h.nombre}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{h.nota}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Bottom Panorama Ad */}
          <div className="container mx-auto px-4 max-w-6xl pb-16">
            <PanoramaAd />
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
