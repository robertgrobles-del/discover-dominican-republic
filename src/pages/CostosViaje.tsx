import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { BetweenSectionsAd } from "@/components/promo";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { 
  Calculator, Plane, Hotel, Utensils, Car, 
  Palmtree, DollarSign, TrendingUp, Info
} from "lucide-react";

const presupuestosPorTipo = {
  economico: {
    label: "Económico",
    diario: { min: 50, max: 80 },
    color: "bg-green-500",
    descripcion: "Hostales, comida local, transporte público",
    desglose: {
      alojamiento: 25,
      alimentacion: 15,
      transporte: 5,
      actividades: 10,
      otros: 5
    }
  },
  moderado: {
    label: "Moderado",
    diario: { min: 100, max: 180 },
    color: "bg-blue-500",
    descripcion: "Hoteles 3-4*, restaurantes variados, tours",
    desglose: {
      alojamiento: 70,
      alimentacion: 40,
      transporte: 20,
      actividades: 35,
      otros: 15
    }
  },
  premium: {
    label: "Premium",
    diario: { min: 250, max: 400 },
    color: "bg-purple-500",
    descripcion: "Resorts 4-5*, experiencias exclusivas",
    desglose: {
      alojamiento: 180,
      alimentacion: 80,
      transporte: 40,
      actividades: 70,
      otros: 30
    }
  },
  lujo: {
    label: "Lujo",
    diario: { min: 500, max: 1000 },
    color: "bg-amber-500",
    descripcion: "Resorts de lujo, villas privadas, todo exclusivo",
    desglose: {
      alojamiento: 450,
      alimentacion: 150,
      transporte: 100,
      actividades: 200,
      otros: 100
    }
  }
};

const costosDetallados = [
  {
    categoria: "Vuelos",
    icon: Plane,
    items: [
      { item: "Desde EE.UU. (Miami)", rango: "$200 - $500", nota: "Ida y vuelta" },
      { item: "Desde Europa (Madrid)", rango: "$500 - $900", nota: "Ida y vuelta" },
      { item: "Desde Latinoamérica", rango: "$300 - $700", nota: "Ida y vuelta" },
    ]
  },
  {
    categoria: "Alojamiento por noche",
    icon: Hotel,
    items: [
      { item: "Hostal/Airbnb básico", rango: "$15 - $40", nota: "" },
      { item: "Hotel 3 estrellas", rango: "$50 - $100", nota: "" },
      { item: "Resort 4 estrellas", rango: "$150 - $300", nota: "All-inclusive" },
      { item: "Resort 5 estrellas", rango: "$350 - $800+", nota: "All-inclusive" },
    ]
  },
  {
    categoria: "Alimentación",
    icon: Utensils,
    items: [
      { item: "Comida callejera", rango: "$2 - $5", nota: "Por plato" },
      { item: "Restaurante local", rango: "$8 - $15", nota: "Almuerzo completo" },
      { item: "Restaurante turístico", rango: "$20 - $40", nota: "Cena" },
      { item: "Fine dining", rango: "$50 - $150+", nota: "Por persona" },
    ]
  },
  {
    categoria: "Transporte",
    icon: Car,
    items: [
      { item: "Guagua (bus público)", rango: "$0.50 - $2", nota: "Por viaje" },
      { item: "Taxi aeropuerto", rango: "$25 - $50", nota: "A zona hotelera" },
      { item: "Uber/taxi en ciudad", rango: "$3 - $15", nota: "Por viaje" },
      { item: "Alquiler de carro", rango: "$35 - $80", nota: "Por día" },
    ]
  },
  {
    categoria: "Actividades",
    icon: Palmtree,
    items: [
      { item: "Playa pública", rango: "Gratis", nota: "" },
      { item: "Tour de medio día", rango: "$40 - $80", nota: "" },
      { item: "Excursión día completo", rango: "$80 - $150", nota: "Con almuerzo" },
      { item: "Buceo certificado", rango: "$100 - $200", nota: "2 inmersiones" },
    ]
  },
];

