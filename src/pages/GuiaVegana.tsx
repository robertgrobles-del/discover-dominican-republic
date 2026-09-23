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
  Leaf, MapPin, UtensilsCrossed, Star, CheckCircle, ShoppingBag, 
  ChevronRight, Heart, Sparkles, AlertCircle, MessageSquare
} from "lucide-react";

import gastronomyImg from "@/assets/gastronomy.jpg";

const restaurantesVeganos = [
  { 
    nombre: "Pura Tasca Plant-Based", 
    ubicacion: "Zona Colonial, Santo Domingo", 
    tipo: "100% Vegano", 
    imagen: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=400&fit=crop",
    opciones: ["Hamburguesas de plátano y frijol negro", "Ceviche de setas y coco", "Brunch y postres sin azúcar refinada"], 
    rating: 4.8 
  },
  { 
    nombre: "Fresh Fresh Café", 
    ubicacion: "Piantini, Santo Domingo / Punta Cana", 
    tipo: "Vegetariano & Vegano", 
    imagen: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop",
    opciones: ["Smoothie bowls tropicales", "Wraps de tofu y aguacate criollo", "Café orgánico con leche de coco y almendra"], 
    rating: 4.7 
  },
  { 
    nombre: "Greenlife Organic Café", 
    ubicacion: "Los Jardines, Santiago", 
    tipo: "100% Vegano", 
    imagen: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop",
    opciones: ["Comida rápida saludable", "Pizzas de masa de yuca con queso vegetal", "Jugos détox prensados en frío"], 
    rating: 4.6 
  },
  { 
    nombre: "Vagamundo Waffles & Coffee", 
    ubicacion: "Cabarete, Puerto Plata", 
    tipo: "Vegan-Friendly", 
    imagen: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
    opciones: ["Waffles veganos sin gluten", "Bowls de açaí y frutas locales", "Ambiente surfista y social"], 
    rating: 4.9 
  },
  { 
    nombre: "La Roulotte Veggie", 
    ubicacion: "Las Terrenas, Samaná", 
    tipo: "Vegetariano & Vegano", 
    imagen: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop",
    opciones: ["Curry tailandés de coco y vegetales", "Ensaladas mediterráneas", "Tacos de jackfruit al pastor"], 
    rating: 4.7 
  },
  { 
    nombre: "Jalao Restaurante (Opciones Criollas)", 
    ubicacion: "Zona Colonial, Santo Domingo", 
    tipo: "Cocina Tradicional con Opciones", 
    imagen: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=400&fit=crop",
    opciones: ["Moro de guandules sin manteca", "Tostones crujientes con aguacate", "Yuca al ajillo y ensaladas criollas"], 
    rating: 4.6 
  },
];

const platosLocalesVeganos = [
  { 
    nombre: "Mangú Criollo con Cebolla Salteada", 
    desc: "Puré suave de plátano verde con abundante cebolla roja caramelizada en aceite de oliva y vinagre de manzana. 100% plant-based.",
    imagen: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop"
  },
  { 
    nombre: "Chenchén del Sur con Leche de Coco", 
    desc: "Maíz tierno partido cocinado lentamente con especias y leche de coco fresca de Samaná. Delicia típica de San Juan y Barahona.",
    imagen: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop"
  },
  { 
    nombre: "Habichuelas Rojas Guisadas", 
    desc: "Frijoles rojos con orégano criollo, cilantro, ajo y calabaza (auyama) para dar espesor. Pedir 'sin caldo de pollo ni carne'.",
    imagen: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&h=200&fit=crop"
  },
  { 
    nombre: "Tostones de Plátano & Yuca Frita", 
    desc: "El aperitivo dominicano por excelencia: plátano macho verde o yuca fresca frita dos veces con sal marina y ajo.",
    imagen: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop"
  }
];

const frasesUtiles = [
  { frase: "Soy vegano / vegana (no como carne, pollo, pescado, lácteos ni huevos).", context: "Al llegar a cualquier restaurante o buffet." },
  { frase: "¿Las habichuelas o el moro tienen caldo de pollo o manteca de cerdo?", context: "Para verificar que no usen sopitas ni grasas animales." },
  { frase: "Por favor, prepare el mangú solo con agua de plátano y aceite, sin mantequilla.", context: "Para asegurar mangú 100% libre de lácteos." },
  { frase: "¿Tienen leche de coco o almendra para el café?", context: "En cafeterías y bares locales." }
];

