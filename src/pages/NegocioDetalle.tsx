import { Link, useParams } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  FileText,
  CheckCircle2,
  Share2,
  ArrowLeft,
  Building2,
  ExternalLink,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { usePublicEstablishment } from "@/lib/stagingContent";

const TIPO_LABELS: Record<string, string> = {
  hotel: "Hotel / Alojamiento",
  airbnb: "Hospedaje Vacacional",
  restaurante: "Restaurante",
  bar: "Bar & Lounge",
  cafe: "Cafetería",
  tour: "Operador de Tours",
  transporte: "Servicio de Transporte",
  comercio: "Comercio Local",
  general: "Negocio Turístico",
};

const DEFAULT_COVER: Record<string, string> = {
  hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80",
  airbnb: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80",
  restaurante: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80",
  bar: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&auto=format&fit=crop&q=80",
  cafe: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80",
  tour: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop&q=80",
  transporte: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&auto=format&fit=crop&q=80",
  comercio: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80",
  general: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80",
};

export default function NegocioDetalle() {
  const { id } = useParams<{ id: string }>();
  const { data: e, isLoading } = usePublicEstablishment(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto max-w-5xl px-4 pb-20 pt-28">
          <Skeleton className="mb-4 h-6 w-48" />
          <Skeleton className="aspect-[21/9] w-full rounded-3xl" />
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div className="space-y-4 md:col-span-2">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!e) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead
          title="Empresa no encontrada | Descubre RD"
          description="El negocio que buscas no existe o aún está en proceso de revisión."
          breadcrumbs={[]}
        />
        <Header />
        <main className="container mx-auto max-w-2xl px-4 py-36 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold">Empresa no encontrada</h1>
          <p className="mt-2 text-muted-foreground">
            Es posible que el enlace no sea correcto o que la empresa se encuentre pendiente de aprobación.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/negocios">Ver directorio de negocios</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/registra-tu-negocio">Registrar mi negocio</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const tipoLabel = TIPO_LABELS[e.type] || e.type;
  const coverUrl = e.photo_url || DEFAULT_COVER[e.type] || DEFAULT_COVER.general;
  const filesList = e.files ? e.files.split(" ").filter(Boolean) : [];
  const menuFile = filesList.find((f) => f.endsWith(".pdf"));
  const galleryPhotos = filesList.filter((f) => !f.endsWith(".pdf"));

  let parsedDetails: Record<string, string | number | boolean | string[]> = {};
  if (e.details) {
    try {
      parsedDetails = typeof e.details === "object" ? e.details : JSON.parse(e.details);
    } catch {
      parsedDetails = {};
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${e.name} en Descubre República Dominicana`,
        text: e.description || `Conoce ${e.name} en ${e.province}.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  const schemaType = e.type === "restaurante" || e.type === "cafe"
    ? "Restaurant"
    : e.type === "hotel" || e.type === "airbnb"
    ? "LodgingBusiness"
    : "LocalBusiness";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: e.name,
    description: e.description || `Información y servicios de ${e.name} en ${e.province}, República Dominicana.`,
    image: coverUrl,
    telephone: e.phone,
    email: e.email,
    url: e.website || window.location.href,
    address: {
      "@type": "PostalAddress",
      streetAddress: e.address || undefined,
      addressRegion: e.province || "República Dominicana",
      addressCountry: "DO",
    },
    openingHours: e.schedule || undefined,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title={`${e.name} | ${tipoLabel} en ${e.province || "RD"} - Descubre RD`}
        description={(e.description || `Descubre ${e.name}, ${tipoLabel} ubicado en ${e.province}. Horario, contacto, fotos y detalles oficiales.`).slice(0, 160)}
        url={`/negocios/${e.id}`}
        image={coverUrl}
        keywords={`${e.name}, ${tipoLabel}, turismo ${e.province}, hoteles rd, restaurantes rd, negocios republica dominicana`}
        geo={{
          placename: e.province ? `${e.province}, República Dominicana` : "República Dominicana",
          region: "DO",
        }}
        breadcrumbs={[
          { name: "Inicio", url: "/" },
          { name: "Negocios", url: "/negocios" },
          { name: e.name, url: `/negocios/${e.id}` },
        ]}
        jsonLd={jsonLd}
      />
      <Header />

      <main className="container mx-auto max-w-5xl px-4 pb-20 pt-24 md:pt-28">
        {/* Breadcrumb nav */}
        <nav aria-label="Migas de pan" className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Inicio</Link>
          <span aria-hidden="true">/</span>
          <Link to="/negocios" className="hover:text-foreground">Directorio de Negocios</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="truncate font-medium text-foreground">{e.name}</span>
        </nav>

        {/* Hero Visual Card */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="relative aspect-[21/9] min-h-[260px] w-full overflow-hidden bg-muted">
            <img
              src={coverUrl}
              alt={e.name}
              className="h-full w-full object-cover"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

            <div className="absolute left-4 top-4 flex flex-wrap gap-2 md:left-6 md:top-6">
              <Badge className="bg-primary/95 text-primary-foreground backdrop-blur-md font-semibold text-xs py-1 px-2.5">
                {tipoLabel}
              </Badge>
              {e.province && (
                <Badge variant="secondary" className="bg-background/90 text-foreground backdrop-blur-md text-xs py-1 px-2.5">
                  <MapPin className="mr-1 h-3.5 w-3.5 text-primary" />
                  {e.province}
                </Badge>
              )}
            </div>

            <div className="absolute right-4 top-4 md:right-6 md:top-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="gap-1.5 rounded-full bg-background/85 backdrop-blur-md hover:bg-background border-border/40 text-xs"
              >
                <Share2 className="h-3.5 w-3.5" /> Compartir
              </Button>
            </div>

            <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 backdrop-blur-md">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Negocio Verificado
                </span>
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl drop-shadow-sm">
                {e.name}
              </h1>
              {e.address && (
                <p className="mt-2 flex items-center text-sm text-white/90">
                  <MapPin className="mr-1.5 h-4 w-4 shrink-0 text-primary" />
                  {e.address} {e.province ? `· ${e.province}` : ""}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Content Layout */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Main Info */}
          <div className="space-y-8">
            {/* Description */}
            {e.description && (
              <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
                <h2 className="font-display text-2xl font-bold">Acerca del negocio</h2>
                <p className="mt-4 whitespace-pre-line leading-relaxed text-muted-foreground text-base">
                  {e.description}
                </p>
              </section>
            )}

            {/* Specific details */}
            {Object.keys(parsedDetails).length > 0 && (
              <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
                <h2 className="font-display text-xl font-bold">Detalles y Servicios</h2>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  {Object.entries(parsedDetails).map(([key, val]) => (
                    <div key={key} className="rounded-xl border border-border/60 bg-muted/30 p-3.5">
                      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {key.replace(/_/g, " ")}
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-foreground">
                        {Array.isArray(val) ? val.join(", ") : typeof val === "boolean" ? (val ? "Sí" : "No") : String(val)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {/* Menu Download / Digital Menu */}
            {menuFile && (
              <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Menú Digital Disponible</h3>
                    <p className="text-xs text-muted-foreground">Consulta los platillos, bebidas y tarifas oficiales de {e.name}.</p>
                  </div>
                </div>
                <Button asChild className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <a href={menuFile} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4" /> Ver Menú en PDF
                  </a>
                </Button>
              </section>
            )}

            {/* Photo Gallery */}
            {galleryPhotos.length > 0 && (
              <section className="space-y-4">
                <h2 className="font-display text-2xl font-bold">Galería de Fotos</h2>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {galleryPhotos.map((url, i) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted"
                    >
                      <img
                        src={url}
                        alt={`Foto ${i + 1} de ${e.name}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Info Card */}
          <aside className="space-y-6">
            <div className="sticky top-28 rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
              <h3 className="font-display text-lg font-bold text-foreground">Datos de Contacto</h3>

              <div className="space-y-3.5 text-sm">
                {e.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Teléfono directo</p>
                      <a href={`tel:${e.phone}`} className="font-semibold text-primary hover:underline">
                        {e.phone}
                      </a>
                    </div>
                  </div>
                )}

                {e.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Correo de atención</p>
                      <a href={`mailto:${e.email}`} className="font-semibold text-primary hover:underline break-all">
                        {e.email}
                      </a>
                    </div>
                  </div>
                )}

                {e.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Sitio web oficial</p>
                      <a
                        href={e.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline break-all"
                      >
                        {new URL(e.website).hostname.replace(/^www\./, "")}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}

                {e.schedule && (
                  <div className="flex items-start gap-3 border-t border-border pt-3">
                    <Clock className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Horario de operación</p>
                      <p className="font-medium text-foreground">{e.schedule}</p>
                    </div>
                  </div>
                )}

                {e.address && (
                  <div className="flex items-start gap-3 border-t border-border pt-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Ubicación</p>
                      <p className="font-medium text-foreground">{e.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-border">
                {e.phone && (
                  <Button asChild className="w-full gap-2 rounded-xl">
                    <a href={`tel:${e.phone}`}>
                      <Phone className="h-4 w-4" /> Llamar ahora
                    </a>
                  </Button>
                )}
                {e.website && (
                  <Button asChild variant="outline" className="w-full gap-2 rounded-xl">
                    <a href={e.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4" /> Visitar sitio web
                    </a>
                  </Button>
                )}
              </div>

              <div className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground text-center">
                Ficha registrada y verificada en el portal turístico oficial Descubre República Dominicana.
              </div>
            </div>
          </aside>
        </div>

        {/* Back navigation */}
        <div className="mt-12 pt-6 border-t border-border flex items-center justify-between">
          <Button asChild variant="ghost" className="gap-2">
            <Link to="/negocios">
              <ArrowLeft className="h-4 w-4" /> Volver al directorio de empresas
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/registra-tu-negocio">Registrar otro negocio</Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
