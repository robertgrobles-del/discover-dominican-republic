import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Heart, Compass, BookOpen, Beer, HelpCircle, Utensils, Star, Trophy } from "lucide-react";
import { toast } from "sonner";

interface ExperienciaLocal {
  id: string;
  title: string;
  desc: string;
  details: string;
  icon: any;
  location: string;
  rating: number;
  duration: string;
  price: number;
  image: string;
}

const localExperiences: ExperienciaLocal[] = [
  {
    id: "l1",
    title: "Tarde de Dominó en la Zona Colonial",
    desc: "Aprende las reglas tácticas del dominó callejero jugando con los abuelos de la plaza.",
    details: "El dominó en RD no es solo un juego, es un deporte nacional. En esta experiencia te unirás a veteranos locales en mesas de madera tradicionales en el Parque San Miguel, jugarás partidas reales y aprenderás las señas clásicas.",
    icon: Trophy,
    location: "Santo Domingo",
    rating: 4.9,
    duration: "2 horas",
    price: 600,
    image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800"
  },
  {
    id: "l2",
    title: "Ruta del Colmado y Bachata en Santiago",
    desc: "Visita colmados emblemáticos de barrio, aprende a pedir una Presidente 'vestida de novia' y baila bachata.",
    details: "El colmado es el centro social del dominicano. En esta ruta, un guía del barrio te llevará a 3 colmados vibrantes, te enseñará a ordenar cerveza ultra fría con el vocabulario local y aprenderás los pasos básicos de la bachata al compás del 'loudspeaker'.",
    icon: Beer,
    location: "Santiago",
    rating: 4.8,
    duration: "3 horas",
    price: 1200,
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800"
  },
  {
    id: "l3",
    title: "Clase de Sancocho y Mofongo Familiar",
    desc: "Cocina el caldo patrio sancocho o un mofongo crujiente en el patio de Doña Carmela.",
    details: "Entra a la cocina de una casa familiar dominicana en Jarabacoa. Aprenderás a pelar los víveres (plátano, yuca, yautía), sazonar con cilantro ancho y preparar un sancocho de 7 carnes o majar los plátanos con chicharrón en un pilón de madera.",
    icon: Utensils,
    location: "Jarabacoa",
    rating: 5.0,
    duration: "4 horas",
    price: 2500,
    image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800"
  },
  {
    id: "l4",
    title: "La Fiebre del Play: Béisbol con la Fanaticada",
    desc: "Asiste al estadio como un local con la comparsa del Licey o el Escogido.",
    details: "Olvídate de la zona turística, ven con la barra del equipo al play. Disfrutarás del bullicio de la trompeta, comerás 'platanitos' fritos en la grada, bailarás con las mascotas y cantarás cada batazo con miles de apasionados.",
    icon: Compass,
    location: "Santo Domingo",
    rating: 4.9,
    duration: "4 horas",
    price: 900,
    image: "https://images.unsplash.com/photo-1508704019882-f9cf40e475b4?w=800"
  }
];

const colmadoSlang = [
  { term: "Vestida de Novia", definition: "Dícese de la cerveza Presidente tan fría que se le forma una fina capa de hielo blanco en la botella." },
  { term: "Una Fría", definition: "Término universal para pedir una cerveza, comúnmente una Presidente de tamaño grande ('Grande' o 'Familiar')." },
  { term: "Trancar el Juego", definition: "En dominó, cuando ningún jugador posee fichas con números jugables en los extremos abiertos, cerrando la partida por puntos." },
  { term: "Doble Seis / La Pulla", definition: "La ficha de dominó más valiosa (6-6), con la que tradicionalmente se inicia la primera mano del juego." },
  { term: "Un Frío", definition: "Un trago corto de ron puro servido directamente en un vasito plástico pequeño con mucho hielo." },
  { term: "Dígame Líder", definition: "Saludo amigable y respetuoso del colmadero o vendedor local para atenderte." }
];

