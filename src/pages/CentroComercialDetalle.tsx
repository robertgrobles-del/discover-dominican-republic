import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FavoriteButton } from "@/components/FavoriteButton";
import { DistancesFromCities } from "@/components/destination/DistancesFromCities";
import type { FavoriteType } from "@/hooks/useFavorites";
import { getMallBySlug } from "@/data/shopping-malls";
import { motion } from "framer-motion";
import {
  MapPin, Clock, Phone, Globe, Star, Car, Film, UtensilsCrossed,
  ShoppingCart, Store, ChevronRight, Building2, Layers, ExternalLink
} from "lucide-react";

const tipoLabel: Record<string, string> = {
  premium: "Premium",
  regional: "Regional",
  outlet: "Outlet",
  lifestyle: "Lifestyle",
};

export default function CentroComercialDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const mall = getMallBySlug(slug || "");

  if (!mall) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Centro comercial no encontrado</h1>
            <Link to="/compras">
              <Button>Volver a Compras</Button>
            </Link>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  const amenities = [
    { icon: Car, label: "Estacionamiento", active: mall.estacionamiento },
    { icon: Film, label: "Cine", active: mall.cine },
    { icon: UtensilsCrossed, label: "Food Court", active: mall.foodCourt },
    { icon: ShoppingCart, label: "Supermercado", active: mall.supermercado },
  ];

  return (
    <PageTransition>
      <SEOHead
        title={`${mall.nombre} - Compras en ${mall.ciudad} | DescubreRD`}
        description={mall.shortDescription}
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative h-[50vh] min-h-[400px] flex items-end mt-16">
          <div className="absolute inset-0">
            <img src={mall.imagen} alt={mall.nombre} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>
          <div className="relative z-10 container mx-auto px-4 pb-12">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-primary/20 text-primary border-primary/30">{tipoLabel[mall.tipo]}</Badge>
              <Badge variant="secondary">{mall.ciudad}</Badge>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-2">{mall.nombre}</h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {mall.direccion}
                </p>
              </div>
              <FavoriteButton id={mall.slug} type={"destination" as any} name={mall.nombre} image={mall.imagen} />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-6 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-6 justify-center">
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-amber-500" />
                <span className="font-semibold text-foreground">{mall.rating}</span>
                <span className="text-muted-foreground">({mall.reviewCount} reseñas)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Store className="h-4 w-4 text-primary" />
                {mall.tiendas}+ tiendas
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Layers className="h-4 w-4 text-primary" />
                {mall.pisos} pisos
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                {mall.horario.split("|")[0]}
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main */}
              <div className="lg:col-span-2 space-y-10">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-4">Sobre {mall.nombre}</h2>
                  <p className="text-muted-foreground leading-relaxed">{mall.descripcion}</p>
                </div>

                {/* Highlights */}
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-4">Destacados</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {mall.destacados.map((d) => (
                      <div key={d} className="flex items-center gap-3 bg-card rounded-lg border border-border p-3">
                        <ChevronRight className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-foreground">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-4">Facilidades</h3>
                  <div className="flex flex-wrap gap-3">
                    {amenities.map((a) => (
                      <Badge
                        key={a.label}
                        variant={a.active ? "default" : "secondary"}
                        className={`gap-2 py-2 px-4 ${a.active ? "" : "opacity-40 line-through"}`}
                      >
                        <a.icon className="h-3 w-3" /> {a.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-4">Marcas Destacadas</h3>
                  <div className="flex flex-wrap gap-2">
                    {mall.marcas.map((m) => (
                      <Badge key={m} variant="outline" className="text-sm">{m}</Badge>
                    ))}
                  </div>
                </div>

                {/* Services */}
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-4">Servicios</h3>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {mall.servicios.map((s) => (
                      <li key={s} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Distances */}
                {mall.latitude && mall.longitude && (
                  <DistancesFromCities latitude={mall.latitude} longitude={mall.longitude} />
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="border-border">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-display font-bold text-foreground">Información de Contacto</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                        {mall.direccion}
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                        <div>{mall.horario.split("|").map((h, i) => <div key={i}>{h.trim()}</div>)}</div>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                        {mall.telefono}
                      </div>
                      {mall.website && (
                        <a href={mall.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-primary hover:underline">
                          <Globe className="h-4 w-4 flex-shrink-0" />
                          Sitio Web <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <Button className="w-full gap-2 mt-4">
                      <MapPin className="h-4 w-4" /> Cómo Llegar
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardContent className="p-6">
                    <h3 className="font-display font-bold text-foreground mb-3">Ubicación</h3>
                    <div className="aspect-video rounded-lg bg-secondary/30 flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">{mall.ciudad}, {mall.provincia}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
