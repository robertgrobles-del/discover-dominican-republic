import { SectionIndex } from "@/components/SectionIndex";
import { SpasSection } from "@/components/wellness/SpasSection";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Link } from "react-router-dom";
import { Waves, Heart, Mountain, Leaf, MapPin, Star, Mail, Droplets, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BetweenSectionsAd, CompactInlineAd } from "@/components/promo";
import heroBeach from "@/assets/hero-beach.jpg";
import hotelClareVerde from "@/assets/hotel-clare-verde.jpg";
import adventure from "@/assets/adventure.jpg";
import { usePageContent } from "@/lib/pageContent";

const categorias = [
  { nombre: "Todos", activo: true, ancla: "tratamientos" },
  { nombre: "Spas de Lujo", activo: false, ancla: "spas" },
  { nombre: "Yoga en Samaná", activo: false, ancla: "retiros" },
  { nombre: "Retiros de Montaña", activo: false, ancla: "retiros" },
  { nombre: "Terapias Holísticas", activo: false, ancla: "tratamientos" },
];

const tratamientos = [
  { nombre: "Hidroterapia", icon: Droplets, desc: "Circuitos de agua y piscinas termales en los spas de resort" },
  { nombre: "Mindfulness", icon: Heart, desc: "Meditación guiada y yoga para cuerpo y mente en armonía" },
  { nombre: "Termales", icon: Mountain, desc: "Aguas termales naturales en el sur y la cordillera" },
  { nombre: "Productos naturales", icon: Leaf, desc: "Tratamientos con cacao, café e ingredientes orgánicos locales" },
  { nombre: "Relax total", icon: Smile, desc: "Ambientes de tranquilidad frente al mar o en la montaña" },
  { nombre: "Ayurveda", icon: Waves, desc: "Terapias holísticas y masajes con aceites esenciales" },
];

const retiros = [
  {
    id: 1,
    slug: "santuario-del-mar",
    nombre: "Santuario del Mar Spa",
    ubicacion: "Punta Cana, La Altagracia",
    descripcion: "Experiencia de rejuvenecimiento total frente al mar Caribe con tratamientos...",
    imagen: hotelClareVerde,
    precio: 180,
    unidad: "día",
    rating: 4.9,
    resenas: 108,
    tipo: "SPA DE LUJO"
  },
  {
    id: 2,
    slug: "el-valle-yoga-loft",
    nombre: "El Valle Yoga Loft",
    ubicacion: "Las Terrenas, Samaná",
    descripcion: "Conecta con la naturaleza en nuestros bungalows ecológicos y sesiones...",
    imagen: adventure,
    precio: 450,
    unidad: "paquete 3 días",
    rating: 4.8,
    resenas: 65,
    tipo: "YOGA RETREAT"
  },
  {
    id: 3,
    slug: "eco-retiro-los-pinos",
    nombre: "Eco-Retiro Los Pinos",
    ubicacion: "Jarabacoa, La Vega",
    descripcion: "Aire fresco, meditación guiada y senderismo consciente en la eterna...",
    imagen: heroBeach,
    precio: 120,
    unidad: "noche",
    rating: 5.0,
    resenas: 42,
    tipo: "MONTAÑA & ZEN"
  }
];

const zonas = [
  { nombre: "Zona Norte", desc: "Puerto Plata, Cabarete" },
  { nombre: "Península de Samaná", desc: "Las Terrenas, Las Galeras" },
];

