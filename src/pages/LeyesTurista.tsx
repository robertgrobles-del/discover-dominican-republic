import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { PanoramaAd } from "@/components/promo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Scale, ShieldCheck, AlertTriangle, Camera, Leaf, Car,
  Cigarette, Wine, Phone, MapPin, Ban, Info, CheckCircle,
  ChevronRight, FileText, Globe, Plane
} from "lucide-react";

import santoDomingoImg from "@/assets/santo-domingo.jpg";

const leyesCategorizadas = [
  {
    categoria: "drones",
    titulo: "Uso de Drones en República Dominicana",
    severidad: "Moderada / Regulada",
    icon: Ban,
    desc: "El Instituto Dominicano de Aviación Civil (IDAC) exige registro previo para drones comerciales o con peso superior a 250 gramos. Está terminantemente prohibido volar sobre aeropuertos, bases militares, el Palacio Nacional, monumentos históricos congestionados y multitudes.",
    consejo: "Si traes un dron pequeño recreativo (<250g), podrás volarlo en playas despejadas y campos respetando la privacidad de otros turistas y una altura máxima de 120 metros."
  },
  {
    categoria: "drogas",
    titulo: "Cero Tolerancia con Estupefacientes (Ley 50-88)",
    severidad: "Severa / Penas de Cárcel",
    icon: AlertTriangle,
    desc: "La República Dominicana mantiene una política estricta de tolerancia cero contra la posesión, consumo, compra y tráfico de cualquier droga ilícita, incluyendo marihuana y derivados de cannabis. Las penas implican prisión obligatoria e incomunicación.",
    consejo: "Nunca transportes paquetes de desconocidos en aeropuertos y declina cualquier oferta en zonas de vida nocturna."
  },
  {
    categoria: "transito",
    titulo: "Conducción y Permiso Internacional (Ley 63-17)",
    severidad: "Moderada / Multas",
    icon: Car,
    desc: "Los turistas pueden conducir legalmente en el país con la licencia de su país de origen durante la vigencia de su visado o tarjeta de turista (hasta 30 días). El uso de cinturón de seguridad es obligatorio para todos los ocupantes.",
    consejo: "En autopistas como la Autovía del Este o la Autopista Duarte el límite de velocidad es de 100 km/h. Respeta los semáforos y evita conducir de noche en carreteras secundarias poco iluminadas."
  },
  {
    categoria: "medioambiente",
    titulo: "Protección de Flora y Fauna Marina (Ley 64-00)",
    severidad: "Severa / Multas y Decomiso",
    icon: Leaf,
    desc: "Está prohibida la extracción de corales, estrellas de mar, conchas marinas gigantes (Lambí), y la compra de artesanías confeccionadas con caparazón de tortuga carey o coral negro protegido por CITES.",
    consejo: "Disfruta de la fauna en su hábitat natural sin tocar ni alimentar animales silvestres."
  },
  {
    categoria: "alcohol",
    titulo: "Edad Mínima y Horarios de Bebidas Alcohólicas",
    severidad: "Leve / Restricción de Venta",
    icon: Wine,
    desc: "La edad legal para comprar y consumir alcohol en República Dominicana es de 18 años. Está prohibido vender alcohol a menores en colmados, bares y discotecas.",
    consejo: "En la mayoría de ciudades la venta nocturna en establecimientos no turísticos está regulada hasta las 2:00 AM entre semana y 3:00 AM los fines de semana."
  },
  {
    categoria: "aduanas",
    titulo: "Divisas y Franquicias Aduaneras de Entrada",
    severidad: "Obligatorio / Declaración",
    icon: Plane,
    desc: "Todo viajero debe completar el formulario electrónico obligatorio 'E-Ticket' antes de ingresar y salir del país. Si ingresas con más de US$ 10,000 en efectivo o su equivalente en divisas, debes declararlo ante la Dirección General de Aduanas.",
    consejo: "Los turistas tienen franquicia libre de impuestos para 20 cajetillas de cigarrillos y hasta 3 litros de licor para uso personal."
  }
];

const derechosTurista = [
  "Derecho a ser atendido con respeto y sin discriminación de nacionalidad, raza, religión o género.",
  "Derecho a recibir asistencia y protección inmediata de la Policía Turística (POLITUR) en caso de extravío o delito.",
  "Derecho a precios transparentes y recibo de compra en establecimientos comerciales y restaurantes (ProConsumidor).",
  "Derecho a atención médica de emergencia en centros de salud y activación de la red del Sistema 911.",
  "Derecho a contactar al consulado o embajada de tu país de origen en caso de incidente legal.",
  "Derecho a traslados seguros y tarifas reguladas en taxis autorizados de aeropuertos y aplicaciones verificadas."
];

