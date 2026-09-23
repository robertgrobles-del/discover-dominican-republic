import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, Image as ImageIcon, Heart, Calendar, 
  Upload, Sparkles, Award, Users, AlertCircle 
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { getStoredJSON } from "@/lib/safeStorage";

export default function ConcursosFotografia() {
  const { user } = useAuth();
  
  // Contest state
  const [photoSubmissions, setPhotoSubmissions] = useState<any[]>([]);
  const [hasVoted, setHasVoted] = useState<string[]>([]);
  
  // Form states
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoLocation, setPhotoLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load submissions from localStorage or mock defaults
  useEffect(() => {
    const saved = getStoredJSON<any[] | null>("contest_photo_submissions", null);
    if (saved) {
      setPhotoSubmissions(saved);
    } else {
      const defaultSubmissions = [
        {
          id: "sub-1",
          title: "Amanecer dorado en Bahía de las Águilas",
          author: "Sofía Medina",
          location: "Pedernales",
          url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=60",
          votes: 142,
          date: "2026-06-12"
        },
        {
          id: "sub-2",
          title: "Detalle colonial en la calle Las Damas",
          author: "Jean Carlos Ortiz",
          location: "Santo Domingo",
          url: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=600&auto=format&fit=crop&q=60",
          votes: 98,
          date: "2026-06-13"
        },
        {
          id: "sub-3",
          title: "Colores del play en LIDOM",
          author: "Esteban Guerrero",
          location: "Estadio Quisqueya",
          url: "https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?w=600&auto=format&fit=crop&q=60",
          votes: 75,
          date: "2026-06-14"
        }
      ];
      setPhotoSubmissions(defaultSubmissions);
      localStorage.setItem("contest_photo_submissions", JSON.stringify(defaultSubmissions));
    }

    setHasVoted(getStoredJSON<string[]>("contest_voted_ids", []));
  }, []);

  const handleVote = (id: string) => {
    if (hasVoted.includes(id)) {
      toast.info("Ya has votado por esta fotografía.");
      return;
    }

    const updatedSubmissions = photoSubmissions.map(sub => {
      if (sub.id === id) {
        return { ...sub, votes: sub.votes + 1 };
      }
      return sub;
    });

    setPhotoSubmissions(updatedSubmissions);
    localStorage.setItem("contest_photo_submissions", JSON.stringify(updatedSubmissions));

    const updatedVotes = [...hasVoted, id];
    setHasVoted(updatedVotes);
    localStorage.setItem("contest_voted_ids", JSON.stringify(updatedVotes));

    toast.success("¡Tu voto ha sido registrado! 💖");
  };

  const handleSubmitPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoTitle || !photoUrl || !photoLocation) {
      toast.error("Por favor completa todos los campos.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      
      const newSubmission = {
        id: "sub-" + Date.now(),
        title: photoTitle,
        author: user?.email?.split("@")[0] || "Viajero anónimo",
        location: photoLocation,
        url: photoUrl,
        votes: 0,
        date: new Date().toISOString().split("T")[0]
      };

      const updated = [newSubmission, ...photoSubmissions];
      setPhotoSubmissions(updated);
      localStorage.setItem("contest_photo_submissions", JSON.stringify(updated));

      // Reset form
      setPhotoTitle("");
      setPhotoUrl("");
      setPhotoLocation("");
      toast.success("¡Fotografía enviada exitosamente al concurso! 📷");
    }, 1500);
  };

  return (
    <PageTransition>
      <SEOHead
        title="Concursos de Fotografía Mensual | Descubre RD"
        description="Participa en nuestro concurso fotográfico mensual 'Captura RD'. Sube tus fotos de viajes y gana premios increíbles."
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 pt-24 pb-12">
          <div className="container mx-auto px-4">
            
            {/* Contest Header */}
            <div className="bg-gradient-to-r from-amber-600/20 via-orange-600/10 to-background border border-amber-500/20 rounded-2xl p-8 mb-8 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="max-w-2xl">
                <Badge className="bg-amber-500/20 text-amber-500 border border-amber-500/30 uppercase text-[10px] tracking-wider mb-3">
                  Concurso Mensual de Fotografía
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-3">
                  Captura la Esencia de <span className="text-amber-500">Quisqueya</span>
                </h1>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  Participa en el certamen de este mes con el tema: <strong className="text-foreground">"Los Colores del Caribe"</strong>. Comparte la mejor toma de tu viaje y gana estadías en resorts premium de República Dominicana o tours ecológicos exclusivos.
                </p>
              </div>
            </div>

            {/* Content Section */}
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Left & Middle Column: Photo Submissions & Info */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Contest Details info */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="border border-border bg-card">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Calendar className="h-8 w-8 text-primary shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Fecha Límite</p>
                        <p className="font-bold text-xs text-foreground">30 de Junio, 2026</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-border bg-card">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Trophy className="h-8 w-8 text-amber-500 shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Primer Premio</p>
                        <p className="font-bold text-xs text-foreground">Fin de Semana en Cayo Levantado</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-border bg-card">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Users className="h-8 w-8 text-violet-500 shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Participantes</p>
                        <p className="font-bold text-xs text-foreground">{photoSubmissions.length} Envías activos</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Submissions Gallery */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    Fotografías Participantes
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {photoSubmissions.map(photo => {
                      const voted = hasVoted.includes(photo.id);
                      return (
                        <Card key={photo.id} className="overflow-hidden border border-border bg-card group relative">
                          <div className="aspect-square relative w-full overflow-hidden">
                            <img 
                              src={photo.url} 
                              alt={photo.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            />
                            <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm border-white/10 uppercase text-[9px]">
                              📍 {photo.location}
                            </Badge>
                          </div>
                          <CardContent className="p-4 space-y-2">
                            <h4 className="font-bold text-xs text-foreground line-clamp-1">{photo.title}</h4>
                            <p className="text-[10px] text-muted-foreground">Por: {photo.author} • {photo.date}</p>
                            
                            <div className="flex items-center justify-between pt-2 border-t border-border">
                              <span className="text-xs font-mono font-bold text-muted-foreground">
                                {photo.votes} votos
                              </span>
                              <Button 
                                variant={voted ? "secondary" : "default"} 
                                size="sm" 
                                className="h-8 text-xs font-bold gap-1"
                                onClick={() => handleVote(photo.id)}
                                disabled={voted}
                              >
                                <Heart className={`h-3.5 w-3.5 ${voted ? "fill-red-500 text-red-500" : ""}`} />
                                {voted ? "Votado" : "Votar"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Submission Form & Winners */}
              <div className="space-y-8">
                
                {/* Upload Form Card */}
                <Card className="border border-border bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-1.5">
                      <Upload className="h-5 w-5 text-primary animate-pulse" />
                      Participar en el Concurso
                    </CardTitle>
                    <CardDescription>Sube tu foto y pon a prueba tu talento visual.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitPhoto} className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Título de la Fotografía</label>
                        <Input 
                          placeholder="Ej. Olas turquesas de Playa Rincón" 
                          value={photoTitle}
                          onChange={(e) => setPhotoTitle(e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Provincia/Lugar</label>
                        <Input 
                          placeholder="Ej. Samaná, Puerto Plata..." 
                          value={photoLocation}
                          onChange={(e) => setPhotoLocation(e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Enlace de la Imagen (URL)</label>
                        <Input 
                          placeholder="Ej. https://images.unsplash.com/photo-..." 
                          value={photoUrl}
                          onChange={(e) => setPhotoUrl(e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="p-3 bg-secondary/50 rounded-xl text-xs text-muted-foreground flex gap-2 items-start">
                        <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>Solo se permite enviar una foto por participante. Debe corresponder al tema mensual actual.</span>
                      </div>

                      <Button type="submit" disabled={isSubmitting} className="w-full font-bold gap-2">
                        {isSubmitting ? "Enviando..." : "Cargar Fotografía"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Wall of previous winners */}
                <Card className="border border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-1.5">
                      <Award className="h-5 w-5 text-amber-500" />
                      Ganadores Anteriores
                    </CardTitle>
                    <CardDescription>Inspírate con las fotos ganadoras de los últimos meses.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { 
                        month: "Mayo - Aventura Verde", 
                        winner: "Ricardo Ruiz", 
                        prize: "Tour a Valle Nuevo",
                        img: "https://images.unsplash.com/photo-1540552980157-21d2a565c52b?w=600&auto=format&fit=crop&q=60" 
                      },
                      { 
                        month: "Abril - Patrimonio Histórico", 
                        winner: "Carla Peña", 
                        prize: "Cena VIP en Zona Colonial",
                        img: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=600&auto=format&fit=crop&q=60" 
                      }
                    ].map((winner, idx) => (
                      <div key={idx} className="flex gap-3 items-center p-2.5 bg-secondary/30 rounded-xl border border-border">
                        <img 
                          src={winner.img} 
                          alt="Winner" 
                          className="w-16 h-16 object-cover rounded-lg border border-border/80 shrink-0" 
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-[10px] text-amber-500 uppercase">{winner.month}</p>
                          <p className="font-semibold text-xs text-foreground truncate">Por: {winner.winner}</p>
                          <p className="text-[10px] text-muted-foreground truncate">Premio: {winner.prize}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

              </div>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
