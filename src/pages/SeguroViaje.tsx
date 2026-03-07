import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, Heart, Stethoscope, Plane, AlertTriangle,
  CheckCircle, XCircle, DollarSign, Phone, Clock, Star, ExternalLink
} from "lucide-react";

const planes = [
  {
    nombre: "Básico", precio: "US$3-5/día", ideal: "Viajeros jóvenes y saludables",
    coberturas: [
      { item: "Emergencia médica", valor: "US$50,000", incluido: true },
      { item: "Evacuación médica", valor: "US$100,000", incluido: true },
      { item: "Cancelación de vuelo", valor: "Hasta US$1,000", incluido: true },
      { item: "Equipaje perdido", valor: "US$500", incluido: true },
      { item: "Deportes extremos", valor: "", incluido: false },
      { item: "COVID-19", valor: "", incluido: false },
      { item: "Preexistencias", valor: "", incluido: false },
    ],
    color: "border-sky-500/30",
  },
  {
    nombre: "Estándar", precio: "US$7-12/día", ideal: "Familias y parejas",
    coberturas: [
      { item: "Emergencia médica", valor: "US$150,000", incluido: true },
      { item: "Evacuación médica", valor: "US$300,000", incluido: true },
      { item: "Cancelación de vuelo", valor: "Hasta US$3,000", incluido: true },
      { item: "Equipaje perdido", valor: "US$1,500", incluido: true },
      { item: "Deportes extremos", valor: "Incluido", incluido: true },
      { item: "COVID-19", valor: "Incluido", incluido: true },
      { item: "Preexistencias", valor: "", incluido: false },
    ],
    color: "border-primary/30",
    popular: true,
  },
  {
    nombre: "Premium", precio: "US$15-25/día", ideal: "Viajeros frecuentes y adultos mayores",
    coberturas: [
      { item: "Emergencia médica", valor: "US$500,000+", incluido: true },
      { item: "Evacuación médica", valor: "Ilimitada", incluido: true },
      { item: "Cancelación de vuelo", valor: "Hasta US$10,000", incluido: true },
      { item: "Equipaje perdido", valor: "US$3,000", incluido: true },
      { item: "Deportes extremos", valor: "Incluido", incluido: true },
      { item: "COVID-19", valor: "Incluido", incluido: true },
      { item: "Preexistencias", valor: "Incluido", incluido: true },
    ],
    color: "border-amber-500/30",
  },
];

const proveedores = [
  { nombre: "World Nomads", web: "worldnomads.com", ideal: "Aventureros y mochileros", rating: 4.5 },
  { nombre: "Allianz Travel", web: "allianztravelinsurance.com", ideal: "Familias y viajes de lujo", rating: 4.6 },
  { nombre: "SafetyWing", web: "safetywing.com", ideal: "Nómadas digitales y estancias largas", rating: 4.4 },
  { nombre: "IATI Seguros", web: "iatiseguros.com", ideal: "Viajeros desde España/Latam", rating: 4.7 },
  { nombre: "Assist Card", web: "assistcard.com", ideal: "Latinoamérica y Caribe", rating: 4.3 },
  { nombre: "Heymondo", web: "heymondo.com", ideal: "Europa y viajes largos", rating: 4.5 },
];

const emergenciasRD = [
  { servicio: "Emergencias generales", numero: "911" },
  { servicio: "Policía turística (POLITUR)", numero: "+1 809-200-3500" },
  { servicio: "Bomberos", numero: "+1 809-682-2000" },
  { servicio: "Cruz Roja", numero: "+1 809-682-4545" },
  { servicio: "Defensa Civil", numero: "+1 809-472-8614" },
];

export default function SeguroViaje() {
  return (
    <PageTransition>
      <SEOHead
        title="Seguro de Viaje para República Dominicana - Comparador"
        description="Compara planes de seguro de viaje para RD. Coberturas médicas, evacuación, cancelación y más. Guía completa para viajeros internacionales."
        keywords="seguro viaje dominicana, seguro médico turista RD, comparar seguros viaje caribe"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <ShieldCheck className="h-3 w-3 mr-1" /> Viaja Protegido
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Seguro de Viaje para <span className="text-primary">RD</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              No viajes sin protección. Compara coberturas y elige el plan ideal para ti y tu familia.
            </p>
          </div>
        </section>

        {/* Alerta importante */}
        <section className="py-6 bg-amber-500/10 border-y border-amber-500/20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-foreground flex items-center justify-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <strong>Importante:</strong> RD no exige seguro de viaje obligatorio, pero la atención médica privada puede costar US$500-5,000+ por emergencia.
            </p>
          </div>
        </section>

        {/* Planes */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">Tipos de Cobertura</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {planes.map(plan => (
                <Card key={plan.nombre} className={`relative overflow-hidden ${plan.color} ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                      MÁS POPULAR
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="font-display text-xl font-bold text-foreground mb-1">{plan.nombre}</h3>
                    <p className="text-2xl font-bold text-primary mb-1">{plan.precio}</p>
                    <p className="text-xs text-muted-foreground mb-4">Ideal para: {plan.ideal}</p>
                    <div className="space-y-2">
                      {plan.coberturas.map(c => (
                        <div key={c.item} className="flex items-center gap-2 text-sm">
                          {c.incluido ? (
                            <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                          )}
                          <span className={c.incluido ? "text-foreground" : "text-muted-foreground/60 line-through"}>
                            {c.item}
                          </span>
                          {c.valor && c.incluido && (
                            <span className="ml-auto text-xs text-primary font-medium">{c.valor}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Proveedores */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">Proveedores Recomendados</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {proveedores.map(p => (
                <Card key={p.nombre} className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-foreground mb-1">{p.nombre}</h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-3 w-3 text-amber-500" />
                      <span className="text-xs text-muted-foreground">{p.rating}/5</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">Ideal: {p.ideal}</p>
                    <a href={`https://${p.web}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                        <ExternalLink className="h-3 w-3" /> Visitar sitio
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Números de emergencia */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="font-display text-xl font-bold text-foreground mb-6 text-center">📞 Números de Emergencia en RD</h2>
            <div className="space-y-3">
              {emergenciasRD.map(e => (
                <div key={e.servicio} className="flex items-center justify-between bg-card rounded-xl p-4 border border-border">
                  <span className="text-sm text-foreground">{e.servicio}</span>
                  <a href={`tel:${e.numero}`} className="text-primary font-bold hover:underline">{e.numero}</a>
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
