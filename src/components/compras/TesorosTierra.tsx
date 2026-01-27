import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Gem,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  Mountain,
  Sparkles,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";

const gemas = [
  {
    nombre: "Larimar",
    subtitulo: "La Piedra del Caribe",
    descripcion: "Gema azul pectolita única en el mundo, encontrada solo en las montañas de Barahona, República Dominicana.",
    imagen: "https://images.unsplash.com/photo-1551376347-075b0121a65b?w=600&h=400&fit=crop",
    color: "from-cyan-500 to-blue-600",
    historia: "Descubierta oficialmente en 1974 por Miguel Méndez, quien la nombró combinando el nombre de su hija Larissa con 'mar'. La piedra se forma en rocas volcánicas y su color varía de azul claro a azul profundo.",
    origen: "Sierra de Bahoruco, Barahona",
    formacion: "Hace 15-20 millones de años por actividad volcánica",
    autenticidad: [
      "El Larimar genuino tiene vetas blancas naturales",
      "Se siente fresco al tacto, no plástico",
      "El color es irregular, no perfectamente uniforme",
      "Pesa más que las imitaciones de plástico",
    ],
    falsificaciones: [
      "Resinas teñidas de azul",
      "Vidrio coloreado",
      "Piedras similares de otros países",
    ],
    precios: "RD$500 - RD$50,000+ según calidad y tamaño",
  },
  {
    nombre: "Ámbar",
    subtitulo: "Lágrimas del Sol Fosilizadas",
    descripcion: "Resina de árbol fosilizada de 15-40 millones de años. El ámbar dominicano es famoso por su claridad y frecuentes inclusiones de insectos.",
    imagen: "https://images.unsplash.com/photo-1564389598-c1ac3caa5b87?w=600&h=400&fit=crop",
    color: "from-amber-500 to-orange-600",
    historia: "Los taínos lo llamaban 'luz del sol capturada'. El ámbar dominicano se hizo famoso mundialmente después de aparecer en Jurassic Park. Es considerado entre los más puros del mundo.",
    origen: "Cordillera Septentrional (Puerto Plata, Santiago)",
    formacion: "15-40 millones de años, resina de árbol Hymenaea",
    autenticidad: [
      "Flota en agua salada concentrada",
      "Emite olor a pino al frotarlo",
      "Se electrifica al frotarlo (atrae papelitos)",
      "Es cálido al tacto, no frío como el vidrio",
    ],
    falsificaciones: [
      "Copal (resina más joven)",
      "Plástico imitación",
      "Ámbar reconstituido (polvo prensado)",
    ],
    precios: "RD$1,000 - RD$100,000+ con inclusiones raras",
  },
];

const museos = [
  {
    nombre: "Museo del Ámbar Dominicano",
    ubicacion: "Puerto Plata",
    descripcion: "Colección de ámbar con inclusiones únicas, incluyendo lagartos y ranas prehistóricas.",
    horario: "9:00 AM - 5:00 PM",
    entrada: "RD$150",
  },
  {
    nombre: "Museo Mundo del Ámbar",
    ubicacion: "Santo Domingo, Zona Colonial",
    descripcion: "Exhibiciones interactivas sobre la formación del ámbar y joyería artesanal.",
    horario: "9:00 AM - 6:00 PM",
    entrada: "RD$100",
  },
  {
    nombre: "Mina de Larimar",
    ubicacion: "Barahona",
    descripcion: "Visita la única mina de Larimar del mundo. Tour guiado por las galerías.",
    horario: "8:00 AM - 4:00 PM",
    entrada: "RD$500 (incluye guía)",
  },
];

const rutaArtesanal = [
  { paso: 1, lugar: "Mina de Larimar", ciudad: "Bahoruco", actividad: "Ver extracción" },
  { paso: 2, lugar: "Taller de Pulido", ciudad: "Barahona", actividad: "Proceso artesanal" },
  { paso: 3, lugar: "Joyería Local", ciudad: "Santo Domingo", actividad: "Comprar auténtico" },
  { paso: 4, lugar: "Museo del Ámbar", ciudad: "Puerto Plata", actividad: "Historia y ciencia" },
];

