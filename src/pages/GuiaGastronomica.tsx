import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, MapPin, Star, Heart, Eye, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BetweenSectionsAd } from "@/components/ads";

const priceRanges = ["$", "$$", "$$$", "$$$$"];

const cuisineTypes = [
  { id: "criolla", label: "Criolla Dominicana", checked: true },
  { id: "mariscos", label: "Mariscos", checked: false },
  { id: "italiana", label: "Italiana", checked: false },
  { id: "asian", label: "Fusión Asiática", checked: false },
];

const popularTags = [
  "Pet Friendly", "Romántico", "Vista al Mar", "Música en Vivo", "Rooftop", "Desayuno"
];

const restaurants = [
  {
    id: 1,
    slug: "pat-e-palo",
    name: "Pat'e Palo European Brasserie",
    rating: 4.8,
    priceRange: "$$$",
    location: "Zona Colonial",
    cuisine: "Europea",
    tags: ["Romántico", "Terraza"],
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop"
  },
  {
    id: 2,
    slug: "meson-de-bari",
    name: "Mesón de Bari",
    rating: 4.5,
    priceRange: "$$",
    location: "Zona Colonial",
    cuisine: "Criolla",
    tags: ["Familiar", "Tradicional"],
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop"
  },
  {
    id: 3,
    slug: "jellyfish-punta-cana",
    name: "Jellyfish Restaurant",
    rating: 4.9,
    priceRange: "$$$$",
    location: "Punta Cana",
    cuisine: "Mediterránea",
    tags: ["Vista al Mar", "Elegante"],
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop"
  },
  {
    id: 4,
    slug: "bliss",
    name: "Bliss Restaurant",
    rating: 4.7,
    priceRange: "$$",
    location: "Cabarete",
    cuisine: "Saludable",
    tags: ["Vegano", "Casual"],
    image: "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=400&h=300&fit=crop"
  }
];

export default function GuiaGastronomica() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("$$");
  const [selectedTag, setSelectedTag] = useState("Romántico");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&h=400&fit=crop"
            alt="Gastronomía RD"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/50" />
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground italic mb-4">
              Explora los sabores de la isla
            </h1>
            <p className="text-muted-foreground mb-8">
              Desde puestos callejeros hasta estrellas Michelin en el Caribe.
            </p>

            {/* Search Bar */}
            <div className="flex gap-2 max-w-xl mx-auto bg-card/80 backdrop-blur-md p-2 rounded-xl border border-border">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, plato o chef..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-transparent border-0 focus-visible:ring-0"
                />
              </div>
              <Button>Buscar</Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Inicio</span>
          <span>/</span>
          <span className="text-foreground">Dónde Comer</span>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-foreground">Filtros</h3>
                <Button variant="link" className="text-primary text-sm p-0">Limpiar todo</Button>
              </div>

              <Accordion type="multiple" defaultValue={["provincia", "cocina", "precio"]} className="space-y-4">
                {/* Province Filter */}
                <AccordionItem value="provincia" className="border-0">
                  <AccordionTrigger className="bg-surface rounded-lg px-4 py-3 hover:no-underline">
                    Provincia / Ciudad
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <Select defaultValue="santo-domingo">
                      <SelectTrigger className="bg-transparent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="santo-domingo">Santo Domingo</SelectItem>
                        <SelectItem value="punta-cana">Punta Cana</SelectItem>
                        <SelectItem value="santiago">Santiago</SelectItem>
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>

                {/* Cuisine Type Filter */}
                <AccordionItem value="cocina" className="border-0">
                  <AccordionTrigger className="bg-surface rounded-lg px-4 py-3 hover:no-underline">
                    Tipo de Cocina
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-3">
                    {cuisineTypes.map((type) => (
                      <div key={type.id} className="flex items-center gap-2">
                        <Checkbox id={type.id} defaultChecked={type.checked} />
                        <label htmlFor={type.id} className="text-sm text-muted-foreground">{type.label}</label>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                {/* Price Filter */}
                <AccordionItem value="precio" className="border-0">
                  <AccordionTrigger className="bg-surface rounded-lg px-4 py-3 hover:no-underline">
                    Precio
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="flex gap-2">
                      {priceRanges.map((price) => (
                        <Button
                          key={price}
                          variant={selectedPrice === price ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedPrice(price)}
                        >
                          {price}
                        </Button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Popular Tags */}
              <div className="mt-6">
                <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase">Etiquetas Populares</h4>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTag === tag ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                      onClick={() => setSelectedTag(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Restaurant Grid */}
          <div className="lg:col-span-8">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-2xl font-bold text-foreground">124</span>
                <span className="text-muted-foreground ml-2">Restaurantes</span>
                <p className="text-sm text-muted-foreground">Mostrando resultados en Santo Domingo</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Ordenar por:</span>
                <Select defaultValue="recomendados">
                  <SelectTrigger className="w-[160px] bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recomendados">Recomendados</SelectItem>
                    <SelectItem value="rating">Mayor Rating</SelectItem>
                    <SelectItem value="precio-asc">Precio: Menor a Mayor</SelectItem>
                    <SelectItem value="precio-desc">Precio: Mayor a Menor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Restaurant Cards Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {restaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link 
                    to={`/restaurante/${restaurant.slug}`}
                    className="block bg-card rounded-xl overflow-hidden border border-border group hover:border-primary/50 transition-colors"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img 
                        src={restaurant.image} 
                        alt={restaurant.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-3 left-3 bg-background/50 backdrop-blur-sm hover:bg-background/80"
                        onClick={(e) => e.preventDefault()}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-medium">{restaurant.rating}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {restaurant.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <span>{restaurant.priceRange}</span>
                        <span>•</span>
                        <span>{restaurant.location}</span>
                        <span>•</span>
                        <span>{restaurant.cuisine}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {restaurant.tags.map((tag) => (
                          <span key={tag} className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">Reservar</Button>
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ad before footer */}
      <BetweenSectionsAd showDemo />

      <Footer />
    </div>
  );
}