import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, Mountain, Waves, Landmark, Ship, Anchor, Compass } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { CTARegistroEstablecimiento } from "@/components/forms/CTARegistroEstablecimiento";
import { SectionWithSideAds } from "@/components/SectionWithSideAds";

import heroBeach from "@/assets/hero-beach.jpg";
import adventureImg from "@/assets/adventure.jpg";
import raftingImg from "@/assets/rafting.jpg";
import whaleSamanaImg from "@/assets/whale-samana.jpg";
import divingImg from "@/assets/diving.jpg";
import colonialDoorImg from "@/assets/colonial-door.jpg";
import historyImg from "@/assets/history.jpg";
import { usePageContent } from "@/lib/pageContent";

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
  const pc = usePageContent("actividades");
  const adventureActivities = pc.data("adventureActivities", __pcData.adventureActivities);
  const seaActivities = pc.data("seaActivities", __pcData.seaActivities);
  return (
    <div className="min-h-dvh bg-background">
      <SEOHead
        title={pc.t("SEOHead.title.1", "Actividades y Experiencias en República Dominicana")}
        description={pc.t("SEOHead.description.1", "Explora aventuras de montaña, buceo y avistamiento de ballenas, y experiencias culturales en la Zona Colonial para vivir la isla más allá de sus playas.")}
      />
      <Header />


      {/* Hero Section */}
      <section className="relative h-[70vh] w-full flex flex-col justify-center items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={pc.img("img.src.1", heroBeach)}
            alt={pc.t("img.alt.1", "Experiencias en República Dominicana")}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20" />
        </div>

        <div className="relative z-10 text-center px-4 pt-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block bg-surface/80 backdrop-blur-sm text-muted-foreground text-sm font-medium px-4 py-2 rounded-full mb-6"
          >{pc.tx("motion_span.1", "Descubre Más")}</motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-6xl font-bold mb-4"
          >{pc.tx("motion_h1.1", "Experiencias")}{" "}<span className="text-gradient italic">{pc.tx("span.1", "Inolvidables")}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >{pc.tx("motion_p.1", "Una isla, mil aventuras. Sumérgete en historias que despertarán todos tus sentidos.")}</motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground text-sm mt-12"
          >{pc.tx("motion_p.2", "Scroll para explorar")}</motion.p>
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
              <span className="text-primary text-sm font-medium uppercase tracking-wider">{pc.tx("span.2", "Altura y Adrenalina")}</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 mb-6">{pc.tx("h2.1", "Aventura en las")}{" "}
                <span className="text-gradient">{pc.tx("span.3", "Montañas")}</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">{pc.tx("p.1", "Más allá de las playas, el corazón de la isla late con fuerza en la Cordillera Central. Escala el Pico Duarte, el punto más alto del Caribe, o siente la frescura de Jarabacoa, la ciudad de la eterna primavera. Aquí, el aire es puro y la aventura no tiene límites.")}</p>

              <h3 className="font-display font-bold text-foreground mb-4">{pc.tx("h3.1", "Actividades Recomendadas")}</h3>
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
                  <p className="font-bold text-foreground">{pc.tx("p.2", "Ubicación Principal")}</p>
                  <p className="text-sm text-muted-foreground">{pc.tx("p.3", "Jarabacoa & Constanza")}</p>
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
                  src={pc.img("img.src.2", raftingImg)}
                  alt={pc.t("img.alt.2", "Rafting Extremo")}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <p className="absolute bottom-4 left-4 font-display font-bold text-foreground">{pc.tx("p.4", "Rafting Extremo")}</p>
              </div>
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mt-8">
                <img
                  src={pc.img("img.src.3", adventureImg)}
                  alt={pc.t("img.alt.3", "Senderos Naturales")}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <p className="absolute bottom-4 left-4 font-display font-bold text-foreground">{pc.tx("p.5", "Senderos Na...")}</p>
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

      {/* Sea Section wrapped with skyscraper side ads */}
      <SectionWithSideAds 
        showAds section="actividades" 
        className="container mx-auto"
      >
        <section className="py-20 bg-card rounded-3xl my-6">
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
                    src={pc.img("img.src.4", whaleSamanaImg)}
                    alt={pc.t("img.alt.4", "Santuario de Ballenas Jorobadas")}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-primary/20 text-primary text-xs font-medium px-2 py-1 rounded">{pc.tx("span.4", "Temporada Enero - Marzo")}</span>
                    <h3 className="font-display text-xl font-bold text-foreground mt-2">{pc.tx("h3.2", "Santuario de Ballenas Jorobadas")}</h3>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-1 lg:order-2"
              >
                <span className="text-primary text-sm font-medium uppercase tracking-wider">{pc.tx("span.5", "Profundidad Azul")}</span>
                <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 mb-6">{pc.tx("h2.2", "Secretos Bajo")}{" "}
                  <span className="text-gradient">{pc.tx("span.6", "el Mar")}</span>
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">{pc.tx("p.6", "Sumérgete en un universo silencioso lleno de vida y color. Desde los vibrantes arrecifes de Bayahibe hasta el espectáculo natural de las ballenas jorobadas en la Bahía de Samaná, el océano Atlántico y el mar Caribe te invitan a explorar sus misterios.")}</p>

                <h3 className="font-display font-bold text-foreground mb-4">{pc.tx("h3.3", "Actividades Recomendadas")}</h3>
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
                    <p className="font-bold text-foreground">{pc.tx("p.7", "Zonas Costeras")}</p>
                    <p className="text-sm text-muted-foreground">{pc.tx("p.8", "Samaná, Bayahibe & Punta Cana")}</p>
                  </div>
                  <Button size="icon" variant="ghost">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </SectionWithSideAds>

      {/* Culture Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-primary text-sm font-medium uppercase tracking-wider">{pc.tx("span.7", "Historia y Ritmo")}</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 mb-6">{pc.tx("h2.3", "Cultura")}{" "}<span className="text-gradient">{pc.tx("span.8", "Viva")}</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">{pc.tx("p.9", "Camina por donde comenzó la historia de América. La Ciudad Colonial de Santo Domingo te transporta en el tiempo con su arquitectura centenaria. Pero la cultura aquí no solo se ve, se saborea y se baila. Disfruta de una gastronomía rica en sabores y déjate llevar por el ritmo del merengue y la bachata.")}</p>

              <h3 className="font-display font-bold text-foreground mb-4">{pc.tx("h3.4", "Actividades Recomendadas")}</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Landmark className="h-5 w-5 text-primary" />
                  <span>{pc.tx("span.9", "Tour histórico Zona Colonial")}</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Landmark className="h-5 w-5 text-primary" />
                  <span>{pc.tx("span.10", "Ruta gastronómica criolla")}</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Landmark className="h-5 w-5 text-primary" />
                  <span>{pc.tx("span.11", "Noches de baile y folclore")}</span>
                </li>
              </ul>

              <div className="bg-card rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">{pc.tx("p.10", "Centro Cultural")}</p>
                  <p className="text-sm text-muted-foreground">{pc.tx("p.11", "Santo Domingo & Santiago")}</p>
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
                  src={pc.img("img.src.5", historyImg)}
                  alt={pc.t("img.alt.5", "Zona Colonial")}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <img
                  src={pc.img("img.src.6", colonialDoorImg)}
                  alt={pc.t("img.alt.6", "Arquitectura Colonial")}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <div className="text-center p-4">
                  <p className="text-primary font-bold text-lg">500+</p>
                  <p className="text-muted-foreground text-sm">{pc.tx("p.12", "Años de historia")}</p>
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
            className="bg-surface rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 mb-12"
          >
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">{pc.tx("h2.4", "¿Listo para tu próxima experiencia?")}</h2>
              <p className="text-muted-foreground">{pc.tx("p.13", "Descarga nuestra guía oficial de actividades y comienza a planificar.")}</p>
            </div>
            <div className="flex gap-4">
              <Button>{pc.tx("Button.1", "Descargar Guía")}</Button>
              <Button variant="outline">{pc.tx("Button.2", "Ver Mapa Interactivo")}</Button>
            </div>
          </motion.div>

          <CTARegistroEstablecimiento 
            tipo="tour" 
            titulo="¿Eres proveedor de tours o actividades turísticas?" 
            subtitulo="Registra tus excursiones, tours guiados o actividades de aventura en Descubre RD y conecta con aventureros y familias buscando experiencias únicas."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).
const __pcData = { adventureActivities, seaActivities };
