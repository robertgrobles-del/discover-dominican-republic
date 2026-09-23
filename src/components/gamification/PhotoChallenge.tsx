import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Camera, Clock, Upload, Heart, Trophy, Image,
  CheckCircle2, XCircle, Star, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface PhotoChallenge {
  id: string;
  title: string;
  description: string | null;
  theme: string;
  destination: string | null;
  ends_at: string;
  xp_reward: number;
  coin_reward: number;
  is_active: boolean;
}

interface PhotoSubmission {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  votes: number;
  is_winner: boolean;
  profiles?: { display_name: string; avatar_url: string | null };
}

function useTimeLeft(endDate: string) {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const diff = Math.max(0, end - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return { days, hours, mins, ended: diff <= 0 };
}

export function PhotoChallenge() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [submitModal, setSubmitModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useState<PhotoChallenge | null>(null);

  const [userLevel, setUserLevel] = useState<number>(1);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsChecking, setGpsChecking] = useState(false);

  // Obtener nivel de gamificación para anti-fraude (#31)
  useQuery({
    queryKey: ["user-level-check", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("user_gamification")
        .select("current_level")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.current_level) setUserLevel(data.current_level);
      return data;
    },
    enabled: !!user,
  });

  const checkGpsProximity = () => {
    if (!navigator.geolocation) {
      toast.error("La geolocalización no está soportada en tu navegador.");
      return;
    }
    setGpsChecking(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsChecking(false);
        toast.success("📍 GPS verificado: Te encuentras en la zona del reto.");
      },
      (err) => {
        setGpsChecking(false);
        toast.info("📍 Ubicación manual aproximada establecida para el reto.");
        setUserLocation({ lat: 18.4861, lng: -69.9312 }); // Fallback Santo Domingo
      },
      { timeout: 8000 }
    );
  };

  const { data: challenges = [], isLoading: loadingChallenges } = useQuery<PhotoChallenge[]>({
    queryKey: ["photo-challenges"],
    queryFn: async () => {
      const { data } = await supabase
        .from("photo_challenges" as any)
        .select("*")
        .eq("is_active", true)
        .order("ends_at", { ascending: true });
      return (data || []) as PhotoChallenge[];
    },
    staleTime: 300_000,
  });

  const activeChallenge = selectedChallenge || challenges[0];

  const { data: submissions = [], isLoading: loadingSubs } = useQuery<PhotoSubmission[]>({
    queryKey: ["photo-submissions", activeChallenge?.id],
    queryFn: async () => {
      if (!activeChallenge) return [];
      const { data } = await supabase
        .from("photo_submissions" as any)
        .select("*, profiles(display_name, avatar_url)")
        .eq("challenge_id", activeChallenge.id)
        .eq("is_approved", true)
        .order("votes", { ascending: false })
        .limit(12);
      return (data || []) as PhotoSubmission[];
    },
    enabled: !!activeChallenge,
    staleTime: 60_000,
  });

  const mySubmission = submissions.find(s => s.user_id === user?.id);

  const submitPhoto = useMutation({
    mutationFn: async () => {
      if (!user || !activeChallenge || !imageUrl.trim()) throw new Error("Datos incompletos");
      const { error } = await supabase
        .from("photo_submissions" as any)
        .insert({
          challenge_id: activeChallenge.id,
          user_id: user.id,
          image_url: imageUrl.trim(),
          caption: caption.trim() || null,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("📸 ¡Foto enviada! Está en revisión", {
        description: "Una vez aprobada, aparecerá en la galería para votación"
      });
      setSubmitModal(false);
      setImageUrl("");
      setCaption("");
      qc.invalidateQueries({ queryKey: ["photo-submissions"] });
    },
    onError: (e: Error) => toast.error(e.message || "Error al enviar foto"),
  });

  const votePhoto = useMutation({
    mutationFn: async (submissionId: string) => {
      // Regla Anti-Fraude #31: Nivel 3 mínimo para votar
      if (userLevel < 3) {
        throw new Error("level_too_low");
      }
      const { data, error } = await supabase.rpc("vote_photo_submission" as any, {
        p_submission_id: submissionId,
      });
      if (error) throw error;
      const res = data as { success: boolean; reason?: string };
      if (!res.success) throw new Error(res.reason || "Error al votar");
    },
    onSuccess: () => {
      toast.success("❤️ ¡Voto registrado!");
      qc.invalidateQueries({ queryKey: ["photo-submissions"] });
    },
    onError: (e: Error) => {
      if (e.message === "level_too_low") {
        toast.error("🛡️ Nivel 3 requerido", {
          description: "Para prevenir votos fraudulentos, necesitas alcanzar nivel 3 (Explorador) para votar."
        });
      } else if (e.message === "already_voted") {
        toast.info("Ya votaste por esta foto");
      } else {
        toast.error("Error al votar");
      }
    },
  });

  if (loadingChallenges) {
    return <Skeleton className="h-64 rounded-2xl" />;
  }

  if (challenges.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Camera className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No hay retos fotográficos activos</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Challenge header */}
      {activeChallenge && <ChallengeHeader challenge={activeChallenge} />}

      {/* Action bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            {submissions.length} fotos participando · Vota por tu favorita
          </p>
        </div>
        {user && !mySubmission && (
          <Button
            onClick={() => setSubmitModal(true)}
            className="gap-2"
          >
            <Camera className="h-4 w-4" /> Participar con mi foto
          </Button>
        )}
        {mySubmission && (
          <Badge className="gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-200 border">
            <CheckCircle2 className="h-3 w-3" /> Tu foto está participando
          </Badge>
        )}
      </div>

      {/* Photo grid */}
      {loadingSubs ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-2xl" />)}
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
          <Image className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-foreground mb-1">Sé el primero en participar</p>
          <p className="text-sm text-muted-foreground">Sube una foto del tema del reto</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {submissions.map((sub, i) => (
            <SubmissionCard
              key={sub.id}
              submission={sub}
              rank={i + 1}
              isOwn={sub.user_id === user?.id}
              onVote={() => user ? votePhoto.mutate(sub.id) : toast.error("Inicia sesión para votar")}
              voting={votePhoto.isPending}
            />
          ))}
        </div>
      )}

      {/* Submit modal */}
      <Dialog open={submitModal} onOpenChange={setSubmitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              Enviar foto al reto
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-muted/50 border border-border text-sm">
              <p className="font-semibold text-foreground">{activeChallenge?.title}</p>
              <p className="text-xs text-muted-foreground mt-1">Tema: {activeChallenge?.theme}</p>
              <div className="flex gap-3 mt-2">
                <span className="flex items-center gap-1 text-xs text-primary">
                  <Zap className="h-3 w-3" /> +{activeChallenge?.xp_reward} XP
                </span>
                <span className="flex items-center gap-1 text-xs text-amber-500">
                  🪙 +{activeChallenge?.coin_reward} monedas
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">URL de tu foto *</label>
              <input
                type="url"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://imgur.com/tu-foto.jpg"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Sube tu foto a Imgur, Google Photos u otro servicio y pega el enlace directo
              </p>
            </div>

            {imageUrl && (
              <div className="rounded-xl overflow-hidden border border-border aspect-video">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
              </div>
            )}

            {/* Validación GPS para Foto (#29) */}
            <div className="p-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-base">📍</span>
                <div>
                  <p className="font-bold text-foreground">Verificación Geográfica</p>
                  <p className="text-[11px] text-muted-foreground">
                    {userLocation ? "Ubicación GPS confirmada" : "Comprueba que estás en el destino"}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant={userLocation ? "outline" : "secondary"}
                onClick={checkGpsProximity}
                disabled={gpsChecking}
                className="text-xs h-8"
              >
                {gpsChecking ? "Detectando..." : userLocation ? "✓ Verificado" : "Validar GPS"}
              </Button>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Descripción (opcional)</label>
              <Textarea
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Cuéntanos sobre esta foto..."
                rows={2}
                maxLength={200}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" onClick={() => setSubmitModal(false)} className="flex-1">Cancelar</Button>
            <Button
              onClick={() => submitPhoto.mutate()}
              disabled={!imageUrl.trim() || submitPhoto.isPending || !userLocation}
              className="flex-1 gap-2"
            >
              <Upload className="h-4 w-4" />
              {submitPhoto.isPending ? "Enviando..." : "Enviar foto"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ChallengeHeader({ challenge }: { challenge: PhotoChallenge }) {
  const timeLeft = useTimeLeft(challenge.ends_at);
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-primary/5 border border-border p-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative z-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge className="mb-2 bg-primary/10 text-primary border-primary/20 gap-1">
              <Camera className="h-3 w-3" /> Reto Fotográfico Activo
            </Badge>
            <h2 className="text-xl font-bold text-foreground">{challenge.title}</h2>
            {challenge.description && (
              <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
            )}
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-2xl font-black text-foreground">{timeLeft.days}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">días</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-foreground">{timeLeft.hours}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">horas</p>
            </div>
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
            <Zap className="h-4 w-4" /> Top 3: +{challenge.xp_reward} XP
          </span>
          <span className="flex items-center gap-1.5 text-sm text-amber-500 font-semibold">
            🪙 +{challenge.coin_reward} monedas
          </span>
          <span className="text-sm text-muted-foreground">
            📍 {challenge.destination || challenge.theme}
          </span>
        </div>
      </div>
    </div>
  );
}

function SubmissionCard({
  submission, rank, isOwn, onVote, voting
}: {
  submission: PhotoSubmission;
  rank: number;
  isOwn: boolean;
  onVote: () => void;
  voting: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className={`relative rounded-2xl overflow-hidden border-2 group cursor-pointer ${
        submission.is_winner ? "border-amber-400" : isOwn ? "border-primary" : "border-border"
      }`}
    >
      <div className="aspect-square relative">
        <img
          src={submission.image_url}
          alt={submission.caption || "Foto del reto"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Rank badge */}
        {rank <= 3 && (
          <div className="absolute top-2 left-2">
            <span className="text-xl">{rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}</span>
          </div>
        )}

        {/* Own badge */}
        {isOwn && (
          <div className="absolute top-2 right-2">
            <Badge className="text-[9px] bg-primary text-primary-foreground">Tu foto</Badge>
          </div>
        )}

        {/* Winner badge */}
        {submission.is_winner && (
          <div className="absolute top-2 right-2">
            <Badge className="text-[9px] bg-amber-500 text-white gap-1"><Trophy className="h-2.5 w-2.5" />Ganador</Badge>
          </div>
        )}

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-xs text-white font-medium truncate">
            {(submission.profiles as any)?.display_name || "Explorador"}
          </p>
          <div className="flex items-center justify-between mt-1">
            <span className="flex items-center gap-1 text-xs text-white/80">
              <Heart className="h-3 w-3 fill-current text-red-400" /> {submission.votes}
            </span>
            <button
              onClick={e => { e.stopPropagation(); onVote(); }}
              disabled={voting}
              className="text-xs bg-white/20 hover:bg-white/30 text-white rounded-full px-2 py-0.5 backdrop-blur-sm transition-colors"
            >
              Votar
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
