import { Link } from "react-router-dom";
import { MapPin, Phone, Globe, Clock, FileText, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PublicEstablishment } from "@/lib/stagingContent";

const TIPO_LABELS: Record<string, string> = {
  hotel: "Hotel / Alojamiento",
  airbnb: "Hospedaje",
  restaurante: "Restaurante",
  bar: "Bar & Lounge",
  cafe: "Cafetería",
  tour: "Operador de Tours",
  transporte: "Transporte",
  comercio: "Comercio",
  general: "Negocio Turístico",
};

const DEFAULT_COVER: Record<string, string> = {
  hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
  airbnb: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80",
  restaurante: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
  bar: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop&q=80",
  cafe: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80",
  tour: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80",
  transporte: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&auto=format&fit=crop&q=80",
  comercio: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80",
  general: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
};

interface EstablishmentCardProps {
  establishment: PublicEstablishment;
  className?: string;
}

export function EstablishmentCard({ establishment: e, className = "" }: EstablishmentCardProps) {
  const coverUrl = e.photo_url || DEFAULT_COVER[e.type] || DEFAULT_COVER.general;
  const label = TIPO_LABELS[e.type] || e.type;
  const hasMenu = e.files && e.files.includes(".pdf");

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl ${className}`}
    >
      {/* Cover image & badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <img
          src={coverUrl}
          alt={e.name}
          loading="lazy"
          width={600}
          height={375}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm hover:bg-primary font-medium text-xs">
            {label}
          </Badge>
          {e.province && (
            <Badge variant="secondary" className="bg-background/90 text-foreground backdrop-blur-sm text-xs">
              <MapPin className="mr-1 h-3 w-3 text-primary" />
              {e.province}
            </Badge>
          )}
        </div>

        {/* Verified badge */}
        <div className="absolute bottom-2.5 right-3 flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[11px] font-medium text-emerald-600 backdrop-blur-sm dark:text-emerald-400">
          <CheckCircle2 className="h-3 w-3" /> Verificado
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2">
          <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            <Link to={`/negocios/${e.id}`} className="hover:underline">
              {e.name}
            </Link>
          </h3>
          {e.address && (
            <p className="mt-1 flex items-center text-xs text-muted-foreground line-clamp-1">
              <MapPin className="mr-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              {e.address}
            </p>
          )}
        </div>

        {e.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
            {e.description}
          </p>
        )}

        {/* Quick meta pills */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {e.schedule && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
              <Clock className="h-3 w-3 text-primary" />
              <span className="line-clamp-1 max-w-[200px]">{e.schedule}</span>
            </span>
          )}
          {hasMenu && (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-1 font-medium">
              <FileText className="h-3 w-3" />
              Menú Digital
            </span>
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-auto pt-5 border-t border-border flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-muted-foreground">
            {e.phone && (
              <a
                href={`tel:${e.phone}`}
                title={`Llamar a ${e.phone}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted hover:text-foreground transition-colors"
              >
                <Phone className="h-4 w-4" />
              </a>
            )}
            {e.website && (
              <a
                href={e.website}
                target="_blank"
                rel="noopener noreferrer"
                title="Sitio web oficial"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted hover:text-foreground transition-colors"
              >
                <Globe className="h-4 w-4" />
              </a>
            )}
          </div>

          <Button size="sm" asChild className="rounded-lg font-medium text-xs">
            <Link to={`/negocios/${e.id}`}>
              Ver Empresa
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
