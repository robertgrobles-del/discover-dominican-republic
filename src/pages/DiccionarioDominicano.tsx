import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, Volume2, Heart, BookOpen, Lightbulb, HandshakeIcon, UtensilsCrossed, Bus, PartyPopper, MessageCircle
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";

interface Word {
  id: string;
  word: string;
  pronunciation: string;
  type: string;
  definition: string;
  example: string;
  category: string;
  usage: "común" | "muy común" | "regional";
}

const words: Word[] = [
  {
    id: "vaina",
    word: "Vaina",
    pronunciation: "/vai-na/",
    type: "Sustantivo",
    definition: "La navaja suiza del vocabulario dominicano. Puede significar una 'cosa', un 'problema', una 'situación' o literalmente cualquier objeto cuyo nombre olvidaste.",
    example: "Pásame esa vaina que está en la mesa.",
    category: "Expresiones",
    usage: "muy común",
  },
  {
    id: "klk",
    word: "Klk",
    pronunciation: "/ke-lo-ke/",
    type: "Interjección",
    definition: "Abreviación de '¿Qué lo que?', el saludo más popular entre dominicanos. Equivale a '¿Qué tal?' o '¿Cómo estás?'.",
    example: "¡Klk manito, cómo tú tá!",
    category: "Saludos",
    usage: "muy común",
  },
  {
    id: "concho",
    word: "Concho",
    pronunciation: "/con-cho/",
    type: "Sustantivo",
    definition: "Motocicleta que funciona como taxi informal. Transporte económico y rápido en zonas urbanas.",
    example: "Voy a coger un concho pa' llegar más rápido.",
    category: "Transporte",
    usage: "común",
  },
  {
    id: "chin",
    word: "Chin",
    pronunciation: "/chin/",
    type: "Adverbio",
    definition: "Significa 'un poco' o 'un poquito'. Se usa para indicar una cantidad pequeña de algo.",
    example: "Dame un chin de agua.",
    category: "Expresiones",
    usage: "muy común",
  },
  {
    id: "yala",
    word: "Yala",
    pronunciation: "/ya-la/",
    type: "Interjección",
    definition: "Expresión de aprobación o acuerdo. Equivale a 'OK', 'está bien' o 'de acuerdo'.",
    example: "¿Nos vemos a las 8? —Yala.",
    category: "Expresiones",
    usage: "común",
  },
  {
    id: "colmado",
    word: "Colmado",
    pronunciation: "/col-ma-do/",
    type: "Sustantivo",
    definition: "Pequeña tienda de barrio donde se vende de todo: comida, bebidas, artículos del hogar. El corazón social del vecindario.",
    example: "Voy al colmado a buscar unas frías.",
    category: "Comida",
    usage: "muy común",
  },
  {
    id: "guagua",
    word: "Guagua",
    pronunciation: "/gua-gua/",
    type: "Sustantivo",
    definition: "Autobús público o privado. También se usa para cualquier vehículo de transporte colectivo.",
    example: "La guagua de las 7 siempre llega tarde.",
    category: "Transporte",
    usage: "muy común",
  },
  {
    id: "jevi",
    word: "Jevi",
    pronunciation: "/je-vi/",
    type: "Adjetivo",
    definition: "Del inglés 'heavy'. Significa genial, increíble, impresionante. Algo muy bueno.",
    example: "Esa fiesta estuvo jevi.",
    category: "Fiesta",
    usage: "común",
  },
];

const categories = [
  { id: "todos", label: "Todos", icon: BookOpen },
  { id: "saludos", label: "Saludos", icon: HandshakeIcon },
  { id: "comida", label: "Comida", icon: UtensilsCrossed },
  { id: "transporte", label: "Transporte", icon: Bus },
  { id: "fiesta", label: "Fiesta", icon: PartyPopper },
  { id: "expresiones", label: "Expresiones", icon: MessageCircle },
];

