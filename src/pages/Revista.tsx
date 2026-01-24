import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Plane, Utensils, Building, TreePalm, Bookmark, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const categories = [
  { id: "all", label: "Todo", icon: null },
  { id: "aviation", label: "Aviación", icon: Plane },
  { id: "gastronomy", label: "Gastronomía", icon: Utensils },
  { id: "official", label: "MITUR", icon: Building },
  { id: "beach", label: "Playas", icon: TreePalm },
];

const featuredArticle = {
  title: "Las Joyas Ocultas de Samaná",
  description: "Más allá de las ballenas, descubre playas vírgenes, cascadas secretas y sabores inexplorados en el corazón verde del Caribe.",
  image: "https://images.unsplash.com/photo-1580541631950-7282082b53ce?w=1200&h=600&fit=crop",
  category: "Historia desde 1993",
  link: "#"
};

const aviationNews = [
  {
    title: "Aeropuerto de Punta Cana inaugura nueva terminal ecológica",
    description: "Con una inversión millonaria, la nueva terminal pretende reducir la huella de carbono y agilizar el tránsito de pasajeros con tecnología de punta.",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop",
    category: "Infraestructura",
    date: "Hace 4 horas"
  },
  {
    title: "Marriott anuncia expansión con 3 nuevos resorts en el Norte",
    description: "",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop",
    category: "Hotelería",
    date: "Ayer"
  },
  {
    title: "Arajet conecta Santo Domingo con 9 nuevos destinos en Sudamérica",
    description: "",
    image: "https://images.unsplash.com/photo-1569629743817-70d8db6c323b?w=300&h=200&fit=crop",
    category: "Aerolineas",
    date: "Hace 2 días"
  }
];

const gastronomyArticles = [
  {
    title: "La revolución culinaria de Santiago",
    description: "De restaurantes premiados a fondas tradicionales: exploramos el nuevo capítulo gastronómico de la segunda ciudad más importante del país.",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
    author: "Isabella Montalvo",
    role: "Crítica Gastronómica",
    category: "Alta Cocina"
  },
  {
    title: "Ruta del Ron: Los mejores bares de la Zona",
    description: "Descubre los secretos mejor guardados de los cócteles de la capital colonial en esta guía exclusiva de bares y lounges.",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=300&fit=crop",
    category: "Bebidas"
  },
  {
    title: "Del mar a la mesa en Boca Chica",
    description: "Pescado frío, champola y la brisa del mar: así atardecer en uno de los destinos costeros más tradicionales de Santo Domingo.",
    image: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=400&h=300&fit=crop",
    category: "Mariscos"
  }
];

const officialNews = [
  {
    title: "Descubre Republica Dominicana presenta cifras récord en llegada de turistas",
    description: "Las estadísticas muestran un crecimiento del 15% comparado con el año anterior.",
    category: "Comunicado",
    date: "Enero 2024"
  },
  {
    title: "Nuevo plan de ordenamiento territorial en Miches",
    description: "Proteger el entorno natural mientras se fomenta el desarrollo turístico sostenible es el objetivo principal.",
    category: "Sostenibilidad",
    date: "Enero 2024"
  },
  {
    title: "RD será sede de la próxima cumbre de turismo sostenible",
    description: "Líderes mundiales se reunirán para discutir el futuro del turismo responsable.",
    category: "Eventos",
    date: "Enero 2024"
  },
  {
    title: "Inician trabajos de renovación en el Malecón",
    description: "Mejoras en accesibilidad, iluminación y espacios verdes transformarán el icónico paseo marítimo.",
    category: "Infraestructura",
    date: "Enero 2024"
  }
];

const beachArticles = [
  {
    title: "Bahía de las Águilas: El último paraíso virgen",
    description: "Una guía completa para llegar, acampar y disfrutar de las aguas más cristalinas del Caribe.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
    category: "Destinos"
  },
  {
    title: "Salto del Limón",
    image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=300&h=200&fit=crop",
    location: "Samaná"
  },
  {
    title: "Pico Duarte",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&h=200&fit=crop",
    location: "Cordillera Central"
  },
  {
    title: "Top 5 Playas de Puerto Plata",
    image: "https://images.unsplash.com/photo-1509233725247-49e657c54213?w=300&h=200&fit=crop",
    location: "Resumen de Google Viajes"
  }
];

const sponsoredContent = [
  {
    title: "Descubre el lujo sostenible en Miches: Exclusive Resorts",
    description: "Una nueva propuesta hotelera que combina la exclusividad con la naturaleza virgen del este.",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=250&fit=crop"
  },
  {
    title: "Invierte en el Paraíso: Proyecto Vista Cana",
    description: "Apartamentos inteligentes con vistas al campo de golf y acceso directo a playa.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=250&fit=crop",
    logo: "REAL ESTATE"
  },
  {
    title: "Festival Gastronómico de Santo Domingo 2024",
    description: "Reúne a los mejores chefs y celebra la rica gastronomía dominicana.",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=250&fit=crop"
  }
];