export default function Wellness() {
  const pc = usePageContent("wellness");
  const categorias = pc.data("categorias", __pcData.categorias);
  const tratamientos = pc.data("tratamientos", __pcData.tratamientos);
  const retiros = pc.data("retiros", __pcData.retiros);
  const zonas = pc.data("zonas", __pcData.zonas);
  return (
    <PageTransition>
      <div className="min-h-dvh flex flex-col bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden aspect-[16/9] mb-8">
              <img 
                src={pc.img("img.src.1", heroBeach)} 
                alt={pc.t("img.alt.1", "Wellness y Retiros")} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <Badge className="mb-4 bg-white/10 text-white border-white/30">{pc.tx("Badge.1", "TURISMO DE BIENESTAR")}</Badge>
                <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">{pc.tx("h1.1", "Wellness y Retiros")}</h1>
                <p className="text-white/90 max-w-lg mb-6">{pc.tx("p.1", "Yoga, retiros de montaña y spas de lujo. Desde Samaná hasta Punta Cana.")}</p>
                <div className="flex gap-3">
                  <Button className="bg-primary text-primary-foreground" asChild><a href="#tratamientos">{pc.tx("Button.1", "Explorar Experiencias →")}</a></Button>
                  <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20" asChild><a href="#mapa">{pc.tx("Button.2", "Ver Mapa Interactivo")}</a></Button>
                </div>
              </div>
            </div>

            {/* Categorías */}
            <div className="flex flex-wrap gap-3 justify-center">
              {categorias.map((cat) => (
                <a
                  key={cat.nombre}
                  href={`#${cat.ancla}`}
                  className={`rounded-full border text-sm px-4 py-2 font-medium transition-colors ${
                    cat.activo ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card text-foreground hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {cat.nombre}
                </a>
              ))}
            </div>
          </div>
        </section>
        <SectionIndex items={[{ id: "tratamientos", label: "Tratamientos" }, { id: "retiros", label: "Retiros" }, { id: "mapa", label: "Dónde ir" }, { id: "spas", label: "Spas" }]} />

        {/* Encuentra tu Equilibrio */}
        <section id="tratamientos" className="py-16 px-4 scroll-mt-24">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">{pc.tx("h2.1", "Encuentra tu Equilibrio")}</h2>
            <p className="text-muted-foreground mb-12 max-w-xl mx-auto">{pc.tx("p.2", "Explora una variedad de tratamientos diseñados para restaurar tu cuerpo y alma en el corazón del Caribe.")}</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-10">
              {tratamientos.map((t) => (
                <div key={t.nombre} className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
                    <t.icon className="h-8 w-8 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{t.nombre}</span>
                  {t.desc && <p className="text-sm text-muted-foreground max-w-[14rem]">{t.desc}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Retiros Destacados */}
        <section id="retiros" className="py-16 px-4 bg-card/30 scroll-mt-24">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl font-bold text-foreground">{pc.tx("h2.2", "Retiros Destacados")}</h2>
              <Link to="/alojamientos" className="text-primary font-medium text-sm hover:underline">{pc.tx("Link.1", "Ver todos →")}</Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {retiros.map((retiro) => (
                <Link key={retiro.id} to={`/spa/${retiro.slug}`} className="bg-card rounded-2xl border border-border overflow-hidden group block hover:shadow-lg transition-shadow">
                  <div className="relative aspect-[4/3]">
                    <img 
                      src={retiro.imagen} 
                      alt={retiro.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <Badge className="absolute top-4 left-4 bg-primary/90 text-primary-foreground text-xs">
                      {retiro.tipo}
                    </Badge>
                    <button className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white" onClick={(e) => e.preventDefault()}>
                      <Heart className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                      <MapPin className="h-3 w-3" />
                      <span>{retiro.ubicacion}</span>
                    </div>
                    <h3 className="font-display font-bold text-lg text-foreground mb-2">
                      {retiro.nombre}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {retiro.descripcion}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-sm">{retiro.rating}</span>
                        <span className="text-muted-foreground text-sm">({retiro.resenas}{" "}{pc.tx("span.1", "reseñas)")}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">{pc.tx("span.2", "Desde")}</span>
                        <p className="font-bold text-foreground">
                          ${retiro.precio}<span className="text-sm font-normal text-muted-foreground">/{retiro.unidad}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Mapa Interactivo */}
        <section id="mapa" className="py-16 px-4 scroll-mt-24">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-3xl p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">{pc.tx("Badge.2", "🌿 EXPLORA LA ISLA")}</Badge>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">{pc.tx("h2.3", "Encuentra tu santuario")}</h2>
                  <p className="text-muted-foreground mb-6">{pc.tx("p.3", "Navega por nuestro mapa interactivo para descubrir gemas ocultas, desde cabañas aisladas hasta resorts de clase mundial.")}</p>
                  <div className="space-y-4">
                    {zonas.map((zona) => (
                      <div key={zona.nombre} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                          <Mountain className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{zona.nombre}</p>
                          <p className="text-sm text-muted-foreground">{zona.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-800/30 dark:to-emerald-800/30 rounded-2xl aspect-square flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">{pc.tx("p.4", "Mapa Interactivo")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 px-4">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">{pc.tx("h2.4", "Paz en tu bandeja de entrada")}</h2>
            <p className="text-muted-foreground mb-8">{pc.tx("p.5", "Recibe guías exclusivas de meditación, ofertas en retiros y secretos de bienestar de la isla.")}</p>
            <div className="flex gap-3 max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder={pc.t("Input.placeholder.1", "Tu correo electrónico")} 
                className="flex-1"
              />
              <Button className="bg-primary text-primary-foreground">{pc.tx("Button.3", "Suscribir")}</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">{pc.tx("p.6", "Respetamos tu privacidad. Date de baja cuando quieras.")}</p>
          </div>
        </section>

        {/* Ad before footer */}
        <BetweenSectionsAd showDemo />

        <SpasSection />
        <Footer />
      </div>
    </PageTransition>
  );
}

// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).
const __pcData = { categorias, tratamientos, retiros, zonas };
