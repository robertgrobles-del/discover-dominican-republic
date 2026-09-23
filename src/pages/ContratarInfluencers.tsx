import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import {
  Camera, Video, Instagram, Users, TrendingUp, Star,
  ChevronRight, CheckCircle, Globe, Zap, Send, MapPin, Heart, Gift
} from "lucide-react";
import { toast } from "sonner";
import relaxBeach from "@/assets/relax-beach.jpg";
import adventureImg from "@/assets/adventure.jpg";
import gastronomy from "@/assets/gastronomy.jpg";
import puntaCana from "@/assets/punta-cana.jpg";
import samanaImg from "@/assets/samana.jpg";
import santoDomingo from "@/assets/santo-domingo.jpg";

const influencers = [
  {
    id: "viajera-eco",
    nombre: "María Fernández",
    handle: "@viajera_eco",
    imagen: relaxBeach,
    nicho: "viaje",
    seguidores: "185K",
    plataformas: ["Instagram", "YouTube", "TikTok"],
    ubicacion: "Santo Domingo",
    idiomas: ["Español", "Inglés"],
    rating: 4.9,
    campanas: 24,
    tarifa: "Desde US$ 500",
    descripcion: "Creadora de contenido especializada en ecoturismo, playas vírgenes y experiencias sostenibles en RD.",
    destacado: true,
  },
  {
    id: "extreme-rd",
    nombre: "Pedro Aventurero",
    handle: "@extreme_rd",
    imagen: adventureImg,
    nicho: "viaje",
    seguidores: "120K",
    plataformas: ["Instagram", "YouTube"],
    ubicacion: "Jarabacoa",
    idiomas: ["Español"],
    rating: 4.8,
    campanas: 18,
    tarifa: "Desde US$ 350",
    descripcion: "Rafting, canyoning, Pico Duarte y adrenalina pura. Contenido de aventura extrema en el Caribe.",
    destacado: false,
  },
  {
    id: "sabores-rd",
    nombre: "Chef María",
    handle: "@sabores_rd",
    imagen: gastronomy,
    nicho: "foodie",
    seguidores: "95K",
    plataformas: ["Instagram", "TikTok"],
    ubicacion: "Punta Cana",
    idiomas: ["Español", "Inglés", "Francés"],
    rating: 4.9,
    campanas: 32,
    tarifa: "Desde US$ 400",
    descripcion: "Explora la gastronomía dominicana desde restaurantes de lujo hasta colmados y comedores callejeros.",
    destacado: true,
  },
  {
    id: "love-caribbean",
    nombre: "Carolina & Luis",
    handle: "@love_caribbean",
    imagen: puntaCana,
    nicho: "lifestyle",
    seguidores: "210K",
    plataformas: ["Instagram", "YouTube", "Blog"],
    ubicacion: "Punta Cana",
    idiomas: ["Español", "Inglés"],
    rating: 5.0,
    campanas: 45,
    tarifa: "Desde US$ 800",
    descripcion: "Pareja viajera especializada en hoteles de lujo, bodas destino y experiencias románticas.",
    destacado: true,
  },
  {
    id: "patrimonio-rd",
    nombre: "Lucía Historia",
    handle: "@patrimonio_rd",
    imagen: santoDomingo,
    nicho: "general",
    seguidores: "75K",
    plataformas: ["Instagram", "YouTube"],
    ubicacion: "Santo Domingo",
    idiomas: ["Español", "Inglés"],
    rating: 4.7,
    campanas: 15,
    tarifa: "Desde US$ 300",
    descripcion: "Historiadora y comunicadora. Tours culturales, museos, arquitectura colonial y tradiciones.",
    destacado: false,
  },
  {
    id: "family-rd",
    nombre: "Familia Viajera",
    handle: "@family_rd",
    imagen: samanaImg,
    nicho: "familia",
    seguidores: "145K",
    plataformas: ["Instagram", "TikTok", "YouTube"],
    ubicacion: "Santiago",
    idiomas: ["Español"],
    rating: 4.8,
    campanas: 20,
    tarifa: "Desde US$ 450",
    descripcion: "Contenido para familias: parques, playas kid-friendly, hoteles all-inclusive y tips prácticos.",
    destacado: false,
  },
  {
    id: "moda-rd",
    nombre: "Gabriela Moda",
    handle: "@gabriela_style",
    imagen: relaxBeach,
    nicho: "moda",
    seguidores: "115K",
    plataformas: ["Instagram", "TikTok"],
    ubicacion: "Santo Domingo",
    idiomas: ["Español", "Inglés"],
    rating: 4.8,
    campanas: 22,
    tarifa: "Desde US$ 420",
    descripcion: "Moda de playa caribeña, tendencias tropicales y sesiones fotográficas de marcas de diseño en resorts.",
    destacado: false,
  },
  {
    id: "ugc-creator",
    nombre: "Roberto Creador",
    handle: "@roberto_ugc",
    imagen: adventureImg,
    nicho: "creadores UGC",
    seguidores: "45K",
    plataformas: ["TikTok", "Instagram Reels"],
    ubicacion: "Cabarete",
    idiomas: ["Español", "Inglés"],
    rating: 4.9,
    campanas: 40,
    tarifa: "Desde US$ 250",
    descripcion: "Especialista en videos orgánicos, reseñas honestas y contenido generado por usuarios para hoteles y agencias.",
    destacado: true,
  }
];

