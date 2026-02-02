import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Link } from "react-router-dom";
import { MapPin, Star, Waves, Umbrella, Fish, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { beaches, Beach } from "@/data/beaches";

import heroBeach from "@/assets/hero-beach.jpg";

// Mapeo de tipos de playa para mostrar
const beachTypeLabels: Record<Beach['beachType'], string> = {
  'arena-blanca': 'Arena Blanca',
  'arena-dorada': 'Arena Dorada',
  'virgen': 'Virgen',
  'bahia': 'Bahía',
  'deportiva': 'Deportiva',
  'urbana': 'Urbana'
};

const PlayaCard = ({ playa, index }: { playa: Beach; index: number }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link
      to={`/playa/${playa.slug}`}
      className="group relative overflow-hidden rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-500 block"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {!imageLoaded && <Skeleton className="absolute inset-0" />}
        <img
          src={playa.imageUrl}
          alt={playa.name}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <Badge className="absolute top-4 left-4 bg-primary/90 text-primary-foreground">
          {beachTypeLabels[playa.beachType]}
        </Badge>
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-white text-sm font-medium">{playa.rating}</span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span>{playa.destinationName || playa.province}</span>
        </div>
        <h3 className="text-xl font-display font-bold text-foreground mb-2">{playa.name}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{playa.shortDescription}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {playa.activities.slice(0, 3).map((act) => (
            <span key={act} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
              {act}
            </span>
          ))}
        </div>

        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          Explorar Playa
        </Button>
      </div>
    </Link>
  );
};

export default function Playas() {
  const featuredBeaches = beaches.filter(b => b.isFeatured);
  
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        {/* Hero */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <img
            src={heroBeach}
            alt="Playas de República Dominicana"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="relative z-10 text-center px-4">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Waves className="w-4 h-4 mr-2" />
              Paraíso Caribeño
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
              Playas de <span className="text-gradient">República Dominicana</span>
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Descubre más de 1,600 km de costa con algunas de las playas más hermosas del mundo
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Umbrella, label: "400+ Playas", desc: "En todo el país" },
                { icon: Waves, label: "Aguas Cálidas", desc: "24-28°C todo el año" },
                { icon: Fish, label: "Vida Marina", desc: "Arrecifes de coral" },
                { icon: Camera, label: "Paisajes Únicos", desc: "Postales naturales" }
              ].map((feature) => (
                <div key={feature.label} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{feature.label}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Playas Grid */}
        <section className="py-16 flex-1">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                Playas Destacadas
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Desde arenas blancas hasta bahías escondidas, encuentra tu playa perfecta
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredBeaches.map((playa, index) => (
                <PlayaCard key={playa.id} playa={playa} index={index} />
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
