import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coffee, MapPin, Compass, AlertCircle, Sparkles, BookOpen, Star } from "lucide-react";
import { toast } from "sonner";

interface Bebida {
  name: string;
  category: "alcohol" | "non-alcohol" | "traditional";
  history: string;
  notes: string;
  brands: string[];
  image: string;
  rating: number;
}

const mockBebidas: Bebida[] = [
  {
    name: "Ron Dominicano",
    category: "alcohol",
    history: "La caña de azúcar introducida por Colón floreció en el fértil suelo dominicano, dando origen a una tradición ronera centenaria basada en el añejamiento natural en barricas de roble.",
    notes: "Notas intensas de vainilla, caramelo, frutos secos y un toque sutil de madera tostada y cacao.",
    brands: ["Brugal", "Barceló", "Bermúdez", "Siboney"],
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800",
    rating: 5.0
  },
  {
    name: "Mamajuana",
    category: "traditional",
    history: "Un elixir ancestral curativo heredado de los taínos, quienes preparaban infusiones de raíces y cortezas de árboles. Tras la colonización se le añadió ron y miel de abejas.",
    notes: "Sabor herbal aromático complejo, dulce, especiado, con matices terrosos y un regusto vigorizante.",
    brands: ["Kalembú", "Karibú", "Preparación casera tradicional"],
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800",
    rating: 4.9
  },
  {
    name: "Cerveza Presidente",
    category: "alcohol",
    history: "Nacida en 1935, es la cerveza insignia de República Dominicana. Considerada un elemento clave del folclor popular, presente en cada celebración, colmado y esquina.",
    notes: "Lager ligera y refrescante, de cuerpo medio, con un suave lúpulo y burbuja fina, servida a temperaturas heladas.",
    brands: ["Cervecería Nacional Dominicana"],
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",
    rating: 4.8
  },
  {
    name: "Morir Soñando",
    category: "non-alcohol",
    history: "La bebida láctea dulce por excelencia de la gastronomía dominicana. Su nombre lírico refleja la sensación reconfortante de tomar este nutritivo ponche cítrico.",
    notes: "Textura cremosa y aterciopelada, contraste balanceado entre el dulzor de la leche y la acidez del zumo de naranja natural.",
    brands: ["Elaboración hogareña y cafeterías locales"],
    image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800",
    rating: 4.9
  }
];

const tastingRoutes = [
  {
    title: "Ruta del Ron del Norte (Puerto Plata)",
    duration: "4 horas",
    stops: [
      { name: "Fábrica de Ron Brugal (Centro de Visitantes)", desc: "Aprende el proceso de destilación y envasado a gran escala y disfruta de una cata guiada de rones premium." },
      { name: "Casa Ron Macorix", desc: "Museo boutique del ron en el centro histórico, cata de rones saborizados con coco, piña y especias." }
    ]
  },
  {
    title: "Ruta Bohemia de la Zona Colonial",
    duration: "3 horas",
    stops: [
      { name: "La Hija de la Flaca Colmado", desc: "Prueba la cerveza Presidente en su punto de congelación exacto ('ceniza') conversando con vecinos." },
      { name: "El Bodegón de la Mamajuana", desc: "Taller artesanal interactivo para preparar tu propio frasco de mamajuana con corteza local." }
    ]
  }
];

