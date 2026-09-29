import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Heart, MapPin, CheckCircle, ArrowUp } from "lucide-react";
import { ReplyEditor } from "./ReplyEditor";
import { Virtuoso } from "react-virtuoso";

/** Por debajo de este total no vale la pena virtualizar (el costo del virtualizador supera el ahorro). */
const VIRTUALIZE_FROM = 20;

export interface Reply {
  id: string;
  author: string;
  isLocal: boolean;
  content: string;
  votes: number;
  date: string;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  author: string;
  location: string;
  date: string;
  votes: number;
  replies: Reply[];
}

interface ThreadListProps {
  questions: Question[];
  onVoteQuestion: (id: string) => void;
  onVoteReply: (qId: string, rId: string) => void;
  onAddReply: (qId: string, text: string) => void;
  onReportThread?: (qId: string) => void;
}

export function ThreadList({
  questions,
  onVoteQuestion,
  onVoteReply,
  onAddReply,
  onReportThread,
}: ThreadListProps) {
  if (questions.length === 0) {
    return (
      <Card className="text-center p-8">
        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground font-medium">No hay discusiones registradas en este destino aún.</p>
        <p className="text-xs text-muted-foreground mt-1">¡Sé el primero en realizar una pregunta a los locales!</p>
      </Card>
    );
  }

  const renderThread = (q: Question) => (
    <Card key={q.id} className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary" />
                {q.location}
              </Badge>
              <span className="text-xs text-muted-foreground">Publicado por @{q.author} • {q.date}</span>
            </div>
            <CardTitle className="text-lg font-bold hover:text-primary transition-colors cursor-pointer">
              {q.title}
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onVoteQuestion(q.id)}
              className="flex items-center gap-1 hover:border-primary text-xs"
            >
              <ArrowUp className="w-4 h-4 text-primary" />
              <span>{q.votes}</span>
            </Button>

            {onReportThread && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-destructive"
                onClick={() => onReportThread(q.id)}
              >
                Reportar
              </Button>
            )}
          </div>
        </div>
        <CardDescription className="text-foreground/90 text-sm mt-2 leading-relaxed">
          {q.content}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Lista de Respuestas */}
        <div className="space-y-3 pl-4 border-l-2 border-muted mt-4">
          {q.replies.map((r) => (
            <div key={r.id} className="bg-muted/40 p-3 rounded-lg text-sm space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs">@{r.author}</span>
                  {r.isLocal && (
                    <Badge className="bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20 border-emerald-600/20 text-[10px] py-0">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Local Certificado
                    </Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground">{r.date}</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onVoteReply(q.id, r.id)}
                  className="h-6 px-2 text-xs flex items-center gap-1 text-muted-foreground hover:text-primary"
                >
                  <Heart className="w-3 h-3 fill-current text-rose-500" />
                  <span>{r.votes}</span>
                </Button>
              </div>
              <p className="text-foreground/80 leading-relaxed text-xs">{r.content}</p>
            </div>
          ))}
        </div>

        {/* Formulario de Respuesta */}
        <ReplyEditor questionId={q.id} onSubmitReply={onAddReply} />
      </CardContent>
    </Card>
  );

  // Fase 10.13: con pocos hilos, renderizar todo es más simple y no hay nada que ganar virtualizando.
  // Con muchos (foros muy activos), Virtuoso mide cada tarjeta (altura variable por nº de respuestas) y sólo monta las visibles.
  if (questions.length < VIRTUALIZE_FROM) {
    return <div className="space-y-6">{questions.map(renderThread)}</div>;
  }

  return (
    <Virtuoso
      useWindowScroll
      data={questions}
      itemContent={(_index, q) => <div className="pb-6">{renderThread(q)}</div>}
    />
  );
}
