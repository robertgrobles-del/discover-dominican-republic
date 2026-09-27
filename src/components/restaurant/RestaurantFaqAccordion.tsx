import { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RestaurantFaqItem {
  q: string;
  a: string;
}

interface RestaurantFaqAccordionProps {
  category: string;
}

export function RestaurantFaqAccordion({ category }: RestaurantFaqAccordionProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs: RestaurantFaqItem[] = [
    {
      q: "¿Es necesario reservar con anticipación?",
      a: "Para turnos de cena y fines de semana recomendamos reservar con al menos 24 a 48 horas de anticipación para asegurar mesa en terraza o salón principal."
    },
    {
      q: "¿Cuentan con código de vestimenta?",
      a: category === 'fine-dining'
        ? "El código de vestimenta es Smart Casual / Elegante. No se permite el acceso en trajes de baño o sandalias de playa para el servicio de cena."
        : "El código de vestimenta es Casual. Se requiere vestimenta adecuada y calzado para ingresar al salón."
    },
    {
      q: "¿Disponen de opciones para vegetarianos y celíacos?",
      a: "Sí, la carta cuenta con opciones vegetarianas y sin gluten claramente señalizadas. Además, el equipo de cocina puede adaptar platos a intolerancias alimentarias."
    },
    {
      q: "¿Ofrecen servicio de Valet Parking?",
      a: "Sí, el establecimiento cuenta con estacionamiento privado vigilado y servicio de Valet Parking para la comodidad de los comensales."
    }
  ];

  return (
    <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm">
      <h3 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2.5">
        <HelpCircle className="h-6 w-6 text-primary" />
        Preguntas Frecuentes
      </h3>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = expandedFaq === idx;
          return (
            <div key={idx} className="border border-border rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpandedFaq(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm text-foreground hover:bg-muted/30 transition-colors"
              >
                <span>{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-primary shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                )}
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed bg-muted/10 border-t border-border/40"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
