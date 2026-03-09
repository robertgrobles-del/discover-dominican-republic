import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronRight, RotateCcw, Star, Flame, Award
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useActionTracker } from "@/hooks/useActionTracker";
import { toast } from "sonner";

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
  "Geografía": "bg-blue-500/10 text-blue-500",
  "Historia": "bg-amber-500/10 text-amber-500",
  "Gastronomía": "bg-orange-500/10 text-orange-500",
  "Naturaleza": "bg-green-500/10 text-green-500",
  "Cultura": "bg-purple-500/10 text-purple-500",
};

const difficultyLabels: Record<string, string> = {
  easy: "Fácil",
  medium: "Medio",
  hard: "Difícil",
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
      if (data) setAllQuestions(data as unknown as Question[]);
      setLoadingQuestions(false);
    };
    fetchQuestions();
  }, []);

  const categories = ["all", ...Array.from(new Set(allQuestions.map(q => q.category)))];

  const startGame = useCallback(() => {
    let pool = [...allQuestions];
    if (selectedCategory !== "all") pool = pool.filter(q => q.category === selectedCategory);
    if (selectedDifficulty !== "all") pool = pool.filter(q => q.difficulty === selectedDifficulty);

    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 7);
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
    const correct = questions[currentQ].correct_index;
    const isCorrect = idx === correct;
    if (isCorrect) {
      const bonus = Math.max(0, timeLeft) * 5;
      setScore(s => s + 100 + bonus);
      setTotalXpEarned(x => x + questions[currentQ].xp_reward);
      setStreak(s => { const n = s + 1; setMaxStreak(m => Math.max(m, n)); return n; });
    } else {
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
    }, 1800);
  };

  // Save results when game ends
  useEffect(() => {
    if (gameState !== "result" || !user) return;

    const correctCount = answers.filter((a, i) => a === questions[i]?.correct_index).length;

    const saveSession = async () => {
      await supabase.from("trivia_sessions").insert({
        user_id: user.id,
        score,
        total_questions: questions.length,
        correct_answers: correctCount,
        xp_earned: totalXpEarned,
        coins_earned: Math.round(totalXpEarned / 2),
        max_streak: maxStreak,
      });

      // Award XP via gamification
      if (totalXpEarned > 0) {
        const { data: gamification } = await supabase
          .from("user_gamification")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (gamification) {
          await supabase
            .from("user_gamification")
            .update({
              total_xp: gamification.total_xp + totalXpEarned,
              coins: gamification.coins + Math.round(totalXpEarned / 2),
              last_activity_date: new Date().toISOString().split("T")[0],
            })
            .eq("user_id", user.id);

          await supabase.from("gamification_transactions").insert({
            user_id: user.id,
            transaction_type: "earn",
            xp_amount: totalXpEarned,
            coin_amount: Math.round(totalXpEarned / 2),
            description: `Trivia completada: ${correctCount}/${questions.length} correctas`,
            source_type: "trivia",
          });
        }

        // Track for missions
        trackAction({ actionType: "complete_quiz", metadata: { score, correct: correctCount } });
      }
    };
    saveSession();
  }, [gameState]);

  const q = questions[currentQ];

  return (
    <PageTransition>
      <SEOHead title="Trivia Turística - ¿Cuánto sabes de RD?" description="Pon a prueba tus conocimientos sobre República Dominicana con nuestra trivia interactiva." />
      <div className="min-h-screen bg-background">
        <Header />

        <section className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-3xl">
            {loadingQuestions ? (
              <div className="text-center py-24">
                <Skeleton className="h-24 w-24 rounded-full mx-auto mb-6" />
                <Skeleton className="h-8 w-64 mx-auto mb-4" />
                <Skeleton className="h-4 w-96 mx-auto" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {gameState === "menu" && (
                  <motion.div key="menu" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center py-12">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                      <Brain className="h-12 w-12 text-primary" />
                    </div>
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">Trivia Turística</h1>
                    <p className="text-lg text-muted-foreground mb-8">
                      ¿Cuánto sabes sobre República Dominicana? 7 preguntas, 20 segundos cada una.
                    </p>
                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
                      <div className="bg-card rounded-xl border border-border p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">{allQuestions.length}</p>
                        <p className="text-xs text-muted-foreground">Preguntas</p>
                      </div>
                      <div className="bg-card rounded-xl border border-border p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">20s</p>
                        <p className="text-xs text-muted-foreground">Por pregunta</p>
                      </div>
                      <div className="bg-card rounded-xl border border-border p-4 text-center">
                        <p className="text-2xl font-bold text-primary">XP</p>
                        <p className="text-xs text-muted-foreground">Recompensa</p>
                      </div>
                    </div>

                    {/* Category filter */}
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {categories.map(cat => (
                        <Button
                          key={cat}
                          variant={selectedCategory === cat ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(cat)}
                        >
                          {cat === "all" ? "Todas" : cat}
                        </Button>
                      ))}
                    </div>

                    {/* Difficulty filter */}
                    <div className="flex justify-center gap-2 mb-8">
                      {["all", "easy", "medium", "hard"].map(d => (
                        <Button
                          key={d}
                          variant={selectedDifficulty === d ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setSelectedDifficulty(d)}
                        >
                          {d === "all" ? "Todas" : difficultyLabels[d]}
                        </Button>
                      ))}
                    </div>

                    <Button size="lg" onClick={startGame} className="gap-2 text-lg px-8">
                      <Zap className="h-5 w-5" /> Comenzar Trivia
                    </Button>
                  </motion.div>
                )}

                {gameState === "playing" && q && (
                  <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="py-8">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-sm font-medium text-muted-foreground">{currentQ + 1}/{questions.length}</span>
                      <Progress value={((currentQ + 1) / questions.length) * 100} className="h-2 flex-1" />
                      <div className="flex items-center gap-1.5">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-bold text-foreground">{score}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Badge className={categoryColors[q.category] || "bg-muted text-muted-foreground"}>{q.category}</Badge>
                        <Badge variant="outline" className="text-xs">{difficultyLabels[q.difficulty] || q.difficulty}</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        {streak > 1 && (
                          <Badge className="bg-orange-500/10 text-orange-500 gap-1">
                            <Flame className="h-3 w-3" /> Racha ×{streak}
                          </Badge>
                        )}
                        <div className={`flex items-center gap-1.5 font-mono font-bold text-lg ${timeLeft <= 5 ? "text-destructive animate-pulse" : "text-foreground"}`}>
                          <Clock className="h-5 w-5" /> {timeLeft}s
                        </div>
                      </div>
                    </div>

                    <div className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-6">
                      <h2 className="text-xl md:text-2xl font-bold text-foreground text-center">{q.question}</h2>
                    </div>

                    <div className="grid gap-3">
                      {q.options.map((opt, idx) => {
                        const isSelected = selected === idx;
                        const isCorrect = idx === q.correct_index;
                        const showResult = selected !== null;
                        let cls = "bg-card border-border hover:border-primary/50";
                        if (showResult && isCorrect) cls = "bg-green-500/10 border-green-500";
                        else if (showResult && isSelected && !isCorrect) cls = "bg-destructive/10 border-destructive";

                        return (
                          <motion.button
                            key={idx}
                            whileHover={!showResult ? { scale: 1.01 } : {}}
                            whileTap={!showResult ? { scale: 0.99 } : {}}
                            onClick={() => handleAnswer(idx)}
                            disabled={selected !== null}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${cls}`}
                          >
                            <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${showResult && isCorrect ? "bg-green-500 text-white" : showResult && isSelected ? "bg-destructive text-white" : "bg-muted text-muted-foreground"}`}>
                              {showResult && isCorrect ? <CheckCircle2 className="h-5 w-5" /> : showResult && isSelected ? <XCircle className="h-5 w-5" /> : String.fromCharCode(65 + idx)}
                            </span>
                            <span className="font-medium text-foreground">{opt}</span>
                            {showResult && isCorrect && (
                              <Badge className="ml-auto bg-primary/10 text-primary text-xs">+{q.xp_reward} XP</Badge>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>

                    {selected !== null && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
                        <p className="text-sm text-foreground">{q.explanation}</p>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {gameState === "result" && (
                  <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                      <Award className="h-12 w-12 text-primary" />
                    </div>
                    <h2 className="font-display text-3xl font-bold text-foreground mb-2">¡Trivia Completada!</h2>
                    <p className="text-muted-foreground mb-8">Aquí están tus resultados</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-lg mx-auto mb-8">
                      <div className="bg-card rounded-xl border border-border p-4">
                        <p className="text-3xl font-bold text-primary">{score}</p>
                        <p className="text-xs text-muted-foreground">Puntos</p>
                      </div>
                      <div className="bg-card rounded-xl border border-border p-4">
                        <p className="text-3xl font-bold text-green-500">
                          {answers.filter((a, i) => a === questions[i]?.correct_index).length}/{questions.length}
                        </p>
                        <p className="text-xs text-muted-foreground">Correctas</p>
                      </div>
                      <div className="bg-card rounded-xl border border-border p-4">
                        <p className="text-3xl font-bold text-orange-500">{maxStreak}</p>
                        <p className="text-xs text-muted-foreground">Mejor racha</p>
                      </div>
                      <div className="bg-card rounded-xl border border-border p-4">
                        <p className="text-3xl font-bold text-amber-500">+{totalXpEarned}</p>
                        <p className="text-xs text-muted-foreground">XP ganados</p>
                      </div>
                    </div>

                    {user && totalXpEarned > 0 && (
                      <p className="text-sm text-primary font-medium mb-6">
                        ✅ +{totalXpEarned} XP y +{Math.round(totalXpEarned / 2)} monedas agregados a tu perfil
                      </p>
                    )}

                    <div className="flex justify-center gap-3">
                      <Button onClick={startGame} className="gap-2">
                        <RotateCcw className="h-4 w-4" /> Jugar de nuevo
                      </Button>
                      <Button variant="outline" onClick={() => setGameState("menu")} className="gap-2">
                        Volver al menú
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
