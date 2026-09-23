import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { PanoramaAd } from "@/components/promo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck, Heart, Stethoscope, Plane, AlertTriangle,
  CheckCircle, XCircle, DollarSign, Phone, Clock, Star, 
  ExternalLink, ChevronRight, Activity, Building2, HelpCircle
} from "lucide-react";
import { toast } from "sonner";

import heroBeach from "@/assets/hero-beach.jpg";

const planes = [
  {
    nombre: "Básico Internacional", 
    precioPorDia: 4, 
    ideal: "Turismo de playa, descanso y viajes tranquilos",
    coberturas: [
      { item: "Gastos médicos por emergencia", valor: "US$ 50,000", incluido: true },
      { item: "Evacuación médica y repatriación", valor: "US$ 100,000", incluido: true },
      { item: "Cancelación o demora de vuelo", valor: "Hasta US$ 1,000", incluido: true },
      { item: "Pérdida de equipaje", valor: "US$ 500", incluido: true },
      { item: "Deportes acuáticos y aventura", valor: "No incluido", incluido: false },
      { item: "Cobertura COVID-19 y cuarentena", valor: "No incluido", incluido: false },
    ],
    color: "border-sky-500/30",
  },
  {
    nombre: "Aventura & Deportes Acuáticos", 
    precioPorDia: 9, 
    ideal: "Kitesurf en Cabarete, buceo, senderismo Pico Duarte y buggy",
    coberturas: [
      { item: "Gastos médicos por emergencia", valor: "US$ 150,000", incluido: true },
      { item: "Evacuación médica y rescate", valor: "US$ 300,000", incluido: true },
      { item: "Cancelación o demora de vuelo", valor: "Hasta US$ 3,000", incluido: true },
      { item: "Pérdida de equipaje y equipo deportivo", valor: "US$ 2,000", incluido: true },
      { item: "Deportes acuáticos y aventura", valor: "100% Incluido", incluido: true },
      { item: "Cobertura COVID-19 y cuarentena", valor: "Incluido", incluido: true },
    ],
    color: "border-primary",
    popular: true,
  },
  {
    nombre: "Premium Cobertura Total 360°", 
    precioPorDia: 16, 
    ideal: "Familias con niños, adultos mayores y viajes prolongados",
    coberturas: [
      { item: "Gastos médicos por emergencia", valor: "US$ 500,000+", incluido: true },
      { item: "Evacuación médica y rescate", valor: "Ilimitado", incluido: true },
      { item: "Cancelación por cualquier motivo", valor: "Hasta US$ 10,000", incluido: true },
      { item: "Pérdida de equipaje y dispositivos", valor: "US$ 4,000", incluido: true },
      { item: "Deportes extremos y senderismo", valor: "100% Incluido", incluido: true },
      { item: "Preexistencias médicas declaradas", valor: "Incluido", incluido: true },
    ],
    color: "border-amber-500/30",
  },
];

const centrosMedicosRD = [
  {
    nombre: "Centro Médico Punta Cana",
    ubicacion: "Punta Cana / Bávaro",
    destacado: "Acreditación internacional Qmentum, departamento para pacientes internacionales y ambulancias 24/7."
  },
  {
    nombre: "Hospiten Bávaro & Hospiten Santo Domingo",
    ubicacion: "Punta Cana & Distrito Nacional",
    destacado: "Red hospitalaria internacional con convenios directos con las principales aseguradoras mundiales."
  },
  {
    nombre: "CEDIMAT (Centro de Diagnóstico y Medicina Avanzada)",
    ubicacion: "Santo Domingo",
    destacado: "Centro de referencia regional para medicina cardiovascular, trauma y cirugías complejas."
  },
  {
    nombre: "HOMS (Hospital Metropolitano de Santiago)",
    ubicacion: "Santiago de los Caballeros",
    destacado: "El hospital privado más moderno del norte del país, especializado en turismo médico."
  }
];

