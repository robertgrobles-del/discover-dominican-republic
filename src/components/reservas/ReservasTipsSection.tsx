import { AlertTriangle, Camera, Leaf } from "lucide-react";

export function ReservasTipsSection() {
  const tips = [
    { icon: AlertTriangle, title: "Respeta la naturaleza", desc: "No dejes basura, no alimentes animales y mantente en los senderos marcados." },
    { icon: Camera, title: "Fotografía responsable", desc: "No uses flash cerca de animales y no arranques plantas para tus fotos." },
    { icon: Leaf, title: "Lleva lo esencial", desc: "Agua, protector solar biodegradable, repelente ecológico y calzado adecuado." },
  ];

  return (
    <section className="py-16 bg-card/50">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">Consejos para Visitantes</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {tips.map((tip) => (
            <div key={tip.title} className="bg-background rounded-xl p-6 border border-border text-center">
              <tip.icon className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">{tip.title}</h3>
              <p className="text-sm text-muted-foreground">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
