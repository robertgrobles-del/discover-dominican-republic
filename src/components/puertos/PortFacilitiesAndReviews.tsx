import { Ship, ShoppingBag, Coffee, Compass, Car, Info, Globe, Users, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CruiseLine, PortFacility, PortNearbyActivity, PortReview } from "@/data/puertosDetalleData";

interface PortFacilitiesAndReviewsProps {
  cruiseLines: CruiseLine[];
  facilities: PortFacility[];
  nearbyActivities: PortNearbyActivity[];
  reviews: PortReview[];
}

export function PortFacilitiesAndReviews({
  cruiseLines,
  facilities,
  nearbyActivities,
  reviews,
}: PortFacilitiesAndReviewsProps) {
  return (
    <>
      {/* Cruise Lines */}
      {cruiseLines.length > 0 && (
        <section>
          <h3 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Ship className="h-5 w-5 text-primary" /> Líneas de Cruceros
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {cruiseLines.map((line) => (
              <div
                key={line.name}
                className="bg-card rounded-xl p-5 border border-border hover:border-primary/50 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="font-bold text-primary">{line.logo}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{line.name}</h4>
                    <p className="text-sm text-muted-foreground">Desde: {line.routes.join(", ")}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Facilities */}
      {facilities.length > 0 && (
        <section>
          <h3 className="font-display text-xl font-bold text-foreground mb-6">Facilidades</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {facilities.map((f) => (
              <div key={f.name} className="bg-card rounded-xl p-4 border border-border text-center shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  {f.icon === "shopping" && <ShoppingBag className="h-5 w-5 text-primary" />}
                  {f.icon === "coffee" && <Coffee className="h-5 w-5 text-primary" />}
                  {f.icon === "compass" && <Compass className="h-5 w-5 text-primary" />}
                  {f.icon === "car" && <Car className="h-5 w-5 text-primary" />}
                  {f.icon === "building" && <Info className="h-5 w-5 text-primary" />}
                  {f.icon === "wifi" && <Globe className="h-5 w-5 text-primary" />}
                </div>
                <h4 className="font-medium text-foreground text-sm mb-1">{f.name}</h4>
                <p className="text-xs text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Nearby Activities */}
      {nearbyActivities.length > 0 && (
        <section>
          <h3 className="font-display text-xl font-bold text-foreground mb-6">Actividades Cercanas</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {nearbyActivities.map((activity) => (
              <div key={activity.name} className="group">
                <div className="aspect-square rounded-xl overflow-hidden relative shadow-sm">
                  <img
                    src={activity.image}
                    alt={activity.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <Badge className="mb-2 text-xs">{activity.type}</Badge>
                    <h4 className="font-semibold text-white text-sm">{activity.name}</h4>
                    <p className="text-xs text-white/70">{activity.distance}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <section>
          <h3 className="font-display text-xl font-bold text-foreground mb-6">Reseñas</h3>
          <div className="space-y-4">
            {reviews.map((review, i) => (
              <div key={i} className="bg-card rounded-xl p-5 border border-border shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{review.name}</p>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        className={`h-4 w-4 ${j < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
