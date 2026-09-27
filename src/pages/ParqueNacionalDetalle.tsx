import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { DestinationGallery } from "@/components/destination/DestinationGallery";
import { Button } from "@/components/ui/button";
import { ChevronRight, TreeDeciduous } from "lucide-react";
import { getEnrichedParkBySlug } from "@/data/provinceEnrichment";
import { parquesNacionalesData, ParqueNacionalData } from "@/data/parquesNacionalesData";
import { ParqueNacionalContent } from "@/components/ecoturismo/ParqueNacionalContent";
import { ParqueNacionalSidebar } from "@/components/ecoturismo/ParqueNacionalSidebar";

export default function ParqueNacionalDetalle() {
  const { slug } = useParams<{ slug: string }>();

  // 1. Check local static dictionary
  const staticPark = slug ? parquesNacionalesData[slug] : undefined;

  // 2. Fallback to province enriched park by slug
  const enrichedPark = slug ? getEnrichedParkBySlug(slug) : undefined;

  const parque: ParqueNacionalData | null = staticPark || (enrichedPark ? {
    id: enrichedPark.slug,
    nombre: enrichedPark.name,
    ubicacion: enrichedPark.province,
    provincia: enrichedPark.province,
    dificultad: "Fácil" as const,
    descripcion: enrichedPark.short_description,
    descripcionLarga: `${enrichedPark.short_description} Esta área protegida representa uno de los baluartes ecológicos más representativos del patrimonio natural dominicano. Cuenta con senderos señalizados, miradores panorámicos, fuentes fluviales de agua cristalina y una exuberante diversidad biológica de flora y fauna endémica protegida por las leyes medioambientales del país.`,
    etiquetas: enrichedPark.activities || ["Ecoturismo", "Naturaleza", "Biodiversidad"],
    precio: enrichedPark.entry_fee || "Entrada Libre",
    horario: "08:00 AM - 05:00 PM",
    superficie: enrichedPark.area_km2 ? `${enrichedPark.area_km2} km²` : "Área Protegida",
    telefono: "+1 809-567-4300",
    email: "areasprotegidas@medioambiente.gob.do",
    website: "https://ambiente.gob.do",
    coordenadas: { lat: 18.7357, lng: -70.1627 },
    imagenes: [
      { src: enrichedPark.image_url, alt: enrichedPark.name },
      { src: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop", alt: "Sendero y cascada" },
      { src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop", alt: "Paisaje natural" },
      { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop", alt: "Flora y fauna" }
    ],
    ecosistemas: ["Bosque húmedo subtropical", "Microcuencas hidrográficas", "Flora endémica"],
    fauna: ["Cotorra de La Española", "Carpintero de Sierra", "Iguana", "Aves migratorias"],
    flora: ["Orquídeas silvestres", "Palma real", "Helechos arborescentes", "Árboles centenarios"],
    actividades: enrichedPark.activities || ["Senderismo guiado", "Fotografía", "Observación de aves", "Ecoturismo"],
    senderos: [
      { nombre: "Sendero Botánico Principal", distancia: "2.8 km", dificultad: "Fácil" },
      { nombre: "Ruta del Mirador Panorámico", distancia: "4.5 km", dificultad: "Media" },
      { nombre: "Circuito de los Saltos", distancia: "3.2 km", dificultad: "Fácil" }
    ],
    servicios: ["Puesto de Guardaparques", "Guías locales certificados", "Área de descanso", "Señalización interpretativa"],
    rating: enrichedPark.rating || 4.85,
    reviews: 142
  } : null);

  if (!parque) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <TreeDeciduous className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Parque no encontrado</h1>
              <p className="text-muted-foreground mb-6">El parque que buscas no existe o ha sido removido.</p>
              <Link to="/ecoturismo">
                <Button>Volver a Ecoturismo</Button>
              </Link>
            </div>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SEOHead
        title={`${parque.nombre} - Parques Nacionales de República Dominicana`}
        description={parque.descripcion}
        keywords={`${parque.nombre}, parques nacionales RD, ecoturismo dominicano, naturaleza`}
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1">
          {/* Breadcrumb */}
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary">Inicio</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/ecoturismo" className="hover:text-primary">Ecoturismo</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{parque.nombre}</span>
            </div>
          </div>

          {/* Gallery */}
          <section className="container mx-auto px-4 mb-8">
            <DestinationGallery images={parque.imagenes} />
          </section>

          {/* Content Layout */}
          <section className="container mx-auto px-4 pb-16">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content Component */}
              <ParqueNacionalContent parque={parque} />

              {/* Sidebar Booking & Info Component */}
              <ParqueNacionalSidebar parque={parque} />
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
