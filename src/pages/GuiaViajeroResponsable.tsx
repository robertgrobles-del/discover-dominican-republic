import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { PanoramaAd } from "@/components/promo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Download, Leaf, TreePine, Map, CheckCircle, ShieldCheck, 
  Waves, Heart, Compass, Sparkles, ChevronRight, Recycle, Sun, Globe
} from "lucide-react";
import { toast } from "sonner";

import samanaImg from "@/assets/samana.jpg";
import whaleImg from "@/assets/whale-samana.jpg";

const decálogoSostenible = [
  {
    icon: Waves,
    numero: "01",
    titulo: "Protege los Arrecifes y la Vida Marina",
    desc: "Usa protector solar 100% biodegradable (mineral/reef-safe). Los químicos oxibenzona y octinoxato blanquean los corales de Bávaro, Bayahíbe y Las Galeras."
  },
  {
    icon: Recycle,
    numero: "02",
    titulo: "Cero Plásticos de Un Solo Uso",
    desc: "Lleva tu botella reutilizable con filtro y bolsas de tela. Ayúdanos a mantener limpias nuestras más de 200 playas y ríos vírgenes."
  },
  {
    icon: Heart,
    numero: "03",
    titulo: "Apoya Directamente la Economía Comunitaria",
    desc: "Compra artesanía hecha a mano en larimar, ámbar y barro. Come en comedores criollos y contrata guías locales certificados por el MITUR."
  },
  {
    icon: TreePine,
    numero: "04",
    titulo: "Respeta la Flora y Fauna Endémica",
    desc: "No compres souvenirs de caracol marino, caparazón de carey o estrellas de mar. Mantén distancia respetuosa de manatíes, iguanas y ballenas jorobadas."
  },
  {
    icon: Sun,
    numero: "05",
    titulo: "Consumo Consciente de Agua y Energía",
    desc: "En zonas como Pedernales, Samaná o Barahona los recursos son preciosos. Apaga el aire acondicionado al salir de tu habitación."
  },
  {
    icon: ShieldCheck,
    numero: "06",
    titulo: "Respeta el Patrimonio Histórico y Taíno",
    desc: "No toques las pictografías de las cuevas de Los Haitises ni te apoyes en las ruinas centenarias de la Ciudad Colonial."
  }
];

const santuariosSostenibles = [
  {
    nombre: "Santuario de Ballenas Jorobadas",
    ubicacion: "Bahía de Samaná & Banco de la Plata",
    desc: "Regulado bajo estrictas normas internacionales de avistamiento responsable con embarcaciones autorizadas.",
    image: whaleImg,
    enlace: "/destino/samana"
  },
  {
    nombre: "Parque Nacional Jaragua & Bahía de las Águilas",
    ubicacion: "Pedernales",
    desc: "Reserva de la biosfera de la UNESCO con playas completamente vírgenes y protección de anidación de tortugas carey.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
    enlace: "/destino/pedernales"
  },
  {
    nombre: "Reserva Científica Ébano Verde",
    ubicacion: "Constanza / La Vega",
    desc: "Bosque nublado de alta montaña dedicado a la conservación del árbol endémico Ébano Verde y orquídeas silvestres.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop",
    enlace: "/destino/constanza"
  }
];

export default function GuiaViajeroResponsable() {
  const handleDownload = () => {
    toast.success("¡Guía Oficial en PDF Descargada!", {
      description: "Gracias por ser parte del cambio hacia un turismo consciente en República Dominicana."
    });
  };

  return (
    <PageTransition>
      <SEOHead
        title="Guía del Viajero Responsable en República Dominicana | Turismo Sostenible RD"
        description="Aprende cómo minimizar tu impacto ambiental, proteger los corales, respetar la fauna endémica y apoyar a las comunidades locales en RD."
        keywords="turismo sostenible republica dominicana, ecoturismo rd, viajero responsable, proteccion arrecifes caribe, cuidar playas dominicana"
      />
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />

        {/* Hero Section */}
        <section className="relative h-[65vh] min-h-[480px] flex items-end overflow-hidden">
          <img
            src={samanaImg}
            alt="Naturaleza virgen y turismo sostenible en República Dominicana"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-black/30" />

          <div className="relative z-10 container mx-auto px-4 lg:px-8 pb-12">
            <nav className="flex items-center gap-2 text-xs md:text-sm text-white/80 mb-4">
              <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link to="/sostenible" className="hover:text-primary transition-colors">Sostenibilidad</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-white font-medium">Guía del Viajero Responsable</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <Badge className="mb-3 bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs px-3 py-1 font-semibold">
                  <Leaf className="h-3.5 w-3.5 mr-1.5" /> IMPACTO POSITIVO
                </Badge>
                <h1 className="font-display text-4xl md:text-6xl font-black text-white tracking-tight mb-3">
                  Guía del Viajero Responsable
                </h1>
                <p className="text-base md:text-lg text-white/90 max-w-2xl leading-relaxed">
                  Tu viaje tiene el poder de transformar y proteger. Descubre cómo disfrutar de nuestros paraísos naturales dejando únicamente huellas en la arena.
                </p>
              </div>

              {/* Action Button */}
              <Button onClick={handleDownload} size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 flex-shrink-0">
                <Download className="h-5 w-5" /> Descargar Guía Digital (PDF)
              </Button>
            </div>
          </div>
        </section>

        {/* Decálogo del Viajero Responsable */}
        <section className="py-16 container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">
              PRINCIPIOS FUNDAMENTALES
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              El Decálogo para Proteger Quisqueya
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
              Acciones sencillas pero de enorme impacto para garantizar que las futuras generaciones también disfruten de nuestra tierra.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {decálogoSostenible.map((item) => (
              <Card key={item.titulo} className="bg-card border-border/80 hover:border-emerald-500/40 hover:shadow-lg transition-all flex flex-col">
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <span className="font-display font-black text-2xl text-muted-foreground/30">{item.numero}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">{item.titulo}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Santuarios y Reservas Ejemplares */}
        <section className="py-16 bg-card/40 border-y border-border/50">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            <div className="text-center mb-12">
              <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">
                ECO-SANTUARIOS
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                Santuarios Naturales con Turismo Regulado
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
                Ejemplos de áreas protegidas donde tu visita contribuye de manera directa a la conservación de especies endémicas.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {santuariosSostenibles.map((s) => (
                <div key={s.nombre} className="group rounded-2xl overflow-hidden bg-card border border-border flex flex-col">
                  <div className="relative h-48 overflow-hidden bg-muted">
                    <img src={s.image} alt={s.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-black/75 text-white text-xs">{s.ubicacion}</Badge>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-display font-bold text-lg text-foreground mb-2">{s.nombre}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">{s.desc}</p>
                    <Button asChild variant="outline" size="sm" className="w-full gap-1.5 text-xs font-semibold">
                      <Link to={s.enlace}>
                        Conocer más <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Panorama Ad Section */}
        <section className="py-6 bg-muted/20 border-t border-border/40">
          <div className="container mx-auto px-4 max-w-6xl">
            <PanoramaAd showDemo />
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}