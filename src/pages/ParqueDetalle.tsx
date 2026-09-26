import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FavoriteButton } from "@/components/FavoriteButton";
import { CommentSection } from "@/components/CommentSection";
import { DetailHeroHeader } from "@/components/detail/DetailHeroHeader";
import { DetailAmenitiesGrid } from "@/components/detail/DetailAmenitiesGrid";
import { DetailInclusionsCard } from "@/components/detail/DetailInclusionsCard";
import { DetailLocationMapCard } from "@/components/detail/DetailLocationMapCard";
import { DetailFloatingBar } from "@/components/detail/DetailFloatingBar";
import { ParkAttractionsList } from "@/components/parks/ParkAttractionsList";
import { ParkTicketCard } from "@/components/parks/ParkTicketCard";
import { parquesData } from "@/data/parquesData";
import { 
  Clock, 
  Calendar,
  Phone, 
  Globe, 
  AlertCircle,
  Camera,
  Ticket
} from "lucide-react";

export default function ParqueDetalle() {
  const { slug: id } = useParams<{ slug: string }>();
  const parque = (id && parquesData[id]) ? parquesData[id] : parquesData["scape-park"];

  return (
    <PageTransition>
      <SEOHead
        title={`${parque.nombre} | Parques Temáticos RD`}
        description={parque.descripcion}
        keywords={`${parque.nombre}, parques temáticos RD, ${parque.tipo}, ${parque.ubicacion}`}
      />
      <Header />

      <main className="min-h-screen bg-background pb-16">
        {/* Unified Hero Header */}
        <DetailHeroHeader
          title={parque.nombre}
          badgeText={parque.tipo}
          location={parque.ubicacion}
          rating={parque.rating}
          reviewsCount={parque.reviews}
          duration={parque.duracion}
          backUrl="/parques-tematicos"
          backLabel="Volver a Parques"
          favoriteId={parque.id}
          favoriteType="parque"
          favoriteName={parque.nombre}
          favoriteImage={parque.imagen}
        />

        {/* Content Section */}
        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <Card className="border-border/60 shadow-sm">
                  <CardContent className="p-6 md:p-8">
                    <h2 className="font-display text-2xl font-bold mb-4 text-foreground">Acerca de {parque.nombre}</h2>
                    <p className="text-muted-foreground leading-relaxed text-base">
                      {parque.descripcionLarga}
                    </p>
                  </CardContent>
                </Card>

                {/* Interactive Tabs */}
                <Tabs defaultValue="atracciones" className="w-full">
                  <TabsList className="w-full justify-start overflow-x-auto p-1 bg-muted/60">
                    <TabsTrigger value="atracciones">Atracciones</TabsTrigger>
                    <TabsTrigger value="incluye">Qué Incluye</TabsTrigger>
                    <TabsTrigger value="info">Información</TabsTrigger>
                    <TabsTrigger value="galeria">Galería ({parque.galeria.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="atracciones" className="mt-6">
                    <ParkAttractionsList atracciones={parque.atracciones} />
                  </TabsContent>

                  <TabsContent value="incluye" className="mt-6 space-y-6">
                    <DetailInclusionsCard 
                      included={parque.incluye}
                      excluded={parque.noIncluye}
                    />

                    {parque.queLlevar && parque.queLlevar.length > 0 && (
                      <Card className="border-border/60 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg">Qué te recomendamos llevar</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {parque.queLlevar.map((item, idx) => (
                              <Badge key={idx} variant="secondary" className="px-3 py-1 text-sm bg-muted">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="info" className="mt-6 space-y-6">
                    <Card className="border-border/60 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Información Operativa</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid sm:grid-cols-2 gap-5">
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-primary shrink-0" />
                            <div>
                              <p className="font-medium text-sm">Horario diario</p>
                              <p className="text-sm text-muted-foreground">{parque.horario}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-primary shrink-0" />
                            <div>
                              <p className="font-medium text-sm">Días de operación</p>
                              <p className="text-sm text-muted-foreground">{parque.diasOperacion}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-primary shrink-0" />
                            <div>
                              <p className="font-medium text-sm">Contacto telefónico</p>
                              <p className="text-sm text-muted-foreground">{parque.telefono}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Globe className="h-5 w-5 text-primary shrink-0" />
                            <div>
                              <p className="font-medium text-sm">Sitio web oficial</p>
                              <a 
                                href={parque.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline font-medium"
                              >
                                Visitar web
                              </a>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Amenities / Services */}
                    <DetailAmenitiesGrid 
                      title="Servicios y Comodidades del Parque"
                      amenities={parque.servicios}
                    />

                    {/* Restrictions */}
                    {parque.restricciones && parque.restricciones.length > 0 && (
                      <Card className="border-border/60 shadow-sm border-l-4 border-l-amber-500">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                            Requisitos y Restricciones
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2.5">
                            {parque.restricciones.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                <AlertCircle className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* How to get there Map Card */}
                    <DetailLocationMapCard
                      locationName={parque.ubicacion}
                      howToGetThere={parque.comoLlegar}
                      coordinates={parque.coordenadas}
                      googleMapsQuery={`${parque.coordenadas.lat},${parque.coordenadas.lng}`}
                    />
                  </TabsContent>

                  <TabsContent value="galeria" className="mt-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {parque.galeria.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer shadow-sm border border-border/40">
                          <img
                            src={img}
                            alt={`${parque.nombre} - Galería ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <Camera className="h-7 w-7 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Reviews and Community Comments */}
                <div className="pt-6 border-t border-border/60">
                  <CommentSection targetId={parque.id} targetType="parque" />
                </div>
              </div>

              {/* Sidebar Ticket Booking */}
              <div className="lg:col-span-1">
                <ParkTicketCard parque={parque} />
              </div>
            </div>
          </div>
        </section>

        {/* Floating Mobile Booking Bar */}
        <DetailFloatingBar
          priceLabel={`Adulto: $${parque.precioAdulto} USD`}
          buttonText="Comprar Entradas"
          buttonIcon={<Ticket className="h-4 w-4 mr-2" />}
          buttonUrl={parque.website}
          isExternalUrl={true}
        />
      </main>

      <Footer />
    </PageTransition>
  );
}