export default function GuiaVegana() {
  return (
    <PageTransition>
      <SEOHead
        title="Guía Vegana y Vegetariana de República Dominicana | Restaurantes y Platos Plant-Based"
        description="Descubre los mejores restaurantes veganos en Santo Domingo, Punta Cana, Cabarete y Las Terrenas. Guía de platos dominicanos tradicionales plant-based."
        keywords="comida vegana republica dominicana, restaurantes veganos punta cana, guia vegetariana rd, mangu vegano, restaurantes plant based santo domingo"
      />
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />

        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[460px] flex items-end overflow-hidden">
          <img
            src={gastronomyImg}
            alt="Gastronomía Vegana y Plant-Based en República Dominicana"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-black/35" />

          <div className="relative z-10 container mx-auto px-4 lg:px-8 pb-12">
            <nav className="flex items-center gap-2 text-xs md:text-sm text-white/80 mb-4">
              <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link to="/guia-gastronomica" className="hover:text-primary transition-colors">Gastronomía</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-white font-medium">Guía Vegana & Vegetariana</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <Badge className="mb-3 bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs px-3 py-1 font-semibold">
                  <Leaf className="h-3.5 w-3.5 mr-1.5" /> PLANT-BASED CARIBBEAN
                </Badge>
                <h1 className="font-display text-4xl md:text-6xl font-black text-white tracking-tight mb-3">
                  Guía Vegana en RD
                </h1>
                <p className="text-base md:text-lg text-white/90 max-w-2xl leading-relaxed">
                  Descubre la rica despensa tropical de Quisqueya: plátano, yuca, aguacate criollo, coco fresco y restaurantes que redefinen la cocina vegetal.
                </p>
              </div>

              {/* Stats pill */}
              <div className="flex flex-wrap gap-4 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-white">
                <div className="text-center px-2">
                  <p className="font-display text-2xl font-bold text-emerald-400">100%</p>
                  <p className="text-[11px] text-white/70 uppercase">Frutas Tropicales</p>
                </div>
                <div className="text-center px-2 border-l border-white/10">
                  <p className="font-display text-2xl font-bold text-primary">30+</p>
                  <p className="text-[11px] text-white/70 uppercase">Restaurantes Plant-Based</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platos Naturalmente Veganos */}
        <section className="py-16 container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">
              SABOR CRIOLLO SIN CARNE
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Platos Típicos Naturalmente Veganos
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
              La cocina dominicana está llena de tesoros vegetales listos para disfrutar en cualquier rincón del país.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {platosLocalesVeganos.map((plato) => (
              <div key={plato.nombre} className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col">
                <div className="h-40 overflow-hidden bg-muted">
                  <img src={plato.imagen} alt={plato.nombre} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-display font-bold text-base text-foreground mb-1">{plato.nombre}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">{plato.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Restaurantes Recomendados */}
        <section className="py-16 bg-card/40 border-y border-border/50">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            <div className="text-center mb-12">
              <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">
                DIRECTORIO GASTRONÓMICO
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                Restaurantes Veganos & Vegetarian-Friendly
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
                Establecimientos seleccionados con opciones creativas y respetuosas de la dieta plant-based.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurantesVeganos.map((r) => (
                <Card key={r.nombre} className="border-border/80 bg-card hover:border-primary/40 hover:shadow-lg transition-all flex flex-col overflow-hidden">
                  <div className="relative h-48 overflow-hidden bg-muted">
                    <img src={r.imagen} alt={r.nombre} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-emerald-600 text-white border-none text-[11px]">
                        {r.tipo}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-black/75 text-amber-300 border-none text-xs font-bold">
                        ★ {r.rating}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-5 flex flex-col flex-1">
                    <h3 className="font-display font-bold text-lg text-foreground mb-1">{r.nombre}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
                      <MapPin className="h-3.5 w-3.5 text-primary" /> {r.ubicacion}
                    </p>

                    <div className="space-y-1.5 pt-3 border-t border-border flex-1">
                      {r.opciones.map((op) => (
                        <div key={op} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{op}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Guía de Frases para Ordenar */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
                <MessageSquare className="h-6 w-6 text-primary" /> Frases Clave para Ordenar en RD
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Usa estas expresiones para comunicarte con claridad en comedores y restaurantes tradicionales.
              </p>
            </div>

            <div className="space-y-3">
              {frasesUtiles.map((f, i) => (
                <div key={i} className="bg-card border border-border p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-foreground text-sm">"{f.frase}"</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Uso: {f.context}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] self-start sm:self-center">Recomendado</Badge>
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