export default function SeguroViaje() {
  const [diasViaje, setDiasViaje] = useState(7);
  const [pasajeros, setPasajeros] = useState(2);

  const handleCotizar = (planNombre: string) => {
    toast.success(`¡Cotización generada para el plan ${planNombre}!`, {
      description: `Duración: ${diasViaje} días para ${pasajeros} personas. Hemos cargado tu comparativa con aseguradoras aliadas.`
    });
  };

  return (
    <PageTransition>
      <SEOHead
        title="Seguro de Viaje para República Dominicana | Comparador y Coberturas Médicas RD"
        description="Compara seguros de viaje para RD: cobertura médica en Punta Cana y Santo Domingo, rescate en deportes acuáticos, cancelación y clínicas de primer nivel."
        keywords="seguro viaje republica dominicana, seguro medico turista rd, cobertura medica punta cana, seguro cancelacion vuelo rd, hospiten centro medico"
      />
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />

        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[460px] flex items-end overflow-hidden">
          <img
            src={heroBeach}
            alt="Seguro de Viaje y Protección Médica en República Dominicana"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-black/35" />

          <div className="relative z-10 container mx-auto px-4 lg:px-8 pb-12">
            <nav className="flex items-center gap-2 text-xs md:text-sm text-white/80 mb-4">
              <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link to="/planifica" className="hover:text-primary transition-colors">Planifica</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-white font-medium">Seguro de Viaje y Cobertura Médica</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <Badge className="mb-3 bg-primary/20 text-primary border-primary/30 text-xs px-3 py-1 font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> VIAJA 100% PROTEGIDO
                </Badge>
                <h1 className="font-display text-4xl md:text-6xl font-black text-white tracking-tight mb-3">
                  Seguro de Viaje para RD
                </h1>
                <p className="text-base md:text-lg text-white/90 max-w-2xl leading-relaxed">
                  Disfruta de tus vacaciones en el Caribe con total serenidad: emergencias médicas, deportes acuáticos, cancelación de vuelos y asistencia en español 24/7.
                </p>
              </div>

              {/* Alert Badge */}
              <div className="bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-white flex items-center gap-3">
                <Stethoscope className="h-8 w-8 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-white/70">Red de Hospitales Privados</p>
                  <p className="text-sm font-bold text-emerald-400">Convenios Directos 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Warning Banner */}
        <section className="py-4 bg-amber-500/10 border-y border-amber-500/20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs md:text-sm text-foreground flex items-center justify-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              <strong>Recomendación oficial:</strong> Aunque el seguro no es obligatorio por ley, una consulta de urgencia privada puede superar los US$ 500 y una internación los US$ 4,000+.
            </p>
          </div>
        </section>

        {/* Interactive Estimator Controls */}
        <section className="py-8 bg-card/40 border-b border-border/60">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <div className="bg-card p-6 rounded-2xl border border-border flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex-1 w-full grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Días de Viaje</label>
                  <Input 
                    type="number" 
                    min={1} 
                    max={90} 
                    value={diasViaje} 
                    onChange={e => setDiasViaje(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-10 bg-muted/20 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Pasajeros</label>
                  <Input 
                    type="number" 
                    min={1} 
                    max={10} 
                    value={pasajeros} 
                    onChange={e => setPasajeros(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-10 bg-muted/20 rounded-xl"
                  />
                </div>
              </div>

              <div className="text-center sm:text-right flex-shrink-0">
                <p className="text-xs text-muted-foreground">Cobertura calculada para:</p>
                <p className="font-display font-bold text-lg text-foreground">{diasViaje} días • {pasajeros} viajeros</p>
              </div>
            </div>
          </div>
        </section>

        {/* Plan Cards Matrix */}
        <section className="py-16 container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">
              PLANES DISPONIBLES
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Compara Coberturas para tu Estadía
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
              Elige el nivel de protección que mejor se adapte a tus actividades previstas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {planes.map((plan) => {
              const costoTotal = plan.precioPorDia * diasViaje * pasajeros;
              return (
                <Card 
                  key={plan.nombre} 
                  className={`relative overflow-hidden bg-card border flex flex-col justify-between ${plan.color} ${plan.popular ? 'ring-2 ring-primary shadow-xl' : 'border-border/80'}`}
                >
                  {plan.popular && (
                    <div className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 text-center tracking-wider">
                      RECOMENDADO PARA REPÚBLICA DOMINICANA
                    </div>
                  )}
                  <CardContent className="p-6 flex flex-col flex-1">
                    <h3 className="font-display text-xl font-bold text-foreground mb-1">{plan.nombre}</h3>
                    <p className="text-xs text-muted-foreground mb-4">{plan.ideal}</p>
                    
                    <div className="mb-6 p-4 bg-muted/30 rounded-xl border border-border">
                      <div className="flex items-baseline gap-1">
                        <span className="font-display font-black text-3xl text-primary">US$ {costoTotal}</span>
                        <span className="text-xs text-muted-foreground">total ({plan.precioPorDia}$/día por persona)</span>
                      </div>
                    </div>

                    <div className="space-y-2.5 flex-1 mb-6 text-xs">
                      {plan.coberturas.map((c) => (
                        <div key={c.item} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {c.incluido ? (
                              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                            )}
                            <span className={c.incluido ? "text-foreground font-medium" : "text-muted-foreground/60 line-through"}>
                              {c.item}
                            </span>
                          </div>
                          {c.valor && c.incluido && (
                            <span className="font-bold text-primary shrink-0">{c.valor}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    <Button onClick={() => handleCotizar(plan.nombre)} className="w-full gap-2">
                      Cotizar y Solicitar {plan.nombre.split(" ")[0]}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Hospitals and Medical Centers */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-10">
            <h3 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" /> Principales Centros Médicos con Atención Internacional
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {centrosMedicosRD.map((c) => (
                <div key={c.nombre} className="p-4 bg-muted/30 rounded-xl border border-border space-y-1.5">
                  <h4 className="font-bold text-sm text-foreground">{c.nombre}</h4>
                  <p className="text-xs text-primary font-semibold">{c.ubicacion}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.destacado}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Panorama Ad Section */}
        <section className="py-6 bg-muted/20 border-t border-border/40">
          <div className="container mx-auto px-4 max-w-6xl">
            <PanoramaAd showDemo />
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
