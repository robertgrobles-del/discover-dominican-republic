import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Train, Clock, MapPin, DollarSign, Users, Shield, ChevronRight, AlertCircle, Info } from "lucide-react";

const lineas = [
  {
    nombre: "Línea 1",
    color: "bg-blue-500",
    textColor: "text-blue-400",
    ruta: "Villa Mella → Centro de los Héroes",
    estaciones: 16,
    longitud: "14.5 km",
    inauguracion: "2009",
    estacionesList: [
      "Mamá Tingó", "Gregorio Urbano Gilbert", "Hermanas Mirabal", "Máximo Gómez",
      "Peña Gómez (Horacio Vásquez)", "Pedro Livio Cedeño", "Casandra Damirón",
      "Prof. Juan Bosch", "Joaquín Balaguer", "Amín Abel Hasbún",
      "Juan Pablo Duarte", "Juan Ulises García Saleta (Centro Olímpico)",
      "Francisco Alberto Caamaño Deñó", "Coronel Rafael Fernández Domínguez",
      "María Montez", "Centro de los Héroes"
    ],
  },
  {
    nombre: "Línea 2",
    color: "bg-red-500",
    textColor: "text-red-400",
    ruta: "Las Américas → Eduardo Brito (Hainamosa → Independencia)",
    estaciones: 18,
    longitud: "18.5 km",
    inauguracion: "2013",
    estacionesList: [
      "Las Américas", "Los Trinitarios", "San Isidro", "Los Mameyes",
      "Sabana Perdida", "Mendoza", "La 40", "Charles de Gaulle", "Las Palmas",
      "Ercilia Pepín", "Juan Pablo Duarte (Transferencia L1)", "Ulises Francisco Espaillat",
      "Mauricio Báez", "Pedro Mir", "Gregorio Luperón", "Freddy Beras Goico",
      "Francisco del Rosario Sánchez", "Eduardo Brito"
    ],
  },
];

const tarifas = [
  { tipo: "Pasaje Regular", precio: "RD$ 35", nota: "Viaje sencillo" },
  { tipo: "Tarjeta Recargable", precio: "RD$ 60", nota: "Incluye RD$25 de primer viaje" },
  { tipo: "Recarga Mínima", precio: "RD$ 25", nota: "Equivalente a un viaje" },
  { tipo: "Estudiantes", precio: "RD$ 15", nota: "Con carnet estudiantil vigente" },
];

const horarios = [
  { dia: "Lunes a Viernes", horario: "6:00 AM - 10:30 PM" },
  { dia: "Sábados", horario: "6:00 AM - 10:00 PM" },
  { dia: "Domingos y Feriados", horario: "6:00 AM - 10:00 PM" },
];

const consejos = [
  "Evita las horas pico (7-9 AM y 5-7 PM) para viajar más cómodo",
  "La tarjeta recargable te ahorra tiempo en las filas de boletería",
  "La estación Juan Pablo Duarte es la estación de transferencia entre ambas líneas",
  "El metro es con aire acondicionado — ideal para escapar del calor tropical",
  "Hay WiFi gratuito en algunas estaciones",
  "Los vagones para mujeres están habilitados en horas pico",
];

export default function MetroSantoDomingo() {
  return (
    <PageTransition>
      <SEOHead
        title="Metro de Santo Domingo - Transporte en RD | DescubreRD"
        description="Guía completa del Metro de Santo Domingo: líneas, estaciones, tarifas, horarios y consejos para moverse por la capital dominicana."
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="pt-24 pb-16 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <Train className="h-3 w-3 mr-1" /> TRANSPORTE PÚBLICO
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Metro de <span className="text-gradient">Santo Domingo</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                El primer sistema de metro del Caribe insular. Dos líneas que conectan los principales puntos de la capital dominicana de forma rápida, segura y económica.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { label: "Líneas", value: "2" },
                { label: "Estaciones", value: "34" },
                { label: "Km de red", value: "33" },
                { label: "Pasajeros/día", value: "300K+" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-display text-3xl font-bold text-primary">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="lineas" className="w-full">
              <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-8">
                <TabsTrigger value="lineas">Líneas y Estaciones</TabsTrigger>
                <TabsTrigger value="tarifas">Tarifas y Horarios</TabsTrigger>
                <TabsTrigger value="consejos">Consejos</TabsTrigger>
              </TabsList>

              <TabsContent value="lineas">
                <div className="space-y-8">
                  {lineas.map((linea) => (
                    <Card key={linea.nombre} className="border-border overflow-hidden">
                      <div className={`h-2 ${linea.color}`} />
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-display text-xl font-bold text-foreground">{linea.nombre}</h3>
                            <p className="text-sm text-muted-foreground">{linea.ruta}</p>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <p>{linea.estaciones} estaciones · {linea.longitud}</p>
                            <p>Desde {linea.inauguracion}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {linea.estacionesList.map((est, i) => (
                            <Badge key={est} variant="outline" className="text-xs">
                              <span className={`w-2 h-2 rounded-full ${linea.color} mr-1.5`} />
                              {est}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="tarifas">
                <div className="max-w-2xl mx-auto space-y-8">
                  <Card className="border-border">
                    <CardContent className="p-6">
                      <h3 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" /> Tarifas
                      </h3>
                      <div className="space-y-3">
                        {tarifas.map((t) => (
                          <div key={t.tipo} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                            <div>
                              <p className="font-medium text-foreground">{t.tipo}</p>
                              <p className="text-xs text-muted-foreground">{t.nota}</p>
                            </div>
                            <Badge variant="secondary" className="text-sm font-bold">{t.precio}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardContent className="p-6">
                      <h3 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" /> Horarios de Operación
                      </h3>
                      <div className="space-y-3">
                        {horarios.map((h) => (
                          <div key={h.dia} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                            <p className="font-medium text-foreground">{h.dia}</p>
                            <p className="text-muted-foreground">{h.horario}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                        <Info className="h-3 w-3" /> Frecuencia: cada 3-6 minutos en hora pico, 8-12 minutos fuera de hora pico
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="consejos">
                <div className="max-w-2xl mx-auto">
                  <Card className="border-border">
                    <CardContent className="p-6">
                      <h3 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" /> Consejos para el Viajero
                      </h3>
                      <div className="space-y-3">
                        {consejos.map((c, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                            <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-muted-foreground">{c}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
