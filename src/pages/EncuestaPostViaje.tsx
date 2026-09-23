import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { BetweenSectionsAd, InlineAd } from "@/components/promo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ClipboardList, Star, CheckCircle2, Send, ThumbsUp, ThumbsDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const questions = [
  {
    id: 1,
    question: "¿Cómo calificarías tu experiencia general en República Dominicana?",
    type: "rating"
  },
  {
    id: 2,
    question: "¿Qué tan probable es que recomiendes RD a un amigo?",
    type: "nps"
  },
  {
    id: 3,
    question: "¿Cuál fue el aspecto más destacado de tu viaje?",
    type: "multiple",
    options: ["Playas", "Gastronomía", "Cultura/Historia", "Naturaleza", "Hospitalidad", "Vida Nocturna"]
  },
  {
    id: 4,
    question: "¿Qué podríamos mejorar?",
    type: "multiple",
    options: ["Transporte", "Señalización", "Limpieza", "Precios", "Seguridad", "Información turística"]
  },
  {
    id: 5,
    question: "Comparte tu experiencia con nosotros",
    type: "text"
  }
];

export default function EncuestaPostViaje() {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [submitted, setSubmitted] = useState(false);

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({ ...prev, [questions[currentQuestion].id]: value }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setSubmitted(true);
      toast({
        title: "¡Gracias por tu opinión!",
        description: "Tu feedback nos ayuda a mejorar la experiencia turística.",
      });
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const renderQuestion = () => {
    const q = questions[currentQuestion];

    switch (q.type) {
      case "rating":
        return (
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                variant={answers[q.id] >= star ? "default" : "outline"}
                size="lg"
                className="w-16 h-16"
                onClick={() => handleAnswer(star)}
              >
                <Star className={`h-8 w-8 ${answers[q.id] >= star ? 'fill-current' : ''}`} />
              </Button>
            ))}
          </div>
        );

      case "nps":
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Nada probable</span>
              <span>Muy probable</span>
            </div>
            <div className="flex justify-center gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <Button
                  key={num}
                  variant={answers[q.id] === num ? "default" : "outline"}
                  size="sm"
                  className={`w-10 ${
                    num <= 6 ? 'hover:bg-red-500/20' : 
                    num <= 8 ? 'hover:bg-yellow-500/20' : 'hover:bg-green-500/20'
                  }`}
                  onClick={() => handleAnswer(num)}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>
        );

      case "multiple":
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {q.options?.map((option) => (
              <Button
                key={option}
                variant={answers[q.id]?.includes(option) ? "default" : "outline"}
                className="h-auto py-4"
                onClick={() => {
                  const current = answers[q.id] || [];
                  if (current.includes(option)) {
                    handleAnswer(current.filter((o: string) => o !== option));
                  } else {
                    handleAnswer([...current, option]);
                  }
                }}
              >
                {option}
              </Button>
            ))}
          </div>
        );

      case "text":
        return (
          <Textarea
            placeholder="Cuéntanos sobre tu viaje..."
            className="min-h-32"
            value={answers[q.id] || ""}
            onChange={(e) => handleAnswer(e.target.value)}
          />
        );

      default:
        return null;
    }
  };

  if (submitted) {
    return (
      <PageTransition>
        <SEOHead title="Gracias - Encuesta Completada" description="Tu opinión ha sido registrada" />
        <div className="min-h-screen bg-background">
          <Header />
          <main className="pt-20 flex items-center justify-center min-h-[80vh]">
            <div className="text-center max-w-md px-4">
              <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold mb-4">¡Gracias por tu opinión!</h1>
              <p className="text-muted-foreground mb-6">
                Tu feedback es invaluable para mejorar la experiencia turística en República Dominicana.
              </p>
              <Button onClick={() => window.location.href = "/"}>
                Volver al Inicio
              </Button>
            </div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SEOHead
        title="Encuesta Post-Viaje - República Dominicana"
        description="Comparte tu experiencia de viaje en RD. Tu opinión nos ayuda a mejorar."
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-20">
          <section className="relative py-12 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
            <div className="container mx-auto px-4 text-center">
              <ClipboardList className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Cuéntanos tu Experiencia</h1>
              <p className="text-muted-foreground">
                Tu opinión nos ayuda a mejorar
              </p>
            </div>
          </section>

          <section className="py-16">
            <div className="container mx-auto px-4 max-w-2xl">
              <div className="mb-8">
                <div className="flex justify-between text-sm mb-2">
                  <span>Pregunta {currentQuestion + 1} de {questions.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    {questions[currentQuestion].question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {renderQuestion()}

                  <div className="flex justify-between pt-6">
                    <Button 
                      variant="outline" 
                      onClick={prevQuestion}
                      disabled={currentQuestion === 0}
                    >
                      Anterior
                    </Button>
                    <Button onClick={nextQuestion}>
                      {currentQuestion === questions.length - 1 ? (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Enviar
                        </>
                      ) : (
                        "Siguiente"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <InlineAd showDemo variant="medium" />
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
