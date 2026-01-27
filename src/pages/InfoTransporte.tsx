import { motion } from "framer-motion";
import { 
  Car, Bus, Plane, Ship, MapPin, Clock, DollarSign, 
  ChevronRight, AlertCircle, CheckCircle2, Phone, Wifi, 
  Coffee, Tv, Snowflake, Search, Download
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState } from "react";

const operadoresPremium = [
  {
    nombre: "Caribe Tours",
    logo: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&h=100&fit=crop",
    descripcion: "La red más extensa. Salidas cada hora hacia el norte y el sur.",
    servicios: ["WIFI", "A/C", "BAÑO"],
    rutas: ["Santo Domingo ↔ Santiago", "Santo Domingo ↔ Puerto Plata"],
    telefono: "(809) 221-4422"
  },
  {
    nombre: "Metro Servicios Turísticos",
    logo: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=100&h=100&fit=crop",
    descripcion: "Servicio ejecutivo con terminales tipo lounge. Ideal para negocios.",
    servicios: ["WIFI", "VIP", "CAFÉ"],
    rutas: ["Santo Domingo ↔ Santiago", "Santo Domingo ↔ Puerto Plata"],
    telefono: "(809) 583-9111"
  },
  {
    nombre: "Expreso Bávaro",
    logo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
    descripcion: "La única ruta directa sin paradas hacia la zona hotelera de Punta Cana.",
    servicios: ["TV", "A/C", "EXTRA"],
    rutas: ["Santo Domingo ↔ Punta Cana", "Santo Domingo ↔ Bávaro"],
    telefono: "(809) 552-1678"
  }
];

const terminales = [
  {
    nombre: "Terminal Caribe Tours",
    direccion: "Av. 27 de Febrero esq. Leopoldo Navarro, Santo Domingo",
    telefono: "(809) 221-4422",
    tipo: "Premium"
  },
  {
    nombre: "Estación Metro Santiago",
    direccion: "Av. Juan Pablo Duarte, Santiago de los Caballeros",
    telefono: "(809) 583-9111",
    tipo: "Premium"
  },
  {
    nombre: "Parada Bávaro Express",
    direccion: "Friusa, Bávaro, Punta Cana",
    telefono: "(809) 552-1678",
    tipo: "Premium"
  },
  {
    nombre: "Parada del Sur (Pintura)",
    direccion: "Isabel Aguiar, Santo Domingo Oeste",
    nota: "Conexión a Barahona y San Juan",
    tipo: "Local"
  }
];

const rutasGuaguas = [
  { ruta: "Higuey → Punta Cana", tiempo: "45 min", precio: "RD$ 150" },
  { ruta: "Sto Dgo → Boca Chica", tiempo: "40 min", precio: "RD$ 100" },
  { ruta: "Puerto Plata → Cabarete", tiempo: "30 min", precio: "RD$ 80" }
];

const consejosViaje = [
  {
    titulo: "Efectivo es Rey",
    descripcion: "En guaguas locales se paga exclusivamente en efectivo (Pesos Dominicanos). Lleva billetes pequeños.",
    icono: DollarSign
  },
  {
    titulo: "Prepárate para el Frío",
    descripcion: "Los autobuses premium (Caribe Tours, Metro) suelen tener el aire acondicionado muy fuerte. Lleva un abrigo ligero.",
    icono: Snowflake
  },
  {
    titulo: "Horarios Flexibles",
    descripcion: "Las guaguas salen cuando se llenan. Los autobuses premium sí tienen horarios fijos y estrictos.",
    icono: Clock
  }
];

const transportOptions = [
  {
    type: "Taxis",
    icon: Car,
    description: "Disponibles en aeropuertos, hoteles y zonas turísticas. Negocia el precio antes de subir o usa apps.",
    pros: ["Disponibilidad 24/7", "Puerta a puerta", "Aire acondicionado"],
    cons: ["Más costoso", "Tarifas variables"],
    priceRange: "$20-100 USD",
    tips: [
      "Usa taxis autorizados con logo oficial",
      "Acuerda el precio antes de iniciar el viaje",
      "Lleva efectivo en pesos o dólares",
    ],
    apps: ["Uber", "inDriver", "Apptaxi"],
  },
  {
    type: "Rent-a-Car",
    icon: Car,
    description: "Ideal para explorar a tu ritmo. Disponible en aeropuertos y zonas turísticas principales.",
    pros: ["Libertad total", "Explora sin límites", "Múltiples destinos"],
    cons: ["Tráfico en ciudades", "Requiere licencia internacional"],
    priceRange: "$35-80 USD/día",
    tips: [
      "Licencia de conducir válida (internacional recomendada)",
      "Seguro completo recomendado",
      "GPS o datos móviles esenciales",
    ],
    companies: ["Budget", "Avis", "Hertz", "National"],
  },
  {
    type: "Vuelos Internos",
    icon: Plane,
    description: "Para distancias largas o llegar rápido a destinos como Samaná o Punta Cana.",
    pros: ["Rápido", "Vistas increíbles", "Cómodo"],
    cons: ["Más costoso", "Disponibilidad limitada"],
    priceRange: "$80-200 USD",
    tips: [
      "Aeropuertos: Santo Domingo, Punta Cana, Santiago, Puerto Plata, Samaná",
      "Reserva con anticipación",
      "Vuelos charter disponibles",
    ],
  },
];

