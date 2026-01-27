import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Headphones,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Clock,
  Calendar,
  ChevronRight,
  Heart,
  Share2,
  Download,
} from "lucide-react";
import { useState } from "react";

const featuredEpisode = {
  title: "Los secretos del merengue",
  description: "Un viaje sonoro por la historia del ritmo que define a República Dominicana, desde sus raíces africanas hasta su reconocimiento como Patrimonio de la Humanidad.",
  duration: "45:20",
  date: "15 Ene 2026",
  image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600",
  listens: "12.5K",
};

const episodes = [
  {
    id: 1,
    title: "Café de las montañas",
    series: "Sabores Dominicanos",
    duration: "32:15",
    date: "10 Ene 2026",
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=200",
  },
  {
    id: 2,
    title: "Las ballenas de Samaná",
    series: "Naturaleza RD",
    duration: "28:40",
    date: "5 Ene 2026",
    image: "https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=200",
  },
  {
    id: 3,
    title: "Leyendas taínas",
    series: "Historia Viva",
    duration: "38:55",
    date: "1 Ene 2026",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200",
  },
  {
    id: 4,
    title: "La vida en el Malecón",
    series: "Gente de RD",
    duration: "41:10",
    date: "28 Dic 2025",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=200",
  },
];

const series = [
  { name: "Sabores Dominicanos", episodes: 24, color: "bg-orange-500" },
  { name: "Naturaleza RD", episodes: 18, color: "bg-green-500" },
  { name: "Historia Viva", episodes: 32, color: "bg-purple-500" },
  { name: "Gente de RD", episodes: 45, color: "bg-blue-500" },
];

export default function PodcastRD() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/90 via-teal-900/80 to-slate-900/90" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1920')] bg-cover bg-center opacity-20" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <Badge className="mb-4 bg-cyan-500/20 text-cyan-200 border-cyan-400/30">
                <Headphones className="h-3 w-3 mr-1" />
                PODCAST TURÍSTICO
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
                Podcast RD: <span className="text-cyan-400">Relatos de la Isla</span>
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Historias, sonidos y secretos de República Dominicana. 
                Escucha mientras viajas o prepárate para tu próxima aventura.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Featured Episode with Player */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-3xl overflow-hidden border border-border"
            >
              <div className="grid md:grid-cols-2">
                <div className="aspect-square md:aspect-auto relative">
                  <img
                    src={featuredEpisode.image}
                    alt={featuredEpisode.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <Badge className="w-fit mb-4" variant="outline">Episodio Destacado</Badge>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {featuredEpisode.title}
                  </h2>
                  <p className="text-muted-foreground mb-6">{featuredEpisode.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {featuredEpisode.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {featuredEpisode.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Headphones className="h-4 w-4" />
                      {featuredEpisode.listens}
                    </span>
                  </div>

                  {/* Audio Player */}
                  <div className="bg-muted/50 rounded-2xl p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                        <SkipBack className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-14 h-14 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                      >
                        {isPlaying ? (
                          <Pause className="h-6 w-6 text-primary-foreground" />
                        ) : (
                          <Play className="h-6 w-6 text-primary-foreground ml-1" />
                        )}
                      </button>
                      <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                        <SkipForward className="h-4 w-4" />
                      </button>
                      <div className="flex-1">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-1/3 bg-primary rounded-full" />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>15:45</span>
                          <span>{featuredEpisode.duration}</span>
                        </div>
                      </div>
                      <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Heart className="h-4 w-4" />
                          Favorito
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Share2 className="h-4 w-4" />
                          Compartir
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Download className="h-4 w-4" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Series */}
        <section className="py-12 bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {series.map((s) => (
                <button
                  key={s.name}
                  className="flex items-center gap-3 bg-surface rounded-full px-5 py-3 border border-border hover:border-primary/50 transition-all shrink-0"
                >
                  <div className={`w-3 h-3 rounded-full ${s.color}`} />
                  <span className="font-medium text-foreground">{s.name}</span>
                  <Badge variant="secondary">{s.episodes}</Badge>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Episodes List */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-end justify-between mb-12"
            >
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                  Episodios <span className="text-gradient">Recientes</span>
                </h2>
              </div>
              <Button variant="outline" className="hidden md:flex gap-2">
                Ver todos
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>

            <div className="space-y-4">
              {episodes.map((episode, index) => (
                <motion.div
                  key={episode.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 bg-card rounded-2xl p-4 border border-border hover:border-primary/50 transition-all group cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden relative shrink-0">
                    <img
                      src={episode.image}
                      alt={episode.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-primary font-medium mb-1">{episode.series}</p>
                    <h3 className="font-display font-bold text-foreground truncate">{episode.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {episode.duration}
                      </span>
                      <span>{episode.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" className="gap-1">
                      <Play className="h-3 w-3" />
                      Escuchar
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Subscribe CTA */}
        <section className="py-20 bg-gradient-to-r from-cyan-900 to-teal-900">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Headphones className="h-16 w-16 text-cyan-300 mx-auto mb-6" />
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                Suscríbete al Podcast
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Nuevos episodios cada semana. Disponible en todas las plataformas.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="gap-2 bg-white text-cyan-900 hover:bg-white/90">
                  Spotify
                </Button>
                <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                  Apple Podcasts
                </Button>
                <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                  Google Podcasts
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
