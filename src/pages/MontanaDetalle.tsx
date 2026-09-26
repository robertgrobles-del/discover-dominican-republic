import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MapPin, Star, Mountain, Clock, Shield, ChevronRight, 
  Navigation, Thermometer, AlertTriangle, TreePine, Users, Ruler, Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { FavoriteButton } from "@/components/FavoriteButton";
import { SEOHead } from "@/components/SEOHead";
import { getMountainBySlug, Mountain as MountainType, rangeLabels } from "@/data/mountains";

const difficultyLabels: Record<MountainType['difficulty'], { label: string; color: string }> = {
  'facil': { label: 'Fácil', color: 'bg-green-500' },
  'moderado': { label: 'Moderado', color: 'bg-yellow-500' },
  'dificil': { label: 'Difícil', color: 'bg-orange-500' },
  'experto': { label: 'Experto', color: 'bg-red-500' }
};

export default function MontanaDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const mountain = slug ? getMountainBySlug(slug) : undefined;

  if (!mountain) {
    return (
      <PageTransition>
        <SEOHead
          title="Montaña no encontrada"
          description="La montaña que buscas no existe o ha sido movida. Explora todas las montañas de República Dominicana."
        />
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32 text-center">
            <h1 className="text-3xl font-bold mb-4">Montaña no encontrada</h1>
            <p className="text-muted-foreground mb-8">La montaña que buscas no existe o ha sido movida.</p>
            <Link to="/montanas">
              <Button>Ver todas las montañas</Button>
            </Link>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  const diff = difficultyLabels[mountain.difficulty];

  return (
    <PageTransition>
      <SEOHead
        title={`${mountain.name} - Montañas de República Dominicana`}
        description={mountain.description}
        image={mountain.imageUrl}
        keywords={`${mountain.name}, montañas república dominicana, ${rangeLabels[mountain.range]}, senderismo, ${diff.label}`}
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          <img src={mountain.imageUrl} alt={mountain.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="container mx-auto">
              <nav className="flex items-center gap-2 text-sm text-white/70 mb-4">
                <Link to="/" className="hover:text-white">Inicio</Link>
                <ChevronRight className="h-4 w-4" />
                <Link to="/montanas" className="hover:text-white">Montañas</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-white">{mountain.name}</span>
              </nav>
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="mb-3 bg-white/20 text-white border-none">{rangeLabels[mountain.range]}</Badge>
                  <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-2">{mountain.name}</h1>
                  <div className="flex items-center gap-4 text-white/80">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{mountain.provinceName}</span>
                    <span className="flex items-center gap-1"><Ruler className="h-4 w-4" />{mountain.altitude.toLocaleString()} m</span>
                    <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400" />{mountain.rating} ({mountain.reviewCount})</span>
                  </div>
                </div>
                <FavoriteButton id={mountain.id} type="experiencia" name={mountain.name} image={mountain.imageUrl} className="text-white" />
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Ruler, label: 'Altitud', value: `${mountain.altitude.toLocaleString()} m` },
                  { icon: Clock, label: 'Duración', value: mountain.duration },
                  { icon: Compass, label: 'Dificultad', value: diff.label },
                  { icon: Users, label: 'Guía', value: mountain.guidesRequired ? 'Obligatorio' : 'Opcional' },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-xl bg-card border border-border text-center">
                    <stat.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="font-semibold text-foreground text-sm">{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Description */}
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">Sobre {mountain.name}</h2>
                <p className="text-muted-foreground leading-relaxed">{mountain.description}</p>
              </div>

              {/* Activities */}
              <div>
                <h2 className="font-display text-xl font-bold text-foreground mb-4">Actividades</h2>
                <div className="flex flex-wrap gap-2">
                  {mountain.activities.map((act, i) => (
                    <Badge key={i} variant="secondary">{act}</Badge>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              <div>
                <h2 className="font-display text-xl font-bold text-foreground mb-4">Puntos Destacados</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  {mountain.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Mountain className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-muted-foreground">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Flora & Fauna */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <TreePine className="h-5 w-5 text-green-500" /> Flora
                  </h3>
                  <ul className="space-y-2">
                    {mountain.flora.map((f, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />{f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <Mountain className="h-5 w-5 text-amber-500" /> Fauna
                  </h3>
                  <ul className="space-y-2">
                    {mountain.fauna.map((f, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />{f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Gallery */}
              {mountain.gallery.length > 0 && (
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">Galería</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {mountain.gallery.map((img, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden">
                        <img src={img} alt={`${mountain.name} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Info Card */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">Información Práctica</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Navigation className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Cómo llegar</p>
                      <p className="text-sm text-muted-foreground">{mountain.howToGetThere}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Mejor temporada</p>
                      <p className="text-sm text-muted-foreground">{mountain.bestSeason}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Thermometer className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Precio</p>
                      <p className="text-sm text-muted-foreground">{mountain.priceRange}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Difficulty */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">Dificultad</h3>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`w-3 h-3 rounded-full ${diff.color}`} />
                  <span className="font-semibold text-foreground">{diff.label}</span>
                </div>
                {mountain.guidesRequired && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <Users className="h-4 w-4" /> Guía obligatorio
                  </p>
                )}
              </div>

              {/* Safety Tips */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" /> Seguridad
                </h3>
                <ul className="space-y-2">
                  {mountain.safetyTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