const routes = [
  { from: "Santo Domingo", to: "Punta Cana", distance: "200 km", time: "2.5 horas", transport: "Auto" },
  { from: "Santo Domingo", to: "Samaná", distance: "245 km", time: "3 horas", transport: "Auto" },
  { from: "Santo Domingo", to: "Puerto Plata", distance: "215 km", time: "3.5 horas", transport: "Auto" },
  { from: "Santo Domingo", to: "Santiago", distance: "155 km", time: "2.5 horas", transport: "Auto" },
  { from: "Punta Cana", to: "La Romana", distance: "50 km", time: "1 hora", transport: "Auto" },
  { from: "Puerto Plata", to: "Cabarete", distance: "15 km", time: "20 min", transport: "Auto" },
];

const tips = [
  {
    title: "Guaguas (Minibuses)",
    desc: "Transporte público local muy económico. Experiencia auténtica pero no siempre cómoda.",
    icon: Bus,
  },
  {
    title: "Motoconchos",
    desc: "Motos-taxi populares para distancias cortas. Económicos pero solo para aventureros.",
    icon: Car,
  },
  {
    title: "Botes y Ferries",
    desc: "Para llegar a cayos e islas como Saona, Catalina o Cayo Levantado.",
    icon: Ship,
  },
];

export default function InfoTransporte() {
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <section className="pt-24 pb-16 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
                <Car className="h-4 w-4" />
                Guía Oficial de Movilidad
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Recorre <span className="text-gradient">República Dominicana</span> por Carretera
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
                Desde autobuses de lujo con aire acondicionado hasta la auténtica experiencia local. Descubre cómo moverte entre playas, montañas y ciudades.
              </p>

              {/* Buscador de Rutas */}
              <div className="max-w-2xl mx-auto bg-card rounded-xl border border-border p-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Origen"
                    value={origen}
                    onChange={(e) => setOrigen(e.target.value)}
                    className="bg-background"
                  />
                  <Input
                    placeholder="Destino"
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                    className="bg-background"
                  />
                  <Button className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Buscar
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tabs de Opciones */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="premium" className="w-full">
              <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-8">
                <TabsTrigger value="premium">Autobuses Premium</TabsTrigger>
                <TabsTrigger value="guaguas">Guaguas Locales</TabsTrigger>
                <TabsTrigger value="privados">Traslados Privados</TabsTrigger>
                <TabsTrigger value="terminales">Mapa de Terminales</TabsTrigger>
              </TabsList>

              <TabsContent value="premium">
                <div className="text-center mb-8">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Operadores Premium
                  </h2>
                  <p className="text-muted-foreground">
                    Viaja cómodo y seguro entre las principales ciudades
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {operadoresPremium.map((op, index) => (
                    <motion.div
                      key={op.nombre}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-card border-border h-full">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <img
                              src={op.logo}
                              alt={op.nombre}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div>
                              <h3 className="font-semibold text-foreground">{op.nombre}</h3>
                              <p className="text-xs text-muted-foreground">{op.telefono}</p>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">{op.descripcion}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {op.servicios.map((serv) => (
                              <Badge key={serv} variant="secondary" className="text-xs">
                                {serv}
                              </Badge>
                            ))}
                          </div>

                          <div className="space-y-2">
                            <p className="text-xs font-medium text-foreground">Rutas:</p>
                            {op.rutas.map((ruta) => (
                              <p key={ruta} className="text-xs text-muted-foreground flex items-center gap-1">
                                <ChevronRight className="w-3 h-3 text-primary" />
                                {ruta}
                              </p>
                            ))}
                          </div>

                          <Button variant="outline" className="w-full mt-4">
                            Ver Horarios y Precios
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="guaguas">
                <div className="max-w-3xl mx-auto">
                  <div className="bg-card rounded-xl border border-border p-6 mb-8">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Bus className="w-5 h-5 text-primary" />
                      ¿Qué son las Guaguas?
                    </h3>
                    <p className="text-muted-foreground">
                      Las "guaguas" son minivans o autobuses pequeños que funcionan como el transporte público principal. Son económicas, frecuentes y te permiten vivir la cultura local, aunque pueden ser menos cómodas para equipaje grande.
                    </p>
                  </div>

                  <h4 className="font-semibold text-foreground mb-4">Rutas Populares</h4>
                  <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-secondary/30">
                        <tr>
                          <th className="text-left p-4 text-sm font-medium text-foreground">Ruta</th>
                          <th className="text-left p-4 text-sm font-medium text-foreground">Tiempo Aprox.</th>
                          <th className="text-left p-4 text-sm font-medium text-foreground">Precio Est.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rutasGuaguas.map((ruta) => (
                          <tr key={ruta.ruta} className="border-t border-border">
                            <td className="p-4 text-sm text-foreground">{ruta.ruta}</td>
                            <td className="p-4 text-sm text-muted-foreground">{ruta.tiempo}</td>
                            <td className="p-4 text-sm text-muted-foreground">{ruta.precio}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="privados">
                <div className="space-y-8">
                  {transportOptions.map((option, index) => (
                    <motion.div
                      key={option.type}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-card border-border overflow-hidden">
                        <CardHeader className="bg-secondary/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <option.icon className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-xl">{option.type}</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-lg px-4 py-2">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {option.priceRange}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="grid md:grid-cols-3 gap-6">
                            <div>
                              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Ventajas
                              </h4>
                              <ul className="space-y-2">
                                {option.pros.map((pro) => (
                                  <li key={pro} className="text-sm text-muted-foreground flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    {pro}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                Consideraciones
                              </h4>
                              <ul className="space-y-2">
                                {option.cons.map((con) => (
                                  <li key={con} className="text-sm text-muted-foreground flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    {con}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-semibold text-foreground mb-3">Tips</h4>
                              <ul className="space-y-2">
                                {option.tips.slice(0, 3).map((tip) => (
                                  <li key={tip} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {(option.apps || option.companies) && (
                            <div className="mt-6 pt-6 border-t border-border">
                              <span className="text-sm text-muted-foreground mr-3">
                                {option.apps ? "Apps disponibles:" : "Empresas:"}
                              </span>
                              <div className="inline-flex flex-wrap gap-2 mt-2">
                                {(option.apps || option.companies)?.map((item) => (
                                  <Badge key={item} variant="outline">
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="terminales">
                <div className="max-w-4xl mx-auto">
                  <h3 className="font-semibold text-foreground mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Red de Terminales
                  </h3>
                  
                  <div className="space-y-4">
                    {terminales.map((terminal) => (
                      <div
                        key={terminal.nombre}
                        className="bg-card rounded-xl border border-border p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${terminal.tipo === "Premium" ? "bg-primary" : "bg-amber-500"}`} />
                          <div>
                            <h4 className="font-semibold text-foreground">{terminal.nombre}</h4>
                            <p className="text-sm text-muted-foreground">{terminal.direccion}</p>
                            {terminal.nota && (
                              <p className="text-xs text-primary">{terminal.nota}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {terminal.telefono && (
                            <Button variant="outline" size="sm" className="gap-1">
                              <Phone className="w-3 h-3" />
                              Llamar
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            Cómo llegar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-6 mt-6 justify-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-sm text-muted-foreground">Premium</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="text-sm text-muted-foreground">Local</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Consejos de Viaje */}
        <section className="py-16 bg-card/50">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
              Consejos de Viaje
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {consejosViaje.map((consejo, index) => (
                <motion.div
                  key={consejo.titulo}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-background border-border h-full">
                    <CardContent className="p-6">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <consejo.icono className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{consejo.titulo}</h3>
                      <p className="text-sm text-muted-foreground">{consejo.descripcion}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Descargar Guía PDF
              </Button>
            </div>
          </div>
        </section>

        {/* Common Routes */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              Rutas Comunes
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {routes.map((route) => (
                <Card key={`${route.from}-${route.to}`} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{route.from}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{route.to}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {route.distance}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {route.time}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {route.transport}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Local Transport Tips */}
        <section className="py-16 bg-card/50">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8">
              Transporte Local
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {tips.map((tip) => (
                <Card key={tip.title} className="bg-background border-border">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <tip.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{tip.title}</h3>
                    <p className="text-sm text-muted-foreground">{tip.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-2xl font-bold text-primary-foreground mb-4">
              ¿Prefieres un traslado privado?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
              Reserva taxis certificados o vans para mayor comodidad y seguridad.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" variant="secondary">Cotizar Traslado</Button>
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Ver Empresas Seguras
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
