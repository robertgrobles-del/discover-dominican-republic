import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PassportStampsTabProps {
  stamps: any[];
}

export function PassportStampsTab({ stamps }: PassportStampsTabProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Colección de Sellos ({stamps.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {stamps.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Comienza a explorar República Dominicana y colecciona sellos
            </p>
            <Button className="mt-4" onClick={() => navigate("/destinos")}>
              Ver Destinos
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {stamps.map((stamp) => (
              <Card key={stamp.id} className="overflow-hidden">
                {stamp.stamp_image && (
                  <img
                    src={stamp.stamp_image}
                    alt={stamp.stamp_name}
                    className="w-full h-32 object-cover"
                  />
                )}
                <CardContent className="p-3">
                  <h4 className="font-semibold text-sm mb-1">{stamp.stamp_name}</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    {stamp.stamp_location}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {new Date(stamp.visited_at).toLocaleDateString("es-DO")}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
