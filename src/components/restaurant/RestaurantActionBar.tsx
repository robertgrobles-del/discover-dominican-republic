import { CalendarCheck, Clock, Leaf, MapPin, Navigation, UtensilsCrossed, Wallet, WheatOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PlaceActions } from "@/components/detail/PlaceActions";
import { SelloVerificadoBadge } from "@/components/ui/SelloVerificadoBadge";
import { calculateOpenStatus } from "@/lib/openStatus";
import { Restaurant } from "@/data/restaurants";

interface RestaurantActionBarProps {
  /** `isVerified` y `licenseNumber` llegan del backend cuando el negocio pasó la verificación. */
  restaurant: Restaurant & { isVerified?: boolean; licenseNumber?: string };
}

/** Consumo medio por persona según la gama de precio. Es una referencia, no la carta del local. */
const AVERAGE_SPEND: Record<Restaurant["priceRange"], { dop: string; usd: string }> = {
  $: { dop: "RD$ 350 – 750", usd: "$6–$12" },
  $$: { dop: "RD$ 750 – 1,600", usd: "$12–$25" },
  $$$: { dop: "RD$ 1,600 – 2,800", usd: "$25–$45" },
  $$$$: { dop: "RD$ 2,800 – 4,500", usd: "$45–$75" },
};

const scrollTo = (id: string, focus = false) => {
  const target = document.getElementById(id);
  if (!target) return;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: focus ? "center" : "start" });
  if (focus) target.focus({ preventScroll: true });
};

export function RestaurantActionBar({ restaurant }: RestaurantActionBarProps) {
  const status = calculateOpenStatus(restaurant.openingHours);
  const spend = AVERAGE_SPEND[restaurant.priceRange];
  // Las opciones de dieta sólo se anuncian si el restaurante las declara entre sus servicios.
  const services = (restaurant.services ?? []).map((service) => service.toLowerCase());
  const vegan = services.some((service) => /vegan|vegetarian/.test(service));
  const glutenFree = services.some((service) => /gluten/.test(service));
  // WhatsApp sólo con el teléfono del propio restaurante: nunca un número genérico.
  const phoneDigits = restaurant.phone?.replace(/\D/g, "") ?? "";
  const whatsappUrl = phoneDigits.length >= 10
    ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(`Hola, vi su ficha en Descubre República Dominicana y quisiera consultar disponibilidad para reservar mesa en ${restaurant.name}.`)}`
    : null;
  const mapsUrl = restaurant.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.name} ${restaurant.address}`)}` : null;

  return (
    <section aria-label={`Información y acciones de ${restaurant.name}`} className="border-b border-border/60 bg-card/60 backdrop-blur-sm">
      <div className="container mx-auto flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:px-8">
        {/* Qué es, cuánto cuesta y dónde está */}
        <div className="min-w-0 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <ul className="flex flex-wrap gap-1.5" aria-label="Tipo de cocina">
              {restaurant.cuisineType.map((cuisine) => (
                <li key={cuisine} className="rounded-full bg-muted px-3 py-1 text-sm font-semibold text-foreground">{cuisine}</li>
              ))}
            </ul>
            <Badge variant="outline" className={`gap-1 text-xs font-bold ${status.badgeClass}`}>
              <Clock className="h-3 w-3" aria-hidden="true" />
              {status.statusLabel}
            </Badge>
            {restaurant.isVerified && <SelloVerificadoBadge variant="compact" size="sm" licenseNumber={restaurant.licenseNumber} />}
          </div>

          <dl className="flex flex-col gap-x-5 gap-y-1.5 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex items-center gap-1.5">
              <Wallet className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <dt className="sr-only">Consumo promedio por persona</dt>
              <dd>
                <span className="font-semibold text-foreground">{spend.dop}</span>{" "}
                <span className="text-xs">(~{spend.usd} USD) por persona</span>
              </dd>
            </div>
            {restaurant.address && (
              <div className="flex min-w-0 items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <dt className="sr-only">Dirección</dt>
                <dd className="truncate">{restaurant.address}</dd>
              </div>
            )}
          </dl>

          {(vegan || glutenFree) && (
            <ul className="flex flex-wrap gap-1.5" aria-label="Opciones de dieta">
              {vegan && (
                <li className="inline-flex items-center gap-1 rounded-md border border-emerald-600/25 bg-emerald-600/10 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <Leaf className="h-3 w-3" aria-hidden="true" /> Opciones veganas
                </li>
              )}
              {glutenFree && (
                <li className="inline-flex items-center gap-1 rounded-md border border-amber-600/25 bg-amber-600/10 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                  <WheatOff className="h-3 w-3" aria-hidden="true" /> Sin gluten
                </li>
              )}
            </ul>
          )}
        </div>

        <PlaceActions
          primary={{ label: "Reservar mesa", icon: CalendarCheck, onClick: () => scrollTo("res-name", true) }}
          secondary={[
            { label: "Ver menú", icon: UtensilsCrossed, onClick: () => scrollTo("restaurant-menu-section") },
            ...(mapsUrl ? [{ label: "Cómo llegar", icon: Navigation, href: mapsUrl }] : []),
          ]}
          whatsappUrl={whatsappUrl ?? undefined}
          shareTitle={restaurant.name}
          claim={{ name: restaurant.name, type: "restaurante", id: restaurant.id }}
        />
      </div>
    </section>
  );
}
