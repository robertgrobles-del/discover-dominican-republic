import { motion } from "framer-motion";
import { ChevronRight, Play, Music, Heart, MapPin, Calendar } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { BetweenSectionsAd, CompactInlineAd } from "@/components/ads";
import laBanderaImg from "@/assets/la-bandera.jpg";
import merengueImg from "@/assets/merengue-dance.jpg";
import carnivalImg from "@/assets/carnival.jpg";
import historyImg from "@/assets/history.jpg";
import gastronomyImg from "@/assets/gastronomy.jpg";

const festivals = [
  {
    name: "Carnaval Vegano",
    month: "Febrero",
    location: "La Vega, RD",
    category: "Cultural",
    description: "La celebración folklórica más vibrante y antigua de América, llena de color, disfraces de diablos...",
    image: carnivalImg,
  },
  {
    name: "Festival del Merengue",
    month: "Julio",
    location: "Santo Domingo, RD",
    category: "Musical",
    description: "Una semana dedicada a nuestro ritmo nacional con orquestas en vivo en el Malecón y ferias...",
    image: merengueImg,
  },
  {
    name: "Día de la Altagracia",
    month: "Enero",
    location: "Higüey, RD",
    category: "Religioso",
    description: "La peregrinación más importante del país hacia la Basílica de Higüey para honrar a la madre espiritual...",
    image: historyImg,
  },
];

const ingredients = ["Arroz", "Habichuelas", "Carne Guisada", "Plátano"];

export default function Cultura() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

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
            República Dominicana
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-6xl font-bold mb-4"
          >
            Esencia <span className="text-gradient italic">Dominicana</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8"
          >
            Un viaje vibrante a través de nuestros sabores auténticos, ritmos que mueven el alma y tradiciones que perduran.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Button className="gap-2">Explorar Cultura</Button>
            <Button variant="outline" className="gap-2">
              <Play className="h-4 w-4" />
              Ver Video
            </Button>
          </motion.div>
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
                Gastronomía
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 mb-6">
                Sabores de la <span className="text-gradient">Isla</span>
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Descubre los ingredientes frescos y las recetas centenarias que definen nuestra identidad culinaria. 
                Desde la costa hasta las montañas, cada plato cuenta una historia de tradición y pasión.
              </p>

              {/* Featured Dish */}
              <div className="bg-surface rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-2 text-primary text-sm mb-3">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Receta Típica
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                  La Bandera Dominicana
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  El símbolo de nuestra mesa diaria. Una armonía perfecta de arroz blanco, habichuelas rojas guisadas y carne, 
                  acompañada de tostones y ensalada fresca.
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
                  Ver Receta Paso a Paso
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
                  Plato del Mes
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
                  <p className="text-muted-foreground text-sm">Recetas tradicionales</p>
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
                    <p className="text-xs text-muted-foreground">Ahora Sonando</p>
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
                  <p className="text-xs text-muted-foreground">Energía y Fiesta</p>
                </div>
                <div className="bg-surface rounded-xl p-4">
                  <Heart className="h-6 w-6 text-rose-500 mb-2" />
                  <h4 className="font-display font-bold text-foreground">Bachata</h4>
                  <p className="text-xs text-muted-foreground">Sentimiento y Pasión</p>
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
                Música y Folklore
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 mb-6">
                Ritmos que Mueven el{" "}
                <span className="text-gradient">Alma</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Desde el contagioso compás del <span className="text-primary font-medium">Merengue</span>, 
                Patrimonio Inmaterial de la Humanidad, hasta la pasión nostálgica de la <span className="text-primary font-medium">Bachata</span>. 
                Nuestra música es el latido de la isla.
              </p>

              <p className="text-muted-foreground text-sm italic border-l-2 border-primary pl-4 mb-6">
                "El merengue no se baila, se siente. Cuando suena, el cuerpo simplemente obedece al ritmo."
              </p>

              <Button className="gap-2">
                Escuchar Playlist
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
              Tradición Viva
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-3 mb-4">
              Fiestas Patronales
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Celebra con nosotros. Cada pueblo tiene su santo, su fiesta y su forma única de expresar la alegría dominicana.
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
                    {festival.month}
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
                    Ver detalles
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Ver Calendario Completo
            </Button>
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
              ¿Listo para saborear la experiencia?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
              Suscríbete a nuestro boletín y recibe una guía gratuita con las mejores rutas gastronómicas de la isla.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="flex-1 px-4 py-3 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30"
              />
              <Button variant="secondary" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                Suscribirme
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
