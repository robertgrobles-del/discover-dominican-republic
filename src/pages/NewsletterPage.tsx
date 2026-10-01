import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { 
  Mail, CheckCircle, Tag, MapPin, Calendar, Sparkles,
  Gift, Plane
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { FloatingInput } from "@/components/ui/floating-input";
import { toast } from "sonner";
import { fetchApi } from "@/lib/fastifyClient";
import { getFormErrorMessage, newsletterSubscribeSchema } from "@/lib/forms";
import { useI18n } from "@/hooks/useI18n";

const interests = [
  { id: "playas", label: "Playas", icon: "🏖️" },
  { id: "aventura", label: "Aventura", icon: "🧗" },
  { id: "cultura", label: "Cultura", icon: "🏛️" },
  { id: "gastronomia", label: "Gastronomía", icon: "🍽️" },
  { id: "naturaleza", label: "Naturaleza", icon: "🌿" },
  { id: "wellness", label: "Wellness", icon: "🧘" },
  { id: "golf", label: "Golf", icon: "⛳" },
  { id: "bodas", label: "Bodas", icon: "💍" },
];

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [formError, setFormError] = useState("");
  const [website, setWebsite] = useState("");
  const submitLock = useRef(false);
  const { locale } = useI18n();

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLock.current) return;
    const parsed = newsletterSubscribeSchema.safeParse({
      email,
      name: name || undefined,
      lists: selectedInterests,
      locale,
      source: "newsletter-page",
      website,
    });
    if (!parsed.success) {
      setFormError("Revisa el correo y el nombre. El nombre admite hasta 80 caracteres.");
      return;
    }

    submitLock.current = true;
    setIsSubmitting(true);
    setFormError("");
    try {
      await fetchApi("/forms/newsletter/subscribe", {
        method: "POST",
        body: JSON.stringify(parsed.data),
      });
      setIsSubscribed(true);
      toast.success("Solicitud recibida. Revisa tu correo para confirmar la suscripción.");
    } catch (error) {
      const message = getFormErrorMessage(error);
      setFormError(message);
      toast.error(message);
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  };
  if (isSubscribed) {
    return (
      <PageTransition>
        <SEOHead
          title="Newsletter - Suscripción Exitosa"
          description="Te has suscrito al newsletter de RD Turismo"
        />
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 lg:px-8 py-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald/20 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-emerald" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-4">¡Suscripción Exitosa!</h1>
              <p className="text-muted-foreground mb-8">
                Gracias por unirte a nuestra comunidad. Hemos enviado un correo de confirmación a <strong>{email}</strong>.
              </p>
              <Button onClick={() => setIsSubscribed(false)}>
                Modificar preferencias
              </Button>
            </motion.div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SEOHead
        title="Newsletter Segmentado - Ofertas Personalizadas de RD"
        description="Suscríbete a nuestro newsletter y recibe ofertas personalizadas según tus intereses de viaje."
        keywords="newsletter, ofertas, República Dominicana, turismo, descuentos, promociones"
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-br from-primary/20 via-background to-background">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <Badge className="mb-4">Newsletter</Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Ofertas <span className="text-gradient">Personalizadas</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Recibe las mejores ofertas y novedades según tus intereses de viaje.
                Sin spam, solo contenido relevante para ti.
              </p>
            </motion.div>
          </div>
        </section>

        <main className="container mx-auto px-4 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8" aria-busy={isSubmitting}>
              {/* Personal Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl p-6 border border-border"
              >
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Información de contacto
                </h2>
                <div className="space-y-4">
                  <FloatingInput
                    label="Nombre (opcional)"
                    id="newsletter-name"
                    maxLength={80}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground text-right" aria-live="polite">{name.length}/80</p>
                  <FloatingInput
                    label="Correo electrónico"
                    type="email"
                    id="newsletter-email"
                    maxLength={254}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </motion.div>

              {/* Interests */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border"
              >
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  ¿Qué te interesa?
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecciona tus intereses para recibir contenido personalizado
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {interests.map((interest) => (
                    <button
                      key={interest.id}
                      type="button"
                      aria-pressed={selectedInterests.includes(interest.id)}
                      onClick={() => toggleInterest(interest.id)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        selectedInterests.includes(interest.id)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-2xl block mb-1">{interest.icon}</span>
                      <span className="text-sm font-medium">{interest.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Benefits */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-primary/10 via-card to-card rounded-2xl p-6 border border-primary/30"
              >
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  Beneficios exclusivos
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { icon: Tag, text: "Descuentos exclusivos" },
                    { icon: Calendar, text: "Acceso anticipado a eventos" },
                    { icon: Plane, text: "Ofertas de vuelos" },
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <benefit.icon className="h-4 w-4 text-primary" />
                      <span className="text-sm">{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Submit */}
              <label className="absolute -left-[10000px]" aria-hidden="true">
                Sitio web
                <input name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
              </label>
              {formError && <p id="newsletter-form-error" role="alert" aria-live="assertive" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{formError}</p>}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
                aria-describedby={formError ? "newsletter-form-error" : undefined}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </span>
                ) : (
                  "Suscribirme al Newsletter"
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Puedes cancelar tu suscripción en cualquier momento.
                Respetamos tu privacidad y nunca compartiremos tu información.
              </p>
            </form>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
