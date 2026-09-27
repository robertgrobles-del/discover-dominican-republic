import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

export interface ExcursionItem {
  id: string;
  title: string;
  price: number;
  duration: string;
  location: string;
  image: string;
}

interface ExcursionsGridProps {
  excursions: ExcursionItem[];
  withCardWrapper?: boolean;
}

export function ExcursionsGrid({
  excursions,
  withCardWrapper = false,
}: ExcursionsGridProps) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {excursions.map((exc, index) => (
        <Link key={exc.id} to={`/experiencia/${exc.id}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className={`group cursor-pointer ${
              withCardWrapper
                ? "bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-colors"
                : ""
            }`}
          >
            <div
              className={`aspect-[4/3] relative overflow-hidden ${
                withCardWrapper ? "" : "rounded-xl mb-3"
              }`}
            >
              <img
                src={exc.image}
                alt={exc.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                Desde ${exc.price} USD
              </div>
            </div>
            <div className={withCardWrapper ? "p-4" : ""}>
              <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                {exc.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{exc.duration}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {exc.location}
                </span>
              </div>
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}
