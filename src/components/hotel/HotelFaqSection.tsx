import { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { hotelFaqsData } from "@/data/hotelDetailData";

/** `faqs` viene de la ficha del hotel en el backend; sin backend se usan las preguntas de muestra. */
export function HotelFaqSection({ faqs }: { faqs?: { q: string; a: string }[] }) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const items = faqs ?? hotelFaqsData;
  if (!items.length) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
        <HelpCircle className="h-6 w-6 text-primary" />
        Preguntas Frecuentes
      </h3>
      <div className="space-y-3">
        {items.map((faq, idx) => (
          <div key={faq.q} className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
            <button
              onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
              className="w-full text-left p-4 flex items-center justify-between font-semibold text-sm hover:text-primary transition-colors"
            >
              <span>{faq.q}</span>
              {expandedFaq === idx ? (
                <ChevronUp className="h-4 w-4 text-primary shrink-0 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
              )}
            </button>
            {expandedFaq === idx && (
              <p className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-border/50 pt-2 bg-muted/10">
                {faq.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
