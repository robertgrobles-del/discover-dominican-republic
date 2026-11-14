import { motion } from "framer-motion";
import { ChevronRight, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LazyImage } from "@/components/ui/lazy-image";
import { BannerAd } from "@/components/promo";
import { useTranslation } from "@/hooks/useI18n";
import heroBeachImg from "@/assets/hero-beach.jpg";
import { channelLabel, formatEditorialDate, useEditorialArticles } from "@/lib/editorialApi";

export function NewsSection() {
  const { t } = useTranslation();
  // Las mismas publicaciones que la revista: la destacada (o la más reciente) y las tres siguientes.
  const { data: articles = [] } = useEditorialArticles();
  const news = articles.map((a) => ({
    id: a.id, href: a.href, title: a.title, excerpt: a.excerpt, image: a.image ?? heroBeachImg, // Las noticias del panel muestran su categoría; el resto, el nombre de su canal.
    category: a.channel === "noticias" && a.category ? a.category : channelLabel(a.channel),
    date: formatEditorialDate(a.publishedAt), readTime: a.readMinutes ? `${a.readMinutes} min` : "", featured: a.featured,
    sponsored: a.postType === "patrocinado", sponsor: a.sponsor,
  }));
  // El post patrocinado ocupa el espacio de publicidad de la columna; si no hay ninguno, queda el anuncio.
  const sponsored = news.find(n => n.sponsored);
  const editorial = news.filter(n => !n.sponsored);
  const featuredNews = editorial.find(n => n.featured) ?? editorial[0];
  const regularNews = editorial.filter(n => n.id !== featuredNews?.id).slice(0, 3);
  if (!featuredNews) return null;

  return (
    <section className="py-14 lg:py-20 bg-muted/40">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              {t("news.stayInformed")} <span className="text-primary">{t("news.informed")}</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg">
              {t("news.subtitle")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Button variant="outline" className="gap-2" asChild>
              <Link to="/noticias">
                {t("news.viewAll")}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
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
              className="lg:col-span-2 group h-full"
            >
              <Link to={featuredNews.href} className="block h-full">
                {/* En escritorio ocupa todo el alto de la columna derecha para que el bloque quede parejo. */}
                <div className="relative aspect-[16/9] lg:aspect-auto lg:h-full lg:min-h-[420px] rounded-2xl overflow-hidden">
                  <LazyImage
                    src={featuredNews.image}
                    alt={featuredNews.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    containerClassName="absolute inset-0"
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
          <div className="flex flex-col gap-6">
            {regularNews.slice(0, 2).map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Link to={article.href} className="flex gap-4">
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
            
            {/* Inline Ad en sección de noticias - ancho armónico con la columna */}
            {sponsored ? (
              <motion.article initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group pt-2">
                <Link to={sponsored.href} className="block overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <LazyImage src={sponsored.image} alt={sponsored.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" containerClassName="w-full h-full" />
                    <Badge className="absolute left-3 top-3 bg-amber-500 text-white hover:bg-amber-500">Patrocinado</Badge>
                  </div>
                  <div className="p-4">
                    {sponsored.sponsor && <p className="mb-1 text-xs text-muted-foreground">Presentado por <span className="font-semibold text-foreground">{sponsored.sponsor}</span></p>}
                    <h4 className="font-display font-bold text-foreground line-clamp-2 transition-colors group-hover:text-primary">{sponsored.title}</h4>
                    {sponsored.excerpt && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{sponsored.excerpt}</p>}
                  </div>
                </Link>
              </motion.article>
            ) : (
              <div className="pt-2 w-full">
                <BannerAd size="medium-rect" placement="inline" showDemo className="w-full !max-w-none shadow-sm" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
