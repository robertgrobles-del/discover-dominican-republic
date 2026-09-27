import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Globe, ChevronRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface DirectoryAgency {
  id: string;
  name: string;
  verified: boolean;
  isDemo: boolean;
  location: string;
  rnt: string;
  description: string;
  type: string;
  status: string;
  logo: string;
  logoUrl?: string;
  hasEmail: boolean;
  hasPhone: boolean;
  hasWeb: boolean;
  phone: string;
  email: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  specialties?: string[];
}

interface AgencyCardProps {
  agency: DirectoryAgency;
  index: number;
}

export function AgencyCard({ agency, index }: AgencyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      viewport={{ once: true }}
      className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors"
    >
      <div className="flex gap-6">
        {/* Logo */}
        <div className="w-28 h-28 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
          {agency.logoUrl ? (
            <img src={agency.logoUrl} alt={agency.name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-display text-3xl font-bold text-primary">{agency.logo}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-display font-bold text-foreground">{agency.name}</h3>
                {agency.verified && (
                  <ShieldCheck className="h-4 w-4 text-emerald-500" title="Operador verificado" />
                )}
                {agency.isDemo && (
                  <Badge
                    variant="outline"
                    className="text-[10px] border-yellow-500/40 text-yellow-600 dark:text-yellow-400"
                  >
                    Demo
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {agency.location}
                </span>
                <span className={agency.verified ? "text-emerald-500" : "text-yellow-500"}>
                  {agency.rnt}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  agency.status === "Activo"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {agency.status}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                {agency.type}
              </span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{agency.description}</p>

          {agency.specialties && agency.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {agency.specialties.slice(0, 3).map((s) => (
                <Badge key={s} variant="secondary" className="text-[10px]">
                  {s}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {agency.hasEmail && (
                <a
                  href={`mailto:${agency.email}?subject=${encodeURIComponent(
                    `Contacto desde Descubre RD - ${agency.name}`
                  )}`}
                  title="Enviar correo"
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Mail className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {agency.hasPhone && (
                <a href={`tel:${agency.phone.replace(/\D/g, "")}`} title="Llamar">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Phone className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {agency.hasWeb && (
                <Link to={`/agencia/${agency.id}`} title="Ver ficha">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Globe className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
            <Link to={`/agencia/${agency.id}`}>
              <Button variant="link" className="text-primary gap-1">
                Ver Perfil Completo <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