export default function ViveLocal() {
  const [activeExp, setActiveExp] = useState<ExperienciaLocal | null>(null);

  const handleReserva = (title: string) => {
    toast.success(`¡Solicitud enviada para: ${title}! Un guía local se pondrá en contacto contigo.`);
  };

  return (
    <PageTransition>
      <SEOHead
        title="Vive como un Local en RD - Turismo Cultural"
        description="Explora experiencias dominicanas auténticas: jugar dominó en la acera, el colmado tradicional, clases de cocina criolla y béisbol real."
      />
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />

        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8">
            
            {/* Title */}
            <div className="mb-10 text-center max-w-2xl mx-auto">
              <Badge className="mb-3 bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1.5 py-1 px-3">
                🇩🇴 Inmersión Cultural Real
              </Badge>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground">
                Vive como un Dominicano
              </h1>
              <p className="text-muted-foreground mt-3 text-base">
                Conéctate con el alma de la isla. Deja a un lado los resorts tradicionales y experimenta las costumbres cotidianas que hacen única a la República Dominicana.
              </p>
            </div>

            {/* Grid of Experiences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {localExperiences.map((exp) => (
                <Card key={exp.id} className="overflow-hidden border border-border bg-card/65 hover:border-primary/20 transition-all duration-300 group hover:shadow-xl flex flex-col md:flex-row h-full">
                  <div className="md:w-2/5 relative aspect-square md:aspect-auto overflow-hidden">
                    <img
                      src={exp.image}
                      alt={exp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 md:w-3/5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                          {exp.location}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{exp.duration}</span>
                      </div>
                      <h3 className="font-display font-bold text-lg text-foreground mb-2 leading-snug group-hover:text-primary transition-colors">
                        {exp.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {exp.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-bold text-foreground">{exp.rating}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">Desde <strong className="text-sm text-foreground">RD$ {exp.price}</strong></span>
                        <Button
                          size="sm"
                          onClick={() => setActiveExp(exp)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                        >
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Slang & Domino Guide Section */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Slang Glossary */}
              <div className="lg:col-span-2 bg-secondary/35 border border-border rounded-2xl p-6 backdrop-blur-md">
                <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                  <BookOpen className="h-5 w-5 text-primary" /> Diccionario y Etiqueta del Colmado
                </h2>
                <p className="text-xs text-muted-foreground mb-6">
                  Dominar la jerga local es el primer paso para camuflarte en el colmado o en la partida de dominó. Aquí los términos indispensables:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {colmadoSlang.map((slang) => (
                    <div key={slang.term} className="p-3 bg-card/40 border border-border/60 rounded-xl">
                      <p className="font-bold text-sm text-primary">{slang.term}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{slang.definition}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips de domino */}
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2 text-foreground">
                    <Trophy className="h-5 w-5 text-amber-500" /> Reglas de Oro del Dominó RD
                  </h2>
                  <ul className="space-y-3 text-xs text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="text-amber-500">1.</span>
                      <span><strong>El doble seis manda:</strong> Quien tenga la ficha del 6-6 ('el doble seis') arranca la primera ronda del juego obligatoriamente.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-500">2.</span>
                      <span><strong>Prohibido hablar señas verbales:</strong> Todo se comunica con gestos corporales y golpes secos de la ficha en la mesa al pasar o al poner un 'tranque'.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-500">3.</span>
                      <span><strong>Trancar el juego:</strong> Si el juego se tranca, gana el jugador que sume menos puntos en sus fichas restantes.</span>
                    </li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border/50 mt-6 text-center">
                  <HelpCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-bold text-xs">¿Listo para jugar?</p>
                  <p className="text-[10px] text-muted-foreground mb-3">Únete a una partida guiada con los campeones de dominó de la Zona Colonial.</p>
                  <Button
                    onClick={() => handleReserva("Clase de Dominó")}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                  >
                    Reserva tu Mesa
                  </Button>
                </div>
              </div>
            </div>

            {/* Experience Detail dialog */}
            <AnimatePresence>
              {activeExp && (
                <Dialog open={!!activeExp} onOpenChange={() => setActiveExp(null)}>
                  <DialogContent className="max-w-md bg-card border border-border shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="font-display text-lg font-bold text-foreground">{activeExp.title}</DialogTitle>
                      <DialogDescription className="text-xs text-primary">{activeExp.location} • {activeExp.duration}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="aspect-[16/10] rounded-xl overflow-hidden border border-border">
                        <img
                          src={activeExp.image}
                          alt={activeExp.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {activeExp.details}
                      </p>
                      
                      <div className="p-3 bg-secondary/50 rounded-lg flex items-center justify-between text-xs border border-border/60">
                        <div>
                          <p className="text-muted-foreground">Precio por persona</p>
                          <p className="font-bold text-foreground">RD$ {activeExp.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{activeExp.rating} / 5.0</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 justify-end pt-4 border-t border-border">
                      <Button variant="outline" size="sm" onClick={() => setActiveExp(null)}>
                        Cerrar
                      </Button>
                      <Button
                        onClick={() => {
                          handleReserva(activeExp.title);
                          setActiveExp(null);
                        }}
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                      >
                        Reservar Aventura
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </AnimatePresence>

          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
