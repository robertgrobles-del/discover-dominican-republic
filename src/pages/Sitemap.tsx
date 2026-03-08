import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead, generateBreadcrumbSchema } from "@/components/SEOHead";

export default function Sitemap() {
  const sections = [
    {
      title: "Destinos",
      links: [
        { name: "Todos los destinos", href: "/destinos" },
        { name: "Punta Cana", href: "/destino/punta-cana" },
        { name: "Santo Domingo", href: "/destino/santo-domingo" },
        { name: "Samaná", href: "/destino/samana" },
        { name: "Puerto Plata", href: "/destino/puerto-plata" },
        { name: "La Romana", href: "/destino/la-romana" },
        { name: "Provincias", href: "/provincias" },
        { name: "Playas", href: "/playas" },
      ],
    },
    {
      title: "Alojamiento",
      links: [
        { name: "Hoteles y Resorts", href: "/alojamientos" },
        { name: "Airbnb", href: "/alojamientos" },
      ],
    },
    {
      title: "Experiencias",
      links: [
        { name: "Todas las experiencias", href: "/experiencias" },
        { name: "Ecoturismo", href: "/ecoturismo" },
        { name: "Turismo de aventura", href: "/actividades" },
        { name: "Cultura", href: "/cultura" },
        { name: "Gastronomía", href: "/guia-gastronomica" },
        { name: "Wellness", href: "/wellness" },
        { name: "Tours", href: "/tours" },
      ],
    },
    {
      title: "Planifica tu viaje",
      links: [
        { name: "Herramientas", href: "/herramientas" },
        { name: "Cómo llegar", href: "/como-llegar" },
        { name: "Clima y temporadas", href: "/clima-temporadas" },
        { name: "Requisitos de viaje", href: "/requisitos-viaje" },
        { name: "Seguro de viaje", href: "/seguro-viaje" },
        { name: "Conversor de moneda", href: "/conversor-moneda" },
        { name: "Lista de empaque", href: "/lista-empaque" },
      ],
    },
    {
      title: "Servicios",
      links: [
        { name: "Restaurantes", href: "/restaurantes" },
        { name: "Vida nocturna", href: "/vida-nocturna" },
        { name: "Compras", href: "/compras" },
        { name: "Establecimientos MITUR", href: "/establecimientos" },
        { name: "Directorio de agencias", href: "/directorio-agencias" },
        { name: "Alquiler de vehículos", href: "/alquiler-vehiculos" },
      ],
    },
    {
      title: "Comunidad",
      links: [
        { name: "Blog", href: "/blog" },
        { name: "Opiniones", href: "/opiniones" },
        { name: "Feed Social", href: "/feed-social" },
        { name: "Eventos", href: "/eventos" },
        { name: "Galería", href: "/galeria" },
      ],
    },
    {
      title: "Legal e info",
      links: [
        { name: "Sobre nosotros", href: "/sobre-nosotros" },
        { name: "Términos y condiciones", href: "/terminos" },
        { name: "Accesibilidad", href: "/accesibilidad" },
        { name: "Contactos de emergencia", href: "/contactos-emergencia" },
      ],
    },
  ];

  return (
    <PageTransition>
      <SEOHead
        title="Mapa del Sitio | DescubreRD"
        description="Encuentra todas las secciones y páginas de DescubreRD, tu portal de turismo de República Dominicana."
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
          <h1 className="font-display text-3xl font-bold mb-8">Mapa del Sitio</h1>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="font-display text-lg font-bold text-foreground mb-3">{section.title}</h2>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <a href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
}
