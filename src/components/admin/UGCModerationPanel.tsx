import { useState, useEffect } from "react";
import { getStoredJSON } from "@/lib/safeStorage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, MapPin, Star, CheckCircle } from "lucide-react";

export function UGCModerationPanel() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"all" | "pins" | "reviews" | "photos">("all");
  const [mapPins, setMapPins] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([
    {
      id: "rev-1",
      author: "Carlos Gómez",
      avatar: "👤",
      type: "review",
      rating: 5,
      destination: "Playa Rincón",
      date: "Hace 2 horas",
      content: "¡Espectacular! La comida en los pequeños puestos al final de la playa es riquísima. Altamente recomendado.",
      photo: "https://images.unsplash.com/photo-1540552980157-21d2a565c52b?w=600&auto=format&fit=crop&q=60"
    },
    {
      id: "rev-2",
      author: "Jessica Winters",
      avatar: "👩",
      type: "review",
      rating: 4,
      destination: "Salto El Limón",
      date: "Hace 1 día",
      content: "La caminata a caballo fue un poco larga, pero la cascada vale toda la pena del mundo. Agua muy fría y refrescante.",
      photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=60"
    }
  ]);
  const [photos, setPhotos] = useState<any[]>([
    {
      id: "photo-1",
      author: "Marcos Almánzar",
      avatar: "📷",
      type: "photo",
      contest: "Captura los Colores del Caribe",
      date: "Hace 3 horas",
      caption: "Atardecer mágico en Las Terrenas",
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=60"
    }
  ]);

  useEffect(() => {
    const pins = getStoredJSON<any[]>("ugc_joyas_escondidas", []);
    if (pins.length) {
      setMapPins(pins.map((p: any) => ({ ...p, type: "pin", author: "Usuario Anónimo" })));
    }
  }, []);

  const handleApprovePin = (id: string) => {
    const pins = getStoredJSON<any[]>("ugc_joyas_escondidas", []);
    if (pins.length) {
      const updated = pins.map((p: any) => p.id === id ? { ...p, approved: true } : p);
      localStorage.setItem("ugc_joyas_escondidas", JSON.stringify(updated));
    }
    setMapPins(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Joya Escondida aprobada",
      description: "Ya está activa en el mapa público de joyas ocultas."
    });
  };

  const handleRejectPin = (id: string) => {
    const pins = getStoredJSON<any[]>("ugc_joyas_escondidas", []);
    if (pins.length) {
      const updated = pins.filter((p: any) => p.id !== id);
      localStorage.setItem("ugc_joyas_escondidas", JSON.stringify(updated));
    }
    setMapPins(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Contenido rechazado",
      description: "El marcador ha sido eliminado de la moderación.",
      variant: "destructive"
    });
  };

  const handleApproveReview = (id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    toast({
      title: "Reseña aprobada",
      description: "La opinión ya está visible en la sección pública."
    });
  };

  const handleRejectReview = (id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    toast({
      title: "Reseña rechazada",
      description: "Se ha eliminado de la cola de moderación.",
      variant: "destructive"
    });
  };

  const handleApprovePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Fotografía aprobada",
      description: "Se ha publicado en la galería oficial de participantes."
    });
  };

  const handleRejectPhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Fotografía rechazada",
      description: "Se ha eliminado de la cola.",
      variant: "destructive"
    });
  };

  const allItems = [
    ...mapPins,
    ...reviews,
    ...photos
  ];

  const filteredItems = allItems.filter(item => {
    if (activeTab === "all") return true;
    if (activeTab === "pins") return item.type === "pin";
    if (activeTab === "reviews") return item.type === "review";
    if (activeTab === "photos") return item.type === "photo";
    return true;
  });

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-primary" />
          Moderación de Contenido Generado por Usuarios (UGC)
        </CardTitle>
        <CardDescription>
          Revisa y aprueba opiniones, fotografías del concurso mensual, y pins del mapa colaborativo aportados por los viajeros.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2 flex-wrap border-b border-border pb-4">
          <Button variant={activeTab === "all" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("all")}>
            Todos ({allItems.length})
          </Button>
          <Button variant={activeTab === "pins" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("pins")}>
            Joyas de Mapa ({mapPins.length})
          </Button>
          <Button variant={activeTab === "reviews" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("reviews")}>
            Opiniones ({reviews.length})
          </Button>
          <Button variant={activeTab === "photos" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("photos")}>
            Fotos Concurso ({photos.length})
          </Button>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-1">¡Todo al día!</h3>
            <p className="text-sm">No hay contenido pendiente de moderación en esta categoría.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredItems.map(item => (
              <Card key={item.id} className="border border-border/80 bg-secondary/20 hover:border-primary/40 transition-colors">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{item.avatar || "👤"}</span>
                      <div>
                        <p className="font-semibold text-xs text-foreground">{item.author || "Usuario"}</p>
                        <p className="text-[10px] text-muted-foreground">{item.date || "Pendiente"}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-wider">
                      {item.type === "pin" ? "Joya de Mapa" : item.type === "review" ? "Reseña" : "Foto Concurso"}
                    </Badge>
                  </div>

                  {item.type === "pin" && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-sm text-foreground">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">{item.description || "Sin descripción proporcionada."}</p>
                      <div className="p-2 bg-secondary/50 rounded-lg text-[10px] font-mono text-primary flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Coordenadas: {item.lat?.toFixed(5)}, {item.lng?.toFixed(5)}
                      </div>
                    </div>
                  )}

                  {item.type === "review" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-foreground">Opinión en {item.destination}</h4>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < item.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground italic">"{item.content}"</p>
                      {item.photo && (
                        <div className="aspect-video w-full overflow-hidden rounded-lg border border-border">
                          <img src={item.photo} alt="Attached" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  )}

                  {item.type === "photo" && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-sm text-foreground">Concurso: {item.contest}</h4>
                      <p className="text-xs text-muted-foreground">"{item.caption}"</p>
                      {item.url && (
                        <div className="aspect-video w-full overflow-hidden rounded-lg border border-border">
                          <img src={item.url} alt="Submitted" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-border justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-destructive hover:bg-destructive/10 text-destructive font-semibold"
                      onClick={() => {
                        if (item.type === "pin") handleRejectPin(item.id);
                        if (item.type === "review") handleRejectReview(item.id);
                        if (item.type === "photo") handleRejectPhoto(item.id);
                      }}
                    >
                      Rechazar
                    </Button>
                    <Button
                      size="sm"
                      className="text-xs font-bold"
                      onClick={() => {
                        if (item.type === "pin") handleApprovePin(item.id);
                        if (item.type === "review") handleApproveReview(item.id);
                        if (item.type === "photo") handleApprovePhoto(item.id);
                      }}
                    >
                      Aprobar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
