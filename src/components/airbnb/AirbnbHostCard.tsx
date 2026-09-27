import { Badge } from "@/components/ui/badge";
import { MessageCircle, Check, Globe, Award } from "lucide-react";

interface AirbnbHostCardProps {
  name: string;
  image?: string;
  isSuperhost?: boolean;
  responseTime: string;
  responseRate: number;
  languages?: string[];
  description: string;
}

export function AirbnbHostCard({
  name,
  image,
  isSuperhost,
  responseTime,
  responseRate,
  languages,
  description,
}: AirbnbHostCardProps) {
  return (
    <div className="flex items-start gap-4">
      <img
        src={image || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200"}
        alt={name}
        className="w-16 h-16 rounded-full object-cover"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">Anfitrión: {name}</h3>
          {isSuperhost && (
            <Badge className="bg-primary">
              <Award className="h-3 w-3 mr-1" /> Superanfitrión
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-1">
          <span className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" /> {responseTime}
          </span>
          <span className="flex items-center gap-1">
            <Check className="h-4 w-4" /> {responseRate}% tasa de respuesta
          </span>
          {languages && (
            <span className="flex items-center gap-1">
              <Globe className="h-4 w-4" /> {languages.join(", ")}
            </span>
          )}
        </div>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>
    </div>
  );
}
