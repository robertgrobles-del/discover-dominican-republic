import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gift, Trophy, Users, Plus, Trash2, Mail, Phone, 
  CheckCircle2, Share2, MessageCircle, Twitter, 
  Sparkles, ExternalLink, ShieldCheck, HeartHandshake, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getStoredJSON } from "@/lib/safeStorage";

interface ReferralInvite {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface ViralSorteoModuleProps {
  onPointsUpdated?: (newPoints: number) => void;
}

const SOCIAL_ACTIONS = [
  { id: "ig", name: "Seguir en Instagram", url: "https://instagram.com/descubrerd", points: 2, icon: "📸", color: "hover:border-pink-500 hover:text-pink-500" },
  { id: "tk", name: "Seguir en TikTok", url: "https://tiktok.com/@descubrerd", points: 2, icon: "🎵", color: "hover:border-cyan-500 hover:text-cyan-500" },
  { id: "yt", name: "Suscribirse a YouTube", url: "https://youtube.com/@descubrerd", points: 3, icon: "▶️", color: "hover:border-red-500 hover:text-red-500" },
  { id: "fb", name: "Seguir en Facebook", url: "https://facebook.com/descubrerd", points: 1, icon: "👍", color: "hover:border-blue-600 hover:text-blue-600" },
];

export const ViralSorteoModule: React.FC<ViralSorteoModuleProps> = ({ onPointsUpdated }) => {
  // Main form state
  const [formData, setFormData] = useState({
    fullName: "",
    identification: "",
    email: "",
    phone: "",
    country: "República Dominicana",
    city: "Santo Domingo",
  });

  const [invites, setInvites] = useState<ReferralInvite[]>(() =>
    getStoredJSON<ReferralInvite[]>("sorteo_referral_invites", [])
  );

  const [newInvite, setNewInvite] = useState({ name: "", email: "", phone: "" });
  const [completedSocials, setCompletedSocials] = useState<string[]>(() =>
    getStoredJSON<string[]>("sorteo_completed_socials", [])
  );

  const [shared, setShared] = useState(() => {
    return localStorage.getItem("sorteo_shared_bonus") === "true";
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(() => {
    return localStorage.getItem("sorteo_grand_registered") === "true";
  });

  // Calculate points
  const points = 1 + (completedSocials.length * 2) + (invites.length * 2) + (shared ? 5 : 0);

  const handleInputChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleToggleSocial = (id: string, url: string, pts: number) => {
    window.open(url, "_blank");
    if (!completedSocials.includes(id)) {
      const updated = [...completedSocials, id];
      setCompletedSocials(updated);
      localStorage.setItem("sorteo_completed_socials", JSON.stringify(updated));
      toast.success(`🎉 ¡Misión completada! +${pts} Puntos para el sorteo.`);
      if (onPointsUpdated) onPointsUpdated(points + pts);
    }
  };

  const handleAddInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvite.name.trim() || !newInvite.email.trim()) {
      toast.error("Ingresa al menos el nombre y correo del amigo.");
      return;
    }

    const invite: ReferralInvite = {
      id: Math.random().toString(36).substring(2, 9),
      name: newInvite.name.trim(),
      email: newInvite.email.trim(),
      phone: newInvite.phone.trim(),
    };

    const updated = [...invites, invite];
    setInvites(updated);
    localStorage.setItem("sorteo_referral_invites", JSON.stringify(updated));
    setNewInvite({ name: "", email: "", phone: "" });
    toast.success(`✨ ¡Amigo invitado! +2 Boletos extras añadidos.`);
    if (onPointsUpdated) onPointsUpdated(points + 2);
  };

  const handleRemoveInvite = (id: string) => {
    const updated = invites.filter((i) => i.id !== id);
    setInvites(updated);
    localStorage.setItem("sorteo_referral_invites", JSON.stringify(updated));
  };

  const handleShare = (channel?: "whatsapp" | "twitter" | "native") => {
    const text = "¡Participa en el sorteo de fines de semana en resorts de lujo en República Dominicana con Descubre RD!";
    const url = window.location.origin + "/sorteos-y-premios";

    if (channel === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`, "_blank");
    } else if (channel === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
    } else if (navigator.share) {
      navigator.share({ title: "Sorteo Descubre RD", text, url }).catch(() => {});
    }

    if (!shared) {
      setShared(true);
      localStorage.setItem("sorteo_shared_bonus", "true");
      toast.success("🔥 ¡Bono viral desbloqueado! +5 Boletos de Sorteo.");
      if (onPointsUpdated) onPointsUpdated(points + 5);
    }
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) {
      toast.error("Por favor completa tu nombre y correo electrónico.");
      return;
    }

    setIsSubmitting(true);
    try {
      await supabase.from("contest_registrations").insert({
        nombre: formData.fullName,
        email: formData.email,
        telefono: formData.phone || null,
        pais: formData.country,
        intereses: ["Resorts de Lujo", "Sorteo Viral 2026", `Amigos: ${invites.length}`],
      });
    } catch {
      // Offline fallback
    }

    localStorage.setItem("sorteo_grand_registered", "true");
    localStorage.setItem("sorteo_tickets_count", points.toString());
    setIsSubmitting(false);
    setIsSuccess(true);
    toast.success("🏆 ¡Tu registro ha sido completado con éxito!", {
      description: `Tienes ${points} boletos activos para el próximo sorteo mensual.`
    });
  };

  if (isSuccess) {
    return (
      <Card className="max-w-2xl mx-auto border border-emerald-500/30 bg-card rounded-3xl p-8 text-center shadow-xl">
        <div className="size-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-xs font-bold mb-2">
          Participación Activa
        </Badge>
        <h3 className="text-2xl md:text-3xl font-display font-black text-foreground mb-2">
          ¡Ya estás participando en el Gran Sorteo!
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
          Has acumulado <strong className="text-primary font-mono text-lg">{points} Boletos</strong>. Los resultados se anunciarán el último día del mes en vivo.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={() => handleShare("whatsapp")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs font-bold"
          >
            <MessageCircle className="w-4 h-4" /> Compartir en WhatsApp (+5 Puntos)
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setIsSuccess(false);
              localStorage.removeItem("sorteo_grand_registered");
            }}
            className="text-xs"
          >
            Actualizar mis datos
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto border border-border/80 bg-card rounded-3xl shadow-xl overflow-hidden">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-primary/10 via-amber-500/10 to-indigo-500/10 p-6 md:p-8 border-b border-border/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Badge variant="outline" className="bg-background/80 text-primary border-primary/20 text-xs gap-1.5 py-1 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Gran Sorteo de Apertura
            </Badge>
            <CardTitle className="text-2xl md:text-3xl font-display font-extrabold text-foreground">
              Formulario Multi-Puntos
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Suma más oportunidades completando los pasos interactivos.
            </CardDescription>
          </div>

          <div className="bg-background/90 backdrop-blur-sm border-2 border-dashed border-primary/30 p-3.5 rounded-2xl flex flex-col items-center min-w-[110px] shadow-sm">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Tus Boletos</span>
            <span className="text-3xl font-mono font-black text-primary">{points}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 md:p-8 space-y-8">
        <form onSubmit={handleSubmitRegistration} className="space-y-8">
          
          {/* PASO 1: Datos Personales */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border/60">
              <span className="size-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h4 className="font-bold text-base text-foreground">Datos del Participante</h4>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold block mb-1">Nombre Completo *</Label>
                <Input
                  required
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Ej. María Santos"
                  className="bg-background text-xs h-9"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold block mb-1">Cédula o Pasaporte *</Label>
                <Input
                  value={formData.identification}
                  onChange={(e) => handleInputChange("identification", e.target.value)}
                  placeholder="001-0000000-0 / Pasaporte"
                  className="bg-background text-xs h-9"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold block mb-1">Correo Electrónico *</Label>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="maria@ejemplo.com"
                  className="bg-background text-xs h-9"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold block mb-1">Teléfono Móvil (WhatsApp) *</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (809) 000-0000"
                  className="bg-background text-xs h-9"
                />
              </div>
            </div>
          </section>

          {/* PASO 2: Misiones Sociales */}
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <span className="size-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h4 className="font-bold text-base text-foreground">Misiones Sociales</h4>
              </div>
              <Badge variant="secondary" className="text-[10px] text-primary">
                +1 a +3 Boletos c/u
              </Badge>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {SOCIAL_ACTIONS.map((task) => {
                const isDone = completedSocials.includes(task.id);
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => handleToggleSocial(task.id, task.url, task.points)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                      isDone
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600"
                        : `bg-background border-border ${task.color}`
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{task.icon}</span>
                      {task.name}
                    </span>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        +{task.points} Pts
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* PASO 3: Invitar Amigos (Referidos) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <span className="size-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h4 className="font-bold text-base text-foreground">Invitar Amigos</h4>
              </div>
              <Badge variant="secondary" className="text-[10px] text-amber-500">
                +2 Boletos por Amigo
              </Badge>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-3">
              <div className="grid sm:grid-cols-3 gap-2">
                <Input
                  value={newInvite.name}
                  onChange={(e) => setNewInvite({ ...newInvite, name: e.target.value })}
                  placeholder="Nombre del amigo"
                  className="bg-background text-xs h-9"
                />
                <Input
                  type="email"
                  value={newInvite.email}
                  onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                  placeholder="Email"
                  className="bg-background text-xs h-9"
                />
                <div className="flex gap-2">
                  <Input
                    type="tel"
                    value={newInvite.phone}
                    onChange={(e) => setNewInvite({ ...newInvite, phone: e.target.value })}
                    placeholder="Teléfono"
                    className="bg-background text-xs h-9 flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddInvite}
                    size="sm"
                    className="h-9 px-3 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Lista de Invitados */}
              {invites.length > 0 && (
                <div className="space-y-2 pt-2">
                  {invites.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        <span className="font-bold">{inv.name}</span>
                        <span className="text-muted-foreground text-[11px]">({inv.email})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveInvite(inv.id)}
                        className="text-muted-foreground hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* PASO 4: Compartir Viral */}
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <span className="size-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  4
                </span>
                <h4 className="font-bold text-base text-foreground">Multiplicador Viral</h4>
              </div>
              <Badge variant="secondary" className="text-[10px] text-emerald-500 font-bold">
                +5 Boletos
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={() => handleShare("whatsapp")}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-10 gap-2"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp (+5 Boletos)
              </Button>
              <Button
                type="button"
                onClick={() => handleShare("twitter")}
                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold h-10 gap-2"
              >
                <Twitter className="w-4 h-4" /> Twitter (+5 Boletos)
              </Button>
            </div>
          </section>

          {/* Botón de Envío Final */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-sm font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-lg shadow-primary/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Registrando...
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4" /> Enviar y Participar con {points} Boletos
                </>
              )}
            </Button>
            <p className="text-[10px] text-center text-muted-foreground mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Al registrarte aceptas las bases del sorteo y confirmas ser mayor de 18 años.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
