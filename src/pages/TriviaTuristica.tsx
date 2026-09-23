import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Brain, CheckCircle2, XCircle, Trophy, Clock, Zap,
  ChevronRight, RotateCcw, Star, Flame, Award, Compass,
  MapPin, Target, Sparkles, ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useActionTracker } from "@/hooks/useActionTracker";
import { toast } from "sonner";
import { PanoramaAd } from "@/components/promo";
import { GamificationSoundEngine } from "@/services/gamificationEngine";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  category: string;
  difficulty: string;
  explanation: string;
  xp_reward: number;
}

type GameState = "menu" | "playing" | "result";

const categoryColors: Record<string, string> = {
  "Geografía": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  "Historia": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  "Gastronomía": "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  "Naturaleza": "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  "Cultura": "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
};

const difficultyLabels: Record<string, string> = {
  easy: "Fácil",
  medium: "Intermedio",
  hard: "Experto",
};

export default function TriviaTuristica() {
  const { user } = useAuth();
  const { trackAction } = useActionTracker();
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [gameState, setGameState] = useState<GameState>("menu");
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [totalXpEarned, setTotalXpEarned] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  // Fetch questions from DB
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoadingQuestions(true);
      const { data } = await supabase
        .from("trivia_questions")
        .select("*")
        .eq("is_active", true);
      if (data && data.length > 0) {
        setAllQuestions(data as unknown as Question[]);
      } else {
        // Fallback quality trivia questions if DB table is empty
        setAllQuestions([
          {
            id: "t1",
            question: "¿En qué año se proclamó la Independencia Efímera liderada por José Núñez de Cáceres?",
            options: ["1821", "1844", "1863", "1492"],
            correct_index: 0,
            category: "Historia",
            difficulty: "medium",
            explanation: "El 1 de diciembre de 1821, José Núñez de Cáceres proclamó el Estado Independiente del Haití Español.",
            xp_reward: 35
          },
          {
            id: "t2",
            question: "¿Cuál es la montaña más alta de las Antillas con 3,087 metros sobre el nivel del mar?",
            options: ["Pico Isabel de Torres", "Loma Quita Espuela", "Pico Duarte", "Sierra de Bahoruco"],
            correct_index: 2,
            category: "Geografía",
            difficulty: "easy",
            explanation: "El Pico Duarte en la Cordillera Central es la máxima elevación de todo el Caribe insular.",
            xp_reward: 25
          },
          {
            id: "t3",
            question: "¿Qué plato tradicional dominicano es apodado 'La Bandera'?",
            options: ["Sancocho de siete carnes", "Arroz blanco, habichuelas y carne guisada", "Mangú con los tres golpes", "Chivo liniero"],
            correct_index: 1,
            category: "Gastronomía",
            difficulty: "easy",
            explanation: "La combinación de arroz blanco, habichuelas rojas y carne guisada emula los colores patrios.",
            xp_reward: 25
          },
          {
            id: "t4",
            question: "¿En qué provincia se encuentra Bahía de las Águilas, célebre por su arena blanca y aguas turquesas?",
            options: ["Barahona", "Pedernales", "Montecristi", "Samaná"],
            correct_index: 1,
            category: "Naturaleza",
            difficulty: "medium",
            explanation: "Bahía de las Águilas se ubica en el Parque Nacional Jaragua, en la provincia de Pedernales.",
            xp_reward: 35
          },
          {
            id: "t5",
            question: "¿Qué danza autóctona dominicana fue declarada Patrimonio Cultural Inmaterial de la Humanidad por la UNESCO?",
            options: ["Bachata y Merengue", "Salsa", "Reggaetón", "Son Cubano"],
            correct_index: 0,
            category: "Cultura",
            difficulty: "easy",
            explanation: "El Merengue (2016) y la Bachata (2019) son Patrimonios Culturales de la Humanidad de la UNESCO.",
            xp_reward: 30
          }
        ]);
      }
      setLoadingQuestions(false);
    };
    fetchQuestions();
  }, []);

  const categories = ["all", ...Array.from(new Set(allQuestions.map(q => q.category)))];

  const startGame = useCallback(() => {
    let pool = [...allQuestions];
    if (selectedCategory !== "all") pool = pool.filter(q => q.category === selectedCategory);
    if (selectedDifficulty !== "all") pool = pool.filter(q => q.difficulty === selectedDifficulty);

    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 5);
    if (shuffled.length === 0) {
      toast.error("No hay suficientes preguntas para esta categoría");
      return;
    }
    setQuestions(shuffled);
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(20);
    setAnswers([]);
    setTotalXpEarned(0);
    setGameState("playing");
  }, [allQuestions, selectedCategory, selectedDifficulty]);

  useEffect(() => {
    if (gameState !== "playing" || selected !== null) return;
    if (timeLeft <= 0) { handleAnswer(-1); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, gameState, selected]);

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = questions[currentQ]?.correct_index;
    const isCorrect = idx === correct;
    if (isCorrect) {
      GamificationSoundEngine.playCorrectAnswerSound();
      const bonus = Math.max(0, timeLeft) * 5;
      setScore(s => s + 100 + bonus);
      setTotalXpEarned(x => x + (questions[currentQ]?.xp_reward || 25));
      setStreak(s => { const n = s + 1; setMaxStreak(m => Math.max(m, n)); return n; });
    } else {
      GamificationSoundEngine.playStampSound();
      setStreak(0);
    }
    setAnswers(a => [...a, idx]);

    setTimeout(() => {
      if (currentQ + 1 >= questions.length) {
        setGameState("result");
      } else {
        setCurrentQ(c => c + 1);
        setSelected(null);
        setTimeLeft(20);
      }
    }, 1600);
  };

  useEffect(() => {
    if (gameState !== "result" || !user) return;
    const correctCount = answers.filter((a, i) => a === questions[i]?.correct_index).length;

    const saveSession = async () => {
      try {
        await supabase.from("trivia_sessions").insert({
          user_id: user.id,
          score,
          total_questions: questions.length,
          correct_answers: correctCount,
          xp_earned: totalXpEarned,
          coins_earned: Math.round(totalXpEarned / 2),
          max_streak: maxStreak,
        });

        if (totalXpEarned > 0) {
          await supabase.rpc("award_user_xp", {
            xp_to_award: totalXpEarned,
            coins_to_award: Math.round(totalXpEarned / 2),
            xp_description: `Trivia completada: ${correctCount}/${questions.length} correctas`,
            source_type: "trivia",
            source_id: null,
          });
          trackAction({ actionType: "complete_quiz", metadata: { score, correct: correctCount } });
        }
      } catch (err) {
        // Silently catch in demo mode
      }
    };
    saveSession();
  }, [gameState]);

  const q = questions[currentQ];

  return (
    <PageTransition>
      <SEOHead
        title="Trivia Turística Dominicana | Descubre RD"
        description="Pon a prueba tus conocimientos sobre geografía, próceres, gastronomía y patrimonio de República Dominicana. Gana puntos XP y sube en el ranking."
        keywords="trivia dominicana, quiz turismo rd, preguntas republica dominicana, gamificacion trivia"
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        {/* Hub Breadcrumb */}
        <div className="border-b border-border/60 bg-muted/20 py-2.5">
          <div className="container mx-auto px-4 max-w-4xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link to="/gamificacion-turistica" className="hover:text-primary transition-colors flex items-center gap-1 font-semibold">
                <Compass className="h-3.5 w-3.5 text-primary" /> Gamificación Turística
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-bold">Trivia Dominicana</span>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/gamificacion-turistica/retos" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                <Target className="h-3 w-3 text-emerald-500" /> Retos
              </Link>
              <span className="text-muted-foreground/40">•</span>
              <Link to="/gamificacion-turistica/mapa" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                <MapPin className="h-3 w-3 text-blue-500" /> Mapa
              </Link>
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 max-w-3xl py-12 flex-1 flex flex-col justify-center">
          {loadingQuestions ? (
            <div className="text-center py-20 space-y-4">
              <Skeleton className="h-20 w-20 rounded-full mx-auto" />
              <Skeleton className="h-8 w-64 mx-auto" />
              <Skeleton className="h-4 w-96 mx-auto" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* MENU STATE */}
              {gameState === "menu" && (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="rounded-3xl bg-card border border-border p-6 sm:p-10 shadow-sm text-center space-y-6"
                >
                  <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary shadow-inner">
                    <Brain className="h-10 w-10" />
                  </div>

                  <div>
                    <Badge className="mb-2 bg-primary/15 text-primary border-primary/30">
                      <Sparkles className="h-3 w-3 mr-1" /> Desafío de Sabiduría Turística
                    </Badge>
                    <h1 className="font-display text-3xl md:text-4xl font-black text-foreground tracking-tight">
                      Trivia Dominicana
                    </h1>
                    <p className="text-xs md:text-sm text-muted-foreground mt-2 max-w-lg mx-auto leading-relaxed">
                      5 preguntas aleatorias de geografía, cultura, gastronomía y patrimonio patrio. Tienes 20 segundos por pregunta. ¡Acierta y gana puntos XP!
                    </p>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase">Elige una Categoría</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {categories.map((c) => (
                        <Button
                          key={c}
                          variant={selectedCategory === c ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(c)}
                          className="rounded-xl text-xs h-8"
                        >
                          {c === "all" ? "🎯 Todas las Categorías" : c}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                    <Button onClick={startGame} className="font-bold rounded-2xl h-11 px-8 text-xs sm:text-sm shadow-md shadow-primary/20 gap-2">
                      <Zap className="h-4 w-4" /> Comenzar Ronda de Trivia
                    </Button>
                    <Button asChild variant="outline" className="rounded-2xl h-11 px-6 text-xs sm:text-sm">
                      <Link to="/gamificacion-turistica">Volver al Pasaporte</Link>
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* PLAYING STATE */}
              {gameState === "playing" && q && (
                <motion.div
                  key={`q-${currentQ}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-sm space-y-6"
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-4">
                    <div className="flex items-center gap-2">
                      <Badge className={categoryColors[q.category] || "bg-primary/10 text-primary"}>
                        {q.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-semibold">
                        Pregunta {currentQ + 1} de {questions.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {streak > 1 && (
                        <Badge className="bg-orange-500/15 text-orange-500 border-orange-500/30 gap-1 text-xs">
                          <Flame className="h-3 w-3 fill-orange-500" /> x{streak}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-foreground bg-muted px-3 py-1 rounded-xl">
                        <Clock className={`h-3.5 w-3.5 ${timeLeft <= 5 ? "text-destructive animate-pulse" : "text-primary"}`} />
                        <span>{timeLeft}s</span>
                      </div>
                    </div>
                  </div>

                  {/* Question */}
                  <h3 className="font-display font-bold text-lg md:text-xl text-foreground leading-snug">
                    {q.question}
                  </h3>

                  {/* Options */}
                  <div className="grid gap-3">
                    {q.options.map((opt, idx) => {
                      const isSelected = selected === idx;
                      const isCorrect = idx === q.correct_index;
                      const showResult = selected !== null;

                      let btnStyle = "bg-muted/40 border-border hover:bg-muted/70";
                      if (showResult) {
                        if (isCorrect) btnStyle = "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold";
                        else if (isSelected) btnStyle = "bg-destructive/15 border-destructive text-destructive font-bold";
                        else btnStyle = "bg-muted/20 border-border opacity-50";
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswer(idx)}
                          disabled={selected !== null}
                          className={`w-full p-4 rounded-2xl border text-left text-xs md:text-sm font-medium transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-xl bg-background border border-border flex items-center justify-center font-bold text-xs shrink-0">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {showResult && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                          {showResult && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-destructive shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation feedback */}
                  {selected !== null && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 text-xs text-foreground leading-relaxed">
                      <strong>Dato clave:</strong> {q.explanation}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* RESULT STATE */}
              {gameState === "result" && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-3xl bg-card border border-border p-6 sm:p-10 shadow-sm text-center space-y-6"
                >
                  <div className="w-20 h-20 rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500 shadow-inner">
                    <Trophy className="h-10 w-10" />
                  </div>

                  <div>
                    <h2 className="font-display text-3xl font-black text-foreground">¡Ronda Finalizada!</h2>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      Has completado el cuestionario de sabiduría dominicana.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-lg mx-auto">
                    <div className="p-3.5 rounded-2xl bg-muted/40 border border-border">
                      <p className="text-2xl font-black text-primary">{score}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold mt-0.5">Puntos</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-muted/40 border border-border">
                      <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {answers.filter((a, i) => a === questions[i]?.correct_index).length}/{questions.length}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold mt-0.5">Aciertos</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-muted/40 border border-border">
                      <p className="text-2xl font-black text-orange-500">{maxStreak}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold mt-0.5">Mejor Racha</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-muted/40 border border-border">
                      <p className="text-2xl font-black text-amber-500">+{totalXpEarned}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold mt-0.5">XP Ganados</p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                    <Button onClick={startGame} className="font-bold rounded-2xl h-11 px-6 text-xs gap-2">
                      <RotateCcw className="h-4 w-4" /> Jugar Otra Ronda
                    </Button>
                    <Button asChild variant="outline" className="rounded-2xl h-11 px-6 text-xs">
                      <Link to="/gamificacion-turistica">Volver al Hub de Gamificación</Link>
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          <div className="mt-12">
            <PanoramaAd showDemo />
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
