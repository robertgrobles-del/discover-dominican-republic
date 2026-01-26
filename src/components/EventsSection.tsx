import { motion } from "framer-motion";
import { Calendar, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FavoriteButton } from "@/components/FavoriteButton";
import carnivalImg from "@/assets/carnival.jpg";
import jazzImg from "@/assets/jazz-festival.jpg";
import tasteImg from "@/assets/taste-event.jpg";

const events = [
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

export function EventsSection() {
  return (
    <section className="min-h-screen flex flex-col justify-center bg-card py-16">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 text-muted-foreground text-sm font-medium mb-3">
              <span className="w-8 h-px bg-border" />
              Eventos Próximos
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Próximos <span className="text-gradient">Eventos</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg">
              Vive la vibrante cultura dominicana a través de festivales, música y arte.
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
                Ver Calendario Completo
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Event Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {events.map((event, index) => (
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
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                  Experimenta la magia de los eventos culturales más emblemáticos del Caribe.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  <Link to={`/eventos`} className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Detalles
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
