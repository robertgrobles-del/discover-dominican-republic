import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ChevronRight, Play, Music, Heart, MapPin, Calendar, Landmark, 
  BookOpen, Palette, Sparkles, Globe, Drumstick, Radio, Share2, Compass, CheckCircle2, Ticket
} from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { BetweenSectionsAd, CompactInlineAd } from "@/components/promo";
import { useTranslation } from "@/hooks/useI18n";
import { toast } from "sonner";

import laBanderaImg from "@/assets/la-bandera.jpg";
import merengueImg from "@/assets/merengue-dance.jpg";
import carnivalImg from "@/assets/carnival.jpg";
import historyImg from "@/assets/history.jpg";
import gastronomyImg from "@/assets/gastronomy.jpg";
import colonialDoorImg from "@/assets/colonial-door.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";

const culturalCategories = [
  { id: "all", label: "Todo el Patrimonio", icon: "🇩🇴" },
  { id: "unesco", label: "Patrimonio UNESCO", icon: "🏛️" },
  { id: "music", label: "Merengue & Bachata", icon: "🎵" },
  { id: "festivals", label: "Carnavales & Fiestas", icon: "🎭" },
  { id: "gastronomy", label: "Sabor Criollo", icon: "🍽️" },
  { id: "history", label: "500 Años de Historia", icon: "📜" },
];

const festivals = [
  {
    name: "Carnaval Vegano",
    monthKey: "Febrero (Todos los Domingos)",
    location: "La Vega, RD",
    category: "Carnaval & Tradición",
    description: "La celebración folklórica más vibrante y antigua de América, con los famosos Diablos Cojuelos, disfraces de vejiga y conciertos multitudinarios.",
    image: carnivalImg,
    badge: "Fiesta Nacional"
  },
  {
    name: "Festival del Merengue & Ritmos Caribeños",
    monthKey: "Julio / Agosto",
    location: "Malecón de Santo Domingo",
    category: "Música en Vivo",
    description: "Una semana dedicada a nuestro ritmo Patrimonio Inmaterial de la Humanidad, con orquestas legendarias en vivo y pistas de baile abiertas.",
    image: merengueImg,
    badge: "UNESCO"
  },
  {
    name: "Peregrinación de la Virgen de la Altagracia",
    monthKey: "21 de Enero",
    location: "Basílica Catedral de Higüey",
    category: "Fervor Religioso",
    description: "La mayor manifestación de fe mariana y devoción popular de la isla, reuniendo a más de medio millón de peregrinos y promeseros.",
    image: historyImg,
    badge: "Santuario Nacional"
  },
];

const unescoTreasures = [
  {
    title: "Ciudad Colonial de Santo Domingo",
    year: "Inscrito 1990",
    category: "Patrimonio Mundial Material",
    desc: "Primera ciudad fundada por europeos en el continente americano. Alberga la primera catedral, el primer hospital y la primera corte real.",
    image: colonialDoorImg,
    link: "/destino/santo-domingo"
  },
  {
    title: "El Merengue Dominicano",
    year: "Inscrito 2016",
    category: "Patrimonio Cultural Inmaterial",
    desc: "Ritmo y baile insignia nacido de la fusión de la güira taína, la tambora africana y el acordeón europeo.",
    image: merengueImg,
    link: "/cultura#musica"
  },
  {
    title: "La Bachata Dominicana",
    year: "Inscrito 2019",
    category: "Patrimonio Cultural Inmaterial",
    desc: "Poesía popular y guitarra amargada que conquistó los escenarios del mundo, desde los barrios populares hasta los teatros globales.",
    image: gastronomyImg,
    link: "/cultura#musica"
  },
  {
    title: "El Teatro Danzante Cocolo (Los Guloyas)",
    year: "Inscrito 2005",
    category: "Obra Maestra del Patrimonio Oral",
    desc: "Danza dramática y máscaras de plumas de pavo real en San Pedro de Macorís, traída por los inmigrantes afrocaribeños de las Antillas Menores.",
    image: carnivalImg,
    link: "/cultura#folclore"
  }
];

