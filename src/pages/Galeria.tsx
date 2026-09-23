import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Grid, Trees, Users, Building2, Utensils, ChevronDown, X, Download, Share2, Heart } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/PageTransition";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import heroBeachImg from "@/assets/hero-beach.jpg";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import samanaImg from "@/assets/samana.jpg";
import whaleSamanaImg from "@/assets/whale-samana.jpg";
import gastronomyImg from "@/assets/gastronomy.jpg";
import colonialDoorImg from "@/assets/colonial-door.jpg";
import divingImg from "@/assets/diving.jpg";
import adventureImg from "@/assets/adventure.jpg";

const categories = [
  { id: "todo", label: "Todo", icon: Grid },
  { id: "naturaleza", label: "Naturaleza", icon: Trees },
  { id: "gente", label: "Gente", icon: Users },
  { id: "arquitectura", label: "Arquitectura", icon: Building2 },
  { id: "gastronomia", label: "Gastronomía", icon: Utensils },
];

const galleryItems = [
  {
    id: 1,
    type: "image",
    category: "naturaleza",
    src: heroBeachImg,
    title: "Playa Bávaro",
    location: "Punta Cana",
    aspectRatio: "portrait",
  },
  {
    id: 2,
    type: "video",
    category: "naturaleza",
    src: whaleSamanaImg,
    title: "Avistamiento de Ballenas",
    location: "Samaná",
    aspectRatio: "landscape",
  },
  {
    id: 3,
    type: "image",
    category: "arquitectura",
    src: colonialDoorImg,
    title: "Catedral Primada",
    location: "Santo Domingo",
    aspectRatio: "square",
  },
  {
    id: 4,
    type: "image",
    category: "gente",
    src: divingImg,
    title: "Artesana Local",
    location: "La Romana",
    aspectRatio: "portrait",
  },
  {
    id: 5,
    type: "video",
    category: "gente",
    src: adventureImg,
    title: "Carnaval de La Vega",
    location: "La Vega",
    aspectRatio: "square",
  },
  {
    id: 6,
    type: "video",
    category: "naturaleza",
    src: samanaImg,
    title: "Cascada El Limón",
    location: "Samaná",
    aspectRatio: "portrait",
  },
  {
    id: 7,
    type: "image",
    category: "gastronomia",
    src: gastronomyImg,
    title: "La Bandera Dominicana",
    location: "Santo Domingo",
    aspectRatio: "landscape",
  },
  {
    id: 8,
    type: "image",
    category: "naturaleza",
    src: puntaCanaImg,
    title: "Kitesurfing",
    location: "Cabarete",
    aspectRatio: "landscape",
  },
  {
    id: 9,
    type: "video",
    category: "naturaleza",
    src: santoDomingoImg,
    title: "Cola de Ballena",
    location: "Bahía de Samaná",
    aspectRatio: "portrait",
  },
];

function GalleryItem({ item, onClick }: { item: typeof galleryItems[0]; onClick: () => void }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const aspectClass = {
    portrait: "row-span-2",
    landscape: "col-span-1",
    square: "col-span-1",
  }[item.aspectRatio];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={`group relative rounded-xl overflow-hidden cursor-pointer ${aspectClass}`}
    >
      {!imageLoaded && <Skeleton className="absolute inset-0 w-full h-full" />}
      <img
        src={item.src}
        alt={item.title}
        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setImageLoaded(true)}
        ref={(img) => { if (img?.complete) setImageLoaded(true); }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {item.type === "video" && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center">
            <Play className="h-4 w-4 text-primary-foreground fill-current" />
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
        <h3 className="font-display font-bold text-foreground">{item.title}</h3>
        <p className="text-sm text-muted-foreground">{item.location}</p>
      </div>
    </motion.div>
  );
}

export default function Galeria() {
  const [activeCategory, setActiveCategory] = useState("todo");
  const [selectedItem, setSelectedItem] = useState<typeof galleryItems[0] | null>(null);

  const filteredItems = galleryItems.filter(
    (item) => activeCategory === "todo" || item.category === activeCategory
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <section className="relative h-[50vh] min-h-[400px] w-full flex flex-col justify-end">
          <div className="absolute inset-0 z-0">
            <img
              src={heroBeachImg}
              alt="Galería RD"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>

          <div className="relative z-10 container mx-auto px-4 lg:px-8 pb-12">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block bg-primary/20 text-primary text-sm font-medium px-4 py-2 rounded-full mb-4"
            >
              GALERÍA MULTIMEDIA
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            >
              RD en Lente
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg max-w-xl"
            >
              Sumérgete en el alma del Caribe. Una colección curada de momentos visuales que capturan la esencia vibrante de nuestra tierra, desde picos nublados hasta profundidades turquesas.
            </motion.p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 bg-card border-y border-border sticky top-16 z-30 backdrop-blur-md bg-card/90">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(category.id)}
                    className="gap-2 rounded-full"
                  >
                    <Icon className="h-4 w-4" />
                    {category.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div 
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]"
            >
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => (
                  <GalleryItem
                    key={item.id}
                    item={item}
                    onClick={() => setSelectedItem(item)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="outline" className="gap-2">
                Cargar más momentos
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Lightbox Dialog */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-5xl p-0 bg-background/95 backdrop-blur-xl border-border">
            {selectedItem && (
              <div className="relative">
                <img
                  src={selectedItem.src}
                  alt={selectedItem.title}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background to-transparent">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="font-display text-2xl font-bold text-foreground">{selectedItem.title}</h3>
                      <p className="text-muted-foreground">{selectedItem.location}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" className="rounded-full">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="rounded-full">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="rounded-full">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Footer />
      </div>
    </PageTransition>
  );
}
