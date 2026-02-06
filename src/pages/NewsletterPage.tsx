import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Mail, CheckCircle, Tag, MapPin, Calendar, Sparkles,
  Bell, Gift, Plane, Hotel, Utensils
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { FloatingInput } from "@/components/ui/floating-input";
import { toast } from "sonner";

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

const frequencies = [
  { id: "weekly", label: "Semanal", desc: "Ofertas y novedades cada semana" },
  { id: "biweekly", label: "Quincenal", desc: "Lo mejor cada dos semanas" },
  { id: "monthly", label: "Mensual", desc: "Resumen mensual de ofertas" },
];

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [frequency, setFrequency] = useState("biweekly");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Por favor ingresa tu correo electrónico");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubscribed(true);
    toast.success("¡Gracias por suscribirte! Revisa tu correo para confirmar.");
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
            <form onSubmit={handleSubmit} className="space-y-8">
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <FloatingInput
                    label="Correo electrónico"
                    type="email"
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

              {/* Frequency */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-2xl p-6 border border-border"
              >
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Frecuencia de envío
                </h2>
                <div className="grid md:grid-cols-3 gap-3">
                  {frequencies.map((freq) => (
                    <button
                      key={freq.id}
                      type="button"
                      onClick={() => setFrequency(freq.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        frequency === freq.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p className="font-medium">{freq.label}</p>
                      <p className="text-xs text-muted-foreground">{freq.desc}</p>
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
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
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
