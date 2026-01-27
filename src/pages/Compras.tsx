import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, MapPin, Store, Gem, ShoppingBag, Coffee, HelpCircle, Crown, CreditCard, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";

import merengue from "@/assets/merengue-dance.jpg";
import gastronomy from "@/assets/gastronomy.jpg";

const categoriasCompras = [
  { id: "lujo", titulo: "Centros de Lujo", imagen: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=300&fit=crop" },
  { id: "artesania", titulo: "Artesanía Local", imagen: merengue },
  { id: "joyas", titulo: "Joyas: Ámbar & Larimar", imagen: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop" },
  { id: "gourmet", titulo: "Cigarros y Café", imagen: gastronomy },
];

const productosInsignia = [
  {
    id: "larimar",
    nombre: "Larimar",
    descripcion: "Conocida como la 'Piedra del Caribe', esta gema azul pectolita solo se encuentra en una remota montaña de Barahona.",
    imagen: "https://images.unsplash.com/photo-1551376347-075b0121a65b?w=300&h=300&fit=crop",
    exclusivo: true,
    detalles: ["Color azul volcánico único", "Joyería de plata artesanal"],
    cta: "Dónde comprar auténtico",
  },
  {
    id: "ambar",
    nombre: "Ámbar",
    descripcion: "Famoso por su claridad y la frecuencia de fósiles prehistóricos. El ámbar dominicano es considerado uno de los mejores del mundo.",
    imagen: "https://images.unsplash.com/photo-1564389598-c1ac3caa5b87?w=300&h=300&fit=crop",
    detalles: ["Variedades doradas y azules", "Museos del Ámbar en Puerto Plata"],
    cta: "Ver guía de calidad",
  },
  {
    id: "tabaco",
    nombre: "Tabaco Premium",
    descripcion: "La República Dominicana es el mayor exportador de cigarros premium hechos a mano del mundo. Calidad inigualable.",
    imagen: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=300&h=300&fit=crop",
    detalles: ["Tours de fábricas disponibles", "Marcas mundialmente reconocidas"],
    cta: "Mejores Cigar Clubs",
  },
];

const consejosViajero = [
  { pregunta: "¿Cómo funciona el Tax-Free?", respuesta: "Los turistas pueden recuperar el ITBIS (18%) en compras superiores a RD$2,000 en establecimientos autorizados. Presenta tu pasaporte al momento de la compra y solicita el formulario de reembolso." },
  { pregunta: "Identificar Artesanía Auténtica", respuesta: "Busca la etiqueta 'Hecho en RD' oficial, verifica la calidad del material y compra en tiendas certificadas o mercados de artesanos reconocidos como el Mercado Modelo." },
  { pregunta: "Mejores zonas de compras", respuesta: "Santo Domingo: Ágora Mall, Blue Mall, Zona Colonial. Punta Cana: Palma Real, Downtown Punta Cana. Puerto Plata: Plaza Turisol, Mercado del Ámbar." },
];

const marcasInternacionales = ["Louis Vuitton", "Cartier", "Rolex", "Carolina Herrera", "Zara"];

// ==================== SHOPPING DE LUJO ====================
const boutiquesLujo = [
  { nombre: "Louis Vuitton", categoria: "Marroquinería & Ready-to-Wear", flagship: true },
  { nombre: "Cartier", categoria: "Haute Horlogerie & Joyas", flagship: false },
  { nombre: "Salvatore Ferragamo", categoria: "Italian Luxury & Shoes", flagship: false }
];

const dutyFreeInfo = [
  { titulo: "Límites de Compra", descripcion: "Los viajeros internacionales pueden adquirir hasta $500 USD en mercancía libre de impuestos por persona." },
  { titulo: "Requisitos", descripcion: "Es indispensable presentar pasaporte válido y pase de abordar internacional al momento de la compra." },
  { titulo: "Tax Refund", descripcion: "Solicita tu formulario de devolución de impuestos (ITBIS) en compras superiores a $50 USD en tiendas afiliadas." }
];

export default function Compras() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        {/* Hero */}
        <section className="relative h-[60vh] min-h-[500px] flex items-end mt-16">
          <div className="absolute inset-0">
            <img
              src={merengue}
              alt="Compras en República Dominicana"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>
          
          <div className="relative z-10 container mx-auto px-4 pb-16">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              GUÍA OFICIAL DE COMPRAS
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 max-w-2xl">
              Lleva contigo un pedazo de{" "}
              <span className="text-gradient">Paraíso</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mb-8">
              Desde boutiques de lujo en Santo Domingo hasta los tesoros artesanales escondidos en los mercados locales. Descubre el Larimar, el Ámbar y los sabores auténticos del Caribe.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Button size="lg" className="gap-2">
                <Store className="h-4 w-4" /> Explorar Mercados
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <MapPin className="h-4 w-4" /> Ver Mapa de Tiendas
              </Button>
            </div>
          </div>
        </section>

        {/* Tabs Principal */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-auto gap-2 bg-transparent mb-8">
                <TabsTrigger 
                  value="general" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Guía General
                </TabsTrigger>
                <TabsTrigger 
                  value="lujo" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3"
                >
                  <Crown className="h-4 w-4" />
                  Shopping de Lujo
                </TabsTrigger>
              </TabsList>

              {/* ========== TAB: GUÍA GENERAL ========== */}
              <TabsContent value="general">
                {/* Categorías */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                  {categoriasCompras.map((cat, index) => (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer"
                    >
                      <img
                        src={cat.imagen}
                        alt={cat.titulo}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-semibold text-foreground">{cat.titulo}</h3>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Productos Insignia */}
                <div className="text-center mb-12">
                  <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                    Productos Insignia
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    La República Dominicana es famosa mundialmente por estos tesoros únicos. No regreses a casa sin ellos.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-16">
                  {productosInsignia.map((producto, index) => (
                    <motion.div
                      key={producto.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-card rounded-2xl border border-border overflow-hidden"
                    >
                      <div className="relative aspect-square">
                        <img
                          src={producto.imagen}
                          alt={producto.nombre}
                          className="w-full h-full object-cover"
                        />
                        {producto.exclusivo && (
                          <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                            Exclusivo RD
                          </Badge>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="font-display text-xl font-bold text-foreground mb-2">
                          {producto.nombre}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {producto.descripcion}
                        </p>
                        <ul className="space-y-2 mb-6">
                          {producto.detalles.map((detalle) => (
                            <li key={detalle} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Gem className="h-3 w-3 text-primary" />
                              {detalle}
                            </li>
                          ))}
                        </ul>
                        <Button variant="outline" className="w-full gap-2">
                          {producto.cta} <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Consejos y Mapa */}
                <div className="grid lg:grid-cols-2 gap-12">
                  {/* Consejos */}
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      <h2 className="font-display text-2xl font-bold text-foreground">
                        Consejos para el Viajero
                      </h2>
                    </div>

                    <Accordion type="single" collapsible className="space-y-2">
                      {consejosViajero.map((consejo, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="bg-card rounded-xl border border-border px-4">
                          <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                            {consejo.pregunta}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {consejo.respuesta}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>

                  {/* Mapa */}
                  <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="aspect-[4/3] relative">
                      <img
                        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=600&fit=crop"
                        alt="Mapa de compras"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="font-display text-xl font-bold text-foreground mb-2">
                          Mapa Interactivo de Tiendas
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Localiza los centros comerciales certificados y mercados de artesanía cerca de tu hotel.
                        </p>
                        <div className="flex gap-2 flex-wrap mb-4">
                          <Badge className="bg-primary/20 text-primary">Santo Domingo</Badge>
                          <Badge className="bg-primary/20 text-primary">Punta Cana</Badge>
                          <Badge className="bg-primary/20 text-primary">Puerto Plata</Badge>
                        </div>
                        <Button className="w-full gap-2">
                          <MapPin className="h-4 w-4" /> Encontrar tiendas cercanas
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ========== TAB: SHOPPING DE LUJO ========== */}
              <TabsContent value="lujo">
                <div className="mb-8">
                  <Badge className="mb-4 bg-amber-500/20 text-amber-400 border-amber-500/30">
                    EXCLUSIVE GUIDE
                  </Badge>
                  <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                    Dominican Republic: The Caribbean's Fashion Capital
                  </h2>
                  <p className="text-muted-foreground max-w-2xl">
                    Descubre la fusión del lujo tropical y la alta costura internacional. Desde las boutiques de diseñador en Santo Domingo hasta la exclusividad de Punta Cana.
                  </p>
                </div>

                {/* BlueMall Section */}
                <div className="bg-card rounded-2xl border border-border p-8 mb-12">
                  <div className="flex items-center gap-2 mb-6">
                    <Badge className="bg-primary text-primary-foreground">SANTO DOMINGO</Badge>
                    <h3 className="font-display text-xl font-bold text-foreground">The BlueMall Experience</h3>
                  </div>
                  <p className="text-muted-foreground mb-8">
                    El destino definitivo para la alta costura en el Caribe. Encuentra las colecciones más recientes de casas de moda europeas.
                  </p>

                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    {boutiquesLujo.map((boutique) => (
                      <div key={boutique.nombre} className="bg-secondary/30 rounded-xl p-6">
                        {boutique.flagship && <Badge className="mb-2 bg-amber-500 text-white">FLAGSHIP</Badge>}
                        <h4 className="font-display font-bold text-foreground mb-1">{boutique.nombre}</h4>
                        <p className="text-sm text-muted-foreground">{boutique.categoria}</p>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="gap-2">
                    <MapPin className="h-4 w-4" /> Ver mapa del mall
                  </Button>
                </div>

                {/* Punta Cana Village */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  <div className="bg-card rounded-2xl border border-border p-8">
                    <h3 className="font-display text-xl font-bold text-foreground mb-4">Punta Cana Village</h3>
                    <p className="text-muted-foreground mb-6">
                      Un ambiente relajado y sofisticado donde el diseño local se encuentra con marcas internacionales de resort.
                    </p>
                    
                    <div className="space-y-4 mb-6">
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Diseñadores Locales</h4>
                        <p className="text-sm text-muted-foreground">
                          Descubre piezas únicas de Oscar de la Renta y Jenny Polanco, inspiradas en la luz del Caribe.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Concept Stores</h4>
                        <p className="text-sm text-muted-foreground">
                          Boutiques que mezclan arte, decoración y moda en un ambiente de galería.
                        </p>
                      </div>
                    </div>

                    <Button variant="outline" className="gap-2">
                      Ver Directorio <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Duty Free */}
                  <div className="bg-card rounded-2xl border border-border p-8">
                    <h3 className="font-display text-xl font-bold text-foreground mb-6">Duty Free Privileges</h3>
                    
                    <div className="space-y-4">
                      {dutyFreeInfo.map((info, i) => (
                        <div key={i} className="flex gap-4">
                          <CreditCard className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="font-semibold text-foreground mb-1">{info.titulo}</h4>
                            <p className="text-sm text-muted-foreground">{info.descripcion}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* VIP Concierge */}
                <div className="bg-gradient-to-r from-amber-500/10 to-primary/10 rounded-2xl p-8 text-center">
                  <User className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">Experiencia VIP Concierge</h3>
                  <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                    Reserva un Personal Shopper para una experiencia de compra privada y transporte de lujo entre boutiques.
                  </p>
                  <Button size="lg" className="gap-2">
                    Reservar Ahora <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Marcas Internacionales */}
        <section className="py-12 border-t border-border">
          <div className="container mx-auto px-4">
            <p className="text-center text-xs text-muted-foreground uppercase tracking-wider mb-6">
              Encuentra tus marcas favoritas
            </p>
            <div className="flex items-center justify-center gap-8 md:gap-16 flex-wrap">
              {marcasInternacionales.map((marca) => (
                <span key={marca} className="text-xl md:text-2xl font-display font-light text-muted-foreground">
                  {marca}
                </span>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
