import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Link } from "react-router-dom";
import { Anchor, MapPin, Clock, Wifi, CreditCard, Pill, Info, Car, Bus, ShipWheel, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import santoDomingo from "@/assets/santo-domingo.jpg";
import puertoPlata from "@/assets/puerto-plata.jpg";
import adventure from "@/assets/adventure.jpg";
import heroBeach from "@/assets/hero-beach.jpg";

const puertos = [
  {
    nombre: "Amber Cove",
    ubicacion: "Puerto Plata",
    descripcion: "Terminal moderna de Carnival con parque acuático y cabañas.",
    imagen: puertoPlata,
    tags: ["Piscinas", "Zip Line"]
  },
  {
    nombre: "Taino Bay",
    ubicacion: "Puerto Plata",
    descripcion: "Terminal vibrante con río lento, avario y restaurantes.",
    imagen: adventure,
    tags: ["Río Lento", "Motos"]
  },
  {
    nombre: "Sans Soucí",
    ubicacion: "Santo Domingo",
    descripcion: "Acceso directo a la Zona Colonial, Primera de América.",
    imagen: santoDomingo,
    tags: ["Historia", "Cultura"]
  }
];

const itinerario = [
  { hora: "9:00 AM", titulo: "Desembarque y Bienvenida", desc: "Disfruta de la música típica y tómate fotos en el letrero del puerto." },
  { hora: "10:00 AM", titulo: "Transporte al Centro", desc: "Toma un taxi autorizado o shuttle hacia el centro histórico o playa." },
  { hora: "11:00 AM - 1:00 PM", titulo: "Exploración y Cultura", desc: "Visita museos, camina por calles coloniales y compra artesanías locales." },
  { hora: "1:30 PM", titulo: "Almuerzo Dominicano", desc: 'Prueba el "Mofongo" o la "Bandera" en un restaurante certificado.' },
  { hora: "4:00 PM", titulo: "Regreso al Barco", desc: "Tiempo de sobra para abordar con seguridad antes de zarpar." },
];

const serviciosTerminal = [
  { nombre: "Wi-Fi Gratis", icon: Wifi },
  { nombre: "ATM / Cajeros", icon: CreditCard },
  { nombre: "Parada Taxis", icon: Car },
  { nombre: "Farmacia", icon: Pill },
  { nombre: "Duty Free", icon: ShipWheel },
  { nombre: "Info Point", icon: Info },
];

const excursiones = [
  {
    nombre: "27 Charcos de Damajagua",
    descripcion: "Aventura de saltos y toboganes naturales en...",
    precio: 55,
    duracion: "4 Horas",
    imagen: adventure,
  },
  {
    nombre: "City Tour Colonial",
    descripcion: "Recorrido histórico por la primera ciudad de América.",
    precio: 45,
    duracion: "3 Horas",
    imagen: santoDomingo,
  },
  {
    nombre: "Ron & Tabaco",
    descripcion: "Experiencia sensorial probando los mejores...",
    precio: 35,
    duracion: "2 Horas",
    imagen: heroBeach,
  },
  {
    nombre: "Día de Playa VIP",
    descripcion: "Relajación total con almuerzo y bebidas incluid.",
    precio: 65,
    duracion: "5 Horas",
    imagen: puertoPlata,
  },
];

const transporte = [
  { tipo: "Taxis Turísticos", desc: "Tarifas fijas reguladas por el sindicato. Seguros y disponibles en la salida.", precio: "$20 - $35" },
  { tipo: "Shuttle de Excursión", desc: "Ideal para grupos. Incluye guía y regreso garantizado a tiempo.", precio: "$15 / persona" },
  { tipo: "Rent-a-Car", desc: "Para los aventureros. Se requiere licencia válida y tarjeta de crédito.", precio: "$50 / día" },
];

export default function Cruceros() {
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden aspect-[16/9] mb-8">
              <img 
                src={santoDomingo} 
                alt="Cruceros en RD" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
              <div className="absolute inset-0 flex items-center px-8 md:px-16">
                <div className="max-w-lg">
                  <Badge className="mb-4 bg-cyan-500/20 text-cyan-400 border-cyan-400/30">
                    ⚓ PORTAL OFICIAL DE CRUCEROS
                  </Badge>
                  <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">
                    Bienvenido a República Dominicana
                  </h1>
                  <p className="text-white/80 mb-6">
                    La guía esencial para tu llegada en crucero. Descubre itinerarios de 
                    un día, transporte seguro y lo mejor de cada puerto antes de que 
                    zarpe tu barco.
                  </p>
                  <div className="flex gap-3">
                    <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
                      Ver Puertos
                    </Button>
                    <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                      ▶ Ver Video
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Selecciona tu Puerto */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Selecciona tu Puerto de Llegada
              </h2>
              <Link to="/destinos" className="text-cyan-500 font-medium text-sm hover:underline">
                Ver todos los puertos →
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {puertos.map((puerto) => (
                <div key={puerto.nombre} className="group">
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-4">
                    <img 
                      src={puerto.imagen} 
                      alt={puerto.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <Badge className="absolute top-4 right-4 bg-cyan-500 text-white text-xs">
                      {puerto.ubicacion}
                    </Badge>
                  </div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-1">{puerto.nombre}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{puerto.descripcion}</p>
                  <div className="flex gap-2">
                    {puerto.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Itinerario + Servicios */}
        <section className="py-16 px-4 bg-card/30">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Itinerario */}
              <div>
                <Badge className="mb-4 bg-cyan-500/20 text-cyan-500 border-cyan-500/30">
                  ⭐ RECOMENDADO
                </Badge>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Itinerario: Un Día Perfecto
                </h2>
                <p className="text-muted-foreground mb-8">
                  Aprovecha al máximo tus 8 horas en tierra con este plan optimizado.
                </p>

                <div className="space-y-6">
                  {itinerario.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-cyan-500" />
                        {index < itinerario.length - 1 && (
                          <div className="w-0.5 flex-1 bg-border mt-2" />
                        )}
                      </div>
                      <div className="pb-6">
                        <p className="text-cyan-500 text-sm font-medium">{item.hora}</p>
                        <h3 className="font-semibold text-foreground">{item.titulo}</h3>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Servicios */}
              <div>
                <Badge className="mb-4 bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                  ✓ FACILIDADES
                </Badge>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Mapa de Servicios
                </h2>
                <p className="text-muted-foreground mb-8">
                  Ubica lo esencial dentro de la terminal.
                </p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {serviciosTerminal.map((serv) => (
                    <div key={serv.nombre} className="bg-card rounded-xl p-4 border border-border text-center">
                      <serv.icon className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-foreground">{serv.nombre}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-2xl p-6 flex items-center justify-center">
                  <Button variant="outline" className="gap-2">
                    <MapPin className="h-4 w-4" /> Explorar Mapa
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Excursiones Express */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Excursiones Express
                </h2>
                <p className="text-muted-foreground">Garantizadas para regresar antes de que zarpe tu barco.</p>
              </div>
              <Button variant="outline" className="text-cyan-500 border-cyan-500">
                Ver todas
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {excursiones.map((exc) => (
                <div key={exc.nombre} className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="relative aspect-[4/3]">
                    <img 
                      src={exc.imagen} 
                      alt={exc.nombre}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-3 left-3 bg-emerald-500 text-white text-xs">
                      ✓ GARANTÍA REGRESO
                    </Badge>
                    <Badge className="absolute bottom-3 right-3 bg-background/90 text-foreground text-xs">
                      {exc.duracion}
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-1">{exc.nombre}</h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{exc.descripcion}</p>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-cyan-500">
                        ${exc.precio}<span className="text-xs font-normal text-muted-foreground">/pers</span>
                      </p>
                      <Button size="icon" variant="outline" className="h-8 w-8 rounded-full">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Transporte */}
        <section className="py-16 px-4 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-2xl font-bold text-white mb-2">
              Opciones de Transporte
            </h2>
            <p className="text-white/60 mb-12">Muévete seguro desde la terminal.</p>

            <div className="grid md:grid-cols-3 gap-6">
              {transporte.map((t) => (
                <div key={t.tipo} className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
                  <Car className="h-8 w-8 text-cyan-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-white mb-2">{t.tipo}</h3>
                  <p className="text-sm text-white/60 mb-4">{t.desc}</p>
                  <p className="text-xs text-white/40">Costo estimado</p>
                  <p className="text-xl font-bold text-white">{t.precio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