export default function BebidasRD() {
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredBebidas = mockBebidas.filter(bebida => {
    if (activeTab === "all") return true;
    return bebida.category === activeTab;
  });

  const handleRouteRequest = (title: string) => {
    toast.success(`¡Ruta reservada: ${title}! Recibirás el mapa detallado y cupones de cata en tu email.`);
  };

  return (
    <PageTransition>
      <SEOHead
        title="Guía de Bebidas de República Dominicana"
        description="Explora las bebidas típicas dominicanas: ron, mamajuana, cerveza Presidente, morir soñando. Rutas de degustación y catas."
      />
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />

        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8">
            
            {/* Header Title */}
            <div className="text-center max-w-2xl mx-auto mb-10">
              <Badge className="mb-3 bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1.5 py-1 px-3">
                🍹 Sabores de Quisqueya
              </Badge>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground">
                Guía de Bebidas y Licores RD
              </h1>
              <p className="text-muted-foreground mt-3 text-base">
                Descubre el patrimonio líquido de la República Dominicana. Desde el centenario ron añejo hasta la exótica mamajuana de raíces taínas.
              </p>
            </div>

            {/* Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
              <div className="flex justify-center mb-8">
                <TabsList className="bg-secondary/40 border border-border">
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="alcohol">Espirituosas</TabsTrigger>
                  <TabsTrigger value="traditional">Tradicionales</TabsTrigger>
                  <TabsTrigger value="non-alcohol">Sin Alcohol</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value={activeTab} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredBebidas.map((bebida) => (
                    <Card key={bebida.name} className="overflow-hidden border border-border bg-card/65 hover:border-primary/20 transition-all duration-300 group hover:shadow-xl flex flex-col sm:flex-row h-full">
                      <div className="sm:w-1/3 relative aspect-square sm:aspect-auto overflow-hidden bg-muted">
                        <img
                          src={bebida.image}
                          alt={bebida.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-6 sm:w-2/3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] uppercase">
                              {bebida.category === "alcohol" ? "Con Alcohol" : bebida.category === "non-alcohol" ? "Sin Alcohol" : "Herencia Cultural"}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-bold text-foreground">{bebida.rating}</span>
                            </div>
                          </div>
                          <h3 className="font-display font-bold text-lg text-foreground mb-3 group-hover:text-primary transition-colors">
                            {bebida.name}
                          </h3>
                          <div className="space-y-3 text-xs text-muted-foreground">
                            <p className="leading-relaxed"><strong>Historia:</strong> {bebida.history}</p>
                            <p className="leading-relaxed"><strong>Notas de Cata:</strong> {bebida.notes}</p>
                          </div>
                        </div>

                        <div className="border-t border-border/40 pt-4 mt-4 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-muted-foreground">Marcas Sugeridas</p>
                            <p className="text-xs font-semibold text-foreground truncate max-w-[150px]">{bebida.brands.join(", ")}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => toast.info(`Mostrando bares donde disfrutar de: ${bebida.name}`)}
                            variant="outline"
                            className="text-xs border-amber-500 text-amber-500 hover:bg-amber-500/10"
                          >
                            Dónde Probarla
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Tasting Routes Section */}
            <div>
              <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                <Compass className="h-6 w-6 text-primary" /> Rutas de Degustación Sugeridas
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {tastingRoutes.map((route) => (
                  <Card key={route.title} className="bg-secondary/25 border border-border rounded-2xl overflow-hidden flex flex-col justify-between h-full">
                    <CardHeader className="p-6 pb-2">
                      <div className="flex justify-between items-center mb-1">
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">Ruta Oficial</Badge>
                        <span className="text-xs text-muted-foreground">{route.duration}</span>
                      </div>
                      <CardTitle className="text-lg font-bold">{route.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 space-y-4">
                      {route.stops.map((stop, i) => (
                        <div key={stop.name} className="flex gap-3 items-start border-l-2 border-primary/45 pl-4 ml-1 relative">
                          <div className="absolute w-3 h-3 rounded-full bg-primary -left-2 top-1 border-2 border-background" />
                          <div>
                            <p className="font-bold text-xs text-foreground">{i + 1}. {stop.name}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{stop.desc}</p>
                          </div>
                        </div>
                      ))}
                      <Button
                        onClick={() => handleRouteRequest(route.title)}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs mt-4 gap-1.5"
                      >
                        <MapPin className="h-3.5 w-3.5" /> Solicitar Mapa y Cupones
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