export default function Cultura() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("all");
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  const togglePlayMusic = () => {
    setIsPlayingMusic(!isPlayingMusic);
    toast.info(isPlayingMusic ? "Música en pausa" : "Reproduciendo: 'Compadre Pedro Juan' - Clásicos del Merengue Dominicano 🎵");
  };

  return (
    <PageTransition>
      <SEOHead
        title="Cultura, Tradiciones y Ritmos de República Dominicana | Descubre RD"
        description="Explora 500 años de patrimonio: la Ciudad Colonial UNESCO, el Merengue, la Bachata, el Carnaval Vegano y la auténtica gastronomía criolla."
        keywords="cultura dominicana, merengue unesco, bachata dominicana, carnaval vegano, zona colonial historia, gastronomia criolla rd"
      />
      <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-amber-500 selection:text-white">
        <Header />

        {/* HERO EDITORIAL CULTURA */}
        <section className="relative h-[65vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={merengueImg}
              alt="Cultura, Danza y Tradiciones Dominicanas"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-black/60" />
          </div>

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 text-xs font-mono uppercase tracking-widest px-4 py-1.5 mb-4 backdrop-blur-md">
                🇩🇴 ALMA Y CORAZÓN DEL CARIBE
              </Badge>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black mb-4 tracking-tight">
                Cultura & <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">Tradición Dominicana</span>
              </h1>

              <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 font-light leading-relaxed">
                500 años de historia viva donde confluyen la herencia taína, el pulso africano y el legado hispánico en una explosión de música, arte y hospitalidad.
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-6 py-5 rounded-xl shadow-lg shadow-amber-600/25">
                  <Link to="/patrimonio">
                    <Landmark className="h-4 w-4 mr-2" /> Explorar Monumentos UNESCO
                  </Link>
                </Button>
                <Button 
                  onClick={togglePlayMusic}
                  variant="outline" 
                  className="gap-2 rounded-xl border-border bg-card/60 backdrop-blur-md px-6 py-5"
                >
                  <Play className={`h-4 w-4 ${isPlayingMusic ? "text-amber-500 animate-pulse" : ""}`} />
                  {isPlayingMusic ? "Pausar Ritmos RD" : "Escuchar Playlist Dominicana"}
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* NAVEGACIÓN TEMÁTICA */}
        <section className="bg-background/95 backdrop-blur-md border-b border-border py-3">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto no-scrollbar py-1">
              {culturalCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    activeCategory === cat.id
                      ? "bg-amber-600 text-white shadow-md shadow-amber-600/20 scale-105"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* STATS CULTURALES */}
        <section className="py-8 bg-card border-b border-border">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "1492", label: "Cuna de América", icon: "📜" },
                { value: "4", label: "Patrimonios UNESCO", icon: "🏛️" },
                { value: "100+", label: "Fiestas Patronales y Carnavales", icon: "🎭" },
                { value: "2", label: "Géneros Musicales Mundiales", icon: "🎵" },
              ].map((stat, i) => (
                <div key={i} className="text-center p-3">
                  <span className="text-2xl mb-1 block">{stat.icon}</span>
                  <p className="text-2xl sm:text-3xl font-black text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESOROS UNESCO DE LA HUMANIDAD (BENTO GRID) */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <Badge className="bg-amber-500/20 text-amber-500 mb-2">RECONOCIMIENTO INTERNACIONAL</Badge>
              <h2 className="font-display text-3xl sm:text-4xl font-black">
                Patrimonio de la Humanidad UNESCO
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Bienes materiales e inmateriales que la República Dominicana le ha regalado al mundo entero.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {unescoTreasures.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-card rounded-3xl border border-border overflow-hidden hover:border-amber-500/40 transition-all flex flex-col justify-between group"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <Badge className="absolute top-3 left-3 bg-amber-600 text-white text-xs">
                      {item.category}
                    </Badge>
                    <span className="absolute bottom-3 right-3 text-white font-mono text-xs bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md">
                      {item.year}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-amber-500 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {item.desc}
                    </p>
                    <Button asChild variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 hover:border-amber-500 hover:text-amber-500">
                      <Link to={item.link}>
                        Conocer más detalles <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <BetweenSectionsAd position="cultura-mid" />

        {/* CALENDARIO DE FESTIVALES Y CARNAVALES */}
        <section className="py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto px-4 max-w-6xl space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <Badge className="bg-amber-500/20 text-amber-500 mb-2">TRADICIÓN EN VIVO</Badge>
                <h2 className="font-display text-3xl font-black text-foreground">
                  Grandes Festivales & Fiestas Populares
                </h2>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                Planifica tu viaje para coincidir con las expresiones folklóricas y musicales más electrizantes del Caribe.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {festivals.map((fest, idx) => (
                <div key={idx} className="bg-card rounded-3xl border border-border overflow-hidden hover:border-amber-500/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      <img src={fest.image} alt={fest.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-amber-400 border border-white/10 text-xs">
                        {fest.badge}
                      </Badge>
                      <span className="absolute bottom-3 left-3 text-white text-xs font-semibold flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-amber-400" /> {fest.monthKey}
                      </span>
                    </div>

                    <div className="p-6">
                      <p className="text-xs text-amber-500 font-bold mb-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {fest.location}
                      </p>
                      <h4 className="font-display font-bold text-lg text-foreground mb-2">
                        {fest.name}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {fest.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <Button asChild className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs py-5">
                      <Link to="/eventos">
                        Ver Programa y Fechas de Salida →
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PERSONAJES DEL CARNAVAL DOMINICANO (GUÍAS VISUALES CULTURALES) */}
        <section className="py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto px-4 max-w-6xl space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <Badge className="bg-primary/20 text-primary mb-2">FOLKLORE VIVO & PERSONAJES</Badge>
              <h2 className="font-display text-3xl sm:text-4xl font-black">
                Personajes Icónicos del Carnaval Dominicano
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Símbolos satíricos y festivos creados por la imaginación popular que acompañan nuestras celebraciones.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  nombre: "El Diablo Cojuelo",
                  origen: "La Vega & Santiago",
                  icono: "👺",
                  desc: "El personaje estelar con su máscara de cuernos afilados, capa reluciente y vejiga de vaca con la que castiga jocosamente a los espectadores distraídos en el desfile.",
                  lema: "Satírico y desobediente"
                },
                {
                  nombre: "Roba la Gallina",
                  origen: "Todo el país (Popular)",
                  icono: "🪶",
                  desc: "Divertida figura vestida con senos y caderas gigantescas de almohadones, sombrilla y bolso, cantando estribillos pidiendo dulces y monedas para sus 'pollitos'.",
                  lema: "¡Ti-ti, manatí, roba la gallina!"
                },
                {
                  nombre: "Califé",
                  origen: "Santo Domingo",
                  icono: "🎩",
                  desc: "Poeta crítico del pueblo vestido con frac negro, sombrero de copa alta y rostro pintado. Recita versos rimados de denuncia social y política con humor incisivo.",
                  lema: "La voz rimada de la conciencia popular"
                },
              ].map((p, i) => (
                <div key={i} className="bg-card rounded-2xl border border-border p-6 space-y-3 hover:border-primary/50 transition-all shadow-sm">
                  <div className="text-4xl">{p.icono}</div>
                  <div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">{p.origen}</span>
                    <h3 className="font-display text-lg font-bold text-foreground mt-0.5">{p.nombre}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                  <p className="text-xs font-semibold text-primary italic pt-1 border-t border-border/50">"{p.lema}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MITOS Y LEYENDAS DOMINICANAS */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <Badge className="bg-purple-500/20 text-purple-600 dark:text-purple-400 mb-2">ORALIDAD & MISTERIO</Badge>
              <h2 className="font-display text-3xl sm:text-4xl font-black">
                Mitos y Leyendas de Nuestra Tierra
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Relatos transmitidos de generación en generación en los campos y cordilleras de la República Dominicana.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  titulo: "La Ciguapa",
                  zona: "Cordillera Central & Cibao",
                  desc: "Mujer mítica de largas cabelleras negras y pies volteados hacia atrás que confunde a quien intente seguir sus huellas por los bosques vírgenes al caer la noche."
                },
                {
                  titulo: "El Galipote",
                  zona: "San Juan & Región Sur",
                  desc: "Ser legendario con la facultad mágica de transformarse en perro, tronco de árbol o animal de carga para despistar caminantes en senderos desolados."
                },
                {
                  titulo: "El Bacá",
                  zona: "Valles y Zonas Rurales",
                  desc: "Ente sobrenatural creado mediante pactos para resguardar tierras, cosechas y ganado, con la advertencia moral de que la codicia desmedida cobra su precio."
                }
              ].map((m, idx) => (
                <div key={idx} className="bg-card rounded-2xl border border-border p-6 space-y-2.5 hover:shadow-md transition-all">
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">{m.zona}</span>
                  <h3 className="font-display text-lg font-bold text-foreground">{m.titulo}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="bg-gradient-to-br from-amber-600/15 via-card to-orange-600/15 rounded-3xl p-8 sm:p-12 border border-amber-500/25">
              <BookOpen className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="font-display text-2xl sm:text-3xl font-black mb-3">
                ¿Deseas profundizar en las Crónicas de la Historia?
              </h3>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
                Descubre los documentos y semblanzas sobre los próceres patrios, la Independencia de 1844 y la Gesta Restauradora en nuestro Archivo Histórico.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl">
                  <Link to="/historia">Leer Crónicas Históricas</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-xl">
                  <Link to="/recetas-criollas">Explorar Sabores Criollos</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
