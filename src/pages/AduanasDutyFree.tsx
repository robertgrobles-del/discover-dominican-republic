import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Package, ShoppingBag, AlertTriangle, CheckCircle, XCircle,
  Plane, Wine, Cigarette, DollarSign, Gift, Gem, Info
} from "lucide-react";

const permitido = [
  { item: "Alcohol", limite: "1 litro por persona (mayores de 18)", icon: Wine, notas: "Ron dominicano es popular. Declara cantidades adicionales." },
  { item: "Tabaco / Cigarros", limite: "200 cigarrillos o 1 caja de puros", icon: Cigarette, notas: "Los puros dominicanos son de clase mundial. Compra en tiendas certificadas." },
  { item: "Perfumes", limite: "Uso personal razonable", icon: Gift, notas: "Fragancias en duty-free son hasta 40% más baratas." },
  { item: "Artesanías", limite: "Sin restricción para uso personal", icon: Gem, notas: "Larimar, ámbar, pinturas y cerámicas son los souvenirs clásicos." },
  { item: "Café / Cacao", limite: "Cantidades personales razonables", icon: ShoppingBag, notas: "Café Santo Domingo y cacao orgánico son excelentes regalos." },
  { item: "Mamajuana", limite: "1-2 botellas (puede requerir declaración)", icon: Wine, notas: "Bebida tradicional. Algunos países restringen hierbas medicinales." },
];

const prohibido = [
  { item: "Armas de fuego y municiones", razon: "Prohibición total. Penas de cárcel." },
  { item: "Drogas ilegales", razon: "Tolerancia cero. Penas severas de 5-20 años." },
  { item: "Flora y fauna protegida", razon: "Coral, carey, algunas plantas están protegidos." },
  { item: "Productos de carey (tortuga)", razon: "Protegido internacionalmente. Confiscación y multa." },
  { item: "Alimentos frescos sin declarar", razon: "Carnes, frutas y vegetales requieren inspección." },
  { item: "Más de US$10,000 sin declarar", razon: "Montos superiores deben ser declarados al entrar/salir." },
];

const dutyFree = [
  { tienda: "Duty Free Americas", ubicacion: "Todos los aeropuertos", productos: "Licores, perfumes, tabaco, electrónicos, chocolates" },
  { tienda: "Dufry", ubicacion: "PUJ, SDQ", productos: "Marcas internacionales, relojes, moda" },
  { tienda: "Brugal / Barceló stores", ubicacion: "Aeropuertos", productos: "Ron premium a precios especiales" },
];

const porPais = [
  { pais: "🇺🇸 EE.UU.", alcohol: "1 litro", tabaco: "200 cigarrillos o 100 puros", exencion: "US$800 en compras", nota: "CBP puede inspeccionar alimentos. Declara mamajuana." },
  { pais: "🇨🇦 Canadá", alcohol: "1.14L licor o 1.5L vino", tabaco: "200 cigarrillos o 50 puros", exencion: "CA$800 (7+ días)", nota: "Productos de madera pueden requerir inspección." },
  { pais: "🇪🇺 Europa (UE)", alcohol: "1L licor fuerte o 2L vino", tabaco: "200 cigarrillos o 50 puros", exencion: "€430 (avión)", nota: "Declara artículos de valor. Mamajuana puede ser retenida." },
  { pais: "🇨🇴🇲🇽🇧🇷 Latam", alcohol: "Variable (1-3L)", tabaco: "200-400 cigarrillos", exencion: "US$300-500", nota: "Verifica regulaciones específicas de tu país." },
];

export default function AduanasDutyFree() {
  return (
    <PageTransition>
      <SEOHead
        title="Aduanas y Duty-Free en República Dominicana"
        description="Qué puedes llevar de vuelta: límites de alcohol, tabaco, artesanías. Tiendas duty-free, productos prohibidos y regulaciones por país."
        keywords="aduanas dominicana, duty free RD, que puedo llevar de dominicana, limites aduana"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Package className="h-3 w-3 mr-1" /> Información Aduanera
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Aduanas y <span className="text-primary">Duty-Free</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Qué puedes llevar, qué está prohibido y cómo aprovechar las tiendas duty-free en los aeropuertos.
            </p>
          </div>
        </section>

        {/* Permitido */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6 text-center">✅ Qué Puedes Llevar</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {permitido.map(p => (
                <Card key={p.item}>
                  <CardContent className="p-5 flex gap-4">
                    <p.icon className="h-6 w-6 text-primary shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{p.item}</h3>
                      <p className="text-xs text-primary font-medium">{p.limite}</p>
                      <p className="text-xs text-muted-foreground mt-1">{p.notas}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Prohibido */}
        <section className="py-12 bg-destructive/5">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-display text-xl font-bold text-foreground mb-6 text-center flex items-center justify-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" /> Prohibido / Restringido
            </h2>
            <div className="space-y-3">
              {prohibido.map(p => (
                <div key={p.item} className="bg-background rounded-xl p-4 border border-destructive/20 flex items-start gap-3">
                  <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{p.item}</h3>
                    <p className="text-xs text-muted-foreground">{p.razon}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Límites por país */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-display text-xl font-bold text-foreground mb-6 text-center">🌍 Límites al Regresar a Tu País</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {porPais.map(p => (
                <Card key={p.pais}>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-foreground mb-2">{p.pais}</h3>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p><strong className="text-foreground">Alcohol:</strong> {p.alcohol}</p>
                      <p><strong className="text-foreground">Tabaco:</strong> {p.tabaco}</p>
                      <p><strong className="text-foreground">Exención:</strong> {p.exencion}</p>
                      <p className="text-primary mt-1">💡 {p.nota}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Duty-Free */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-display text-xl font-bold text-foreground mb-6 text-center">🛍️ Tiendas Duty-Free</h2>
            <div className="space-y-3">
              {dutyFree.map(d => (
                <div key={d.tienda} className="bg-background rounded-xl p-4 border border-border">
                  <h3 className="font-semibold text-foreground text-sm">{d.tienda}</h3>
                  <p className="text-xs text-muted-foreground">{d.ubicacion}</p>
                  <p className="text-xs text-primary mt-1">{d.productos}</p>
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
