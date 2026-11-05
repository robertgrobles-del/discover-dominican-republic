import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Smile, 
  Meh, 
  Frown, 
  Send,
  Lock,
  Palmtree,
  Utensils,
  Users,
  Hotel,
  Mountain,
  Sun,
  Building,
  Moon,
  Wrench
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageTransition } from "@/components/PageTransition";
import heroBeachImg from "@/assets/hero-beach.jpg";
import { usePageContent } from "@/lib/pageContent";

const experienceOptions = [
  { id: "playas", label: "Playas", icon: Palmtree },
  { id: "gastronomia", label: "Gastronomía", icon: Utensils },
  { id: "gente", label: "La Gente", icon: Users },
  { id: "hoteles", label: "Hoteles", icon: Hotel },
  { id: "naturaleza", label: "Naturaleza", icon: Mountain },
  { id: "clima", label: "Clima", icon: Sun },
  { id: "cultura", label: "Historia y Cultura", icon: Building },
  { id: "vida-nocturna", label: "Vida Nocturna", icon: Moon },
];

// Antes en /encuesta-post-viaje.
const mejoraOptions = ["Transporte", "Señalización", "Limpieza", "Precios", "Seguridad", "Información turística"];

const ratings = [
  { value: 1, label: "Mala", icon: Frown, color: "text-red-500" },
  { value: 2, label: "Regular", icon: Frown, color: "text-orange-500" },
  { value: 3, label: "Normal", icon: Meh, color: "text-yellow-500" },
  { value: 4, label: "Buena", icon: Smile, color: "text-lime-500" },
  { value: 5, label: "Excelente", icon: Smile, color: "text-green-500" },
];

