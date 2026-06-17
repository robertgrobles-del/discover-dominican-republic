import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Heart, MapPin, CheckCircle, ArrowUp, Send, HelpCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Reply {
  id: string;
  author: string;
  isLocal: boolean;
  content: string;
  votes: number;
  date: string;
}

interface Question {
  id: string;
  title: string;
  content: string;
  author: string;
  location: string;
  date: string;
  votes: number;
  replies: Reply[];
}

const mockQuestions: Question[] = [
  {
    id: "q1",
    title: "¿Cómo ir de Santo Domingo a Bahía de las Águilas?",
    content: "Hola a todos, estoy planificando ir en carro de alquiler. ¿Es seguro el camino? ¿Cuánto se tarda y dónde recomiendan parar a almorzar?",
    author: "clara_viajera",
    location: "Pedernales",
    date: "Hace 2 días",
    votes: 12,
    replies: [
      {
        id: "r1",
        author: "José Manuel",
        isLocal: true,
        content: "El trayecto dura unas 6 horas. La carretera de la costa desde Barahona está en muy buen estado y tiene vistas increíbles. Te recomiendo detenerte a almorzar pescado frito en San Rafael o en Los Patos. Para el tramo final de Cabo Rojo a la Bahía, prefiere coordinar un bote en Las Cueva.",
        votes: 8,
        date: "Hace 1 día"
      },
      {
        id: "r2",
        author: "david_backpacks",
        isLocal: false,
        content: "Hice esa ruta el mes pasado, asegúrate de llenar el tanque de gasolina en Barahona, porque después hay muy pocas estaciones de servicio hasta Pedernales.",
        votes: 3,
        date: "Hace 18 horas"
      }
    ]
  },
  {
    id: "q2",
    title: "¿Colmados recomendados para escuchar bachata real?",
    content: "Queremos salir de la zona colonial turística y ver cómo los dominicanos pasan la noche de fin de semana en un colmado. ¿Qué barrios sugieren que sean seguros?",
    author: "marc_99",
    location: "Santo Domingo",
    date: "Hace 3 días",
    votes: 8,
    replies: [
      {
        id: "r3",
        author: "Yanet Altagracia",
        isLocal: true,
        content: "Si estás en Santo Domingo, puedes ir a los colmados de San Carlos o Ciudad Nueva, están muy cerca de la zona colonial y son seguros. Pide una cerveza vestida de novia y disfruta de la música en la acera.",
        votes: 6,
        date: "Hace 2 días"
      }
    ]
  }
];

