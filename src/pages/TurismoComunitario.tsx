import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users, Heart, Leaf, MapPin, Star, ChevronRight, HandHeart,
  Coffee, Paintbrush, Music, UtensilsCrossed, TreePine, Home
} from "lucide-react";
import samanaImg from "@/assets/samana.jpg";
import adventureImg from "@/assets/adventure.jpg";
import gastronomy from "@/assets/gastronomy.jpg";
import merengue from "@/assets/merengue-dance.jpg";
import colonialDoor from "@/assets/colonial-door.jpg";
import relaxBeach from "@/assets/relax-beach.jpg";

const comunidades = [
  {
    id: "los-cacaos",
    nombre: "Los Cacaos",
    region: "San Cristóbal",
    imagen: adventureImg,
    tipo: "Montaña",
    descripcion: "Comunidad cafetalera donde aprenderás el proceso del café desde la semilla hasta la taza, conviviendo con familias locales.",
    experiencias: ["Ruta del Café", "Senderismo", "Gastronomía rural", "Alojamiento familiar"],
    familias: 12,
    rating: 4.9,
    precio: "Desde US$ 45/día",
  },
  {
    id: "caleton",
    nombre: "Caletón",
    region: "Samaná",
    imagen: samanaImg,
    tipo: "Costero",
    descripcion: "Pueblo pesquero donde podrás salir al mar con pescadores artesanales y cocinar tu pesca del día.",
    experiencias: ["Pesca artesanal", "Cocina criolla", "Kayak en manglares", "Avistamiento de aves"],
    familias: 8,
    rating: 4.8,
    precio: "Desde US$ 35/día",
  },
  {
    id: "villa-trina",
    nombre: "Villa Trina",
    region: "Espaillat",
    imagen: gastronomy,
    tipo: "Rural",
    descripcion: "Centro de producción orgánica con fincas demostrativas de cacao, miel y frutas tropicales.",
    experiencias: ["Ruta del Cacao", "Apicultura", "Huertos orgánicos", "Talleres artesanales"],
    familias: 15,
    rating: 4.7,
    precio: "Desde US$ 30/día",
  },
  {
    id: "tubagua",
    nombre: "Tubagua",
    region: "Puerto Plata",
    imagen: adventureImg,
    tipo: "Montaña",
    descripcion: "Eco-aldea en las montañas con vistas al Atlántico, hogar de Tubagua Plantation Village y agricultura sostenible.",
    experiencias: ["Agroturismo", "Senderismo", "Yoga", "Voluntariado"],
    familias: 6,
    rating: 4.9,
    precio: "Desde US$ 55/día",
  },
  {
    id: "los-brazos",
    nombre: "Los Brazos",
    region: "Barahona",
    imagen: relaxBeach,
    tipo: "Costero",
    descripcion: "Puerta de entrada a Bahía de las Águilas con guías locales, comida casera y hospedaje comunitario.",
    experiencias: ["Playa virgen", "Guías locales", "Cocina casera", "Sendero ecológico"],
    familias: 10,
    rating: 4.8,
    precio: "Desde US$ 25/día",
  },
  {
    id: "yamasa",
    nombre: "Yamasá",
    region: "Monte Plata",
    imagen: merengue,
    tipo: "Cultural",
    descripcion: "Comunidad afrodominicana con tradiciones vivas de gagá, palos y cocolo dance. Artesanía en guano y cestería.",
    experiencias: ["Danza gagá", "Artesanía", "Gastronomía afro", "Historia oral"],
    familias: 20,
    rating: 4.6,
    precio: "Desde US$ 30/día",
  },
];

const impacto = [
  { icon: Users, label: "Familias beneficiadas", value: "200+" },
  { icon: Heart, label: "Comunidades activas", value: "35" },
  { icon: Leaf, label: "Hectáreas conservadas", value: "5,000+" },
  { icon: HandHeart, label: "Visitantes/año", value: "12,000+" },
];

const principios = [
  { icon: Home, title: "Alojamiento con familias", desc: "Vive en casas de familias locales y experimenta la hospitalidad dominicana auténtica." },
  { icon: UtensilsCrossed, title: "Gastronomía local", desc: "Come platos preparados con ingredientes de la comunidad, cocina con tus anfitriones." },
  { icon: Paintbrush, title: "Artesanía y oficios", desc: "Aprende técnicas ancestrales de cestería, cerámica, tallado y tejido." },
  { icon: Music, title: "Cultura viva", desc: "Participa en fiestas patronales, danzas tradicionales y rituales comunitarios." },
  { icon: Coffee, title: "Producción sostenible", desc: "Conoce procesos de café, cacao, miel y agricultura orgánica de primera mano." },
  { icon: TreePine, title: "Conservación activa", desc: "Contribuye a proyectos de reforestación, protección de cuencas y reciclaje." },
];

export default function TurismoComunitario() {
  return (
    <PageTransition>
      <SEOHead
        title="Turismo Comunitario Sostenible en República Dominicana"
        description="Vive experiencias auténticas con comunidades locales. Alojamiento familiar, gastronomía rural, artesanía y naturaleza en República Dominicana."
        keywords="turismo comunitario RD, turismo sostenible, experiencias locales, agroturismo dominicano"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <HandHeart className="h-3 w-3 mr-1" /> Turismo con Propósito
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Turismo Comunitario <span className="text-primary">Sostenible</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Conecta con la esencia dominicana. Vive con familias locales, aprende oficios ancestrales y contribuye al desarrollo sostenible.
            </p>
          </div>
        </section>

        {/* Impacto */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {impacto.map((i) => (
                <div key={i.label} className="text-center py-4">
                  <i.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{i.value}</p>
                  <p className="text-xs text-muted-foreground">{i.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Principios */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">¿Qué es el Turismo Comunitario?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {principios.map((p) => (
                <div key={p.title} className="bg-card rounded-xl p-6 border border-border hover:border-primary/30 transition-colors">
                  <p.icon className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comunidades */}
        <section className="py-16 bg-card/50">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">Comunidades Participantes</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {comunidades.map((c) => (
                <Card key={c.id} className="group overflow-hidden border-border hover:shadow-xl transition-all">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={c.imagen} alt={c.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge variant="secondary" className="absolute top-3 left-3">{c.tipo}</Badge>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-lg font-bold text-white">{c.nombre}</h3>
                      <p className="text-white/80 text-sm flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.region}</p>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{c.descripcion}</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {c.experiencias.map((e) => (
                        <Badge key={e} variant="outline" className="text-xs">{e}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" /> {c.rating}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {c.familias} familias</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-primary">{c.precio}</span>
                      <Button size="sm" variant="outline" className="gap-1">
                        Contactar <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">¿Quieres registrar tu comunidad?</h2>
            <p className="text-muted-foreground mb-6">
              Si representas una comunidad rural, costera o cultural interesada en recibir visitantes responsables, contáctanos para ser parte de la red.
            </p>
            <Link to="/sugerencias">
              <Button size="lg" className="gap-2">
                Postular mi comunidad <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