export default function CostosViaje() {
  const [dias, setDias] = useState([7]);
  const [viajeros, setViajeros] = useState([2]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState("moderado");

  const presupuesto = presupuestosPorTipo[tipoSeleccionado as keyof typeof presupuestosPorTipo];
  const costoMinTotal = presupuesto.diario.min * dias[0] * viajeros[0];
  const costoMaxTotal = presupuesto.diario.max * dias[0] * viajeros[0];

  return (
    <PageTransition>
      <SEOHead
        title="Costos de Viaje a República Dominicana - Guía de Presupuesto"
        description="Descubre cuánto cuesta viajar a RD. Presupuestos por tipo de viajero, costos detallados y calculadora interactiva."
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-20">
          {/* Hero */}
          <section className="relative py-20 bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
            <div className="container mx-auto px-4 text-center">
              <Calculator className="h-16 w-16 text-primary mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Costos de Viaje</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                ¿Cuánto cuesta viajar a República Dominicana?
              </p>
            </div>
          </section>

          {/* Quick Calculator */}
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-5xl">
              <Card className="mb-12">
                <CardHeader>
                  <CardTitle>Calculadora Rápida de Presupuesto</CardTitle>
                  <CardDescription>Ajusta los parámetros para estimar tu gasto</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Budget Type */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium">Tipo de viaje</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(presupuestosPorTipo).map(([key, data]) => (
                        <Card 
                          key={key}
                          className={`cursor-pointer transition-all ${
                            tipoSeleccionado === key 
                              ? 'border-primary ring-2 ring-primary/20' 
                              : 'hover:border-muted-foreground/50'
                          }`}
                          onClick={() => setTipoSeleccionado(key)}
                        >
                          <CardContent className="p-4 text-center">
                            <div className={`w-3 h-3 rounded-full ${data.color} mx-auto mb-2`} />
                            <p className="font-semibold">{data.label}</p>
                            <p className="text-xs text-muted-foreground">
                              ${data.diario.min}-${data.diario.max}/día
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{presupuesto.descripcion}</p>
                  </div>

                  {/* Days Slider */}
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">Duración del viaje</label>
                      <span className="text-sm font-bold text-primary">{dias[0]} días</span>
                    </div>
                    <Slider
                      value={dias}
                      onValueChange={setDias}
                      min={1}
                      max={21}
                      step={1}
                    />
                  </div>

                  {/* Travelers Slider */}
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">Número de viajeros</label>
                      <span className="text-sm font-bold text-primary">{viajeros[0]} personas</span>
                    </div>
                    <Slider
                      value={viajeros}
                      onValueChange={setViajeros}
                      min={1}
                      max={10}
                      step={1}
                    />
                  </div>

                  {/* Result */}
                  <div className="bg-primary/5 rounded-xl p-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Presupuesto estimado total</p>
                      <div className="flex items-center justify-center gap-2">
                        <DollarSign className="h-8 w-8 text-primary" />
                        <span className="text-4xl font-bold text-primary">
                          {costoMinTotal.toLocaleString()} - {costoMaxTotal.toLocaleString()}
                        </span>
                        <span className="text-lg text-muted-foreground">USD</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Sin incluir vuelos • {viajeros[0]} personas • {dias[0]} días
                      </p>
                    </div>

                    {/* Breakdown */}
                    <div className="mt-6 grid grid-cols-5 gap-2 text-center">
                      {Object.entries(presupuesto.desglose).map(([key, value]) => (
                        <div key={key} className="bg-background rounded-lg p-2">
                          <p className="text-xs text-muted-foreground capitalize">{key}</p>
                          <p className="font-bold">${value * dias[0]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <BetweenSectionsAd showDemo />

              {/* Detailed Costs */}
              <div className="space-y-8 mt-12">
                <h2 className="text-2xl font-bold text-center mb-8">Costos Detallados</h2>
                
                {costosDetallados.map((categoria) => (
                  <Card key={categoria.categoria}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <categoria.icon className="h-5 w-5 text-primary" />
                        {categoria.categoria}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        {categoria.items.map((item, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div>
                              <span className="font-medium">{item.item}</span>
                              {item.nota && (
                                <span className="text-sm text-muted-foreground ml-2">
                                  ({item.nota})
                                </span>
                              )}
                            </div>
                            <Badge variant="secondary" className="font-mono">
                              {item.rango}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Tips */}
              <Card className="mt-12">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Tips para Ahorrar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                      <span><strong>Temporada baja (May-Nov):</strong> Precios hasta 40% más bajos en alojamiento</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                      <span><strong>All-Inclusive:</strong> Puede ser más económico para familias y estancias largas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                      <span><strong>Come local:</strong> Los comedores dominicanos ofrecen comida excelente a $3-5 USD</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                      <span><strong>Transporte público:</strong> Las guaguas son seguras y muy económicas entre ciudades</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                      <span><strong>Negocia:</strong> En mercados y con taxistas es común regatear un poco</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
