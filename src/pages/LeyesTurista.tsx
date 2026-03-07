import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Scale, ShieldCheck, AlertTriangle, Camera, Leaf, Car,
  Cigarette, Wine, Phone, MapPin, Ban, Info, CheckCircle
} from "lucide-react";

const leyes = [
  {
    icon: AlertTriangle, titulo: "Drogas", severidad: "GRAVE", color: "text-destructive",
    desc: "Tolerancia CERO. Posesión, consumo o tráfico de cualquier droga conlleva penas de 5 a 20 años de cárcel. No hay excepciones para turistas.",
    consejo: "No aceptes paquetes de desconocidos. No lleves sustancias ilegales."
  },
  {
    icon: Camera, titulo: "Fotografía", severidad: "MODERADA", color: "text-amber-500",
    desc: "Prohibido fotografiar instalaciones militares, policiales y aeropuertos (áreas restringidas). Pide permiso antes de fotografiar personas, especialmente niños.",
    consejo: "En la Zona Colonial y zonas turísticas puedes fotografiar libremente."
  },
  {
    icon: Car, titulo: "Conducción", severidad: "MODERADA", color: "text-amber-500",
    desc: "Límite de alcohol: 0.05% BAC. Usar celular al conducir es ilegal. Cinturón de seguridad obligatorio. Menores de 12 años en asiento trasero.",
    consejo: "Si te detienen, pide identificación del oficial. No pagues 'multas' informales."
  },
  {
    icon: Leaf, titulo: "Medio Ambiente", severidad: "MODERADA", color: "text-emerald-500",
    desc: "Prohibido recolectar coral, carey, larimar de áreas protegidas. Prohibido pescar en parques nacionales. Multas por tirar basura en playas.",
    consejo: "Compra larimar y ámbar solo en tiendas certificadas con factura."
  },
  {
    icon: Wine, titulo: "Alcohol", severidad: "LEVE", color: "text-sky-500",
    desc: "Edad legal para beber: 18 años. No se permite consumo en vía pública (aunque se tolera en zonas turísticas). Conducir ebrio es delito.",
    consejo: "El ron dominicano es excelente pero potente. Hidrátate entre tragos."
  },
  {
    icon: Cigarette, titulo: "Tabaco", severidad: "LEVE", color: "text-sky-500",
    desc: "Prohibido fumar en espacios públicos cerrados, restaurantes y transporte público. Multas de RD$5,000-25,000.",
    consejo: "Los puros dominicanos se disfrutan mejor en terrazas y áreas designadas."
  },
  {
    icon: Ban, titulo: "Drones", severidad: "MODERADA", color: "text-amber-500",
    desc: "Uso de drones requiere permiso del IDAC (Instituto Dominicano de Aviación Civil). Prohibido volar sobre aeropuertos, zonas militares y multitudes.",
    consejo: "Solicita permiso online al menos 15 días antes. Multas y confiscación si vuelas sin permiso."
  },
  {
    icon: Phone, titulo: "Estafas comunes", severidad: "INFORMACIÓN", color: "text-primary",
    desc: "Taxistas sin taxímetro con precios inflados. Cambistas callejeros con tasas malas. 'Guías' no oficiales que cobran servicios no solicitados.",
    consejo: "Negocia precios ANTES del servicio. Usa apps de transporte. Cambia dinero en bancos."
  },
];

const derechosTurista = [
  "Derecho a recibir precios justos sin discriminación por nacionalidad",
  "Derecho a asistencia de la Policía Turística (POLITUR) las 24 horas",
  "Derecho a presentar quejas ante el Ministerio de Turismo",
  "Derecho a información clara sobre precios antes de consumir",
  "Derecho a negarte a servicios no solicitados",
  "Derecho a asistencia consular de tu país",
  "Derecho a traducción si eres detenido y no hablas español",
];

const numerosUtiles = [
  { servicio: "Emergencia general", numero: "911" },
  { servicio: "Policía Turística (POLITUR)", numero: "+1 809-200-3500" },
  { servicio: "Ministerio de Turismo", numero: "+1 809-221-4660" },
  { servicio: "Protección al consumidor (ProConsumidor)", numero: "+1 809-683-4757" },
  { servicio: "Defensoría del Pueblo", numero: "+1 809-381-7777" },
];

export default function LeyesTurista() {
  return (
    <PageTransition>
      <SEOHead
        title="Leyes y Normas para Turistas en República Dominicana"
        description="Lo que todo turista debe saber: leyes sobre drogas, fotografía, drones, alcohol, conducción y derechos del turista en RD."
        keywords="leyes turista dominicana, normas viajero RD, drones dominicana, drogas RD, derechos turista"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Scale className="h-3 w-3 mr-1" /> Información Legal
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Leyes y Normas para <span className="text-primary">Turistas</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Conoce las reglas básicas para disfrutar RD sin problemas. Tu seguridad y tu libertad dependen de estar informado.
            </p>
          </div>
        </section>

        {/* Leyes */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="space-y-4">
              {leyes.map(l => (
                <Card key={l.titulo}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <l.icon className={`h-6 w-6 ${l.color} shrink-0 mt-0.5`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{l.titulo}</h3>
                          <Badge variant={l.severidad === "GRAVE" ? "destructive" : "outline"} className="text-[10px]">
                            {l.severidad}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{l.desc}</p>
                        <p className="text-xs text-primary bg-primary/5 rounded-lg p-2">💡 {l.consejo}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Derechos */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-display text-xl font-bold text-foreground mb-6 text-center">🛡️ Tus Derechos como Turista</h2>
            <div className="space-y-2">
              {derechosTurista.map(d => (
                <div key={d} className="flex items-start gap-3 bg-background rounded-xl p-4 border border-border">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Números */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="font-display text-xl font-bold text-foreground mb-6 text-center">📞 Números Útiles</h2>
            <div className="space-y-2">
              {numerosUtiles.map(n => (
                <div key={n.servicio} className="flex items-center justify-between bg-card rounded-xl p-4 border border-border">
                  <span className="text-sm text-foreground">{n.servicio}</span>
                  <a href={`tel:${n.numero}`} className="text-primary font-bold hover:underline">{n.numero}</a>
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
