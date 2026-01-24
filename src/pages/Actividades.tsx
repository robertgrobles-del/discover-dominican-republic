import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, Mountain, Waves, Landmark, Ship, Anchor, Compass } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import heroBeach from "@/assets/hero-beach.jpg";
import adventureImg from "@/assets/adventure.jpg";
import raftingImg from "@/assets/rafting.jpg";
import whaleSamanaImg from "@/assets/whale-samana.jpg";
import divingImg from "@/assets/diving.jpg";
import colonialDoorImg from "@/assets/colonial-door.jpg";
import historyImg from "@/assets/history.jpg";

const adventureActivities = [
  { name: "Senderismo en Pico Duarte", icon: Mountain },
  { name: "Rafting en el río Yaque del Norte", icon: Waves },
  { name: "Parapente sobre el valle de Jarabacoa", icon: Compass },
];

const seaActivities = [
  { name: "Buceo en pecios hundidos", icon: Anchor },
  { name: "Avistamiento de ballenas", icon: Ship },
  { name: "Snorkeling en Isla Catalina", icon: Waves },
];

export default function Actividades() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[70vh] w-full flex flex-col justify-center items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroBeach}
            alt="Experiencias en República Dominicana"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20" />
        </div>

        <div className="relative z-10 text-center px-4 pt-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block bg-surface/80 backdrop-blur-sm text-muted-foreground text-sm font-medium px-4 py-2 rounded-full mb-6"
          >
            Descubre Más
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-6xl font-bold mb-4"
          >
            Experiencias <span className="text-gradient italic">Inolvidables</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Una isla, mil aventuras. Sumérgete en historias que despertarán todos tus sentidos.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground text-sm mt-12"
          >
            Scroll para explorar
          </motion.p>
        </div>
      </section>

      {/* Adventure Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-primary text-sm font-medium uppercase tracking-wider">
                Altura y Adrenalina
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 mb-6">
                Aventura en las{" "}
                <span className="text-gradient">Montañas</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Más allá de las playas, el corazón de la isla late con fuerza en la Cordillera Central. 
                Escala el Pico Duarte, el punto más alto del Caribe, o siente la frescura de Jarabacoa, 
                la ciudad de la eterna primavera. Aquí, el aire es puro y la aventura no tiene límites.
              </p>

              <h3 className="font-display font-bold text-foreground mb-4">
                Actividades Recomendadas
              </h3>
              <ul className="space-y-3 mb-8">
                {adventureActivities.map((activity) => (
                  <li key={activity.name} className="flex items-center gap-3 text-muted-foreground">
                    <activity.icon className="h-5 w-5 text-primary" />
                    <span>{activity.name}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-card rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">Ubicación Principal</p>
                  <p className="text-sm text-muted-foreground">Jarabacoa & Constanza</p>
                </div>
                <Button size="icon" variant="ghost">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                <img
                  src={raftingImg}
                  alt="Rafting Extremo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <p className="absolute bottom-4 left-4 font-display font-bold text-foreground">
                  Rafting Extremo
                </p>
              </div>
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mt-8">
                <img
                  src={adventureImg}
                  alt="Senderos Naturales"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <p className="absolute bottom-4 left-4 font-display font-bold text-foreground">
                  Senderos Na...
                </p>
              </div>
            </motion.div>
          </div>

          {/* Carousel Controls */}
          <div className="flex justify-end gap-2 mt-8">
            <Button size="icon" variant="outline" className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="outline" className="rounded-full">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Sea Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden">
                <img
                  src={whaleSamanaImg}
                  alt="Santuario de Ballenas Jorobadas"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="bg-primary/20 text-primary text-xs font-medium px-2 py-1 rounded">
                    Temporada Enero - Marzo
                  </span>
                  <h3 className="font-display text-xl font-bold text-foreground mt-2">
                    Santuario de Ballenas Jorobadas
                  </h3>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <span className="text-primary text-sm font-medium uppercase tracking-wider">
                Profundidad Azul
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 mb-6">
                Secretos Bajo{" "}
                <span className="text-gradient">el Mar</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Sumérgete en un universo silencioso lleno de vida y color. Desde los vibrantes arrecifes 
                de Bayahibe hasta el espectáculo natural de las ballenas jorobadas en la Bahía de Samaná, 
                el océano Atlántico y el mar Caribe te invitan a explorar sus misterios.
              </p>

              <h3 className="font-display font-bold text-foreground mb-4">
                Actividades Recomendadas
              </h3>
              <ul className="space-y-3 mb-8">
                {seaActivities.map((activity) => (
                  <li key={activity.name} className="flex items-center gap-3 text-muted-foreground">
                    <activity.icon className="h-5 w-5 text-primary" />
                    <span>{activity.name}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-surface rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">Zonas Costeras</p>
                  <p className="text-sm text-muted-foreground">Samaná, Bayahibe & Punta Cana</p>
                </div>
                <Button size="icon" variant="ghost">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-primary text-sm font-medium uppercase tracking-wider">
                Historia y Ritmo
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 mb-6">
                Cultura <span className="text-gradient">Viva</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Camina por donde comenzó la historia de América. La Ciudad Colonial de Santo Domingo 
                te transporta en el tiempo con su arquitectura centenaria. Pero la cultura aquí no 
                solo se ve, se saborea y se baila. Disfruta de una gastronomía rica en sabores y 
                déjate llevar por el ritmo del merengue y la bachata.
              </p>

              <h3 className="font-display font-bold text-foreground mb-4">
                Actividades Recomendadas
              </h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Landmark className="h-5 w-5 text-primary" />
                  <span>Tour histórico Zona Colonial</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Landmark className="h-5 w-5 text-primary" />
                  <span>Ruta gastronómica criolla</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Landmark className="h-5 w-5 text-primary" />
                  <span>Noches de baile y folclore</span>
                </li>
              </ul>

              <div className="bg-card rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">Centro Cultural</p>
                  <p className="text-sm text-muted-foreground">Santo Domingo & Santiago</p>
                </div>
                <Button size="icon" variant="ghost">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="col-span-2 relative aspect-video rounded-2xl overflow-hidden">
                <img
                  src={historyImg}
                  alt="Zona Colonial"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <img
                  src={colonialDoorImg}
                  alt="Arquitectura Colonial"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <div className="text-center p-4">
                  <p className="text-primary font-bold text-lg">500+</p>
                  <p className="text-muted-foreground text-sm">Años de historia</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-surface rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                ¿Listo para tu próxima experiencia?
              </h2>
              <p className="text-muted-foreground">
                Descarga nuestra guía oficial de actividades y comienza a planificar.
              </p>
            </div>
            <div className="flex gap-4">
              <Button>Descargar Guía</Button>
              <Button variant="outline">Ver Mapa Interactivo</Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
