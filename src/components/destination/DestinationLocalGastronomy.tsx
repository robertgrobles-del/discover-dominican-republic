import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UtensilsCrossed, Clock, ChefHat, ChevronRight, Sparkles, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface GastronomyDish {
  slug: string;
  name: string;
  category: string;
  region: string;
  time: string;
  difficulty: string;
  description: string;
  image: string;
  highlightTag: string;
}

const featuredDishes: GastronomyDish[] = [
  {
    slug: "chivo-guisado",
    name: "Chivo Guisado Liniero",
    category: "Plato Fuerte / Tradición",
    region: "Montecristi, Dajabón & Azua",
    time: "2.5 Horas",
    difficulty: "Media-Alta",
    description: "Carne tierna y jugosa marinada con orégano silvestre, ajo criollo y naranja agria, cocinada a fuego lento en caldero con un toque de ron añejo.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=550&fit=crop",
    highlightTag: "Guiso Emblemático"
  },
  {
    slug: "pescado-frito",
    name: "Pescado Frito Playero",
    category: "Especialidad Costera",
    region: "Boca Chica, Samaná & Barahona",
    time: "45 Min",
    difficulty: "Medio",
    description: "Pescado fresco entero (chillo o mero) enharinado ligeramente y frito a la perfección crujiente, acompañado de tostones dorados, aguacate y limón.",
    image: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=800&h=550&fit=crop",
    highlightTag: "Crujiente del Caribe"
  },
  {
    slug: "casabe",
    name: "Casabe Artesanal",
    category: "Herencia Taína / Acompañamiento",
    region: "Monción (Santiago Rodríguez) & Cordillera",
    time: "45 Min",
    difficulty: "Medio",
    description: "Torta crujiente milenaria 100% de yuca prensada en burén. Patrimonio Cultural Inmaterial UNESCO, ideal tostado con ajo o queso criollo.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=550&fit=crop",
    highlightTag: "Herencia Ancestral"
  }
];

interface DestinationLocalGastronomyProps {
  destinoNombre?: string;
  customDishes?: GastronomyDish[];
}

export function DestinationLocalGastronomy({ 
  destinoNombre,
  customDishes 
}: DestinationLocalGastronomyProps) {
  const dishes = customDishes && customDishes.length > 0 ? customDishes : featuredDishes;

  return (
    <section className="py-16 bg-muted/20 border-y border-border/60">
      <div className="container mx-auto px-4">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary block">
              SABORES AUTÉNTICOS &amp; RAÍCES CRIOLLAS
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-black text-foreground tracking-tight">
              Gastronomía Dominicana
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
              Una exquisita fusión de herencia taína, española y africana. Desde el pescado recién capturado sazonado con coco hasta las cocciones lentas tradicionales.
            </p>
          </div>

          <Link to="/recetas-criollas" className="flex-shrink-0">
            <Button variant="outline" className="gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary transition-all rounded-xl font-bold">
              <UtensilsCrossed className="h-4 w-4 text-primary" />
              <span>Ver Todo el Recetario</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Dishes Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {dishes.map((dish, index) => (
            <motion.div
              key={dish.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              viewport={{ once: true }}
              className="flex"
            >
              <Card className="rounded-2xl border-border bg-card overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl group flex flex-col w-full">
                {/* Image Container with Badges */}
                <div className="relative aspect-[16/11] overflow-hidden bg-muted">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <Badge className="bg-primary/90 hover:bg-primary text-primary-foreground font-semibold text-[11px] backdrop-blur-md shadow-md">
                      {dish.highlightTag}
                    </Badge>
                  </div>

                  {/* Bottom Image Info */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-xs uppercase font-bold text-amber-300 tracking-wider">
                      {dish.category}
                    </p>
                    <h3 className="font-display text-xl font-bold text-white group-hover:text-primary-foreground transition-colors">
                      {dish.name}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {dish.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-muted-foreground border-t border-border/50">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        {dish.time}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <ChefHat className="h-3.5 w-3.5 text-amber-500" />
                        {dish.difficulty}
                      </span>
                      <span className="flex items-center gap-1 font-medium truncate">
                        <MapPin className="h-3.5 w-3.5 text-red-500" />
                        {dish.region.split(',')[0]}
                      </span>
                    </div>
                  </div>

                  {/* CTA Link to Recipe */}
                  <Link to={`/receta/${dish.slug}`} className="block pt-2">
                    <Button 
                      className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200"
                      variant="secondary"
                    >
                      <span className="font-semibold text-xs sm:text-sm">Ver Receta en Gastronomía</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Banner Footer Link to Gastronomic Guide */}
        <div className="mt-10 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-amber-500/10 to-transparent border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 shadow-md">
              <UtensilsCrossed className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-display font-bold text-foreground text-base sm:text-lg">
                ¿Prefieres degustar estos platos en un restaurante local?
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Explora nuestra selección de comedores típicos, restaurantes frente al mar y cocinas galardonadas.
              </p>
            </div>
          </div>
          <Link to="/guia-gastronomica" className="flex-shrink-0 w-full sm:w-auto">
            <Button className="w-full sm:w-auto gap-2">
              <span>Explorar Restaurantes</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}
