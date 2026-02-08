import { motion } from "framer-motion";
import { ChevronRight, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LazyImage } from "@/components/ui/lazy-image";
import { InlineAd } from "@/components/ads";
import carnivalImg from "@/assets/carnival.jpg";
import whaleSamanaImg from "@/assets/whale-samana.jpg";
import gastronomyImg from "@/assets/gastronomy.jpg";
import heroBeachImg from "@/assets/hero-beach.jpg";

const news = [
  {
    id: "temporada-ballenas-2026",
    title: "Temporada de Ballenas Jorobadas 2026",
    excerpt: "La bahía de Samaná se prepara para recibir a miles de ballenas jorobadas entre enero y marzo.",
    image: whaleSamanaImg,
    category: "Naturaleza",
    date: "5 Feb 2026",
    readTime: "3 min",
    featured: true,
  },
  {
    id: "carnaval-dominicano",
    title: "Carnaval Dominicano: Las mejores rutas",
    excerpt: "Guía completa para disfrutar del carnaval más colorido del Caribe en La Vega y Santiago.",
    image: carnivalImg,
    category: "Cultura",
    date: "2 Feb 2026",
    readTime: "5 min",
  },
  {
    id: "nuevos-restaurantes",
    title: "5 Nuevos restaurantes imperdibles en Punta Cana",
    excerpt: "Descubre las últimas aperturas gastronómicas que están revolucionando la escena culinaria.",
    image: gastronomyImg,
    category: "Gastronomía",
    date: "28 Ene 2026",
    readTime: "4 min",
  },
  {
    id: "playas-secretas",
    title: "10 Playas secretas que debes conocer",
    excerpt: "Escapa de las multitudes y descubre rincones paradisíacos poco conocidos del país.",
    image: heroBeachImg,
    category: "Playas",
    date: "25 Ene 2026",
    readTime: "6 min",
  },
];

export function NewsSection() {
  const featuredNews = news.find(n => n.featured);
  const regularNews = news.filter(n => !n.featured);

  return (
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 text-muted-foreground text-sm font-medium mb-3">
              <span className="w-8 h-px bg-border" />
              Últimas Noticias
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Mantente <span className="text-gradient">Informado</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg">
              Lo último sobre turismo, eventos y novedades de República Dominicana.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link to="/revista">
              <Button variant="outline" className="gap-2">
                Ver todas las noticias
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* News Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Featured News - Left Column */}
          {featuredNews && (
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 group"
            >
              <Link to={`/articulo/${featuredNews.id}`} className="block">
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-4">
                  <LazyImage
                    src={featuredNews.image}
                    alt={featuredNews.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    containerClassName="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <Badge className="mb-3 bg-primary/90">{featuredNews.category}</Badge>
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {featuredNews.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2 mb-3">
                      {featuredNews.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {featuredNews.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {featuredNews.readTime}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          )}

          {/* Right Column - Regular News + Ad */}
          <div className="space-y-6">
            {regularNews.slice(0, 2).map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Link to={`/articulo/${article.id}`} className="flex gap-4">
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
                    <LazyImage
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      containerClassName="w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {article.category}
                    </Badge>
                    <h4 className="font-display font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-1">
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{article.date}</span>
                      <span>·</span>
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
            
            {/* Inline Ad en sección de noticias */}
            <InlineAd showDemo variant="square-sm" />
          </div>
        </div>

        {/* More News Row */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {regularNews.slice(1).map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-surface rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              <Link to={`/articulo/${article.id}`}>
                <div className="relative aspect-video overflow-hidden">
                  <LazyImage
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    containerClassName="w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <Badge variant="secondary" className="mb-2 text-xs">
                    {article.category}
                  </Badge>
                  <h4 className="font-display font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-2">
                    {article.title}
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{article.date}</span>
                    <span className="text-primary font-medium group-hover:underline">
                      Leer más
                    </span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
