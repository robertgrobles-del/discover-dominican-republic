import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, MapPin, UtensilsCrossed, Star, CheckCircle, ShoppingBag } from "lucide-react";
import gastronomy from "@/assets/gastronomy.jpg";

const restaurantes = [
  { nombre: "Pura Tasca", ubicacion: "Santo Domingo", tipo: "Vegano/Vegetariano", opciones: ["Menú 100% plant-based", "Bowls, wraps y jugos", "Brunch los fines de semana"], rating: 4.7 },
  { nombre: "Café Lara", ubicacion: "Zona Colonial", tipo: "Vegetarian-friendly", opciones: ["Opciones veganas en menú", "Postres sin lácteos", "Café orgánico local"], rating: 4.5 },
  { nombre: "Greenlife", ubicacion: "Santiago", tipo: "Vegano", opciones: ["Comida rápida vegana", "Hamburguesas de plátano", "Smoothies tropicales"], rating: 4.3 },
  { nombre: "Tracadero Restaurante", ubicacion: "Cabarete", tipo: "Vegetarian-friendly", opciones: ["Cocina internacional con opciones veganas", "Vista al mar", "Ensaladas gourmet"], rating: 4.6 },
  { nombre: "The Beach Club", ubicacion: "Las Terrenas", tipo: "Vegetarian-friendly", opciones: ["Menú con sección vegana", "Ceviche de vegetales", "Smoothie bowls"], rating: 4.4 },
  { nombre: "Jalao", ubicacion: "Santo Domingo", tipo: "Local con opciones", opciones: ["Cocina dominicana con opciones sin carne", "Moro de habichuelas", "Tostones y ensaladas"], rating: 4.5 },
];

const platosLocales = [
  { nombre: "Mangú de plátano", desc: "Puré de plátano verde con cebolla roja. Naturalmente vegano.", vegano: true },
  { nombre: "Habichuelas guisadas", desc: "Guiso de frijoles rojos. Pedir sin carne.", vegano: true },
  { nombre: "Moro de guandules", desc: "Arroz con gandules (pigeon peas). Pedir sin carne.", vegano: true },
  { nombre: "Tostones", desc: "Plátano verde frito. Snack vegano universal en RD.", vegano: true },
  { nombre: "Ensalada verde", desc: "Aguacate, tomate, lechuga. Pedir sin queso.", vegano: true },
  { nombre: "Yuca hervida", desc: "Tubérculo hervido con cebolla y aceite. Vegano.", vegano: true },
  { nombre: "Batidas tropicales", desc: "Smoothies de chinola, mango, lechosa, piña. Con agua o leche de coco.", vegano: true },
  { nombre: "Dulce de coco", desc: "Postre de coco rallado con azúcar. Vegano.", vegano: true },
];

const tipsResorts = [
  "La mayoría de resorts all-inclusive tienen estación de ensaladas y frutas tropicales abundantes",
  "Solicita opciones veganas al hacer la reserva — la mayoría acomoda sin problema",
  "Buffets tienen arroz, frijoles, vegetales y frutas que son naturalmente veganos",
  "Restaurantes a la carta de los resorts suelen tener más opciones personalizables",
  "Pide 'sin carne, sin queso, sin leche' — la mayoría de cocineros entiende",
  "Los resorts de cadenas internacionales (Hyatt, Marriott) tienen menús veganos específicos",
];

const mercadosOrganicos = [
  { nombre: "Mercado Orgánico de Santo Domingo", ubicacion: "Parque de la Salud, los sábados", desc: "Frutas, vegetales, productos artesanales orgánicos" },
  { nombre: "Bio Market RD", ubicacion: "Naco, Santo Domingo", desc: "Supermercado con sección orgánica y vegana" },
  { nombre: "Feria Agroecológica", ubicacion: "Santiago, los domingos", desc: "Productos locales y orgánicos directos del campo" },
  { nombre: "Supermercados Nacional/Bravo", ubicacion: "Todo el país", desc: "Secciones de productos saludables y veganos crecientes" },
];

export default function GuiaVegana() {
  return (
    <PageTransition>
      <SEOHead
        title="Guía Vegana y Vegetariana de República Dominicana"
        description="Restaurantes veganos, platos locales plant-based, tips en resorts y mercados orgánicos. Guía para vegetarianos y veganos en RD."
        keywords="vegano dominicana, vegetariano RD, restaurantes veganos punta cana, comida vegana caribe"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <section className="relative min-h-[40vh] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <img src={gastronomy} alt="Comida vegana dominicana" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          </div>
          <div className="container mx-auto px-4 relative z-10 py-16">
            <Badge className="mb-4 bg-white/10 text-white border-white/20 backdrop-blur-sm">
              🌱 Plant-Based Travel
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 max-w-2xl">
              Guía <span className="text-primary">Vegana & Vegetariana</span>
            </h1>
            <p className="text-lg text-white/80 max-w-xl">
              Descubre que RD tiene mucho más que carne: plátano, yuca, frijoles, frutas tropicales y opciones plant-based.
            </p>
          </div>
        </section>

        {/* Platos locales veganos */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6 text-center">🍽️ Platos Dominicanos Naturalmente Veganos</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {platosLocales.map(p => (
                <div key={p.nombre} className="bg-card rounded-xl p-4 border border-border flex items-start gap-3">
                  <Leaf className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{p.nombre}</h3>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Restaurantes */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">🥗 Restaurantes Recomendados</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {restaurantes.map(r => (
                <Card key={r.nombre}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground text-sm">{r.nombre}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500" />
                        <span className="text-xs text-muted-foreground">{r.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3" /> {r.ubicacion}
                    </div>
                    <Badge variant="outline" className="text-[10px] mb-2">{r.tipo}</Badge>
                    <ul className="space-y-1 mt-2">
                      {r.opciones.map(o => (
                        <li key={o} className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckCircle className="h-2.5 w-2.5 text-emerald-500" /> {o}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Tips en resorts */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-display text-xl font-bold text-foreground mb-6 text-center">🏨 Tips para Resorts All-Inclusive</h2>
            <div className="space-y-2">
              {tipsResorts.map(t => (
                <div key={t} className="flex items-start gap-3 bg-card rounded-xl p-4 border border-border">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mercados */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-display text-xl font-bold text-foreground mb-6 text-center">🛒 Mercados y Tiendas Orgánicas</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {mercadosOrganicos.map(m => (
                <div key={m.nombre} className="bg-background rounded-xl p-4 border border-border">
                  <h3 className="font-semibold text-foreground text-sm mb-1">{m.nombre}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                    <MapPin className="h-3 w-3" /> {m.ubicacion}
                  </p>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
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
