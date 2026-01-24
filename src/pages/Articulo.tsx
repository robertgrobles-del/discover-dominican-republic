import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { 
  User, Calendar, Clock, Bookmark, Share2, ThumbsUp,
  Play, ChevronRight, MessageCircle
} from "lucide-react";
import samanaImg from "@/assets/samana.jpg";
import whaleSamanaImg from "@/assets/whale-samana.jpg";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import gastronomiImg from "@/assets/gastronomy.jpg";
import adventureImg from "@/assets/adventure.jpg";

const relatedArticles = [
  {
    id: 1,
    category: "LUXURY",
    title: "Top 5 Resorts en Punta Cana para 2024",
    description: "Experimenta hospitalidad de clase mundial y playas prístinas en el extremo de la isla.",
    image: puntaCanaImg,
  },
  {
    id: 2,
    category: "CULTURE",
    title: "Un Paseo por el Tiempo: Zona Colonial de Santo Domingo",
    description: "Descubre la primera ciudad de las Américas, llena de historia, arte y noches vibrantes.",
    image: santoDomingoImg,
  },
  {
    id: 3,
    category: "ADVENTURE",
    title: "Por Qué Cabarete es la Capital de Deportes Acuáticos",
    description: "Desde kiteboarding hasta windsurf, descubre por qué los aventureros acuden a esta ciudad norteña.",
    image: adventureImg,
  },
];

const tags = ["#DominicanRepublic", "#Ecotourism", "#Samana", "#TravelGuide"];