const servicios = [
  { icon: Camera, title: "Cobertura Fotográfica & Dron", desc: "Sesiones aéreas 4K y fotografía profesional de tu hotel, restaurante o excursión." },
  { icon: Video, title: "Video & Reels Virales", desc: "Producción de videos de alto impacto para Instagram, TikTok y YouTube Shorts con creadores locales." },
  { icon: Gift, title: "Degustaciones & Estancias 100% Canjeables", desc: "Invita a influencers seleccionados a vivir tu experiencia a cambio de reseñas y contenido orgánico." },
  { icon: Heart, title: "Rifas & Sorteos entre Seguidores", desc: "Dinamiza tu comunidad y gana miles de seguidores organizando sorteos conjuntos con creadores verificados." },
  { icon: Users, title: "Press Trips & Fam Trips", desc: "Organización de viajes de prensa con múltiples influencers para lanzamientos y temporadas turísticas." },
  { icon: TrendingUp, title: "Métricas & Auditoría de Impacto", desc: "Informes detallados de alcance real, visualizaciones certificadas, engagement y reservas generadas." },
];

const proceso = [
  { step: 1, title: "Cuéntanos tu objetivo", desc: "¿Qué quieres promocionar? Hotel, restaurante, destino, evento..." },
  { step: 2, title: "Seleccionamos influencers", desc: "Te proponemos perfiles que encajan con tu marca y audiencia." },
  { step: 3, title: "Planificación de campaña", desc: "Definimos contenido, fechas, plataformas y entregables." },
  { step: 4, title: "Ejecución y resultados", desc: "El influencer crea el contenido y te entregamos reportes de métricas." },
];