export default function Revista() {
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Featured Hero */}
      <section className="relative h-[60vh] min-h-[500px]">
        <div className="absolute inset-0">
          <img
            src={featuredArticle.image}
            alt={featuredArticle.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-8 container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full mb-4">
              {featuredArticle.category}
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              {featuredArticle.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              {featuredArticle.description}
            </p>
            <Button className="gap-2">
              Leer Historia Completa <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="border-b border-border sticky top-16 bg-background z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-sm text-muted-foreground mr-2">Secciones:</span>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className="gap-2 whitespace-nowrap"
              >
                {cat.icon && <cat.icon className="h-4 w-4" />}
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Aviation & Hotels Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-primary" />
              <h2 className="font-display text-2xl font-bold text-foreground">Aviación y Hotelería</h2>
            </div>
            <Button variant="link" className="text-primary gap-1">
              Ver todos <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Main Article */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-xl overflow-hidden border border-border"
            >
              <div className="aspect-video">
                <img src={aviationNews[0].image} alt={aviationNews[0].title} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <span className="text-xs text-primary font-medium">{aviationNews[0].category}</span>
                <h3 className="font-display text-xl font-bold text-foreground mt-2 mb-3">{aviationNews[0].title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{aviationNews[0].description}</p>
                <span className="text-xs text-muted-foreground">{aviationNews[0].date}</span>
              </div>
            </motion.div>

            {/* Secondary Articles */}
            <div className="space-y-4">
              {aviationNews.slice(1).map((article, i) => (
                <motion.div
                  key={article.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-4 bg-card rounded-xl p-4 border border-border"
                >
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-primary font-medium">{article.category}</span>
                    <h4 className="font-medium text-foreground mt-1 line-clamp-2">{article.title}</h4>
                    <span className="text-xs text-muted-foreground mt-2 block">{article.date}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Gastronomy Section */}
        <section className="py-12 -mx-4 px-4 bg-card/50">
          <div className="container mx-auto">
            <div className="text-center mb-10">
              <span className="text-primary text-sm italic">Sabores del Caribe</span>
              <h2 className="font-display text-3xl font-bold text-foreground mt-2">Gastronomía & Placer</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {gastronomyArticles.map((article, i) => (
                <motion.div
                  key={article.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4">
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                  </div>
                  <span className="text-xs text-primary font-medium">{article.category}</span>
                  <h3 className="font-display font-bold text-foreground mt-1 mb-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{article.description}</p>
                  {article.author && (
                    <div className="flex items-center gap-2 mt-4">
                      <div className="w-8 h-8 rounded-full bg-surface" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{article.author}</p>
                        <p className="text-xs text-muted-foreground">{article.role}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Button className="gap-2">
                Explorar más Gastronomía <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Official News */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs text-muted-foreground">BOLETÍN OFICIAL</span>
              <h2 className="font-display text-xl font-bold text-foreground">Noticias Oficiales</h2>
            </div>
            <Button variant="link" className="text-primary">Archivo 2024 →</Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {officialNews.map((news, i) => (
              <motion.div
                key={news.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl p-5 border border-border hover:border-primary/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-muted-foreground">{news.date}</span>
                  <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">{news.category}</span>
                </div>
                <h4 className="font-medium text-foreground mb-2 line-clamp-2">{news.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">{news.description}</p>
                <Button variant="link" className="px-0 mt-3 text-primary text-sm">
                  Leer comunicado →
                </Button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Beaches & Ecoturism */}
        <section>
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-foreground">Playas y Ecoturismo</h2>
            <p className="text-muted-foreground mt-2">Explora la belleza natural de la isla a través de nuestro lente.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Main Beach Article */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 md:row-span-2 relative rounded-xl overflow-hidden group cursor-pointer"
            >
              <img 
                src={beachArticles[0].image} 
                alt={beachArticles[0].title} 
                className="w-full h-full object-cover min-h-[400px] transition-transform duration-500 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="text-xs text-primary font-medium">{beachArticles[0].category}</span>
                <h3 className="font-display text-2xl font-bold text-foreground mt-2 mb-2">{beachArticles[0].title}</h3>
                <p className="text-sm text-muted-foreground">{beachArticles[0].description}</p>
                <Button variant="link" className="px-0 mt-3 text-primary">Leer artículo →</Button>
              </div>
            </motion.div>

            {/* Secondary Beach Cards */}
            {beachArticles.slice(1).map((article, i) => (
              <motion.div
                key={article.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative rounded-xl overflow-hidden aspect-[4/3] group cursor-pointer"
              >
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded-full">{article.location}</span>
                  <h4 className="font-medium text-foreground mt-2">{article.title}</h4>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" className="gap-2">
              Ver galería completa <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </section>

        {/* Sponsored Content */}
        <section className="border-t border-border pt-12">
          <p className="text-xs text-muted-foreground text-center mb-6">CONTENIDO PATROCINADO</p>
          <div className="grid md:grid-cols-3 gap-6">
            {sponsoredContent.map((content, i) => (
              <motion.div
                key={content.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl overflow-hidden border border-border"
              >
                <div className="aspect-video relative">
                  <img src={content.image} alt={content.title} className="w-full h-full object-cover" />
                  {content.logo && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-background/80 backdrop-blur-sm rounded text-xs font-bold">
                      {content.logo}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h4 className="font-medium text-foreground mb-2">{content.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{content.description}</p>
                  <Button variant="link" className="px-0 text-primary text-sm gap-1">
                    Conocer más <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}