export default function Articulo() {
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});
  const [comment, setComment] = useState("");
  const [readProgress, setReadProgress] = useState(0);

  const handleImageLoad = (id: string) => {
    setImagesLoaded(prev => ({ ...prev, [id]: true }));
  };

  // Simulate reading progress
  const handleScroll = () => {
    const scrolled = window.scrollY;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    setReadProgress(Math.min((scrolled / height) * 100, 100));
  };

  useState(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Reading Progress Bar */}
      <div className="fixed top-16 left-0 right-0 h-1 bg-border z-40">
        <div 
          className="h-full bg-primary transition-all duration-150"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative pt-20">
        <div className="aspect-[21/9] relative overflow-hidden">
          {!imagesLoaded['hero'] && (
            <Skeleton className="absolute inset-0" />
          )}
          <img
            src={samanaImg}
            alt="Samaná"
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              imagesLoaded['hero'] ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => handleImageLoad('hero')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative -mt-32 md:-mt-48">
          <div className="max-w-3xl mx-auto text-center">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block text-primary text-sm font-medium tracking-wider mb-4"
            >
              DIARIO DE VIAJES
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              Descubriendo Samaná:<br />
              La Joya Escondida del Caribe
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Por María González
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Octubre 24, 2023
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                5 min de lectura
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Sidebar - Social Actions */}
            <aside className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <button className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary transition-colors">
                  <ThumbsUp className="h-5 w-5" />
                </button>
                <button className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary transition-colors">
                  <Bookmark className="h-5 w-5" />
                </button>
                <button className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
                
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center mb-1">Progreso</p>
                  <div className="w-full bg-border rounded-full h-20 relative overflow-hidden">
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-primary transition-all duration-150"
                      style={{ height: `${readProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-1">{Math.round(readProgress)}%</p>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <article className="lg:col-span-7 prose prose-invert max-w-none">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-xl leading-relaxed first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3">
                  El viaje a la cascada El Limón no comienza con el sonido del agua, sino con el 
                  trote rítmico de los caballos y el aroma de la tierra húmeda. En lo profundo de 
                  la Península de Samaná, alejada de los resorts todo-incluido, se encuentra una 
                  República Dominicana que parece intocada por el tiempo.
                </p>

                <p>
                  Mientras navegábamos por los senderos serpenteantes, el dosel sobre nosotros 
                  filtraba la intensa luz del sol caribeño en suaves haces moteados. El aire aquí 
                  es diferente—más denso, más dulce, cargado con la fragancia de orquídeas 
                  silvestres y vainas de cacao madurando. Nuestro guía, Pedro, señalaba plantas 
                  medicinales utilizadas por los locales durante generaciones, convirtiendo una 
                  simple caminata en una lección de botánica.
                </p>

                <blockquote className="border-l-4 border-primary pl-6 my-8 italic text-xl">
                  "El agua no era solo azul; era un color vivo que no parecía real hasta que 
                  lo tocabas, fresco y vigorizante contra el aire húmedo."
                  <footer className="text-sm text-muted-foreground mt-2 not-italic">
                    DIARIO DE VIAJE, DÍA 2
                  </footer>
                </blockquote>

                <p>
                  Emergiendo del denso bosque, el rugido de la cascada finalmente te saluda. 
                  Salto El Limón se precipita 52 metros hacia una piscina natural que invita 
                  a los excursionistas cansados. No es solo una vista; es una experiencia que 
                  demanda participación. Nos despojamos hasta nuestros trajes de baño y nos 
                  adentramos, sintiendo el shock del agua fría de montaña proporcionar alivio instantáneo.
                </p>

                {/* Image Gallery */}
                <div className="grid grid-cols-2 gap-4 my-8 not-prose">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden">
                    <img
                      src={whaleSamanaImg}
                      alt="Ballenas en Samaná"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="aspect-[4/3] rounded-xl overflow-hidden">
                    <img
                      src={samanaImg}
                      alt="Paisaje de Samaná"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="col-span-2 text-sm text-muted-foreground text-center italic">
                    Samaná ofrece una variedad de cascadas, fish fry a orillas del camino, atardeceres de ensueño y delicias culinarias.
                  </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Un Sabor de la Costa</h2>

                <p>
                  Ningún viaje a Samaná está completo sin probar la cocina local. Nos detuvimos 
                  en un pequeño comedor junto a la carretera donde el aroma de arroz con coco y 
                  pescado frito llenaba el aire. Este es el corazón del sabor dominicano—ingredientes 
                  simples, preparados con experticia con amor y tradición. El Pescado con Coco 
                  (pescado en salsa de coco) es una especialidad regional que refleja la abundancia 
                  de las palmeras circundantes.
                </p>

                {/* Video Section */}
                <div className="my-8 not-prose">
                  <div className="aspect-video rounded-2xl overflow-hidden relative group cursor-pointer">
                    <img
                      src={whaleSamanaImg}
                      alt="Video preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-background/40 flex items-center justify-center group-hover:bg-background/30 transition-colors">
                      <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center">
                        <Play className="h-8 w-8 text-primary-foreground ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="font-bold">Mira: Las Ballenas de Samaná</h3>
                      <p className="text-sm opacity-80">Duración: 2:45</p>
                    </div>
                  </div>
                </div>

                <p>
                  Mientras el sol comenzaba a descender bajo el horizonte, pintando el cielo en 
                  tonos de violeta y mandarina, me di cuenta de que Samaná no es solo un destino; 
                  es un sentimiento. Es la sensación de ser pequeño en presencia de la naturaleza, 
                  de conectar con un ritmo de vida que late más lento, más profundo y más verdadero.
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-8 not-prose">
                  {tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-3 py-1 bg-secondary text-sm rounded-full text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            </article>

            {/* Right Sidebar */}
            <aside className="lg:col-span-4">
              <div className="sticky top-24 space-y-8">
                {/* Author Card */}
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold">María González</h3>
                      <p className="text-sm text-primary">Editora de Viajes</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Apasionada por descubrir los rincones menos conocidos del Caribe. 
                    10 años explorando y escribiendo sobre la República Dominicana.
                  </p>
                </div>

                {/* Newsletter */}
                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
                  <h3 className="font-bold mb-2">Suscríbete al Boletín</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Recibe las mejores historias de viaje directamente en tu correo.
                  </p>
                  <Button className="w-full">Suscribirse</Button>
                </div>
              </div>
            </aside>
          </div>

          {/* Related Articles */}
          <section className="mt-20 pt-12 border-t border-border">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">También te puede interesar</h2>
              <Link to="/revista" className="text-sm text-muted-foreground hover:text-primary underline">
                Ver todas las historias
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {relatedArticles.map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4 relative">
                    {!imagesLoaded[`related-${article.id}`] && (
                      <Skeleton className="absolute inset-0" />
                    )}
                    <img
                      src={article.image}
                      alt={article.title}
                      className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                        imagesLoaded[`related-${article.id}`] ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={() => handleImageLoad(`related-${article.id}`)}
                    />
                    <span className="absolute top-3 left-3 px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded">
                      {article.category}
                    </span>
                  </div>
                  <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {article.description}
                  </p>
                </motion.article>
              ))}
            </div>
          </section>

          {/* Comments Section */}
          <section className="mt-20 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Únete a la Conversación</h2>
            
            <Textarea
              placeholder="Comparte tus pensamientos o haz una pregunta..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[120px] mb-4"
            />
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Por favor sé respetuoso y sigue nuestras guías.
              </p>
              <Button className="gap-2">
                Publicar Comentario
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}