export function TesorosTierra() {
  return (
    <>
      {/* Hero Tesoros */}
      <section className="py-20 bg-gradient-to-br from-cyan-900/90 via-blue-900/80 to-amber-900/90">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Gem className="w-4 h-4 mr-2" />
              Exclusivo de RD
            </Badge>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">
              Tesoros de la Tierra
            </h2>
            <p className="text-xl text-white/80 mb-8">
              República Dominicana es el único lugar del mundo donde encontrarás el Larimar. 
              Descubre también el ámbar más puro del Caribe.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gemas Detail */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="space-y-16">
            {gemas.map((gema, index) => (
              <motion.div
                key={gema.nombre}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid lg:grid-cols-2 gap-12 items-center"
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="relative rounded-2xl overflow-hidden">
                    <img
                      src={gema.imagen}
                      alt={gema.nombre}
                      className="w-full aspect-[4/3] object-cover"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${gema.color} opacity-20`} />
                  </div>
                </div>
                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <Badge className={`mb-4 bg-gradient-to-r ${gema.color} text-white`}>
                    <Gem className="w-3 w-3 mr-1" />
                    {gema.subtitulo}
                  </Badge>
                  <h3 className="font-display text-3xl font-bold text-foreground mb-4">
                    {gema.nombre}
                  </h3>
                  <p className="text-muted-foreground mb-6">{gema.descripcion}</p>
                  
                  {/* Historia Geológica */}
                  <div className="bg-card rounded-xl border border-border p-6 mb-6">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Mountain className="h-5 w-5 text-primary" />
                      Historia Geológica
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">{gema.historia}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Origen:</p>
                        <p className="font-medium text-foreground">{gema.origen}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Formación:</p>
                        <p className="font-medium text-foreground">{gema.formacion}</p>
                      </div>
                    </div>
                  </div>

                  {/* Autenticidad */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-emerald-500/10 rounded-xl p-4">
                      <h5 className="font-semibold text-emerald-600 mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Cómo Verificar
                      </h5>
                      <ul className="space-y-2">
                        {gema.autenticidad.map((tip) => (
                          <li key={tip} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-red-500/10 rounded-xl p-4">
                      <h5 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Evitar Falsificaciones
                      </h5>
                      <ul className="space-y-2">
                        {gema.falsificaciones.map((fake) => (
                          <li key={fake} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2" />
                            {fake}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Rango de precios</p>
                      <p className="font-semibold text-foreground">{gema.precios}</p>
                    </div>
                    <Button className="gap-2">
                      Dónde Comprar <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Museos */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="font-display text-3xl font-bold mb-4">
              Museos y <span className="text-gradient">Minas</span>
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Visita los lugares donde puedes aprender sobre estas gemas y ver piezas extraordinarias.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {museos.map((museo, index) => (
              <motion.div
                key={museo.nombre}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-background border-border h-full">
                  <CardContent className="p-6">
                    <h4 className="font-display text-lg font-bold text-foreground mb-2">
                      {museo.nombre}
                    </h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                      <MapPin className="h-3 w-3" />
                      {museo.ubicacion}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">{museo.descripcion}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {museo.horario}
                      </span>
                      <Badge variant="secondary">{museo.entrada}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ruta Artesanal */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="font-display text-3xl font-bold mb-4">
              Ruta <span className="text-gradient">Artesanal</span>
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Sigue el camino desde la mina hasta la joyería. Una experiencia única.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4">
            {rutaArtesanal.map((paso, index) => (
              <motion.div
                key={paso.paso}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="bg-card rounded-xl border border-border p-4 text-center min-w-[180px]">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mx-auto mb-2">
                    {paso.paso}
                  </div>
                  <h4 className="font-semibold text-foreground text-sm">{paso.lugar}</h4>
                  <p className="text-xs text-muted-foreground">{paso.ciudad}</p>
                  <Badge variant="secondary" className="mt-2 text-xs">{paso.actividad}</Badge>
                </div>
                {index < rutaArtesanal.length - 1 && (
                  <ChevronRight className="h-6 w-6 text-muted-foreground hidden md:block" />
                )}
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Reservar Tour Completo
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
