import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FavoriteButton } from "@/components/FavoriteButton";
import { LazyImage } from "@/components/ui/lazy-image";
import { supabase } from "@/integrations/supabase/client";
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
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .order("start_date", { ascending: true })
        .limit(6);

      if (data && data.length > 0) {
        const staticSlugs = new Set(staticEvents.map(e => e.id));
        const dbEvents: DisplayEvent[] = data
          .filter(e => !staticSlugs.has(e.slug || ""))
          .map((e, i) => {
            const startDate = e.start_date ? new Date(e.start_date) : new Date();
            return {
              id: e.slug || e.id,
              title: e.name,
              category: e.event_type || "Evento",
              location: e.venue || e.address || "RD",
              date: {
                day: startDate.getDate(),
                month: MONTH_NAMES[startDate.getMonth()],
              },
              image: e.image_url || carnivalImg,
              color: EVENT_COLORS[(staticEvents.length + i) % EVENT_COLORS.length],
            };
          });
        setEvents([...staticEvents, ...dbEvents].slice(0, 6));
      }
    }
    fetchEvents();
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center bg-card py-16">
      {/* Left Skyscraper Ad */}
      <div className="hidden 2xl:block absolute left-4 top-1/2 -translate-y-1/2 z-10">
        <div className="sticky top-24">
          <div className="w-[160px] h-[600px] bg-gradient-to-br from-muted/50 to-muted/20 border border-dashed border-border/50 rounded-lg flex flex-col items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-muted-foreground text-xs text-center px-2">{t("events.ad")}</span>
            </div>
            <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">{t("events.ad")}</span>
          </div>
        </div>
      </div>

      {/* Right Skyscraper Ad */}
      <div className="hidden 2xl:block absolute right-4 top-1/2 -translate-y-1/2 z-10">
        <div className="sticky top-24">
          <div className="w-[160px] h-[600px] bg-gradient-to-br from-muted/50 to-muted/20 border border-dashed border-border/50 rounded-lg flex flex-col items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-muted-foreground text-xs text-center px-2">{t("events.ad")}</span>
            </div>
            <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">{t("events.ad")}</span>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 lg:px-8 2xl:px-48">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 text-muted-foreground text-sm font-medium mb-3">
              <span className="w-8 h-px bg-border" />
              {t("events.upcoming")}
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              {t("events.next")} <span className="text-gradient">{t("events.events")}</span>
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
            <Link to="/eventos">
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                {t("events.viewCalendar")}
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Event Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {events.slice(0, 3).map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-surface rounded-2xl overflow-hidden hover:bg-surface-elevated transition-colors"
            >
              {/* Image with Date Badge */}
              <div className="relative aspect-video overflow-hidden">
                <LazyImage
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  containerClassName="w-full h-full"
                />
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 text-center min-w-[48px]">
                  <span className="block text-xl font-bold text-foreground leading-none">
                    {event.date.day}
                  </span>
                  <span className="block text-xs text-muted-foreground uppercase mt-1">
                    {event.date.month}
                  </span>
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <div className={`${event.color} rounded px-2 py-1`}>
                    <span className="text-xs font-medium text-white">{event.category}</span>
                  </div>
                  <FavoriteButton
                    id={event.id}
                    type="evento"
                    name={event.title}
                    image={event.image}
                    location={event.location}
                    size="sm"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-display text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {t("events.description")}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  <Link to={`/evento/${event.id}`} className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    {t("events.details")}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
