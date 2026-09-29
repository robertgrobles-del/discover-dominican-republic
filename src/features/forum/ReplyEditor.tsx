import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { toast } from "sonner";

interface ReplyEditorProps {
  questionId: string;
  onSubmitReply: (qId: string, text: string) => void;
}

export function ReplyEditor({ questionId, onSubmitReply }: ReplyEditorProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      toast.error("Por favor escribe una respuesta antes de enviar.");
      return;
    }
    onSubmitReply(questionId, text.trim());
    setText("");
    toast.success("Respuesta enviada a la comunidad.");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 pt-2">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Aporta tu recomendación o información local..."
        className="min-h-[40px] text-xs resize-none"
        rows={1}
      />
      <Button type="submit" size="sm" className="shrink-0 flex items-center gap-1">
        <Send className="w-3 h-3" />
        Responder
      </Button>
    </form>
  );
}
