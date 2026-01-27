import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Image,
  Palette,
  Download,
  Share2,
  Heart,
  ShoppingCart,
  ChevronRight,
  Sparkles,
  Smartphone,
  Monitor,
  Frame,
} from "lucide-react";

const categories = [
  { name: "Wallpapers", icon: Monitor, count: 156 },
  { name: "Fondos Móvil", icon: Smartphone, count: 89 },
  { name: "Postales", icon: Frame, count: 45 },
  { name: "Arte Digital", icon: Palette, count: 67 },
];

const artworks = [
  {
    id: 1,
    title: "Atardecer en Samaná",
    artist: "María Pérez",
    type: "Fotografía Digital",
    price: 0,
    downloads: "2.3K",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
  },
  {
    id: 2,
    title: "Zona Colonial Ilustrada",
    artist: "Juan García",
    type: "Ilustración",
    price: 150,
    downloads: "890",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400",
  },
  {
    id: 3,
    title: "Merengue en Acuarela",
    artist: "Ana Rodríguez",
    type: "Arte Digital",
    price: 200,
    downloads: "1.2K",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
  },
  {
    id: 4,
    title: "Playa Rincón",
    artist: "Carlos Méndez",
    type: "Fotografía",
    price: 0,
    downloads: "4.5K",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
  },
  {
    id: 5,
    title: "Flora Endémica RD",
    artist: "Laura Sánchez",
    type: "Ilustración Botánica",
    price: 250,
    downloads: "567",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400",
  },
  {
    id: 6,
    title: "Carnaval de La Vega",
    artist: "Pedro Jiménez",
    type: "Fotografía",
    price: 0,
    downloads: "3.1K",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400",
  },
];

const collections = [
  {
    name: "Playas Paradisíacas",
    items: 24,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300",
  },
  {
    name: "Cultura Viva",
    items: 18,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300",
  },
  {
    name: "Arquitectura Colonial",
    items: 32,
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=300",
  },
];

export default function SouvenirsDigitales() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/90 via-cyan-900/80 to-slate-900/90" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920')] bg-cover bg-center opacity-20" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <Badge className="mb-4 bg-teal-500/20 text-teal-200 border-teal-400/30">
                <Sparkles className="h-3 w-3 mr-1" />
                GALERÍA DIGITAL
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
                Souvenirs <span className="text-teal-400">Digitales</span>
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Llévate un pedazo de República Dominicana. Arte digital, fotografías 
                y wallpapers de artistas locales.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12 bg-card border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((cat) => (
                <Button
                  key={cat.name}
                  variant="outline"
                  className="gap-2 rounded-full"
                >
                  <cat.icon className="h-4 w-4" />
                  {cat.name}
                  <Badge variant="secondary">{cat.count}</Badge>
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Collections */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h2 className="font-display text-2xl font-bold mb-2">Colecciones Destacadas</h2>
            </motion.div>

            <div className="flex gap-4 overflow-x-auto pb-4">
              {collections.map((col, index) => (
                <motion.div
                  key={col.name}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="shrink-0 w-64 group cursor-pointer"
                >
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden relative mb-3">
                    <img
                      src={col.image}
                      alt={col.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <p className="text-white font-bold">{col.name}</p>
                      <p className="text-white/70 text-sm">{col.items} items</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-end justify-between mb-12"
            >
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                  Galería de <span className="text-gradient">Arte</span>
                </h2>
                <p className="text-muted-foreground">
                  Descarga gratis o apoya a artistas locales con tu compra.
                </p>
              </div>
              <Button variant="outline" className="hidden md:flex gap-2">
                Ver todo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {artworks.map((art, index) => (
                <motion.div
                  key={art.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <div className="aspect-square rounded-2xl overflow-hidden relative mb-3">
                    <img
                      src={art.image}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="secondary" className="rounded-full">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="secondary" className="rounded-full">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="secondary" className="rounded-full">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {art.price === 0 && (
                      <Badge className="absolute top-3 left-3 bg-green-500/90 text-white">
                        Gratis
                      </Badge>
                    )}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground truncate">{art.title}</h3>
                    <p className="text-sm text-muted-foreground">{art.artist}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {art.downloads}
                      </span>
                      {art.price > 0 ? (
                        <span className="text-sm font-bold text-primary">${art.price} DOP</span>
                      ) : (
                        <span className="text-sm text-green-600 font-medium">Descarga libre</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Artist CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-teal-900 to-cyan-900 rounded-3xl p-8 md:p-12 text-center"
            >
              <Palette className="h-16 w-16 text-teal-300 mx-auto mb-6" />
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                ¿Eres artista dominicano?
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Únete a nuestra plataforma y comparte tu arte con viajeros de todo el mundo. 
                Tú decides el precio o si lo ofreces gratis.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="gap-2 bg-white text-teal-900 hover:bg-white/90">
                  Subir mi Arte
                </Button>
                <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                  Conocer más
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
