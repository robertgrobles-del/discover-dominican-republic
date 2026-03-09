import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Play, Music, Heart, MapPin, Calendar, Landmark, BookOpen, Palette, Sparkles, Globe, Drumstick } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BetweenSectionsAd, CompactInlineAd } from "@/components/ads";
import { useTranslation } from "@/hooks/useI18n";
import laBanderaImg from "@/assets/la-bandera.jpg";
import merengueImg from "@/assets/merengue-dance.jpg";
import carnivalImg from "@/assets/carnival.jpg";
import historyImg from "@/assets/history.jpg";
import gastronomyImg from "@/assets/gastronomy.jpg";
import colonialDoorImg from "@/assets/colonial-door.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";

const culturalCategories = [
  { id: "all", label: "Todo", icon: "🇩🇴" },
  { id: "gastronomy", label: "Gastronomía", icon: "🍽️" },
  { id: "music", label: "Música", icon: "🎵" },
  { id: "festivals", label: "Festivales", icon: "🎭" },
  { id: "history", label: "Historia", icon: "📜" },
  { id: "museums", label: "Museos", icon: "🏛️" },
  { id: "art", label: "Arte", icon: "🎨" },
];

export default function Cultura() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("all");

  const festivals = [
    {
      name: "Carnaval Vegano",
      monthKey: "Febrero",
      location: "La Vega, RD",
      category: "Cultural",
      description: "La celebración folklórica más vibrante y antigua de América, llena de color, disfraces de diablos...",
      image: carnivalImg,
    },
    {
      name: "Festival del Merengue",
      monthKey: "Julio",
      location: "Santo Domingo, RD",
      category: "Musical",
      description: "Una semana dedicada a nuestro ritmo nacional con orquestas en vivo en el Malecón y ferias...",
      image: merengueImg,
    },
    {
      name: "Día de la Altagracia",
      monthKey: "Enero",
      location: "Higüey, RD",
      category: "Religioso",
      description: "La peregrinación más importante del país hacia la Basílica de Higüey para honrar a la madre espiritual...",
      image: historyImg,
    },
  ];

  const ingredients = ["Arroz", "Habichuelas", "Carne Guisada", "Plátano"];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageBreadcrumbs items={[{ label: "Cultura" }]} />

      {/* Sticky Cultural Category Nav */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {culturalCategories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                size="sm"
                className="shrink-0 gap-2"
                onClick={() => setActiveCategory(cat.id)}
              >
                <span>{cat.icon}</span> {cat.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] w-full flex flex-col justify-center items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={merengueImg}
            alt="Cultura Dominicana"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        </div>

        <div className="relative z-10 text-center px-4 pt-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block bg-primary/20 text-primary text-sm font-medium px-4 py-2 rounded-full mb-6"
          >
            {t("cultura.tag")}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-6xl font-bold mb-4"
          >
            {t("cultura.title")} <span className="text-gradient italic">{t("cultura.titleHighlight")}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8"
          >
            {t("cultura.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Button className="gap-2">{t("cultura.exploreCulture")}</Button>
            <Button variant="outline" className="gap-2">
              <Play className="h-4 w-4" />
              {t("cultura.watchVideo")}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Cultural Stats */}
      <section className="py-8 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "500+", label: "Años de historia", icon: "📜" },
              { value: "2", label: "Géneros Patrimonio UNESCO", icon: "🎵" },
              { value: "100+", label: "Fiestas patronales", icon: "🎭" },
              { value: "50+", label: "Museos y monumentos", icon: "🏛️" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-4"
              >
                <span className="text-2xl mb-2 block">{stat.icon}</span>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gastronomy Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-primary text-sm font-medium uppercase tracking-wider">
                {t("cultura.gastronomy")}
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 mb-6">
                {t("cultura.flavorsTitle")} <span className="text-gradient">{t("cultura.flavorsHighlight")}</span>
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {t("cultura.flavorsDesc")}
              </p>

              {/* Featured Dish */}
              <div className="bg-surface rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-2 text-primary text-sm mb-3">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  {t("cultura.typicalRecipe")}
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                  {t("cultura.laBandera")}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {t("cultura.laBanderaDesc")}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {ingredients.map((ing) => (
                    <span
                      key={ing}
                      className="bg-background text-muted-foreground text-xs px-3 py-1 rounded-full"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
                <Button variant="outline" className="gap-2">
                  {t("cultura.viewRecipe")}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="col-span-2 relative aspect-video rounded-2xl overflow-hidden">
                <img
                  src={laBanderaImg}
                  alt="La Bandera Dominicana"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded">
                  {t("cultura.dishOfMonth")}
                </div>
              </div>
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <img
                  src={gastronomyImg}
                  alt="Gastronomía dominicana"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center">
                <div className="text-center p-4">
                  <p className="text-amber-500 font-bold text-2xl">100+</p>
                  <p className="text-muted-foreground text-sm">{t("cultura.traditionalRecipes")}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Ad between sections */}
      <CompactInlineAd showDemo />

      {/* Music & Folklore Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-6">
                <img
                  src={merengueImg}
                  alt="Merengue y Bachata"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div>
                    <p className="text-xs text-muted-foreground">{t("cultura.nowPlaying")}</p>
                    <p className="font-display font-bold text-foreground">Compadre Pedro Juan</p>
                    <p className="text-xs text-primary">Luis Alberti - Merengue Clásico</p>
                  </div>
                  <Button size="icon" className="rounded-full w-12 h-12">
                    <Play className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Music Types */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface rounded-xl p-4">
                  <Music className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-display font-bold text-foreground">Merengue</h4>
                  <p className="text-xs text-muted-foreground">{t("cultura.energyParty")}</p>
                </div>
                <div className="bg-surface rounded-xl p-4">
                  <Heart className="h-6 w-6 text-rose-500 mb-2" />
                  <h4 className="font-display font-bold text-foreground">Bachata</h4>
                  <p className="text-xs text-muted-foreground">{t("cultura.feelingPassion")}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <span className="text-primary text-sm font-medium uppercase tracking-wider">
                {t("cultura.musicFolklore")}
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 mb-6">
                {t("cultura.rhythmsTitle")}{" "}
                <span className="text-gradient">{t("cultura.rhythmsHighlight")}</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {t("cultura.rhythmsDesc")}
              </p>

              <p className="text-muted-foreground text-sm italic border-l-2 border-primary pl-4 mb-6">
                {t("cultura.rhythmsQuote")}
              </p>

              <Button className="gap-2">
                {t("cultura.listenPlaylist")}
                <Play className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Patron Festivals Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-primary text-sm font-medium uppercase tracking-wider">
              {t("cultura.livingTradition")}
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-3 mb-4">
              {t("cultura.patronFestivals")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("cultura.patronDesc")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {festivals.map((festival, index) => (
              <motion.div
                key={festival.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-surface rounded-2xl overflow-hidden"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={festival.image}
                    alt={festival.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded">
                    {festival.monthKey}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {festival.name}
                    </h3>
                    <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                      {festival.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                    <MapPin className="h-4 w-4" />
                    {festival.location}
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {festival.description}
                  </p>
                  <Button variant="link" className="text-primary p-0 gap-1">
                    {t("cultura.viewDetails")}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              {t("cultura.viewFullCalendar")}
            </Button>
          </div>
        </div>
      </section>

      {/* Museums & Heritage Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-primary text-sm font-medium uppercase tracking-wider">Patrimonio</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-3 mb-4">
              Museos y <span className="text-gradient">Monumentos</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Desde la primera catedral de América hasta museos de arte contemporáneo, la República Dominicana guarda 500 años de historia.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Zona Colonial", desc: "Patrimonio UNESCO, la primera ciudad del Nuevo Mundo", icon: Landmark, image: colonialDoorImg, link: "/destino/zona-colonial" },
              { name: "Museo del Hombre", desc: "Arte y cultura taína precolombina", icon: BookOpen, image: santoDomingoImg, link: "/museos" },
              { name: "Alcázar de Colón", desc: "Palacio virreinal del siglo XVI restaurado", icon: Landmark, image: historyImg, link: "/museos" },
              { name: "Arte Contemporáneo", desc: "Galerías y expresiones artísticas dominicanas", icon: Palette, image: gastronomyImg, link: "/museos" },
            ].map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={item.link}>
                  <Card className="overflow-hidden group h-full border-border hover:border-primary/50 transition-colors">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <div className="p-2 rounded-lg bg-primary/20 backdrop-blur-sm">
                          <item.icon className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/museos">
              <Button variant="outline" className="gap-2">
                <Landmark className="h-4 w-4" /> Explorar todos los museos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* History Timeline Teaser */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-primary text-sm font-medium uppercase tracking-wider">Historia Viva</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold mt-3 mb-6">
                500 Años de <span className="text-gradient">Historia</span>
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Desde la llegada de Cristóbal Colón en 1492 hasta la República Dominicana moderna, cada rincón de esta isla cuenta una historia fascinante de conquista, resistencia, cultura y renacimiento.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  { year: "1492", event: "Llegada de Colón a la isla La Española" },
                  { year: "1844", event: "Independencia Nacional — Juan Pablo Duarte" },
                  { year: "1916", event: "Primera ocupación norteamericana" },
                  { year: "1965", event: "Revolución de Abril y la guerra civil" },
                ].map((item) => (
                  <div key={item.year} className="flex items-start gap-4">
                    <span className="text-primary font-bold text-lg min-w-[60px]">{item.year}</span>
                    <div className="flex-1 border-l-2 border-primary/30 pl-4">
                      <p className="text-foreground text-sm">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/historia">
                <Button className="gap-2">
                  Explorar la historia completa <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden"
            >
              <img src={colonialDoorImg} alt="Zona Colonial" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-foreground font-display text-xl font-bold">Zona Colonial</p>
                <p className="text-muted-foreground text-sm">Patrimonio de la Humanidad UNESCO</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Ad before CTA */}
      <BetweenSectionsAd showDemo />

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
              {t("cultura.ctaTitle")}
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
              {t("cultura.ctaDesc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder={t("cultura.emailPlaceholder")}
                className="flex-1 px-4 py-3 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30"
              />
              <Button variant="secondary" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                {t("cultura.subscribe")}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
