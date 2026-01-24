import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Palmtree, Umbrella, Utensils, Mountain, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import heroBeachImg from "@/assets/hero-beach.jpg";

const interests = [
  { id: "cultura", label: "Cultura", icon: Palmtree },
  { id: "playa", label: "Playa", icon: Umbrella },
  { id: "gastronomia", label: "Gastronomía", icon: Utensils },
  { id: "aventura", label: "Aventura", icon: Mountain },
];

export default function Newsletter() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["cultura"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <PageTransition>
        <div className="min-h-screen relative flex items-center justify-center p-4">
          <div className="absolute inset-0 z-0">
            <img
              src={heroBeachImg}
              alt="República Dominicana"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-background/40" />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 bg-card/95 backdrop-blur-xl rounded-3xl p-10 max-w-md w-full text-center shadow-2xl border border-border"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-emerald-500" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-3">¡Bienvenido al paraíso!</h2>
            <p className="text-muted-foreground mb-6">
              Tu suscripción ha sido confirmada. Pronto recibirás las mejores ofertas y secretos de República Dominicana en tu bandeja de entrada.
            </p>
            <Link to="/">
              <Button className="w-full gap-2">
                Explorar el sitio
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen relative flex items-center justify-center p-4">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroBeachImg}
            alt="República Dominicana"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/30" />
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 bg-card/95 backdrop-blur-xl rounded-3xl p-8 md:p-10 max-w-lg w-full shadow-2xl border border-border"
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-display font-bold tracking-wider">
              🌴 RD NEWSLETTER
            </div>
          </div>

          <h1 className="font-display text-2xl md:text-3xl font-bold text-center mb-3">
            Recibe un poco de paraíso<br />en tu bandeja de entrada
          </h1>

          <p className="text-muted-foreground text-center mb-8">
            Únete a nuestra comunidad exclusiva y sé el primero en descubrir los secretos mejor guardados y las joyas ocultas de República Dominicana.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name & Email */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                  Nombre completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium mb-2 block">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Interests */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Personaliza tu experiencia:
              </Label>
              <div className="flex flex-wrap gap-3">
                {interests.map((interest) => {
                  const Icon = interest.icon;
                  const isSelected = selectedInterests.includes(interest.id);
                  return (
                    <button
                      key={interest.id}
                      type="button"
                      onClick={() => toggleInterest(interest.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-surface border-border hover:border-primary/50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{interest.label}</span>
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              className="w-full gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Suscribiendo...
                </>
              ) : (
                <>
                  Suscribirme ahora
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Al suscribirte, aceptas nuestra{" "}
              <Link to="/terminos" className="text-primary hover:underline">
                política de privacidad
              </Link>
              . Prometemos no enviar spam, solo sol y playa.
            </p>
          </form>
        </motion.div>
      </div>
    </PageTransition>
  );
}