export default function ForoDestino() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("Por favor completa el título y cuerpo de la pregunta.");
      return;
    }
    const newQ: Question = {
      id: "q-" + Math.random().toString(36).substring(2, 9),
      title: newTitle,
      content: newContent,
      author: user?.email?.split("@")[0] || "viajero_anonimo",
      location: selectedLocation === "all" ? "República Dominicana" : selectedLocation,
      date: "Ahora mismo",
      votes: 0,
      replies: []
    };
    setQuestions([newQ, ...questions]);
    setNewTitle("");
    setNewContent("");
    toast.success("¡Tu pregunta ha sido publicada en el foro!");
  };

  const handleAddReply = (questionId: string) => {
    const text = replyText[questionId];
    if (!text || !text.trim()) {
      toast.error("Escribe un comentario antes de enviar.");
      return;
    }
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        const newReply: Reply = {
          id: "r-" + Math.random().toString(36).substring(2, 9),
          author: user?.email?.split("@")[0] || "turista",
          isLocal: false,
          content: text,
          votes: 0,
          date: "Ahora mismo"
        };
        return {
          ...q,
          replies: [...q.replies, newReply]
        };
      }
      return q;
    }));
    setReplyText(prev => ({ ...prev, [questionId]: "" }));
    toast.success("¡Comentario añadido!");
  };

  const handleVoteQuestion = (id: string) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, votes: q.votes + 1 } : q));
    toast.success("¡Voto registrado!");
  };

  const handleVoteReply = (qId: string, rId: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          replies: q.replies.map(r => r.id === rId ? { ...r, votes: r.votes + 1 } : r)
        };
      }
      return q;
    }));
    toast.success("¡Voto de respuesta registrado!");
  };

  const filteredQuestions = questions.filter(q => {
    if (selectedLocation === "all") return true;
    return q.location === selectedLocation;
  });

  return (
    <PageTransition>
      <SEOHead
        title="Foros por Destino - Comunidad Descubre RD"
        description="Preguntas y respuestas sobre República Dominicana. Consulta dudas de viaje y obtén consejos de guías y locales verificados."
      />
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />

        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-border pb-6">
              <div>
                <Badge className="mb-3 bg-indigo-500/10 text-indigo-400 border-indigo-400/20 gap-1.5 py-1 px-3">
                  <MessageSquare className="h-4 w-4" /> Comunidad de Viajes
                </Badge>
                <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground">
                  Foros por Destino
                </h1>
                <p className="text-muted-foreground mt-2 max-w-xl">
                  Resuelve tus dudas. Interactúa con residentes y viajeros frecuentes para planificar tu itinerario real y seguro.
                </p>
              </div>
            </div>

            {/* Filter by destination */}
            <div className="flex flex-wrap items-center gap-3 mb-8 bg-card/45 backdrop-blur-md p-4 rounded-xl border border-border">
              <span className="text-xs font-semibold text-muted-foreground mr-2">Filtrar Foro:</span>
              {["all", "Santo Domingo", "Santiago", "Samaná", "Punta Cana", "Pedernales"].map((loc) => (
                <Button
                  key={loc}
                  variant={selectedLocation === loc ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLocation(loc)}
                  className="rounded-full text-xs"
                >
                  {loc === "all" ? "Todo el País" : loc}
                </Button>
              ))}
            </div>

            {/* Forum layout */}
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Questions Feed */}
              <div className="lg:col-span-2 space-y-6">
                {filteredQuestions.map((q) => (
                  <Card key={q.id} className="border border-border bg-card/55 overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Upvote column */}
                        <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/50 border border-border/40">
                          <button
                            onClick={() => handleVoteQuestion(q.id)}
                            className="text-muted-foreground hover:text-primary transition-colors"
                            title="Votar pregunta"
                            aria-label="Votar pregunta"
                          >
                            <ArrowUp className="h-5 w-5" />
                          </button>
                          <span className="font-bold text-sm text-foreground mt-1">{q.votes}</span>
                        </div>

                        {/* Question content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                              {q.location}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">publicado por @{q.author} • {q.date}</span>
                          </div>
                          <h3 className="font-display font-bold text-base text-foreground leading-snug">
                            {q.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            {q.content}
                          </p>
                        </div>
                      </div>

                      {/* Replies List */}
                      <div className="mt-6 border-t border-border/40 pt-4 pl-4 md:pl-12 space-y-4">
                        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                          Respuestas ({q.replies.length})
                        </p>
                        {q.replies.map((r) => (
                          <div key={r.id} className="p-3 bg-secondary/45 border border-border/40 rounded-xl relative">
                            <div className="flex justify-between items-center mb-1.5">
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-xs text-foreground">@{r.author}</span>
                                {r.isLocal && (
                                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] gap-0.5 py-0 px-1.5">
                                    <CheckCircle className="h-2.5 w-2.5" /> Local Verificado
                                  </Badge>
                                )}
                              </div>
                              <span className="text-[9px] text-muted-foreground">{r.date}</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{r.content}</p>
                            
                            {/* Vote reply */}
                            <div className="mt-2.5 flex items-center justify-end">
                              <button
                                onClick={() => handleVoteReply(q.id, r.id)}
                                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
                              >
                                <ArrowUp className="h-3.5 w-3.5" /> Útil ({r.votes})
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Add Reply form */}
                        <div className="flex gap-2 pt-2 items-center">
                          <Input
                            placeholder="Escribe una respuesta útil..."
                            value={replyText[q.id] || ""}
                            onChange={(e) => setReplyText(prev => ({ ...prev, [q.id]: e.target.value }))}
                            className="bg-card border-border text-xs flex-grow"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddReply(q.id)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredQuestions.length === 0 && (
                  <div className="py-16 text-center bg-card/40 border border-border rounded-2xl">
                    <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-bounce" />
                    <h3 className="text-lg font-bold text-foreground">Aún no hay dudas en este foro</h3>
                    <p className="text-muted-foreground text-xs">Sé el primero en publicar una pregunta sobre este destino.</p>
                  </div>
                )}
              </div>

              {/* Ask Question form */}
              <div>
                <Card className="bg-card/75 border border-border sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Haz una Pregunta</CardTitle>
                    <CardDescription className="text-xs">
                      Los guías y residentes verificados te responderán a la brevedad.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <form onSubmit={handleCreateQuestion} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">Título de la Pregunta</label>
                        <Input
                          placeholder="Ej: ¿Dónde comprar mariscos en Samaná?"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="bg-secondary/40 border-border text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">Detalle / Cuerpo</label>
                        <Textarea
                          placeholder="Describe con detalle lo que necesitas saber..."
                          value={newContent}
                          onChange={(e) => setNewContent(e.target.value)}
                          rows={4}
                          className="bg-secondary/40 border-border text-xs"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5"
                      >
                        <Send className="h-4 w-4" /> Publicar Pregunta
                      </Button>
                    </form>
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
