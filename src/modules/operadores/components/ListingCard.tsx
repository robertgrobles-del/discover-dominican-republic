import { Link } from "react-router-dom";
import { Clock, MapPin, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CATEGORY_META, formatMoney } from "../constants";
import type { Listing } from "../types";

export function ListingCard({ listing, orgSlug, orgName }: { listing: Listing; orgSlug: string; orgName?: string }) {
  const cat = CATEGORY_META[listing.category];
  return (
    <Link to={`/operador/${orgSlug}/${listing.slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-lg">
        <div className="aspect-[16/10] bg-muted relative overflow-hidden">
          {listing.images?.[0] ? (
            <img src={listing.images[0]} alt={listing.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><cat.icon className="h-10 w-10 text-muted-foreground/50" /></div>
          )}
          <Badge className="absolute top-3 left-3 gap-1"><cat.icon className="h-3 w-3" /> {cat.label.replace(/s$/, "")}</Badge>
        </div>
        <div className="p-4 space-y-2">
          <p className="font-display font-bold leading-snug">{listing.title}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">{listing.summary}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {listing.destination && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {listing.destination}</span>}
            {listing.duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {listing.duration}</span>}
            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> hasta {listing.capacity}</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground truncate">{orgName}</span>
            <span className="flex items-center gap-2">
              {listing.rating ? <span className="flex items-center gap-0.5 text-xs"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{listing.rating}</span> : null}
              <span className="font-semibold">{formatMoney(listing.price, listing.currency)}</span>
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
