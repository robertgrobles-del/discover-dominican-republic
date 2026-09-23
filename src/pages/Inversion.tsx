import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Link } from "react-router-dom";
import { TrendingUp, Building, Receipt, Truck, MapPin, Phone, Mail, ChevronRight, ChevronLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import heroBeach from "@/assets/hero-beach.jpg";
import puntaCana from "@/assets/punta-cana.jpg";
import adventure from "@/assets/adventure.jpg";

const indicadores = [
  { label: "VISITANTES ANUALES", valor: "10.3M+", cambio: "+20%", positivo: true },
  { label: "APORTE AL PIB", valor: "16%", cambio: "+0.3%", positivo: true },
  { label: "ROI INVERSIÓN PROM", valor: "8-12%", cambio: "Estable", positivo: true },
];

const incentivos = [
  { titulo: "100% Impuesto Sobre la Renta", desc: "Exención total del ISR por un período de 15 años para proyectos aprobados.", icon: Receipt },
  { titulo: "Impuestos de Importación", desc: "Exención de impuestos a equipos, materiales y muebles necesarios para el primer equipamiento.", icon: Truck },
  { titulo: "Transferencia Inmobiliaria", desc: "Exención del 3% del impuesto por transferencia inmobiliaria en la adquisición de terrenos.", icon: Building },
  { titulo: "ITBIS en Construcción", desc: "Exención del impuesto a la transferencia de bienes y servicios en materiales y maquinarias.", icon: TrendingUp },
];

const zonasDesarrollo = [
  {
    nombre: "Punta Cana",
    desc: "El destino icónico del Caribe. Infraestructura aeroportuaria de...",
    imagen: puntaCana,
    estado: "EN DESARROLLO"
  },
  {
    nombre: "Miches",
    desc: "El milagro de los sostenible. Grandes cadenas hoteleras ya est...",
    imagen: adventure,
    estado: "EMERGENTE"
  },
  {
    nombre: "Pedernales",
    desc: "Mega-proyecto Cabo Rojo: $3B en inversión público-privada para...",
    imagen: heroBeach,
    estado: "PROYECTO ANCLA"
  },
];

const testimonios = [
  {
    texto: "República Dominicana no solo ofrece las playas más hermosas, sino un marco legal estable y un gobierno que entiende de necesidades del inversionista privado.",
    autor: "Alejandro Ozuna",
    empresa: "CEO, ALPHA GOLDEN GROUP"
  },
  {
    texto: "El crecimiento en Miches es testimonio de la visión de futuro del país. Nuestra inversión aquí ha superado todas las expectativas de retorno en tiempo récord.",
    autor: "Rosanna Piñero",
    empresa: "CFO, DREAMWORLD"
  },
];

export default function Inversion() {
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        {/* Hero */}
        <section className="relative h-[70vh] flex items-center overflow-hidden">
          <img 
            src={heroBeach} 
            alt="Inversión en RD" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
          
          <div className="relative z-10 container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-cyan-500/20 text-cyan-400 border-cyan-400/30">
              🏝️ DESTINO #1 EN EL CARIBE
            </Badge>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">
              Su Próxima Gran Inversión<br />
              Comienza en el Paraíso
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">
              Descubre oportunidades exclusivas con seguridad jurídica, 
              incentivos fiscales de ley y el retorno de inversión más alto de la región.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/bienes-raices">
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
                  Ver Bienes Raíces 🏢
                </Button>
              </Link>
              <Link to="/proyectos-inversion">
                <Button variant="secondary" className="gap-1">
                  Proyectos & Inversionistas 🤝
                </Button>
              </Link>
              <Link to="/calculadora-confotur">
                <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 gap-2">
                  Calculadora CONFOTUR 📊
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-8 mt-12 text-white/60 text-sm">
              <span>✓ TURISTAS: 10.8 MILLONES</span>
              <span>✓ OCUPACIÓN HOTELERA: 82.6%</span>
              <span>✓ INGRESOS EN TURISMO: $10,420 (M.O)</span>
            </div>
          </div>
        </section>

        {/* Indicadores */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Una Década de Crecimiento Imparable
                </h2>
                <p className="text-muted-foreground">Indicadores clave del sector turístico dominicano (2024)</p>
              </div>
              <Button variant="outline" size="sm" className="text-cyan-500 border-cyan-500">
                Ver Reporte Completo 📊
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {indicadores.map((ind) => (
                <div key={ind.label} className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-cyan-100 dark:border-cyan-800/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{ind.label}</p>
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-bold text-foreground">{ind.valor}</span>
                    <span className={`text-sm font-medium ${ind.positivo ? "text-emerald-500" : "text-red-500"}`}>
                      {ind.cambio}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Placeholder */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card rounded-2xl border border-border p-6">
                <p className="text-xs text-muted-foreground uppercase mb-1">INVERSIÓN M. TURÍSTICA (USD MILLONES)</p>
                <p className="text-3xl font-bold text-foreground mb-1">$9.800M</p>
                <p className="text-sm text-emerald-500">+20% vs 2014</p>
                <div className="mt-6 h-32 bg-gradient-to-r from-cyan-100 to-cyan-50 dark:from-cyan-900/30 dark:to-cyan-800/20 rounded-lg flex items-end justify-around px-4 pb-2">
                  <style>{`
                    .chart-bar-0 { height: 40%; }
                    .chart-bar-1 { height: 50%; }
                    .chart-bar-2 { height: 55%; }
                    .chart-bar-3 { height: 60%; }
                    .chart-bar-4 { height: 70%; }
                    .chart-bar-5 { height: 80%; }
                    .chart-bar-6 { height: 100%; }
                  `}</style>
                  {[40, 50, 55, 60, 70, 80, 100].map((h, i) => (
                    <div key={i} className={`w-6 bg-cyan-500 rounded-t chart-bar-${i}`} />
                  ))}
                </div>
              </div>
              <div className="bg-card rounded-2xl border border-border p-6">
                <p className="text-xs text-muted-foreground uppercase mb-1">PLUSVALÍA INMOBILIARIA (ZONA COSTERA)</p>
                <p className="text-3xl font-bold text-foreground mb-1">$2.850/m²</p>
                <p className="text-sm text-emerald-500">+15% vs 2014</p>
                <div className="mt-6 h-32 bg-gradient-to-br from-cyan-100 to-teal-50 dark:from-cyan-900/30 dark:to-teal-800/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-16 w-16 text-cyan-500" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Incentivos Fiscales */}
        <section className="py-16 px-4 bg-card/30">
          <div className="max-w-5xl mx-auto text-center">
            <Badge className="mb-4 bg-cyan-500/20 text-cyan-500 border-cyan-500/30">
              ⚖️ SEGURIDAD JURÍDICA
            </Badge>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Incentivos Fiscales: Ley 158-01
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
              La Ley de Fomento al Desarrollo Turístico ofrece exenciones fiscales hasta por 15 años a los 
              proyectos clasificados, creando uno de los climas de inversión más atractivos de las Américas.
            </p>

            <div className="grid md:grid-cols-4 gap-6">
              {incentivos.map((inc) => (
                <div key={inc.titulo} className="bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl p-6 text-white text-left">
                  <inc.icon className="h-8 w-8 mb-4" />
                  <h3 className="font-semibold mb-2">{inc.titulo}</h3>
                  <p className="text-sm text-white/80">{inc.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 justify-center mt-8">
              <Button variant="outline" className="gap-2">
                Descargar Texto de la Ley
              </Button>
              <Link to="/calculadora-confotur">
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2">
                  Calcular Ahorro CONFOTUR 🧮
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Zonas de Desarrollo */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Áreas de Desarrollo Prioritario
                </h2>
                <p className="text-muted-foreground">
                  Desde destinos consolidados hasta nuevas fronteras vírgenes. El gobierno 
                  dominicano impulsa infraestructura clave en estas zonas.
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" className="rounded-full">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" className="rounded-full bg-cyan-500 text-white border-cyan-500">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {zonasDesarrollo.map((zona) => (
                <div key={zona.nombre} className="group relative rounded-2xl overflow-hidden aspect-[4/5]">
                  <img 
                    src={zona.imagen} 
                    alt={zona.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <Badge className="absolute top-4 left-4 bg-cyan-500 text-white text-xs">
                    {zona.estado}
                  </Badge>
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h3 className="font-display text-xl font-bold mb-2">{zona.nombre}</h3>
                    <p className="text-sm text-white/80 mb-4">{zona.desc}</p>
                    <Button size="sm" variant="outline" className="text-white border-white/50 hover:bg-white/20 gap-1">
                      Explorar <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonios */}
        <section className="py-16 px-4 bg-card/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-2xl font-bold text-foreground mb-12">
              Aliados Estratégicos que Confían en RD
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {testimonios.map((test) => (
                <div key={test.autor} className="bg-card rounded-2xl p-8 border border-border text-left">
                  <div className="text-4xl text-cyan-500/30 mb-4">"</div>
                  <p className="text-foreground italic mb-6">
                    "{test.texto}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-900/50 dark:to-teal-900/50 flex items-center justify-center">
                      <span className="text-xl">👤</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{test.autor}</p>
                      <p className="text-sm text-muted-foreground">{test.empresa}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Formulario de Contacto */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="p-8 md:p-12">
                  <h2 className="font-display text-2xl font-bold text-white mb-2">
                    Departamento de Fomento a la Inversión
                  </h2>
                  <p className="text-white/60 mb-8">
                    Nuestro equipo de expertos está listo para guiarle a través del proceso de 
                    inversión, desde la selección de locación incentivada hasta la ejecución del proyecto.
                  </p>

                  <div className="space-y-4 text-white/80 text-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-cyan-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-white">Oficina Principal</p>
                        <p>Av. Cayetano Germosén esq. Av. Gregorio Luperón, Santo Domingo, RD</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-cyan-400" />
                      <p>inversion@turismo.gob.do</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-cyan-400" />
                      <p>+1 (809) 689-0102</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 md:p-12 bg-white/5">
                  <h3 className="font-semibold text-white mb-6">
                    Solicitar Asesoría Personalizada
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input placeholder="Nombre Completo" className="bg-white/10 border-white/20 text-white placeholder:text-white/50" />
                      <Input placeholder="Empresa" className="bg-white/10 border-white/20 text-white placeholder:text-white/50" />
                    </div>
                    <Input placeholder="Correo Corporativo" className="bg-white/10 border-white/20 text-white placeholder:text-white/50" />
                    <Select>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Área de Interés" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hoteleria">Desarrollo Hotelero</SelectItem>
                        <SelectItem value="inmobiliario">Inmobiliario Turístico</SelectItem>
                        <SelectItem value="entretenimiento">Entretenimiento</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea placeholder="Mensaje / Detalles del Proyecto" className="bg-white/10 border-white/20 text-white placeholder:text-white/50" rows={3} />
                    <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
                      Enviar Solicitud
                    </Button>
                    <p className="text-xs text-white/40 text-center">
                      Su información permanecerá confidencial y será procesada exclusivamente.
                    </p>
                  </div>
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
