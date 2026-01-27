import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Languages,
  Volume2,
  BookOpen,
  MessageCircle,
  Play,
  ChevronRight,
  Check,
  Star,
  Trophy,
} from "lucide-react";
import { useState } from "react";

const levels = [
  { name: "Básico", lessons: 12, completed: 8, color: "bg-green-500" },
  { name: "Intermedio", lessons: 15, completed: 3, color: "bg-amber-500" },
  { name: "Avanzado", lessons: 10, completed: 0, color: "bg-red-500" },
];

const categories = [
  { name: "Restaurantes", icon: "🍽️", phrases: 24 },
  { name: "Transporte", icon: "🚕", phrases: 18 },
  { name: "Compras", icon: "🛍️", phrases: 22 },
  { name: "Emergencias", icon: "🏥", phrases: 15 },
  { name: "Hotel", icon: "🏨", phrases: 20 },
  { name: "Playa", icon: "🏖️", phrases: 16 },
];

const featuredPhrases = [
  {
    spanish: "¿Cuánto cuesta esto?",
    pronunciation: "KWAN-toh KWES-tah ES-toh",
    english: "How much is this?",
    context: "Compras",
  },
  {
    spanish: "La cuenta, por favor",
    pronunciation: "lah KWEN-tah, por fah-VOR",
    english: "The check, please",
    context: "Restaurante",
  },
  {
    spanish: "¿Dónde está la playa?",
    pronunciation: "DON-deh es-TAH lah PLAH-yah",
    english: "Where is the beach?",
    context: "Direcciones",
  },
  {
    spanish: "Está muy bueno",
    pronunciation: "es-TAH mooy BWEH-noh",
    english: "It's very good",
    context: "Cumplidos",
  },
];

const dominicanSlang = [
  { word: "¡Qué lo que!", meaning: "¿Qué tal? / What's up?" },
  { word: "Bacano", meaning: "Cool / Awesome" },
  { word: "Tato", meaning: "De acuerdo / Okay, got it" },
  { word: "Vaina", meaning: "Cosa / Thing (muy versátil)" },
  { word: "Chiviarse", meaning: "Avergonzarse / To be embarrassed" },
  { word: "Guapo/a", meaning: "Enojado/a (no atractivo) / Angry" },
];

export default function EspanolViajero() {
  const [playingPhrase, setPlayingPhrase] = useState<string | null>(null);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-900/90 via-blue-900/80 to-indigo-900/90" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1920')] bg-cover bg-center opacity-20" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <Badge className="mb-4 bg-sky-500/20 text-sky-200 border-sky-400/30">
                <Languages className="h-3 w-3 mr-1" />
                APRENDE ESPAÑOL
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
                Español para el <span className="text-sky-400">Viajero</span>
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Aprende frases esenciales, jerga dominicana y expresiones locales 
                para comunicarte mejor durante tu viaje.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="gap-2 bg-white text-sky-900 hover:bg-white/90">
                  <BookOpen className="h-4 w-4" />
                  Comenzar Curso
                </Button>
                <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                  Frases Rápidas
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Progress */}
        <section className="py-12 bg-card border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-wrap justify-center gap-6">
              {levels.map((level) => (
                <div key={level.name} className="flex items-center gap-4 bg-surface rounded-full px-6 py-3">
                  <div className={`w-3 h-3 rounded-full ${level.color}`} />
                  <div>
                    <p className="font-medium text-foreground">{level.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {level.completed}/{level.lessons} lecciones
                    </p>
                  </div>
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${level.color}`} 
                      style={{ width: `${(level.completed / level.lessons) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Aprende por <span className="text-gradient">Situación</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Frases organizadas por contexto para que encuentres lo que necesitas rápidamente.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat, index) => (
                <motion.button
                  key={cat.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex flex-col items-center gap-3 p-6 bg-card rounded-2xl border border-border hover:border-primary/50 transition-all group"
                >
                  <span className="text-4xl">{cat.icon}</span>
                  <div className="text-center">
                    <p className="font-medium text-foreground">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.phrases} frases</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Phrases */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Frases <span className="text-gradient">Esenciales</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {featuredPhrases.map((phrase, index) => (
                <motion.div
                  key={phrase.spanish}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-surface rounded-2xl p-6 border border-border"
                >
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="outline">{phrase.context}</Badge>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setPlayingPhrase(phrase.spanish)}
                      className="text-primary hover:text-primary/80"
                    >
                      <Volume2 className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-2">{phrase.spanish}</p>
                  <p className="text-sm text-primary font-mono mb-2">/{phrase.pronunciation}/</p>
                  <p className="text-muted-foreground">{phrase.english}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Dominican Slang */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Jerga <span className="text-gradient">Dominicana</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Expresiones locales que escucharás en la calle. ¡Sorprende a los locales!
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {dominicanSlang.map((slang, index) => (
                <motion.div
                  key={slang.word}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl p-5 border border-border hover:border-primary/50 transition-all"
                >
                  <p className="text-xl font-bold text-primary mb-2">{slang.word}</p>
                  <p className="text-muted-foreground">{slang.meaning}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Practice */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-gradient-to-r from-sky-900 to-blue-900 rounded-3xl p-8 md:p-12 text-center">
                <MessageCircle className="h-16 w-16 text-sky-300 mx-auto mb-6" />
                <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                  Practica con el Chatbot
                </h2>
                <p className="text-white/80 mb-8">
                  Conversa con nuestro asistente de IA para practicar tu español 
                  en situaciones reales de viaje.
                </p>
                <Button size="lg" className="gap-2 bg-white text-sky-900 hover:bg-white/90">
                  <Play className="h-4 w-4" />
                  Iniciar Práctica
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Achievements */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Tus <span className="text-gradient">Logros</span>
              </h2>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-4 bg-card rounded-full px-6 py-4 border border-border">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Primera Lección</p>
                  <p className="text-xs text-muted-foreground">Completada</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-card rounded-full px-6 py-4 border border-border opacity-50">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Star className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Nivel Básico</p>
                  <p className="text-xs text-muted-foreground">4 lecciones restantes</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-card rounded-full px-6 py-4 border border-border opacity-50">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Conversador</p>
                  <p className="text-xs text-muted-foreground">10 prácticas</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
