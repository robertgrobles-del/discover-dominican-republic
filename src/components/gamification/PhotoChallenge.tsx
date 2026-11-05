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
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { gamificationApi } from "@/lib/gamificationApi";
import { uploadMedia, ACCEPTED_IMAGE_TYPES } from "@/lib/mediaApi";
import { apiMessage } from "@/lib/fastifyClient";

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
  // Con la API real la foto se sube como archivo (queda en moderación); la URL pegada sólo existe en el modo demo.
  const [imageFile, setImageFile] = useState<File | null>(null);
  const hasImage = HAS_BACKEND_SESSION ? !!imageFile : !!imageUrl.trim();
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
      if (HAS_BACKEND_SESSION) {
        try {
          const state = await gamificationApi.getMyState();
          if (state?.current_level) setUserLevel(state.current_level);
          return state;
        } catch {
          return null;
        }
      }
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
        toast.success("Ubicacion del dispositivo obtenida; no se verifico el destino.");
      },
      () => {
        setGpsChecking(false);
        toast.error("No se pudo verificar tu ubicación. El reto no usará una ubicación simulada.");
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 10_000 }
    );
  };

  const { data: challenges = [], isLoading: loadingChallenges } = useQuery<PhotoChallenge[]>({
    queryKey: ["photo-challenges"],
    queryFn: async () => {
      if (HAS_BACKEND_SESSION) {
        const list = await gamificationApi.getPhotoChallenges();
        return list.map((c) => ({ id: c.id, title: c.title, description: c.description, theme: c.theme ?? "", destination: c.destination, ends_at: c.ends_at ?? "", xp_reward: c.xp_reward, coin_reward: c.coin_reward, is_active: c.open }));
      }
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
      if (HAS_BACKEND_SESSION) {
        const { data } = await gamificationApi.getPhotoSubmissions(activeChallenge.id);
        return data.map((x) => ({ id: x.id, user_id: x.author.id, image_url: x.image_url, caption: x.caption, votes: x.votes, is_winner: x.is_winner, profiles: { display_name: x.author.name, avatar_url: x.author.avatar_url } }));
      }
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
      if (!user || !activeChallenge || !hasImage) throw new Error("Datos incompletos");
      if (HAS_BACKEND_SESSION) {
        const media = await uploadMedia(imageFile!, "ugc");
        await gamificationApi.submitPhoto(activeChallenge.id, {
          media_id: media.asset_id,
          caption: caption.trim() || undefined,
        });
        return;
      }
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
      setImageFile(null);
      setCaption("");
      qc.invalidateQueries({ queryKey: ["photo-submissions"] });
    },
    onError: (e: any) => toast.error(apiMessage(e, "Error al enviar foto")),
  });

  const votePhoto = useMutation({
    mutationFn: async (submissionId: string) => {
      // Regla Anti-Fraude #31: Nivel 3 mínimo para votar
      if (userLevel < 3) {
        throw new Error("level_too_low");
      }
      if (HAS_BACKEND_SESSION) {
        await gamificationApi.votePhoto(submissionId);
        return;
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
    onError: (e: any) => {
      if (e.message === "level_too_low") {
        toast.error("🛡️ Nivel 3 requerido", {
          description: "Para prevenir votos fraudulentos, necesitas alcanzar nivel 3 (Explorador) para votar."
        });
      } else if (e.message === "already_voted") {
        toast.info("Ya votaste por esta foto");
      } else {
        toast.error(apiMessage(e, "Error al votar"));
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

            {HAS_BACKEND_SESSION ? (
            <div>
              <label htmlFor="photo-challenge-file" className="text-sm font-medium mb-1.5 block">Tu foto *</label>
              <input id="photo-challenge-file"
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                onChange={e => setImageFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP o GIF de hasta 8 MB. Se publica cuando el equipo la apruebe.</p>
            </div>
            ) : (
            <div>
              <label htmlFor="photo-challenge-f2" className="text-sm font-medium mb-1.5 block">URL de tu foto *</label>
              <input id="photo-challenge-f2"
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
            )}

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
                  <p className="text-2xs text-muted-foreground">
                    {userLocation ? "Ubicacion del dispositivo obtenida" : "Solicita tu ubicacion para continuar"}
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
                {gpsChecking ? "Detectando..." : userLocation ? "Actualizar ubicacion" : "Obtener GPS"}
              </Button>
            </div>

            <div>
              <label htmlFor="photo-challenge-f1" className="text-sm font-medium mb-1.5 block">Descripción (opcional)</label>
              <Textarea id="photo-challenge-f1"
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
              disabled={!hasImage || submitPhoto.isPending || !userLocation}
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
              <p className="text-3xs text-muted-foreground uppercase tracking-wide">días</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-foreground">{timeLeft.hours}</p>
              <p className="text-3xs text-muted-foreground uppercase tracking-wide">horas</p>
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
            <Badge className="text-3xs bg-primary text-primary-foreground">Tu foto</Badge>
          </div>
        )}

        {/* Winner badge */}
        {submission.is_winner && (
          <div className="absolute top-2 right-2">
            <Badge className="text-3xs bg-amber-500 text-white gap-1"><Trophy className="h-2.5 w-2.5" />Ganador</Badge>
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
