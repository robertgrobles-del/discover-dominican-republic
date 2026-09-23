import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChevronRight } from "lucide-react";
import { howItWorks } from "@/data/gamificacionHubData";

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <Badge variant="outline" className="mb-4 gap-2"><Sparkles className="h-3 w-3" /> Cómo Funciona</Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            De turista a <span className="text-gradient">explorador</span>, en 5 pasos
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Sin trucos: cada visita real que registras te acerca al siguiente premio
          </p>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-6">
          {howItWorks.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center relative"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 relative"
              >
                <item.icon className="h-7 w-7 text-primary" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {item.step}
                </span>
              </motion.div>
              <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
              {i < howItWorks.length - 1 && (
                <ChevronRight className="hidden md:block h-5 w-5 text-muted-foreground/40 absolute top-8 -right-3" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