function WordCard({ word }: { word: Word }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card rounded-2xl p-5 border border-border hover:border-primary/30 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display text-2xl font-bold text-foreground">{word.word}</h3>
          <p className="text-primary font-medium text-sm">{word.pronunciation} • {word.type}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Volume2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p className="text-muted-foreground text-sm leading-relaxed mb-3">{word.definition}</p>

      <div className="bg-muted/50 rounded-xl p-3 border-l-4 border-primary mb-3">
        <p className="text-sm italic text-foreground">&quot;{word.example}&quot;</p>
      </div>

      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-xs">{word.category}</Badge>
        <Badge 
          className={`text-xs ${
            word.usage === "muy común" 
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" 
              : "bg-amber-500/10 text-amber-600 border-amber-500/30"
          }`}
        >
          {word.usage}
        </Badge>
      </div>
    </motion.div>
  );
}

export default function DiccionarioDominicano() {
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [search, setSearch] = useState("");

  const filteredWords = words.filter((word) => {
    const matchesCategory = selectedCategory === "todos" || 
      word.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = word.word.toLowerCase().includes(search.toLowerCase()) ||
                          word.definition.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredWord = words[0]; // Palabra del día

  return (
    <PageTransition>
      <SEOHead
        title="Diccionario Dominicano - Habla como un Local"
        description="Aprende las expresiones, jergas y modismos dominicanos. Tu guía definitiva para entender y hablar como un verdadero quisqueyano."
        keywords="diccionario dominicano, jerga dominicana, expresiones RD, vocabulario dominicano, habla dominicana"
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="bg-gradient-to-br from-amber-900/20 via-background to-background py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ 
            backgroundImage: "radial-gradient(hsl(var(--primary)) 1px, transparent 1px)", 
            backgroundSize: "32px 32px" 
          }} />
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <BookOpen className="h-3 w-3 mr-1" />
                Aprende Jergas Locales
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
                Habla como un <span className="text-primary">Dominicano</span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl mb-8">
                Desde 'Vaina' hasta 'Klk'. Tu guía definitiva para entender el tigueraje y moverte como un local en la isla.
              </p>
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Busca una vaina... (ej. Concho, Chin, Yala)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 h-14 text-lg bg-card border-border"
                />
              </div>
            </div>
          </div>
        </section>

        <main className="container mx-auto px-4 lg:px-8 py-10">
          {/* Categories */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Categorías Populares</h3>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? "bg-foreground text-background"
                      : "bg-card border border-border text-foreground hover:border-primary"
                  }`}
                >
                  <cat.icon className="h-4 w-4" />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Word + Tip */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <div className="lg:col-span-2 bg-card rounded-2xl p-6 md:p-8 border border-border relative overflow-hidden">
              <Badge className="absolute top-4 right-4 bg-primary/10 text-primary border-primary/30">
                PALABRA DEL DÍA
              </Badge>
              <div className="space-y-4">
                <div>
                  <h2 className="font-display text-5xl md:text-6xl font-bold text-foreground">{featuredWord.word}</h2>
                  <p className="text-primary font-bold text-lg">{featuredWord.pronunciation} • {featuredWord.type}</p>
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed">{featuredWord.definition}</p>
                <div className="bg-muted/50 rounded-xl p-4 border-l-4 border-primary">
                  <p className="italic text-foreground">&quot;{featuredWord.example}&quot;</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button className="gap-2">
                    <Volume2 className="h-4 w-4" />
                    Escuchar
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500">
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
              <h3 className="text-2xl font-bold mb-2">¿Sabías qué?</h3>
              <p className="opacity-90 leading-relaxed mb-6">
                El español dominicano tiene influencias africanas y taínas que no encontrarás en ningún otro lugar del Caribe.
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-5 w-5 text-amber-300" />
                  <span className="font-bold text-sm uppercase tracking-wider">Tip Pro</span>
                </div>
                <p className="text-sm">Si te dicen &quot;dame luz&quot;, no te piden una lámpara, te están pidiendo información o explicación.</p>
              </div>
            </div>
          </div>

          {/* Word Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                Diccionario Visual
              </h2>
              <select className="bg-transparent border-none text-sm font-bold text-foreground cursor-pointer">
                <option>A-Z</option>
                <option>Más Populares</option>
                <option>Recientes</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWords.map((word) => (
                <WordCard key={word.id} word={word} />
              ))}
            </div>

            {filteredWords.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No se encontraron palabras. ¡Prueba con otra búsqueda!</p>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
