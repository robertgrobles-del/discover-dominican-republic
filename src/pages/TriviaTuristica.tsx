import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain, CheckCircle2, XCircle, Trophy, Clock, Zap,
  ChevronRight, RotateCcw, Star, Flame, Award
} from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  category: string;
  explanation: string;
}

const allQuestions: Question[] = [
  { id: 1, question: "¿Cuál es el pico más alto del Caribe?", options: ["Pico Duarte", "Monte Tina", "Pico La Pelona", "Loma La Rucilla"], correct: 0, category: "Geografía", explanation: "El Pico Duarte, con 3,098 metros, es el punto más alto de todas las Antillas." },
  { id: 2, question: "¿En qué año se fundó la ciudad de Santo Domingo?", options: ["1492", "1496", "1498", "1502"], correct: 1, category: "Historia", explanation: "Santo Domingo fue fundada en 1496 por Bartolomé Colón." },
  { id: 3, question: "¿Cuál es el plato nacional de República Dominicana?", options: ["Sancocho", "La Bandera", "Mangú", "Mofongo"], correct: 1, category: "Gastronomía", explanation: "La Bandera Dominicana (arroz, habichuelas y carne) es el plato nacional." },
  { id: 4, question: "¿Cuál es la mayor área protegida marina del país?", options: ["Parque Nacional del Este", "Banco de la Plata", "Los Haitises", "Isla Saona"], correct: 1, category: "Naturaleza", explanation: "El Santuario de Mamíferos Marinos del Banco de la Plata es la mayor reserva marina." },
  { id: 5, question: "¿Qué ritmo musical dominicano es Patrimonio Inmaterial de la UNESCO?", options: ["Bachata", "Merengue", "Salsa", "Dembow"], correct: 1, category: "Cultura", explanation: "El Merengue fue declarado Patrimonio Inmaterial de la Humanidad en 2016." },
  { id: 6, question: "¿Cuántas provincias tiene República Dominicana?", options: ["28", "31", "32", "34"], correct: 2, category: "Geografía", explanation: "RD tiene 31 provincias más el Distrito Nacional, totalizando 32 demarcaciones." },
  { id: 7, question: "¿Dónde se pueden observar ballenas jorobadas?", options: ["Punta Cana", "Samaná", "Puerto Plata", "La Romana"], correct: 1, category: "Naturaleza", explanation: "La Bahía de Samaná es el principal destino de avistamiento de ballenas jorobadas." },
  { id: 8, question: "¿Cuál fue la primera catedral del Nuevo Mundo?", options: ["Catedral de Santiago", "Catedral Primada", "Catedral de La Vega", "Catedral de Higüey"], correct: 1, category: "Historia", explanation: "La Catedral Primada de América en Santo Domingo fue la primera del continente." },
  { id: 9, question: "¿Qué dulce dominicano se elabora con leche de coco?", options: ["Dulce de leche", "Habichuelas con dulce", "Jalao", "Majarete"], correct: 3, category: "Gastronomía", explanation: "El Majarete es un postre dominicano hecho con maíz y leche de coco." },
  { id: 10, question: "¿En qué provincia se encuentra Bahía de las Águilas?", options: ["Barahona", "Pedernales", "Independencia", "Bahoruco"], correct: 1, category: "Geografía", explanation: "Bahía de las Águilas se encuentra en la provincia de Pedernales." },
];

type GameState = "menu" | "playing" | "result";

const categoryColors: Record<string, string> = {
  "Geografía": "bg-blue-500/10 text-blue-500",
  "Historia": "bg-amber-500/10 text-amber-500",
  "Gastronomía": "bg-orange-500/10 text-orange-500",
  "Naturaleza": "bg-green-500/10 text-green-500",
  "Cultura": "bg-purple-500/10 text-purple-500",
};

export default function TriviaTuristica() {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  const startGame = useCallback(() => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5).slice(0, 7);
    setQuestions(shuffled);
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(20);
    setAnswers([]);
    setGameState("playing");
  }, []);

  useEffect(() => {
    if (gameState !== "playing" || selected !== null) return;
    if (timeLeft <= 0) { handleAnswer(-1); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, gameState, selected]);

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = questions[currentQ].correct;
    const isCorrect = idx === correct;
    if (isCorrect) {
      const bonus = Math.max(0, timeLeft) * 5;
      setScore(s => s + 100 + bonus);
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

  const q = questions[currentQ];

  return (
    <PageTransition>
      <SEOHead title="Trivia Turística - ¿Cuánto sabes de RD?" description="Pon a prueba tus conocimientos sobre República Dominicana con nuestra trivia interactiva." />
      <div className="min-h-screen bg-background">
        <Header />

        <section className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-3xl">
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
                  <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-10">
                    <div className="bg-card rounded-xl border border-border p-4 text-center">
                      <p className="text-2xl font-bold text-foreground">7</p>
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
                  <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {Object.entries(categoryColors).map(([cat, cls]) => (
                      <Badge key={cat} className={cls}>{cat}</Badge>
                    ))}
                  </div>
                  <Button size="lg" onClick={startGame} className="gap-2 text-lg px-8">
                    <Zap className="h-5 w-5" /> Comenzar Trivia
                  </Button>
                </motion.div>
              )}

              {gameState === "playing" && q && (
                <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="py-8">
                  {/* Progress bar */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-sm font-medium text-muted-foreground">{currentQ + 1}/{questions.length}</span>
                    <Progress value={((currentQ + 1) / questions.length) * 100} className="h-2 flex-1" />
                    <div className="flex items-center gap-1.5">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-bold text-foreground">{score}</span>
                    </div>
                  </div>

                  {/* Timer & streak */}
                  <div className="flex items-center justify-between mb-6">
                    <Badge className={categoryColors[q.category] || "bg-muted text-muted-foreground"}>{q.category}</Badge>
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

                  {/* Question */}
                  <div className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-foreground text-center">{q.question}</h2>
                  </div>

                  {/* Options */}
                  <div className="grid gap-3">
                    {q.options.map((opt, idx) => {
                      const isSelected = selected === idx;
                      const isCorrect = idx === q.correct;
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
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Explanation */}
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
                      <p className="text-3xl font-bold text-green-500">{answers.filter((a, i) => a === questions[i]?.correct).length}/{questions.length}</p>
                      <p className="text-xs text-muted-foreground">Correctas</p>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-4">
                      <p className="text-3xl font-bold text-orange-500">{maxStreak}</p>
                      <p className="text-xs text-muted-foreground">Mejor racha</p>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-4">
                      <p className="text-3xl font-bold text-yellow-500">+{Math.round(score / 10)}</p>
                      <p className="text-xs text-muted-foreground">XP ganados</p>
                    </div>
                  </div>

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
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