const numerosUtiles = [
  { servicio: "Sistema Nacional de Emergencias", numero: "911", desc: "Policía, Bomberos y Ambulancias 24/7" },
  { servicio: "Policía Turística (POLITUR)", numero: "809-200-3500", desc: "Línea gratuita de asistencia directa al turista" },
  { servicio: "Ministerio de Turismo (MITUR)", numero: "809-221-4660", desc: "Información turística y quejas de servicios" },
  { servicio: "Protección al Consumidor (ProConsumidor)", numero: "809-567-8555", desc: "Reclamaciones sobre cobros indebidos o fraudes" },
  { servicio: "Defensor del Pueblo RD", numero: "809-381-7777", desc: "Garantía de derechos humanos e institucionales" },
];

export default function LeyesTurista() {
  const [selectedCat, setSelectedCat] = useState<string>("todas");

  const filteredLeyes = selectedCat === "todas"
    ? leyesCategorizadas
    : leyesCategorizadas.filter(l => l.categoria === selectedCat);

  return (
    <PageTransition>
      <SEOHead
        title="Leyes y Normas para Turistas en República Dominicana | Guía Legal y Seguridad RD"
        description="Conoce las leyes clave para viajeros en RD: uso de drones, normas de tránsito, leyes sobre estupefacientes, aduanas, derechos del turista y teléfonos de POLITUR."
        keywords="leyes turista dominicana, normas viajero rd, drones republica dominicana ley, politur telefono emergencia, conducir en dominicana turista"
      />
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />

        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[460px] flex items-end overflow-hidden">
          <img
            src={santoDomingoImg}
            alt="Leyes y Seguridad para Turistas en República Dominicana"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-black/35" />

          <div className="relative z-10 container mx-auto px-4 lg:px-8 pb-12">
            <nav className="flex items-center gap-2 text-xs md:text-sm text-white/80 mb-4">
              <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link to="/planifica" className="hover:text-primary transition-colors">Planifica</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-white font-medium">Leyes y Normas para el Turista</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <Badge className="mb-3 bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs px-3 py-1 font-semibold">
                  <Scale className="h-3.5 w-3.5 mr-1.5" /> INFORMACIÓN LEGAL Y SEGURIDAD
                </Badge>
                <h1 className="font-display text-4xl md:text-6xl font-black text-white tracking-tight mb-3">
                  Leyes & Normas para el Turista
                </h1>
                <p className="text-base md:text-lg text-white/90 max-w-2xl leading-relaxed">
                  Todo lo que necesitas saber sobre normativas locales, uso de drones, aduanas, tránsito y tus derechos garantizados durante tu estadía en República Dominicana.
                </p>
              </div>

              {/* Politur badge */}
              <div className="bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-white flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-white/70 font-medium">Línea de Ayuda POLITUR</p>
                  <a href="tel:8092003500" className="text-sm font-bold text-primary hover:underline">
                    809-200-3500 (24h)
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Laws Grid */}
        <section className="py-16 container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">
              NORMATIVAS VIGENTES
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Regulaciones Clave que Debes Conocer
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
              Mantente informado para disfrutar de unas vacaciones seguras y sin contratiempos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {leyesCategorizadas.map((ley) => (
              <Card key={ley.titulo} className="bg-card border-border/80 hover:border-primary/40 hover:shadow-lg transition-all flex flex-col justify-between">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <ley.icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-foreground">{ley.titulo}</h3>
                    </div>
                    <Badge variant={ley.severidad.includes("Severa") ? "destructive" : "secondary"} className="text-[10px] shrink-0">
                      {ley.severidad}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {ley.desc}
                  </p>

                  <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 text-xs text-primary leading-relaxed">
                    <strong>💡 Consejo práctico:</strong> {ley.consejo}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tourist Rights */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-10 mb-16">
            <div className="text-center mb-8">
              <Badge className="mb-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                TUS GARANTÍAS
              </Badge>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Tus Derechos como Visitante en RD
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {derechosTurista.map((derecho, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 bg-muted/30 rounded-xl border border-border/60">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">{derecho}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Useful Emergency Numbers */}
          <div className="max-w-3xl mx-auto">
            <h3 className="font-display text-2xl font-bold text-foreground mb-6 text-center flex items-center justify-center gap-2">
              <Phone className="h-5 w-5 text-primary" /> Teléfonos Útiles de Asistencia Inmediata
            </h3>
            <div className="space-y-3">
              {numerosUtiles.map((num) => (
                <div key={num.servicio} className="p-4 bg-card rounded-xl border border-border flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{num.servicio}</h4>
                    <p className="text-xs text-muted-foreground">{num.desc}</p>
                  </div>
                  <a 
                    href={`tel:${num.numero.replace(/\D/g, '')}`} 
                    className="px-3.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-sm rounded-lg transition-colors shrink-0"
                  >
                    {num.numero}
                  </a>
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
