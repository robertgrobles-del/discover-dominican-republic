import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Link } from "react-router-dom";
import { Plane, Ship, Bus, Clock, MapPin, Car, ArrowRight, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

import heroBeach from "@/assets/hero-beach.jpg";

const tiemposVuelo = [
  { ciudad: "New York", tiempo: "3h 50m" },
  { ciudad: "Madrid", tiempo: "8h 15m" },
  { ciudad: "Miami", tiempo: "2h 10m" },
  { ciudad: "Bogotá", tiempo: "2h 30m" },
  { ciudad: "Panamá", tiempo: "2h 45m" },
];

const opcionesTransporte = [
  { titulo: "Alquiler de Auto", subtitulo: "Ruta Autopista del Nordeste (Juan Pablo II)", etiqueta: "Recomendado", desc: "Flexibilidad total" },
  { titulo: "Bus Premium", subtitulo: "Caribe Tours / Metro", precio: "$10 - $15 USD", tiempo: "4h 00m" },
];

export default function ComoLlegar() {
  const [heroLoaded, setHeroLoaded] = useState(false);

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        {/* Hero */}
        <section className="relative py-24 flex items-center justify-center overflow-hidden mt-16">
          {!heroLoaded && <Skeleton className="absolute inset-0" />}
          <img
            src={heroBeach}
            alt="Cómo Llegar a RD"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              heroLoaded ? "opacity-30" : "opacity-0"
            }`}
            onLoad={() => setHeroLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />
          
          <div className="relative z-10 text-center px-4">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 italic">
              Cómo Llegar a RD y Moverse
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Tu guía logística completa para explorar la República Dominicana. Encuentra conexiones aéreas, marítimas y calcula tus rutas internas.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto flex items-center gap-2 bg-card rounded-xl p-2 border border-border">
              <div className="flex items-center gap-2 flex-1 px-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="¿A dónde quieres ir hoy?" 
                  className="border-0 bg-transparent focus-visible:ring-0"
                />
              </div>
              <Button className="gap-2">
                Buscar Ruta
              </Button>
            </div>
          </div>
        </section>

        {/* Llegada Internacional */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-primary rounded" />
              <h2 className="font-display text-2xl font-bold text-foreground">Llegada Internacional</h2>
            </div>
            
            <p className="text-muted-foreground max-w-2xl mb-12">
              La República Dominicana es el destino mejor conectado del Caribe, con 8 aeropuertos internacionales y múltiples puertos de cruceros recibiendo visitantes diariamente.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Plane className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Aeropuertos Internacionales</h3>
                <p className="text-sm text-muted-foreground">
                  Punta Cana (PUJ), Santo Domingo (SDQ), Santiago (STI) y Puerto Plata (POP) concentran el 90% de los vuelos.
                </p>
              </div>
              
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Ship className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Puertos de Cruceros</h3>
                <p className="text-sm text-muted-foreground">
                  Terminales turísticas de clase mundial en Amber Cove, Taino Bay, La Romana y Sans Souci.
                </p>
              </div>
              
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Bus className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Ferry del Caribe</h3>
                <p className="text-sm text-muted-foreground">
                  Conexión marítima regular para pasajeros y vehículos entre San Juan, Puerto Rico y Santo Domingo.
                </p>
              </div>
            </div>

            {/* Tiempos de Vuelo */}
            <div className="mb-12">
              <h3 className="font-semibold text-foreground mb-4">Conectividad Directa (Tiempo de Vuelo)</h3>
              <div className="flex flex-wrap gap-4">
                {tiemposVuelo.map((vuelo) => (
                  <div key={vuelo.ciudad} className="bg-card rounded-xl border border-border px-6 py-4">
                    <Plane className="h-5 w-5 text-primary mb-2" />
                    <p className="font-semibold text-foreground">{vuelo.ciudad}</p>
                    <p className="text-sm text-muted-foreground">{vuelo.tiempo}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Traslado Interno */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-primary rounded" />
              <h2 className="font-display text-2xl font-bold text-foreground">Traslado Interno y Rutas</h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Calculadora */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 text-primary mb-4">
                  <Car className="h-5 w-5" />
                  <h3 className="font-semibold">Calculadora de Ruta</h3>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">ORIGEN</label>
                    <Select defaultValue="sdq">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sdq">Santo Domingo (SDQ)</SelectItem>
                        <SelectItem value="puj">Punta Cana (PUJ)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">DESTINO</label>
                    <Select defaultValue="samana">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="samana">Samaná (Las Terrenas)</SelectItem>
                        <SelectItem value="punta-cana">Punta Cana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/50 rounded-lg mb-6">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">DISTANCIA ESTIMADA</p>
                    <p className="text-2xl font-bold text-foreground">178 km</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">TIEMPO (AUTO)</p>
                    <p className="text-2xl font-bold text-primary">2h 30m</p>
                  </div>
                </div>

                <Button className="w-full">Ver Detalles de Ruta</Button>

                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">OPCIONES RECOMENDADAS</p>
                  <div className="space-y-3">
                    {opcionesTransporte.map((opcion) => (
                      <div key={opcion.titulo} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Car className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground text-sm">{opcion.titulo}</p>
                            <p className="text-xs text-muted-foreground">{opcion.subtitulo}</p>
                          </div>
                        </div>
                        {opcion.etiqueta ? (
                          <Badge className="bg-emerald-500/10 text-emerald-500">{opcion.etiqueta}</Badge>
                        ) : (
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">{opcion.precio}</p>
                            <p className="text-xs text-muted-foreground">{opcion.tiempo}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mapa */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="aspect-square bg-secondary relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Mapa interactivo de rutas</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-border flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">VISTA PREVIA</p>
                    <p className="font-medium text-foreground">Ruta Visualizada</p>
                    <p className="text-sm text-muted-foreground">Santo Domingo → Samaná</p>
                  </div>
                  <Button size="icon" variant="ghost">
                    <Maximize2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
