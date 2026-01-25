import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Link } from "react-router-dom";
import { Users, Building2, MapPin, Utensils, Bus, Headphones, Languages, Play, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import heroBeach from "@/assets/hero-beach.jpg";
import hotelBillini from "@/assets/hotel-billini.jpg";
import santoDomingo from "@/assets/santo-domingo.jpg";

const venues = [
  {
    nombre: "Hard Rock Hotel Punta Cana",
    ubicacion: "Bávaro, Punta Cana",
    tipo: "HOTEL & CASINO",
    capacidad: "3,600 Pax",
    salones: "15 Salas",
    imagen: heroBeach
  },
  {
    nombre: "Centro de Convenciones Sans Soucí",
    ubicacion: "Santo Domingo",
    tipo: "CONVENTION CENTER",
    capacidad: "8,000 Pax",
    area: "5,000 m²",
    imagen: santoDomingo
  },
  {
    nombre: "Casa de Campo Resort & Villas",
    ubicacion: "La Romana",
    tipo: "RESORT & SPA",
    capacidad: "1,200 Pax",
    salones: "8 Salas",
    imagen: hotelBillini
  },
];

const servicios = [
  { nombre: "Catering & Banquetes", icon: Utensils },
  { nombre: "Transporte & Logística", icon: Bus },
  { nombre: "Audio & Visual", icon: Headphones },
  { nombre: "Traducción Simultánea", icon: Languages },
];

const tiposMontaje = [
  { nombre: "Teatro", icon: "🎭" },
  { nombre: "Banquete", icon: "🍽️" },
  { nombre: "Aula", icon: "📚" },
  { nombre: "Cocktail", icon: "🍸" },
];

export default function MICE() {
  const [asistentes, setAsistentes] = useState([250]);
  const [tipoMontaje, setTipoMontaje] = useState("Teatro");

  // Calcular espacio estimado basado en tipo de montaje
  const factorEspacio = {
    Teatro: 1,
    Banquete: 1.5,
    Aula: 1.3,
    Cocktail: 0.8
  };
  const espacioNecesario = Math.round(asistentes[0] * (factorEspacio[tipoMontaje as keyof typeof factorEspacio] || 1));
  const alturaMinima = asistentes[0] > 200 ? 4.5 : 3.5;

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-slate-900">
        <Header />

        {/* Hero */}
        <section className="relative h-[60vh] flex items-center overflow-hidden">
          <img 
            src={santoDomingo} 
            alt="MICE en RD" 
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
          
          <div className="relative z-10 container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-cyan-500/20 text-cyan-400 border-cyan-400/30">
              ⭐ EL DESTINO LÍDER DEL CARIBE
            </Badge>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">
              Eventos y Congresos en el Paraíso
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto mb-8">
              Infraestructura de clase mundial, conectividad global y el mejor servicio del 
              Caribe para elevar tus eventos corporativos al siguiente nivel.
            </p>
            <div className="flex gap-4 justify-center">
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2">
                <Building2 className="h-4 w-4" /> Planificar mi Evento
              </Button>
              <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 gap-2">
                <Play className="h-4 w-4" /> Ver Video Destino
              </Button>
            </div>
          </div>
        </section>

        {/* Buscador */}
        <section className="py-8 px-4 -mt-16 relative z-20">
          <div className="max-w-4xl mx-auto bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  placeholder="Buscar por nombre, ciudad (ej. Punta Cana) o capacidad..." 
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
                BUSCAR
              </Button>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              <span className="text-sm text-slate-400">FILTRAR POR:</span>
              <Badge variant="outline" className="border-slate-600 text-slate-300 gap-1">
                Santo Domingo <ChevronDown className="h-3 w-3" />
              </Badge>
              <Badge className="bg-cyan-500 text-white">
                Punta Cana ✕
              </Badge>
              <Badge variant="outline" className="border-slate-600 text-slate-300 gap-1">
                Hoteles <ChevronDown className="h-3 w-3" />
              </Badge>
              <Badge variant="outline" className="border-slate-600 text-slate-300 gap-1">
                Convenciones <ChevronDown className="h-3 w-3" />
              </Badge>
              <Badge variant="outline" className="border-slate-600 text-slate-300 gap-1">
                {"> "}1000 Pax <ChevronDown className="h-3 w-3" />
              </Badge>
            </div>
          </div>
        </section>

        {/* Directorio de Venues */}
        <section className="py-16 px-4 bg-slate-900">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">
                  Directorio de Venues
                </h2>
                <p className="text-slate-400">Mostrando 42 espacios disponibles</p>
              </div>
              <Link to="/alojamientos" className="text-cyan-400 font-medium text-sm hover:underline">
                Ver todos +
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {venues.map((venue) => (
                <div key={venue.nombre} className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                  <div className="relative aspect-[16/10]">
                    <img 
                      src={venue.imagen} 
                      alt={venue.nombre}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-4 right-4 bg-slate-900/80 text-cyan-400 text-xs">
                      {venue.tipo}
                    </Badge>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-bold text-lg text-white mb-1">{venue.nombre}</h3>
                    <div className="flex items-center gap-1 text-slate-400 text-sm mb-4">
                      <MapPin className="h-3 w-3" />
                      <span>{venue.ubicacion}</span>
                    </div>
                    <div className="flex gap-6 text-sm mb-4">
                      <div>
                        <p className="text-slate-500 text-xs">Capacidad Máx</p>
                        <p className="text-white font-medium flex items-center gap-1">
                          <Users className="h-3 w-3 text-cyan-400" /> {venue.capacidad}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">{venue.area ? "Área Total" : "Salones"}</p>
                        <p className="text-white font-medium flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-cyan-400" /> {venue.area || venue.salones}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Calculadora de Capacidad */}
        <section className="py-16 px-4 bg-slate-800/50">
          <div className="max-w-5xl mx-auto">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <Badge className="mb-4 bg-cyan-500/20 text-cyan-400 border-cyan-400/30">
                    📐 PLANIFICADOR INTELIGENTE
                  </Badge>
                  <h2 className="font-display text-2xl font-bold text-white mb-2">
                    Calculadora de Capacidad
                  </h2>
                  <p className="text-slate-400 mb-8">
                    Descubre qué espacio necesitas según el número de asistentes y el 
                    tipo de montaje deseado.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">Número de Asistentes</label>
                      <div className="flex items-center gap-4">
                        <Input 
                          type="number" 
                          value={asistentes[0]} 
                          onChange={(e) => setAsistentes([parseInt(e.target.value) || 0])}
                          className="w-24 bg-slate-700 border-slate-600 text-white"
                        />
                        <span className="text-slate-400">Personas</span>
                      </div>
                      <Slider 
                        value={asistentes} 
                        onValueChange={setAsistentes}
                        max={1000}
                        step={10}
                        className="mt-4"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-slate-300 mb-3 block">Tipo de Montaje</label>
                      <div className="flex gap-3">
                        {tiposMontaje.map((tipo) => (
                          <button
                            key={tipo.nombre}
                            onClick={() => setTipoMontaje(tipo.nombre)}
                            className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                              tipoMontaje === tipo.nombre 
                                ? "bg-cyan-500/20 border-cyan-500 text-cyan-400" 
                                : "border-slate-600 text-slate-400 hover:border-slate-500"
                            }`}
                          >
                            <span className="text-xl">{tipo.icon}</span>
                            <span className="text-xs">{tipo.nombre}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Resultados Estimados</h3>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-slate-800 rounded-xl p-4">
                      <p className="text-xs text-slate-400 uppercase mb-1">Espacio Necesario</p>
                      <p className="text-3xl font-bold text-cyan-400">{espacioNecesario}<span className="text-lg font-normal text-slate-400"> m²</span></p>
                    </div>
                    <div className="bg-slate-800 rounded-xl p-4">
                      <p className="text-xs text-slate-400 uppercase mb-1">Altura Mín. Sugerida</p>
                      <p className="text-3xl font-bold text-cyan-400">{alturaMinima}<span className="text-lg font-normal text-slate-400"> m</span></p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-400 mb-4">Venues recomendados con esta capacidad:</p>
                  <div className="flex gap-2 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-slate-600" />
                    <div className="w-10 h-10 rounded-lg bg-slate-600" />
                    <div className="w-10 h-10 rounded-lg bg-slate-600 flex items-center justify-center text-xs text-slate-300">+12</div>
                  </div>

                  <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
                    Ver Venues Disponibles
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Servicios Complementarios */}
        <section className="py-16 px-4 bg-slate-900">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-white mb-8 text-center">
              Servicios Complementarios
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {servicios.map((serv) => (
                <div key={serv.nombre} className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center hover:border-cyan-500/50 transition-colors cursor-pointer">
                  <serv.icon className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-white">{serv.nombre}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA RFP */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-3xl p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
                    ¿Listo para cotizar tu evento?
                  </h2>
                  <p className="text-white/80 mb-6">
                    Envíanos tu solicitud de propuesta (RFP) y recibe cotizaciones 
                    personalizadas de los mejores proveedores y venues de República Dominicana.
                  </p>
                  <div className="flex gap-3">
                    <Badge className="bg-white/20 text-white border-white/30">
                      ✓ Proveedores Verificados
                    </Badge>
                    <Badge className="bg-white/20 text-white border-white/30">
                      ⏱ Respuesta en 24h
                    </Badge>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Nombre" className="bg-white/10 border-white/20 text-white placeholder:text-white/50" />
                    <Input placeholder="Email Corporativo" className="bg-white/10 border-white/20 text-white placeholder:text-white/50" />
                  </div>
                  <Select>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Tipo de Evento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="congreso">Congreso</SelectItem>
                      <SelectItem value="convencion">Convención</SelectItem>
                      <SelectItem value="incentivo">Viaje de Incentivo</SelectItem>
                      <SelectItem value="lanzamiento">Lanzamiento de Producto</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                    Enviar Solicitud RFP →
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
