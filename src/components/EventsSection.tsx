import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FavoriteButton } from "@/components/FavoriteButton";
import { LazyImage } from "@/components/ui/lazy-image";
import { HOME_SECTION_FRAME, SectionWithSideAds } from "@/components/SectionWithSideAds";
import { fetchApi } from "@/lib/fastifyClient";
import { useTranslation } from "@/hooks/useI18n";
import carnivalImg from "@/assets/carnival.jpg";
import jazzImg from "@/assets/jazz-festival.jpg";
import tasteImg from "@/assets/taste-event.jpg";

const staticEvents = [
  {
    id: "carnaval-dominicano",
    title: "Carnaval Dominicano",
    category: "Festival Nacional",
    location: "La Vega",
    date: { day: 27, month: "FEB" },
    image: carnivalImg,
    color: "bg-pink-500",
  },
  {
    id: "festival-jazz",
    title: "Festival de Jazz",
    category: "Música",
    location: "Cabarete",
    date: { day: 15, month: "MAR" },
    image: jazzImg,
    color: "bg-amber-500",
  },
  {
    id: "taste-santo-domingo",
    title: "Taste Santo Domingo",
    category: "Gastronomía",
    location: "Sto. Cap.",
    date: { day: 5, month: "ABR" },
    image: tasteImg,
    color: "bg-emerald-500",
  },
];

const MONTH_NAMES = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
const EVENT_COLORS = ["bg-pink-500","bg-amber-500","bg-emerald-500","bg-blue-500","bg-purple-500"];

interface DisplayEvent {
  id: string;
  title: string;
  category: string;
  location: string;
  date: { day: number; month: string };
  image: string;
  color: string;
}

export function EventsSection() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<DisplayEvent[]>(staticEvents);

  useEffect(() => {
    async function fetchEvents() {
      // Eventos publicados en el panel (Turso), ya sin los terminados; delante de los del código.
      const data = await fetchApi<{ data: Record<string, string | null>[] }>("/public/events").then((r) => r.data).catch(() => null);

      if (data && data.length > 0) {
        const staticSlugs = new Set(staticEvents.map(e => e.id));
        const dbEvents: DisplayEvent[] = data
          .filter(e => !staticSlugs.has(e.slug || ""))
          .map((e, i) => {
            const startDate = e.start_date ? new Date(`${e.start_date}T12:00:00`) : new Date();
            return {
              id: e.slug || e.id,
              title: e.name ?? "",
              category: e.event_type || "Evento",
              location: e.address || "RD",
              date: {
                day: startDate.getDate(),
                month: MONTH_NAMES[startDate.getMonth()],
              },
              image: e.image_url || carnivalImg,
              color: EVENT_COLORS[(staticEvents.length + i) % EVENT_COLORS.length],
            };
          });
        setEvents([...dbEvents, ...staticEvents].slice(0, 6));
      }
    }
    fetchEvents();
  }, []);

  return (
    <section className="relative bg-muted/40 py-14 lg:py-20">
      <div className={HOME_SECTION_FRAME}>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-balance">
              {t("events.next")} <span className="text-primary">{t("events.events")}</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg">
              {t("events.subtitle")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Button variant="outline" className="gap-2" asChild>
              <Link to="/eventos">
                <Calendar className="h-4 w-4" />
                {t("events.viewCalendar")}
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Event Cards */}
        <SectionWithSideAds section="home-eventos">
        {/* El próximo evento en grande y los siguientes en lista, para que no sean tres tarjetas iguales. */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          {events.slice(0, 1).map((event) => (
            <motion.article
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-2xl bg-muted"
            >
              <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[420px]">
                <LazyImage
                  src={event.image}
                  alt={event.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  containerClassName="absolute inset-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute right-4 top-4 z-10">
                  <FavoriteButton id={event.id} type="evento" name={event.title} image={event.image} location={event.location} size="sm" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                  <p className="text-sm font-medium text-white/85">{event.date.day} {event.date.month} · {event.category}</p>
                  <h3 className="mt-1 font-display text-2xl font-bold leading-tight sm:text-3xl">
                    <Link to={`/evento/${event.id}`} className="after:absolute after:inset-0 hover:underline">{event.title}</Link>
                  </h3>
                  <p className="mt-2 flex items-center gap-1 text-sm text-white/85"><MapPin className="h-4 w-4" aria-hidden="true" />{event.location}</p>
                </div>
              </div>
            </motion.article>
          ))}
          <ul className="flex flex-col gap-3">
            {events.slice(1, 5).map((event, index) => (
              <motion.li
                key={event.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="group relative flex items-center gap-4 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/50"
              >
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <LazyImage src={event.image} alt="" className="h-full w-full object-cover" containerClassName="h-full w-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground">{event.date.day} {event.date.month} · {event.category}</p>
                  <h3 className="mt-0.5 truncate font-display font-semibold text-foreground group-hover:text-primary">
                    <Link to={`/evento/${event.id}`} className="after:absolute after:inset-0">{event.title}</Link>
                  </h3>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />{event.location}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden="true" />
              </motion.li>
            ))}
          </ul>
        </div>
        </SectionWithSideAds>
      </div>
    </section>
  );
}
