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
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { gamificationApi, type TriviaSessionData } from "@/lib/gamificationApi";
import { apiMessage } from "@/lib/accountApi";
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
  const [backendSession, setBackendSession] = useState<TriviaSessionData | null>(null);

  // Fetch questions from DB
  useEffect(() => {
    const fetchQuestions = async () => {
      if (HAS_BACKEND_SESSION) {
        setLoadingQuestions(false);
        return;
      }
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
            question: "¿Qué piedra semipreciosa pectolita azul es endémica exclusivamente de Barahona?",
            options: ["Ámbar", "Larimar", "Turquesa", "Jade caribeño"],
            correct_index: 1,
            category: "Geografía",
            difficulty: "easy",
            explanation: "El Larimar es una variedad rara de pectolita azul que sólo se encuentra en la provincia de Barahona.",
            xp_reward: 25
          },
          {
            id: "t4",
            question: "¿Cuál es el plato insignia dominicano conocido popularmente como «La Bandera»?",
            options: ["Sancocho y Aguacate", "Mangú con los Tres Golpes", "Arroz, Habichuelas y Carne", "Chivo Liniero con Yuca"],
            correct_index: 2,
            category: "Gastronomía",
            difficulty: "medium",
            explanation: "La Bandera Dominicana consiste en arroz blanco, habichuelas guisadas rojas y carne de res o pollo.",
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

  const startGame = useCallback(async () => {
    if (HAS_BACKEND_SESSION) {
      try {
        const session = await gamificationApi.startTriviaSession();
        if (session && session.questions && session.questions.length > 0) {
          setBackendSession(session);
          setQuestions(
            session.questions.map((q) => ({
              id: q.id,
              question: q.question,
              options: q.choices,
              correct_index: -1,
              category: q.category,
              difficulty: q.difficulty,
              explanation: q.explanation || "",
              xp_reward: 30,
            }))
          );
          setCurrentQ(0);
          setSelected(null);
          setScore(0);
          setStreak(0);
          setMaxStreak(0);
          setTimeLeft(20);
          setAnswers([]);
          setTotalXpEarned(0);
          setGameState("playing");
          return;
        }
      } catch (err) {
        toast.error(apiMessage(err, "No se pudo iniciar la sesión de trivia en el servidor."));
      }
    }

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

  const handleAnswer = async (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);

    if (HAS_BACKEND_SESSION && backendSession && questions[currentQ]) {
      try {
        const result = await gamificationApi.answerTrivia(
          backendSession.id,
          questions[currentQ].id,
          idx >= 0 ? idx : 0
        );
        if (result.correct) {
          GamificationSoundEngine.playCorrectAnswerSound();
          setScore(s => s + 100 + Math.max(0, timeLeft) * 5);
          setStreak(s => { const n = s + 1; setMaxStreak(m => Math.max(m, n)); return n; });
        } else {
          GamificationSoundEngine.playStampSound();
          setStreak(0);
        }
      } catch {
        // ignore
      }
    } else {
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
      if (HAS_BACKEND_SESSION) {
        if (backendSession) {
          try {
            const res = await gamificationApi.finishTrivia(backendSession.id);
            setTotalXpEarned(res.xp_awarded || 0);
            toast.success("🏆 ¡Trivia completada!", {
              description: `+${res.xp_awarded} XP, +${res.coins_awarded} monedas ganadas en esta partida`,
            });
          } catch (err: any) {
            toast.error("Error al finalizar la trivia", { description: err.message });
          }
        }
        return;
      }

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
              <span className="text-foreground font-medium">Trivia Dominicana</span>
            </div>
            <Link to="/perfil-jugador" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              Mi Perfil <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <main className="flex-1 py-10">
          <div className="container mx-auto px-4 max-w-3xl">

            {/* STATE: MENU */}
            {gameState === "menu" && (
              <div className="space-y-8">
                {/* Hero Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/20 via-primary/15 to-purple-500/10 border border-amber-500/30 p-8 text-center shadow-lg">
                  <div className="inline-flex p-4 rounded-2xl bg-amber-500/20 text-amber-500 mb-4 shadow-inner">
                    <Brain className="h-10 w-10 animate-pulse" />
                  </div>
                  <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-2">
                    Trivia Turística Quisqueyana
                  </h1>
                  <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
                    Demuestra cuánto sabes sobre las 32 provincias, la historia libertadora, los parques nacionales y la gastronomía criolla.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                    <Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 py-1 px-3">
                      <Zap className="h-3.5 w-3.5" /> +100 XP por respuesta correcta
                    </Badge>
                    <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/20 py-1 px-3">
                      <Flame className="h-3.5 w-3.5" /> Bonos por racha consecutiva
                    </Badge>
                  </div>
                </div>

                {/* Filters */}
                <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm space-y-5">
                  <h2 className="font-bold text-base flex items-center gap-2 text-foreground">
                    <Target className="h-4 w-4 text-primary" /> Configura tu Partida
                  </h2>

                  {/* Category Filter */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-2">
                      Categoría Temática
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            selectedCategory === cat
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                          }`}
                        >
                          {cat === "all" ? "🌐 Todas las Categorías" : cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty Filter */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-2">
                      Nivel de Dificultad
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["all", "easy", "medium", "hard"].map((diff) => (
                        <button
                          key={diff}
                          onClick={() => setSelectedDifficulty(diff)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            selectedDifficulty === diff
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                          }`}
                        >
                          {diff === "all" ? "🎯 Todos los Niveles" : difficultyLabels[diff]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={startGame}
                    disabled={loadingQuestions || allQuestions.length === 0}
                    size="lg"
                    className="w-full gap-2 font-bold text-base bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 text-white shadow-lg py-6 rounded-2xl"
                  >
                    <Sparkles className="h-5 w-5" /> Comenzar Trivia (5 Preguntas)
                  </Button>
                </div>
              </div>
            )}

            {/* STATE: PLAYING */}
            {gameState === "playing" && q && (
              <div className="space-y-6">
                {/* Header Stats Bar */}
                <div className="flex items-center justify-between bg-card border border-border/60 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground">
                      Pregunta {currentQ + 1} de {questions.length}
                    </span>
                    <Badge variant="outline" className={`text-[11px] font-semibold py-0.5 px-2.5 ${categoryColors[q.category] || "border-border"}`}>
                      {q.category}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4">
                    {streak > 1 && (
                      <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 gap-1 font-bold animate-pulse">
                        <Flame className="h-3.5 w-3.5" /> Racha: {streak}x
                      </Badge>
                    )}
                    <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-foreground">
                      <Clock className={`h-4 w-4 ${timeLeft <= 5 ? "text-destructive animate-spin" : "text-primary"}`} />
                      <span className={timeLeft <= 5 ? "text-destructive font-black" : ""}>{timeLeft}s</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <Progress value={((currentQ + 1) / questions.length) * 100} className="h-2 rounded-full" />

                {/* Question Box */}
                <div className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground leading-snug">
                    {q.question}
                  </h2>

                  {/* Options */}
                  <div className="grid grid-cols-1 gap-3">
                    {q.options.map((opt, idx) => {
                      const isSelected = selected === idx;
                      let btnStyle = "bg-muted/30 hover:bg-muted/60 border-border/80 text-foreground";
                      if (selected !== null) {
                        if (idx === q.correct_index) {
                          btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm";
                        } else if (isSelected) {
                          btnStyle = "bg-destructive/20 border-destructive text-destructive font-bold";
                        } else {
                          btnStyle = "bg-muted/10 border-border/40 text-muted-foreground opacity-50";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={selected !== null}
                          onClick={() => handleAnswer(idx)}
                          className={`p-4 rounded-2xl border text-left text-sm sm:text-base font-medium transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {selected !== null && idx === q.correct_index && (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                          )}
                          {selected !== null && isSelected && idx !== q.correct_index && (
                            <XCircle className="h-5 w-5 text-destructive shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation reveal */}
                  {selected !== null && q.explanation && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-xs sm:text-sm text-foreground space-y-1"
                    >
                      <strong className="text-primary block">💡 ¿Sabías qué?</strong>
                      <p className="text-muted-foreground leading-relaxed">{q.explanation}</p>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* STATE: RESULT */}
            {gameState === "result" && (
              <div className="space-y-6">
                <div className="bg-card border border-border/60 rounded-3xl p-8 text-center shadow-lg space-y-6">
                  <div className="inline-flex p-4 rounded-3xl bg-amber-500/20 text-amber-500 shadow-inner">
                    <Trophy className="h-12 w-12" />
                  </div>

                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-black text-foreground mb-1">
                      ¡Trivia Finalizada!
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Puntaje obtenido: <strong className="text-foreground">{score} puntos</strong>
                    </p>
                  </div>

                  {/* Rewards summary */}
                  <div className="grid grid-cols-3 gap-3 p-4 bg-muted/20 rounded-2xl border border-border/60">
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Aciertos</span>
                      <strong className="text-lg font-bold text-foreground">
                        {answers.filter((a, i) => a === questions[i]?.correct_index).length}/{questions.length}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">XP Ganado</span>
                      <strong className="text-lg font-bold text-primary">+{totalXpEarned} XP</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Max Racha</span>
                      <strong className="text-lg font-bold text-amber-500">{maxStreak}x</strong>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      onClick={startGame}
                      size="lg"
                      className="flex-1 gap-2 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <RotateCcw className="h-4 w-4" /> Jugar Otra Vez
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="flex-1 gap-2 rounded-2xl font-bold border-border"
                    >
                      <Link to="/perfil-jugador">
                        <Award className="h-4 w-4 text-amber-500" /> Ver Mi Perfil
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