export default function Encuesta() {
  const pc = usePageContent("encuesta");
  const ratings = pc.data("ratings", __pcData.ratings);
  const experienceOptions = pc.data("experienceOptions", __pcData.experienceOptions);
  const [searchParams] = useSearchParams();
  const requestedSource = searchParams.get("from") ?? "";
  const sourcePage = requestedSource.startsWith("/") && !requestedSource.startsWith("//")
    ? requestedSource.slice(0, 200)
    : "";
  const [step, setStep] = useState(1);
  const [rating, setRating] = useState<number | null>(null);
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState(7);
  const [comments, setComments] = useState("");
  const mejoraOptions = pc.data("mejoraOptions", __pcData.mejoraOptions);
  const [mejoras, setMejoras] = useState<string[]>([]);

  const toggleExperience = (id: string) => {
    setSelectedExperiences((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    console.log({
      rating,
      selectedExperiences,
      recommendation,
      comments,
      mejoras,
      sourcePage,
    });
    // Submit logic here
    alert("¡Gracias por tu opinión!");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-16 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${pc.img("asset.heroBeachImg", heroBeachImg)})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/60" />
          
          <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block bg-primary/20 text-primary text-sm font-medium px-4 py-2 rounded-full mb-4">{pc.tx("span.1", "ENCUESTA DE SATISFACCIÓN")}</span>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">{pc.tx("h1.1", "¡Gracias por visitarnos!")}</h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">{pc.tx("p.1", "Tu opinión es vital para mejorar el turismo en nuestro país. Solo tomará 2 minutos.")}</p>
              {sourcePage && <p className="mt-3 text-sm text-muted-foreground">{pc.tx("p.2", "Encuesta abierta desde:")}{" "}<span className="font-medium">{sourcePage}</span></p>}
            </motion.div>
          </div>
        </section>

        {/* Survey Form */}
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-2xl mx-auto bg-card rounded-2xl border border-border p-8">
              {/* Progress */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display font-bold text-foreground">{pc.tx("h2.1", "TU EXPERIENCIA")}</h2>
                <span className="text-sm text-muted-foreground">{pc.tx("span.2", "Paso")}{" "}{step}{" "}{pc.tx("span.3", "de 2")}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full mb-8">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${step * 50}%` }}
                />
              </div>

              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  {/* Question 1: Rating */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        1
                      </span>
                      <div>
                        <h3 className="font-display font-bold text-foreground">{pc.tx("h3.1", "¿Cómo calificarías tu experiencia general?")}</h3>
                        <p className="text-sm text-muted-foreground">{pc.tx("p.3", "Selecciona la carita que mejor represente tu viaje.")}</p>
                      </div>
                    </div>
                    <div className="flex justify-center gap-4">
                      {ratings.map((r) => (
                        <button
                          key={r.value}
                          onClick={() => setRating(r.value)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                            rating === r.value
                              ? "bg-primary/10 border-2 border-primary"
                              : "hover:bg-secondary"
                          }`}
                        >
                          <r.icon className={`h-10 w-10 ${rating === r.value ? "text-primary" : r.color}`} />
                          <span className={`text-xs ${rating === r.value ? "text-primary font-medium" : "text-muted-foreground"}`}>
                            {r.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question 2: What did you enjoy */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        2
                      </span>
                      <div>
                        <h3 className="font-display font-bold text-foreground">{pc.tx("h3.2", "¿Qué fue lo que más disfrutaste?")}</h3>
                        <p className="text-sm text-muted-foreground">{pc.tx("p.4", "Selecciona todas las opciones que apliquen.")}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                      {experienceOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => toggleExperience(option.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                            selectedExperiences.includes(option.id)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background border-border hover:border-primary/50"
                          }`}
                        >
                          <option.icon className="h-4 w-4" />
                          <span className="text-sm">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question 3: Recommendation */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        3
                      </span>
                      <h3 className="font-display font-bold text-foreground">{pc.tx("h3.3", "¿Qué tan probable es que recomiendes RD?")}</h3>
                    </div>
                    <div className="space-y-4">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={recommendation}
                        onChange={(e) => setRecommendation(Number(e.target.value))}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{pc.tx("span.4", "NADA PROBABLE")}</span>
                        <span className="text-primary font-bold text-lg">{recommendation}</span>
                        <span>{pc.tx("span.5", "MUY PROBABLE")}</span>
                      </div>
                    </div>
                  </div>

                  <Button onClick={() => setStep(2)} className="w-full">{pc.tx("Button.1", "Continuar")}</Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  {/* Qué mejorar (antes en /encuesta-post-viaje) */}
                  <fieldset>
                    <legend className="flex items-center gap-3 mb-4">
                      <Wrench className="h-5 w-5 text-primary" aria-hidden="true" />
                      <span className="font-display font-bold text-foreground">{pc.tx("h3.5", "¿Qué podríamos mejorar?")}</span>
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {mejoraOptions.map((m) => {
                        const activa = mejoras.includes(m);
                        return (
                          <Button
                            key={m}
                            type="button"
                            variant={activa ? "default" : "outline"}
                            size="sm"
                            aria-pressed={activa}
                            onClick={() => setMejoras((prev) => (activa ? prev.filter((x) => x !== m) : [...prev, m]))}
                          >
                            {m}
                          </Button>
                        );
                      })}
                    </div>
                  </fieldset>

                  {/* Comments */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Send className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-display font-bold text-foreground">{pc.tx("h3.4", "¿Alguna sugerencia o comentario adicional? (Opcional)")}</h3>
                      </div>
                    </div>
                    <Textarea
                      placeholder={pc.t("Textarea.placeholder.1", "Cuéntanos tu momento favorito o cómo podemos mejorar...")}
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={5}
                      className="resize-none"
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">{pc.tx("Button.2", "Volver")}</Button>
                    <Button onClick={handleSubmit} className="flex-1 gap-2">{pc.tx("Button.3", "Enviar Encuesta")}{" "}<Send className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Privacy Notice */}
              <div className="flex items-center justify-center gap-2 mt-8 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>{pc.tx("span.6", "Sus respuestas son anónimas y seguras.")}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Institutional Footer */}
        <section className="py-8 border-t border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex justify-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{pc.tx("span.7", "MT")}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{pc.tx("span.8", "MITUR")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{pc.tx("span.9", "ONE")}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{pc.tx("span.10", "ONE")}</span>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4">{pc.tx("p.5", "© 2024 Ministerio de Turismo de la República Dominicana.")}<br />{pc.tx("p.6", "Todos los derechos reservados.")}</p>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}

// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).
const __pcData = { ratings, experienceOptions, mejoraOptions };
