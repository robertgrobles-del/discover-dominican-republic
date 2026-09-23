import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { 
  Users, Building2, MapPin, Utensils, Bus, Headphones, 
  Languages, Play, Search, ChevronDown, CheckCircle2, 
  Sparkles, Calendar, Award, PhoneCall, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { PanoramaAd } from "@/components/promo";
import heroBeach from "@/assets/hero-beach.jpg";
import hotelBillini from "@/assets/hotel-billini.jpg";
import santoDomingo from "@/assets/santo-domingo.jpg";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import laRomanaImg from "@/assets/la-romana.jpg";

const venues = [
  {
    id: "m1",
    nombre: "Hard Rock Hotel & Casino Punta Cana",
    ubicacion: "Bávaro, Punta Cana",
    tipo: "Centro de Convenciones & Hotel",
    capacidad: "Hasta 3,960 Pax",
    salones: "15 Salones de Conferencias",
    imagen: puntaCanaImg,
    destacados: "El centro de convenciones más grande de Punta Cana con tecnología audiovisual de última generación y 1,800 habitaciones para delegaciones."
  },
  {
    id: "m2",
    nombre: "Centro de Convenciones Sans Soucí",
    ubicacion: "Santo Domingo Este",
    tipo: "Exposiciones & Macro-Eventos",
    capacidad: "Hasta 8,000 Pax",
    salones: "5,000 m² libres de columnas",
    imagen: santoDomingo,
    destacados: "Ubicado frente al Río Ozama con acceso directo a terminal de cruceros y a 5 minutos de los hoteles corporativos de la capital."
  },
  {
    id: "m3",
    nombre: "Casa de Campo Resort & Centro de Conferencias",
    ubicacion: "La Romana",
    tipo: "Resort VIP & Incentivos",
    capacidad: "Hasta 1,200 Pax",
    salones: "8 Salas + Anfiteatro 5,000 Pax",
    imagen: laRomanaImg,
    destacados: "El destino predilecto para viajes de incentivo, cumbres ejecutivas de alto nivel y torneos de golf corporativos en Teeth of the Dog."
  },
  {
    id: "m4",
    nombre: "Barceló Bávaro Convention Center",
    ubicacion: "Punta Cana",
    tipo: "Centro Internacional de Congresos",
    capacidad: "Hasta 5,000 Pax",
    salones: "13 Salas Modulares",
    imagen: heroBeach,
    destacados: "Espacios de exhibición polivalentes con servicio de catering certificado y playa privada para cenas de gala al aire libre."
  },
];

const servicios = [
  { nombre: "Catering Gourmet & Banquetes", icon: Utensils, desc: "Menús temáticos criollos e internacionales con certificación HACCP." },
  { nombre: "Transporte VIP & Transfers", icon: Bus, desc: "Flota de autobuses ejecutivos con WiFi y recepción personalizada en aeropuertos." },
  { nombre: "Producción Audiovisual & LED", icon: Headphones, desc: "Pantallas gigantes, streaming híbrido 4K y sonido profesional para conciertos." },
  { nombre: "Traducción e Interpretación", icon: Languages, desc: "Cabinas de interpretación simultánea en inglés, francés, alemán y portugués." },
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
  const [searchQuery, setSearchQuery] = useState("");

  const factorEspacio = {
    Teatro: 1,
    Banquete: 1.5,
    Aula: 1.3,
    Cocktail: 0.8
  };
  const espacioNecesario = Math.round(asistentes[0] * (factorEspacio[tipoMontaje as keyof typeof factorEspacio] || 1));
  const alturaMinima = asistentes[0] > 200 ? 4.5 : 3.5;

  const filteredVenues = venues.filter(v => 
    v.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.ubicacion.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.tipo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageTransition>
      <SEOHead
        title="Turismo MICE, Congresos y Eventos en República Dominicana | Descubre RD"
        description="Infraestructura de clase mundial para congresos, convenciones, viajes de incentivo y ferias internacionales en Santo Domingo, Punta Cana y La Romana."
        keywords="turismo mice dominicana, congresos punta cana, centro de convenciones santo domingo, eventos corporativos republica dominicana, rfp eventos rd"
      />
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="pb-20">
          {/* Hero Corporativo de Alta Gama */}
          <section className="relative min-h-[55vh] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <img 
                src={santoDomingo} 
                alt="Eventos y Congresos Internacionales en República Dominicana" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-slate-900/80 to-slate-900/40" />
            </div>
            
            <div className="relative z-10 container mx-auto px-4 py-16 text-center max-w-4xl text-white">
              <Badge className="mb-4 bg-cyan-500/20 text-cyan-300 border-cyan-400/40 backdrop-blur-md px-3 py-1 font-semibold">
                ⭐ Líder del Caribe en Turismo MICE & Eventos
              </Badge>
              <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight mb-4 drop-shadow-md">
                Congresos, Convenciones & <br />
                <span className="text-cyan-400 italic">Viajes de Incentivo</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow">
                Infraestructura de clase mundial, conectividad aérea directa con más de 70 ciudades y la calidez hospitalaria del Caribe para tus eventos corporativos.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center mt-8">
                <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold gap-2 shadow-md">
                  <Building2 className="h-4 w-4" /> Solicitar Propuesta (RFP)
                </Button>
                <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm">
                  Descargar Dossier MICE 2026
                </Button>
              </div>
            </div>
          </section>

          {/* Buscador de Espacios y Filtros */}
          <section className="container mx-auto px-4 -mt-8 relative z-20 max-w-4xl">
            <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por venue, ciudad (ej. Punta Cana, Santo Domingo) o capacidad..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-background"
                />
              </div>
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold h-11 px-6">
                Buscar Espacios
              </Button>
            </div>
          </section>

          {/* Directorio de Venues */}
          <section className="container mx-auto px-4 mt-16 max-w-6xl">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest block mb-1">Centros de Eventos</span>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  Venues y Hoteles de Convenciones Destacados
                </h2>
              </div>
              <span className="text-xs text-muted-foreground font-semibold">
                Mostrando {filteredVenues.length} espacios
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredVenues.map((venue) => (
                <Card key={venue.id} className="overflow-hidden border border-border/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img 
                        src={venue.imagen} 
                        alt={venue.nombre} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      <Badge className="absolute top-3 right-3 bg-slate-950/80 text-cyan-300 border-cyan-500/30 text-[10px] font-semibold">
                        {venue.tipo}
                      </Badge>

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h3 className="font-display font-bold text-lg leading-tight drop-shadow">{venue.nombre}</h3>
                        <p className="text-xs text-white/90 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-cyan-400" /> {venue.ubicacion}
                        </p>
                      </div>
                    </div>

                    <CardContent className="p-5 space-y-4">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {venue.destacados}
                      </p>

                      <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl border border-border/50 text-xs">
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold block">Capacidad Máxima</span>
                          <span className="font-extrabold text-foreground flex items-center gap-1 mt-0.5">
                            <Users className="h-3.5 w-3.5 text-cyan-500" /> {venue.capacidad}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold block">Espacios & Salones</span>
                          <span className="font-extrabold text-foreground flex items-center gap-1 mt-0.5">
                            <Building2 className="h-3.5 w-3.5 text-cyan-500" /> {venue.salones}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </div>

                  <div className="p-5 pt-0">
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold hover:border-cyan-500 hover:text-cyan-500">
                      Ver Ficha Técnica y Planos
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Calculadora de Espacio y Aforo */}
          <section className="container mx-auto px-4 mt-16 max-w-5xl">
            <Card className="border border-border/80 shadow-md overflow-hidden">
              <div className="p-6 md:p-8 bg-muted/20 border-b">
                <Badge className="mb-2 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 text-xs font-semibold">
                  📐 Dimensionamiento Inteligente
                </Badge>
                <h2 className="text-2xl font-display font-bold text-foreground">
                  Calculadora de Capacidad y Metraje
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Estima el área requerida en metros cuadrados según la cantidad de delegados y el formato de montaje.
                </p>
              </div>

              <CardContent className="p-6 md:p-8 grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2 text-xs font-bold">
                      <span className="text-foreground">Número de Asistentes:</span>
                      <span className="text-cyan-600 dark:text-cyan-400 font-mono text-base">{asistentes[0]} Personas</span>
                    </div>
                    <Slider 
                      value={asistentes} 
                      onValueChange={setAsistentes}
                      min={20}
                      max={1500}
                      step={10}
                      className="py-2"
                    />
                  </div>

                  <div>
                    <span className="text-xs font-bold text-foreground block mb-2">Formato de Montaje:</span>
                    <div className="grid grid-cols-4 gap-2">
                      {tiposMontaje.map((tipo) => (
                        <button
                          key={tipo.nombre}
                          type="button"
                          onClick={() => setTipoMontaje(tipo.nombre)}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            tipoMontaje === tipo.nombre 
                              ? "bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold" 
                              : "bg-muted/30 border-border/60 text-muted-foreground hover:border-border"
                          }`}
                        >
                          <span className="text-xl block mb-1">{tipo.icon}</span>
                          <span className="text-[11px]">{tipo.nombre}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Resultados */}
                <div className="bg-muted/40 border border-border/80 rounded-2xl p-6 space-y-4">
                  <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Dimensiones Sugeridas</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-background rounded-xl border">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase block">Área Mínima</span>
                      <span className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">{espacioNecesario}</span>
                      <span className="text-xs text-muted-foreground ml-1">m²</span>
                    </div>

                    <div className="p-4 bg-background rounded-xl border">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase block">Altura de Techo</span>
                      <span className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">{alturaMinima}</span>
                      <span className="text-xs text-muted-foreground ml-1">metros</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    * El cálculo contempla pasillos de seguridad, tarima para ponentes y espacio para traducción simultánea reglamentaria.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Servicios Complementarios */}
          <section className="container mx-auto px-4 mt-16 max-w-6xl">
            <h2 className="font-display text-2xl font-bold text-foreground text-center mb-8">
              Servicios Especializados para Eventos Corporativos
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {servicios.map((serv) => {
                const IconC = serv.icon;
                return (
                  <Card key={serv.nombre} className="border border-border/80 shadow-xs p-5 space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                      <IconC className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-foreground text-sm">{serv.nombre}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{serv.desc}</p>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Formulario RFP */}
          <section className="container mx-auto px-4 mt-16 max-w-5xl">
            <div className="bg-gradient-to-br from-cyan-600 via-teal-700 to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-xl">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <Badge className="bg-white/20 text-white border-white/30 text-xs mb-3">
                    ⚡ Ventanilla Única MICE
                  </Badge>
                  <h2 className="font-display text-3xl font-bold mb-4">
                    Cotiza tu Evento con Proveedores Certificados
                  </h2>
                  <p className="text-white/80 text-sm leading-relaxed mb-6">
                    Envía tu solicitud de propuesta (RFP) y recibe hasta 3 propuestas integrales de centros de convenciones y agencias DMC dominicanas en menos de 48 horas.
                  </p>
                  <div className="space-y-2 text-xs text-white/90">
                    <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-300" /> Tarifas corporativas exclusivas</p>
                    <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-300" /> Asistencia en trámites aduaneros para ferias</p>
                    <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-300" /> Inspecciones técnicas de locación (Site Inspections)</p>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Nombre Completo" className="bg-white/10 border-white/30 text-white placeholder:text-white/60 text-xs" />
                    <Input placeholder="Empresa / Asociación" className="bg-white/10 border-white/30 text-white placeholder:text-white/60 text-xs" />
                  </div>
                  <Input type="email" placeholder="Correo Electrónico Corporativo" className="bg-white/10 border-white/30 text-white placeholder:text-white/60 text-xs" />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Fecha Estimada" className="bg-white/10 border-white/30 text-white placeholder:text-white/60 text-xs" />
                    <Input placeholder="Delegados Estimados" className="bg-white/10 border-white/30 text-white placeholder:text-white/60 text-xs" />
                  </div>

                  <Button className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs h-10 shadow-md">
                    Enviar Solicitud RFP Inmediata
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Banner Publicitario Panorama */}
          <section className="container mx-auto px-4 mt-16 max-w-5xl">
            <PanoramaAd />
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
