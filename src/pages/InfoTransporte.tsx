import { motion } from "framer-motion";
import { 
  Car, Bus, MapPin, Clock, 
  ChevronRight, AlertCircle, CheckCircle2, Phone, Download, Navigation,
  CreditCard, ShieldCheck, Search, ArrowRight
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
import { BetweenSectionsAd } from "@/components/promo";
import { SEOHead } from "@/components/SEOHead";
import { 
  operadoresPremium, 
  sistemasMasivos, 
  peajesPasoRapido, 
  rutasGuaguas, 
  consejosViaje, 
  transportOptions, 
  routes, 
  localTips 
} from "@/data/transporteData";

export default function InfoTransporte() {
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");

  return (
    <PageTransition>
      <SEOHead
        title="Transporte en República Dominicana: Autobuses, Metro y Rutas"
        description="Guía completa de movilidad en RD: autobuses interurbanos premium, metro y teleférico de Santo Domingo, guaguas locales, peajes de Paso Rápido y calculadora de rutas."
      />
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

              {/* Buscador y Calculador Interactivo de Rutas */}
              <div className="max-w-3xl mx-auto bg-card rounded-2xl border border-border/80 shadow-lg p-5">
                <div className="text-left mb-3">
                  <p className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-primary" />
                    Calculadora de Tiempos, Distancias y Opciones
                  </p>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <Input
                    placeholder="Ej: Santo Domingo, Santiago..."
                    value={origen}
                    onChange={(e) => setOrigen(e.target.value)}
                    className="bg-background"
                  />
                  <Input
                    placeholder="Ej: Punta Cana, Las Terrenas..."
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                    className="bg-background"
                  />
                  <Button className="w-full font-semibold shadow-xs">
                    <Search className="h-4 w-4 mr-1.5" />
                    Calcular Ruta
                  </Button>
                </div>

                {(origen || destino) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pt-4 border-t border-border/60 grid sm:grid-cols-3 gap-3 text-left"
                  >
                    <div className="p-3 bg-secondary/30 rounded-xl border border-border/40">
                      <p className="text-[11px] text-muted-foreground uppercase font-semibold">🚌 Autobús Premium</p>
                      <p className="text-sm font-bold text-foreground mt-0.5">RD$ 400 - 550</p>
                      <p className="text-[11px] text-muted-foreground">Frecuencias diarias cada hora</p>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-xl border border-border/40">
                      <p className="text-[11px] text-muted-foreground uppercase font-semibold">🚗 Rent-a-Car / Auto</p>
                      <p className="text-sm font-bold text-primary mt-0.5">2h - 3h 15m</p>
                      <p className="text-[11px] text-muted-foreground">Autopistas señalizadas + Paso Rápido</p>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-xl border border-border/40">
                      <p className="text-[11px] text-muted-foreground uppercase font-semibold">🚕 Transfer Privado</p>
                      <p className="text-sm font-bold text-foreground mt-0.5">US$ 60 - 120</p>
                      <p className="text-[11px] text-muted-foreground">Directo puerta a puerta</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tabs de Opciones */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="premium" className="w-full">
              <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-2 sm:grid-cols-5 mb-8">
                <TabsTrigger value="premium">Autobuses Interurbanos</TabsTrigger>
                <TabsTrigger value="urbanos">Metro & Monorriel</TabsTrigger>
                <TabsTrigger value="guaguas">Guaguas Locales</TabsTrigger>
                <TabsTrigger value="privados">Apps & Rent-a-Car</TabsTrigger>
                <TabsTrigger value="peajes">Peajes Paso Rápido</TabsTrigger>
              </TabsList>

              {/* Autobuses Premium Interurbanos */}
              <TabsContent value="premium">
                <div className="text-center mb-8">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Autobuses Premium Interurbanos
                  </h2>
                  <p className="text-muted-foreground">
                    La forma más confiable, segura y económica para viajar entre provincias y polos turísticos
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {operadoresPremium.map((op, index) => (
                    <motion.div
                      key={op.nombre}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-card border-border h-full flex flex-col justify-between hover:shadow-lg transition-all">
                        <CardContent className="p-6 flex flex-col justify-between h-full">
                          <div>
                            <div className="flex items-center gap-3 mb-4">
                              <img
                                src={op.logo}
                                alt={op.nombre}
                                className="w-14 h-14 rounded-xl object-cover shadow-xs border border-border"
                              />
                              <div>
                                <h3 className="font-bold text-foreground text-base leading-tight">{op.nombre}</h3>
                                <p className="text-xs text-primary font-medium">{op.tarifaPromedio}</p>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{op.descripcion}</p>
                            
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {op.servicios.map((serv) => (
                                <Badge key={serv} variant="secondary" className="text-[10px] px-2 py-0.5">
                                  {serv}
                                </Badge>
                              ))}
                            </div>

                            <div className="space-y-2 mb-4 bg-secondary/30 p-3 rounded-lg border border-border/60">
                              <p className="text-[11px] font-bold text-foreground uppercase tracking-wide">Frecuencias y Tramos:</p>
                              {op.rutas.map((ruta) => (
                                <div key={ruta.tramo} className="text-xs text-muted-foreground flex justify-between items-center">
                                  <span className="truncate mr-2 flex items-center gap-1 font-medium text-foreground">
                                    <ChevronRight className="w-3 h-3 text-primary shrink-0" />
                                    {ruta.tramo}
                                  </span>
                                  <span className="text-[11px] shrink-0 text-primary font-semibold">{ruta.tiempo}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-border/60">
                            <p className="text-[11px] text-muted-foreground mb-2 truncate">
                              📍 {op.terminalPrincipal}
                            </p>
                            <a href={`tel:${op.telefono.replace(/[^0-9]/g, '')}`} className="block">
                              <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                                <Phone className="w-3.5 h-3.5 text-primary" />
                                {op.telefono}
                              </Button>
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* Metro, Teleférico y Monorriel */}
              <TabsContent value="urbanos">
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                      Sistemas Urbanos Masivos (Metro, Teleférico & Monorriel)
                    </h2>
                    <p className="text-muted-foreground">
                      La red de transporte público moderno y rápido de Santo Domingo y Santiago
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {sistemasMasivos.map((sis) => (
                      <Card key={sis.sistema} className="bg-card border-border hover:border-primary/50 transition-colors flex flex-col justify-between">
                        <CardContent className="p-6">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                            <sis.icono className="w-6 h-6 text-primary" />
                          </div>
                          <Badge className="mb-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
                            {sis.estado}
                          </Badge>
                          <h3 className="font-bold text-foreground text-lg mb-1">{sis.sistema}</h3>
                          <p className="text-xs font-semibold text-primary mb-3">Tarifa: {sis.tarifa}</p>
                          <p className="text-xs text-muted-foreground mb-3">{sis.cobertura}</p>
                          
                          <div className="bg-secondary/40 p-3 rounded-lg text-[11px] text-muted-foreground space-y-1 mb-4">
                            <p><strong>⏰ Horario:</strong> {sis.horario}</p>
                            <p><strong>💡 Consejo:</strong> {sis.consejo}</p>
                          </div>

                          <Link to={sis.link} className="block mt-auto">
                            <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                              Ver Guía y Mapa de Estaciones <ArrowRight className="w-3.5 h-3.5 text-primary" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Guaguas Locales */}
              <TabsContent value="guaguas">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-card rounded-xl border border-border p-6 mb-8">
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2 text-lg">
                      <Bus className="w-5 h-5 text-primary" />
                      ¿Cómo funcionan las Guaguas en RD?
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      Las <strong>guaguas</strong> (microbuses y autobuses medianos) son el nervio del transporte interprovincial y municipal. Conectan pueblos, parajes y cruces de carreteras donde los grandes autobuses no llegan. Se abordan en paradas establecidas o haciéndoles una seña con la mano en la carretera.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-border">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-xs text-muted-foreground">Económicas y de alta frecuencia</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-xs text-muted-foreground">Pago únicamente en efectivo en pesos</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-xs text-muted-foreground">Avisa al 'cobrador' antes de tu bajada</span>
                      </div>
                    </div>
                  </div>

                  <h4 className="font-semibold text-foreground mb-4">Tarifas y Rutas de Guaguas más Utilizadas</h4>
                  <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-secondary/40">
                        <tr>
                          <th className="text-left p-4 text-xs font-semibold text-foreground">Tramo / Ruta</th>
                          <th className="text-left p-4 text-xs font-semibold text-foreground">Frecuencia</th>
                          <th className="text-left p-4 text-xs font-semibold text-foreground">Tiempo Promedio</th>
                          <th className="text-right p-4 text-xs font-semibold text-foreground">Precio Est. (2026)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-xs">
                        {rutasGuaguas.map((ruta) => (
                          <tr key={ruta.ruta} className="hover:bg-secondary/20 transition-colors">
                            <td className="p-4 font-medium text-foreground">{ruta.ruta}</td>
                            <td className="p-4 text-muted-foreground">{ruta.frecuencia}</td>
                            <td className="p-4 text-muted-foreground">{ruta.tiempo}</td>
                            <td className="p-4 text-right font-bold text-primary">{ruta.precio}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              {/* Apps y Privados */}
              <TabsContent value="privados">
                <div className="space-y-8 max-w-4xl mx-auto">
                  {transportOptions.map((option, index) => (
                    <motion.div
                      key={option.type}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-card border-border overflow-hidden">
                        <CardHeader className="bg-secondary/30 p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <option.icon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{option.type}</CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs px-3 py-1 font-bold text-primary shrink-0 self-start sm:self-auto">
                              {option.priceRange}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="grid md:grid-cols-3 gap-6">
                            <div>
                              <h4 className="font-semibold text-foreground mb-2 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                Ventajas
                              </h4>
                              <ul className="space-y-1.5">
                                {option.pros.map((pro) => (
                                  <li key={pro} className="text-xs text-muted-foreground flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                                    {pro}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-semibold text-foreground mb-2 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                                A tener en cuenta
                              </h4>
                              <ul className="space-y-1.5">
                                {option.cons.map((con) => (
                                  <li key={con} className="text-xs text-muted-foreground flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                                    {con}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-semibold text-foreground mb-2 text-xs uppercase tracking-wide">Recomendaciones</h4>
                              <ul className="space-y-1.5">
                                {option.tips.map((tip) => (
                                  <li key={tip} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                    <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {(option.apps || option.companies) && (
                            <div className="mt-5 pt-4 border-t border-border/60 flex flex-wrap items-center gap-2">
                              <span className="text-xs text-muted-foreground font-medium">
                                {option.apps ? "Plataformas autorizadas:" : "Compañías recomendadas:"}
                              </span>
                              {(option.apps || option.companies)?.map((item) => (
                                <Badge key={item} variant="outline" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* Peajes y Paso Rápido */}
              <TabsContent value="peajes">
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="bg-card rounded-xl border border-border p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-lg">Sistema Paso Rápido RD</h3>
                        <p className="text-xs text-muted-foreground">Tecnología RFID para cruce ágil sin hacer fila en efectivo</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                      Todas las autopistas troncales de República Dominicana cuentan con carriles exclusivos de <strong>Paso Rápido</strong>. Los vehículos de alquiler suelen contar con el dispositivo integrado o puedes solicitarlo por un cargo mínimo.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-3 bg-secondary/30 rounded-lg border border-border/50 text-xs">
                        <p className="font-semibold text-foreground mb-1">🏷️ Categoría 1 (Automóviles y SUVs):</p>
                        <p className="text-muted-foreground">La mayoría de peajes tienen un costo estándar de <strong>RD$ 60 a RD$ 100</strong> por estación.</p>
                      </div>
                      <div className="p-3 bg-secondary/30 rounded-lg border border-border/50 text-xs">
                        <p className="font-semibold text-foreground mb-1">💳 Formas de Pago en Cabina:</p>
                        <p className="text-muted-foreground">Efectivo en Pesos Dominicanos (RD$) o Tag electrónico Paso Rápido prepago.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="p-4 bg-secondary/30 border-b border-border">
                      <h4 className="font-semibold text-foreground text-sm">Tarifario de Peajes Principales</h4>
                    </div>
                    <table className="w-full text-xs">
                      <thead className="bg-secondary/20">
                        <tr>
                          <th className="text-left p-3.5 font-semibold text-foreground">Autopista / Troncal</th>
                          <th className="text-left p-3.5 font-semibold text-foreground">Estación de Peaje</th>
                          <th className="text-right p-3.5 font-semibold text-foreground">Tarifa Cat. 1</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {peajesPasoRapido.map((peaje) => (
                          <tr key={peaje.estacion} className="hover:bg-secondary/20 transition-colors">
                            <td className="p-3.5 font-medium text-foreground">{peaje.autopista}</td>
                            <td className="p-3.5 text-muted-foreground">{peaje.estacion}</td>
                            <td className="p-3.5 text-right font-bold text-primary">{peaje.precioCat1}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
            <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
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
                      <p className="text-xs text-muted-foreground leading-relaxed">{consejo.descripcion}</p>
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
              {localTips.map((tip) => (
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
              <Link to="/reserva-directa">
                <Button size="lg" variant="secondary" className="shadow-md">Cotizar Traslado Directo</Button>
              </Link>
              <Link to="/alquiler-vehiculos">
                <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Ver Rent-a-Cars Seguros
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <BetweenSectionsAd showDemo />

        <Footer />
      </div>
    </PageTransition>
  );
}