export default function ContratarInfluencers() {
  const [formData, setFormData] = useState({
    empresa: "",
    contacto: "",
    email: "",
    telefono: "",
    descripcion: "",
  });

  const [selectedNicho, setSelectedNicho] = useState<string>("all");

  const filteredInfluencers = influencers.filter((inf) => {
    return selectedNicho === "all" || inf.nicho === selectedNicho;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.empresa || !formData.email) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }
    toast.success("¡Solicitud recibida! Nuestro equipo te contactará en 24 horas.");
    setFormData({ empresa: "", contacto: "", email: "", telefono: "", descripcion: "" });
  };

  return (
    <PageTransition>
      <SEOHead
        title="Contratar Influencers de Turismo - DescubreRD"
        description="Conecta tu marca con influencers de turismo en República Dominicana. Campañas en redes sociales, videos y cobertura fotográfica profesional."
        keywords="influencers turismo RD, marketing turístico, campañas redes sociales, influencer marketing dominicano"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Camera className="h-3 w-3 mr-1" /> Influencer Marketing
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Conecta tu marca con <span className="text-primary">Influencers</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Trabajamos con los mejores creadores de contenido turístico de República Dominicana para promocionar tu negocio.
            </p>
            <Button size="lg" className="gap-2" onClick={() => document.getElementById("form-contacto")?.scrollIntoView({ behavior: "smooth" })}>
              Solicitar campaña <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </section>

        {/* Servicios */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">Nuestros Servicios</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicios.map((s) => (
                <div key={s.title} className="bg-card rounded-xl p-6 border border-border hover:border-primary/30 transition-colors">
                  <s.icon className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Proceso */}
        <section className="py-16 bg-card/50">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">¿Cómo funciona?</h2>
            <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {proceso.map((p) => (
                <div key={p.step} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mx-auto mb-3 text-lg">
                    {p.step}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-sm">{p.title}</h3>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Influencers */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4 text-center">Nuestros Creadores</h2>
            <p className="text-sm text-muted-foreground text-center max-w-xl mx-auto mb-6">
              Busca influencers por categoría para encontrar el embajador perfecto para tu marca.
            </p>

            {/* Category filter bar */}
            <div className="flex flex-wrap justify-center gap-2 mb-8 border-b border-border pb-4">
              {[
                { label: "Todos", value: "all" },
                { label: "Lifestyle", value: "lifestyle" },
                { label: "Foodie", value: "foodie" },
                { label: "Viaje", value: "viaje" },
                { label: "Moda", value: "moda" },
                { label: "General", value: "general" },
                { label: "Familia", value: "familia" },
                { label: "Creadores UGC", value: "creadores UGC" },
              ].map((cat) => (
                <Button
                  key={cat.value}
                  variant={selectedNicho === cat.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedNicho(cat.value)}
                  className="capitalize"
                >
                  {cat.label}
                </Button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredInfluencers.map((inf) => (
                <Card key={inf.id} className="group overflow-hidden border-border hover:shadow-xl transition-all">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={inf.imagen} alt={inf.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    {inf.destacado && (
                      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">⭐ Top Creator</Badge>
                    )}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-lg font-bold text-white">{inf.nombre}</h3>
                      <p className="text-white/80 text-sm">{inf.handle}</p>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <Badge variant="outline" className="mb-2 capitalize">{inf.nicho}</Badge>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{inf.descripcion}</p>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {inf.plataformas.map((p) => (
                        <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {inf.seguidores}</span>
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" /> {inf.rating}</span>
                      <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {inf.campanas} campañas</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <MapPin className="h-3 w-3" /> {inf.ubicacion}
                      <span className="ml-auto">{inf.idiomas.join(", ")}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-primary">{inf.tarifa}</span>
                      <Button size="sm" variant="outline" className="gap-1"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            descripcion: `Interés en contratar a ${inf.nombre} (${inf.handle}) para una campaña de categoría ${inf.nicho}. \n\nDetalles del proyecto:`
                          }));
                          document.getElementById("form-contacto")?.scrollIntoView({ behavior: "smooth" });
                        }}>
                        Contratar <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredInfluencers.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No hay creadores registrados en esta categoría en este momento.</p>
            )}
          </div>
        </section>

        {/* Form */}
        <section id="form-contacto" className="py-16 bg-card/50">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2 text-center">Solicita una Campaña</h2>
            <p className="text-muted-foreground text-center mb-8">Cuéntanos sobre tu negocio y te propondremos los mejores influencers.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Empresa / Marca *</label>
                  <Input value={formData.empresa} onChange={(e) => setFormData({ ...formData, empresa: e.target.value })} placeholder="Nombre del negocio" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Persona de contacto</label>
                  <Input value={formData.contacto} onChange={(e) => setFormData({ ...formData, contacto: e.target.value })} placeholder="Tu nombre" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Email *</label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@empresa.com" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Teléfono</label>
                  <Input value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} placeholder="+1 809-000-0000" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">¿Qué quieres promocionar?</label>
                <Textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} placeholder="Describe tu negocio, objetivos y presupuesto estimado..." rows={4} />
              </div>
              <Button type="submit" size="lg" className="w-full gap-2">
                <Send className="h-4 w-4" /> Enviar solicitud
              </Button>
            </form>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
