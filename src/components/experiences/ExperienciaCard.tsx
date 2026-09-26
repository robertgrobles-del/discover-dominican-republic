import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/FavoriteButton";
import { StaticExperienceItem } from "@/data/experienciasData";

interface ExperienciaCardProps {
  exp: StaticExperienceItem;
  categoryLabel: string;
  index: number;
  exploreText: string;
}

export function ExperienciaCard({
  exp,
  categoryLabel,
  index,
  exploreText
}: ExperienciaCardProps) {
  return (
    <div
      className="group relative rounded-2xl overflow-hidden aspect-[4/5] animate-fade-in"
      style={{ animationDelay: `${Math.min(index * 40, 300)}ms` }}
    >
      <Link to={exp.link || `/experiencia/${exp.id}`} className="block h-full">
        <img
          src={exp.imagen}
          alt={exp.nombre}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute top-4 left-4">
          <Badge className="bg-black/40 backdrop-blur-sm text-white border-white/20 text-xs">
            {categoryLabel}
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="font-display text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
            {exp.nombre}
          </h3>
          <p className="text-white/80 text-sm mb-3 line-clamp-2">{exp.desc}</p>
          <span className="inline-flex items-center text-primary text-sm font-medium">
            {exploreText} <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </Link>
      <FavoriteButton
        id={exp.id}
        type="experiencia"
        name={exp.nombre}
        image={exp.imagen}
        className="absolute top-4 right-4 z-10"
      />
    </div>
  );
}
