import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { 
  Compass, MapPin, Bed, Utensils, Calendar, ShieldCheck, 
  HelpCircle, Sparkles, Navigation, Globe, Waves, Mountain, BookOpen
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Sitemap() {
  const sections = [
    {
      title: "Destinos & Provincias",
      icon: MapPin,
      badge: "32 Provincias",
      links: [
        { name: "Todos los Destinos", href: "/destinos" },
        { name: "Directorio de Provincias (32/32)", href: "/provincias" },
        { name: "Punta Cana (La Altagracia)", href: "/destino/punta-cana" },
        { name: "Santo Domingo (Distrito Nacional)", href: "/destino/santo-domingo" },
        { name: "Samaná y Las Terrenas", href: "/destino/samana" },
        { name: "Puerto Plata y Cabarete", href: "/destino/puerto-plata" },
        { name: "La Romana y Bayahíbe", href: "/destino/la-romana" },
        { name: "Jarabacoa y Constanza", href: "/destino/jarabacoa" },
        { name: "Barahona y Pedernales", href: "/destino/barahona" },
        { name: "Montecristi y Línea Noroeste", href: "/provincia/montecristi" },
      ],
    },
    {
      title: "Naturaleza & Ecoturismo",
      icon: Waves,
      badge: "Costas y Balnearios",
      links: [
        { name: "Portal de Playas y Semáforo Costero", href: "/playas" },
        { name: "Ríos, Cascadas y Balnearios (40+)", href: "/rios" },
        { name: "Explorador de Biodiversidad y Fauna", href: "/biodiversidad" },
        { name: "Ecoturismo y Áreas Protegidas", href: "/ecoturismo" },
        { name: "Montañas y Rutas de Senderismo", href: "/montanas" },
        { name: "Astroturismo y Cielos Oscuros", href: "/astroturismo" },
        { name: "Turismo Sostenible y Carbono", href: "/sostenible" },
      ],
    },
    {
      title: "Gastronomía Dominicana",
      icon: Utensils,
      badge: "Sabor Criollo",
      links: [
        { name: "Guía Gastronómica y Restaurantes", href: "/guia-gastronomica" },
        { name: "Rutas del Sabor (Café, Cacao, Tabaco, Ron)", href: "/rutas-sabor" },
        { name: "Recetas Criollas Paso a Paso", href: "/recetas-criollas" },
        { name: "Directorio de Chefs Dominicanos", href: "/chefs" },
        { name: "Identificador de Comida Dominicana", href: "/identificador-comida" },
      ],
    },
    {
      title: "Alojamientos & Estadía",
      icon: Bed,
      badge: "Resorts y Cabañas",
      links: [
        { name: "Directorio de Alojamientos y Hoteles", href: "/alojamientos" },
        { name: "Comparador Interactivo de Hoteles", href: "/comparador-hoteles" },
        { name: "Eco-Lodges y Glamping de Montaña", href: "/alojamientos?categoria=mountain" },
        { name: "Villas Frente al Mar", href: "/alojamientos?categoria=beachfront" },
        { name: "Resorts Todo Incluido", href: "/alojamientos?categoria=resort" },
      ],
    },
    {
      title: "Experiencias, Cultura & Tours",
      icon: Sparkles,
      badge: "500 Años de Historia",
      links: [
        { name: "Catálogo de Experiencias", href: "/experiencias" },
        { name: "Paquetes de Tours y Excursiones", href: "/tours" },
        { name: "Cultura y Tradiciones", href: "/cultura" },
        { name: "Patrimonio y Monumentos Históricos", href: "/patrimonio" },
        { name: "Directorio de Museos", href: "/museos" },
        { name: "Vida Nocturna y Bares", href: "/vida-nocturna" },
        { name: "Beisbol Dominicano (LIDOM)", href: "/lidom" },
        { name: "Bienestar, Spas y Wellness", href: "/wellness" },
      ],
    },
    {
      title: "Herramientas del Viajero",
      icon: Navigation,
      badge: "Utilidades",
      links: [
        { name: "Hub de Herramientas de Viaje", href: "/herramientas" },
        { name: "Cómo Llegar y Transporte", href: "/como-llegar" },
        { name: "Información de Transporte Terrestre", href: "/info-transporte" },
        { name: "Calculadora de Presupuesto", href: "/calculadora-presupuesto" },
        { name: "Conversor de Moneda (DOP/USD/EUR)", href: "/conversor-moneda" },
        { name: "Estado y Clima de Playas en Tiempo Real", href: "/estado-playas" },
        { name: "Diccionario de Dominicanismos", href: "/diccionario" },
        { name: "Mi Viaje e Itinerario Inteligente", href: "/mi-viaje" },
      ],
    },
    {
      title: "Servicios y Negocios",
      icon: Globe,
      badge: "B2B y MITUR",
      links: [
        { name: "Inversión Turística y Proyectos", href: "/inversion" },
        { name: "Turismo MICE y Eventos", href: "/mice" },
        { name: "Turismo Médico y Salud", href: "/turismo-medico" },
        { name: "Nómadas Digitales en RD", href: "/nomadas-digitales" },
        { name: "Directorio de Agencias de Viaje", href: "/directorio-agencias" },
        { name: "Portal de Partners y Registro", href: "/partner/login" },
        { name: "Operadores RD: reservas directas", href: "/operadores" },
        { name: "Directorio de operadores verificados", href: "/operadores/directorio" },
        { name: "Panel de operador", href: "/operadores/panel" },
        { name: "Tienda oficial Descubre RD", href: "/tienda" },
      ],
    },
    {
      title: "Institucional & Legal",
      icon: ShieldCheck,
      badge: "Oficial",
      links: [
        { name: "Sobre Descubre República Dominicana", href: "/sobre-nosotros" },
        { name: "Términos y Condiciones de Uso", href: "/terminos" },
        { name: "Declaración de Accesibilidad Web", href: "/accesibilidad" },
        { name: "Centro de Ayuda y Preguntas Frecuentes", href: "/centro-ayuda" },
        { name: "Prensa y Comunicados Oficiales", href: "/prensa" },
        { name: "Mapa del Sitio (HTML)", href: "/sitemap" },
      ],
    },
  ];

  return (
    <PageTransition>
      <SEOHead
        title="Mapa del Sitio Completo | Descubre República Dominicana"
        description="Índice exhaustivo de todas las provincias, playas, ríos, rutas gastronómicas, hoteles y experiencias de República Dominicana."
        keywords="sitemap descubre rd, mapa del sitio turismo republica dominicana, directorio turismo dominicano"
      />
      <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-white">
        <Header />

        {/* Hero */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-primary/10 via-background to-background border-b border-border">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <Badge className="bg-primary/20 text-primary border-primary/30 mb-4 px-4 py-1.5 text-xs font-mono uppercase tracking-widest">
              ARQUITECTURA DE INFORMACIÓN
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl font-black mb-4 tracking-tight">
              Mapa del Sitio <span className="text-gradient">Descubre RD</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Explora la estructura completa de nuestro portal turístico. Acceso directo a todas las guías, provincias, herramientas y experiencias de la República Dominicana.
            </p>
          </div>
        </section>

        {/* Matriz de Secciones */}
        <main className="flex-1 py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
              {sections.map((section, idx) => {
                const Icon = section.icon;
                return (
                  <div key={idx} className="bg-card rounded-3xl p-6 border border-border flex flex-col justify-between h-full shadow-sm hover:border-primary/40 transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <Badge variant="secondary" className="text-[10px] font-mono">
                          {section.badge}
                        </Badge>
                      </div>

                      <h2 className="font-display text-lg font-bold text-foreground mb-4">
                        {section.title}
                      </h2>

                      <ul className="space-y-2.5">
                        {section.links.map((link, i) => (
                          <li key={i}>
                            <Link
                              to={link.href}
                              className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary transition-colors shrink-0" />
                              <span className="group-hover:translate-x-0.5 transition-transform">{link.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
