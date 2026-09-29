import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { ThreadList, type Question } from "@/features/forum/ThreadList";
import { ReportModal } from "@/features/forum/ReportModal";

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
        date: "Hace 1 día",
      },
      {
        id: "r2",
        author: "david_backpacks",
        isLocal: false,
        content: "Hice esa ruta el mes pasado, asegúrate de llenar el tanque de gasolina en Barahona, porque después hay muy pocas estaciones de servicio hasta Pedernales.",
        votes: 3,
        date: "Hace 18 horas",
      },
    ],
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
        date: "Hace 2 días",
      },
    ],
  },
];

export default function ForoDestino() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTargetId, setReportTargetId] = useState<string | null>(null);

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("Por favor completa el título y cuerpo de la pregunta.");
      return;
    }
    const newQ: Question = {
      id: "q-" + Math.random().toString(36).substring(2, 9),
      title: newTitle.trim(),
      content: newContent.trim(),
      author: user?.email ? user.email.split("@")[0] : "viajero_anonimo",
      location: "República Dominicana",
      date: "Ahora mismo",
      votes: 1,
      replies: [],
    };
    setQuestions([newQ, ...questions]);
    setNewTitle("");
    setNewContent("");
    toast.success("¡Tu pregunta ha sido publicada en la comunidad!");
  };

  const handleVoteQuestion = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, votes: q.votes + 1 } : q))
    );
    toast.success("Voto registrado");
  };

  const handleVoteReply = (qId: string, rId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        return {
          ...q,
          replies: q.replies.map((r) =>
            r.id === rId ? { ...r, votes: r.votes + 1 } : r
          ),
        };
      })
    );
    toast.success("Gracias por valorar esta respuesta local");
  };

  const handleAddReply = (qId: string, text: string) => {
    const newR = {
      id: "r-" + Math.random().toString(36).substring(2, 9),
      author: user?.email ? user.email.split("@")[0] : "viajero_rd",
      isLocal: true,
      content: text,
      votes: 1,
      date: "Ahora mismo",
    };

    setQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, replies: [...q.replies, newR] } : q))
    );
  };

  const handleOpenReport = (qId: string) => {
    setReportTargetId(qId);
    setReportOpen(true);
  };

  return (
    <PageTransition>
      <SEOHead
        title="Foro Turístico & Preguntas Locales | Descubre República Dominicana"
        description="Comunidad de viajeros y guías locales en República Dominicana. Haz preguntas sobre rutas, seguridad, playas y cultura criolla."
      />
      <Header />

      <main className="min-h-screen pt-24 pb-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Foro & Comunidad de Viajeros
            </h1>
            <p className="text-sm text-muted-foreground">
              Pregunta directamente a guías locales, residentes y viajeros con experiencia en República Dominicana.
            </p>
          </div>

          {/* Formulario de nueva pregunta */}
          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                Realizar una pregunta a la comunidad
              </CardTitle>
              <CardDescription>
                Obtén respuestas verificadas de locales sobre rutas, colmados, playas y cultura.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleCreateQuestion} className="space-y-4">
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: ¿Cuáles son las mejores playas de Las Terrenas para ir con niños?"
                  className="text-sm"
                />
                <Textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Agrega detalles sobre tu viaje, fechas o presupuesto para recibir recomendaciones precisas..."
                  className="min-h-[90px] text-sm resize-none"
                />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" className="flex items-center gap-1">
                    <PlusCircle className="w-4 h-4" />
                    Publicar Pregunta
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Lista de discusiones */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Preguntas Recientes</h2>
            <ThreadList
              questions={questions}
              onVoteQuestion={handleVoteQuestion}
              onVoteReply={handleVoteReply}
              onAddReply={handleAddReply}
              onReportThread={handleOpenReport}
            />
          </div>

          <ReportModal
            open={reportOpen}
            onOpenChange={setReportOpen}
            targetId={reportTargetId}
            targetType="thread"
          />
        </div>
      </main>

      <Footer />
    </PageTransition>
  );
}
