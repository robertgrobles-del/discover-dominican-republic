import { useState } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, Users, Link as LinkIcon, Gift, TrendingUp,
  Share2, Copy, CheckCircle, BarChart, Award, Zap
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { FloatingInput } from "@/components/ui/floating-input";
import { ProgressBar } from "@/components/ui/progress-bar";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/share-utils";

const benefits = [
  { icon: DollarSign, title: "Comisiones Competitivas", desc: "Gana hasta 10% por cada reserva confirmada" },
  { icon: Gift, title: "Bonos por Volumen", desc: "Bonificaciones extras al superar metas mensuales" },
  { icon: BarChart, title: "Dashboard en Tiempo Real", desc: "Monitorea tus conversiones y ganancias" },
  { icon: Zap, title: "Pagos Rápidos", desc: "Recibe tus comisiones cada 15 días" },
];

const tiers = [
  { name: "Bronce", minSales: 0, commission: 5, color: "text-orange-600" },
  { name: "Plata", minSales: 10, commission: 7, color: "text-gray-400" },
  { name: "Oro", minSales: 25, commission: 8, color: "text-gold" },
  { name: "Platino", minSales: 50, commission: 10, color: "text-primary" },
];

export default function SistemaAfiliados() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const affiliateCode = "RD-" + Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Por favor ingresa tu correo electrónico");
      return;
    }
    setIsRegistered(true);
    toast.success("¡Bienvenido al programa de afiliados!");
  };

  const handleCopyLink = () => {
    const link = `https://rdturismo.com/?ref=${affiliateCode}`;
    copyToClipboard(link);
  };

  return (
    <PageTransition>
      <SEOHead
        title="Programa de Afiliados - Gana con RD Turismo"
        description="Únete a nuestro programa de afiliados y gana comisiones promocionando destinos turísticos en República Dominicana."
        keywords="afiliados, programa, comisiones, turismo, República Dominicana, gana dinero"
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-br from-gold/20 via-background to-background overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 text-8xl">💰</div>
            <div className="absolute bottom-10 left-10 text-8xl">🤝</div>
          </div>
          <div className="container mx-auto px-4 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <Badge className="mb-4 badge-gold">Programa de Afiliados</Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Gana Dinero Promocionando <span className="text-gradient-gold">República Dominicana</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Únete a nuestra red de afiliados y obtén comisiones por cada reserva que generes.
                Sin inversión inicial, sin límites de ganancias.
              </p>
              <div className="flex gap-4">
                <Button size="lg" className="gap-2 bg-gold hover:bg-gold/90 text-background">
                  <DollarSign className="h-4 w-4" />
                  Comenzar a Ganar
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  <BarChart className="h-4 w-4" />
                  Ver Comisiones
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <main className="container mx-auto px-4 lg:px-8 py-12">
          {/* Benefits */}
          <section className="mb-16">
            <h2 className="font-display text-2xl font-bold mb-8 text-center">¿Por qué ser afiliado?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl p-6 border border-border text-center card-lift"
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gold/20 flex items-center justify-center">
                    <benefit.icon className="h-7 w-7 text-gold" />
                  </div>
                  <h3 className="font-bold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Commission Tiers */}
          <section className="mb-16">
            <h2 className="font-display text-2xl font-bold mb-8 text-center">Niveles de Comisión</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {tiers.map((tier, index) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-card rounded-xl p-6 border border-border text-center ${
                    tier.name === "Platino" ? "border-primary ring-2 ring-primary/20" : ""
                  }`}
                >
                  <Award className={`h-10 w-10 mx-auto mb-3 ${tier.color}`} />
                  <h3 className={`font-bold text-lg ${tier.color}`}>{tier.name}</h3>
                  <p className="text-4xl font-display font-bold my-3">{tier.commission}%</p>
                  <p className="text-sm text-muted-foreground">
                    {tier.minSales === 0 ? "Sin mínimo" : `${tier.minSales}+ ventas/mes`}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Registration / Dashboard */}
          <section className="max-w-2xl mx-auto">
            {!isRegistered ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl p-8 border border-border"
              >
                <h2 className="font-display text-2xl font-bold mb-6 text-center">
                  Regístrate como Afiliado
                </h2>
                <form onSubmit={handleRegister} className="space-y-4">
                  <FloatingInput
                    label="Correo electrónico"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <FloatingInput
                    label="Sitio web o redes sociales (opcional)"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                  <Button type="submit" size="lg" className="w-full">
                    Unirme al Programa
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-2xl p-8 border border-primary/30"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald/20 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-emerald" />
                  </div>
                  <h2 className="font-display text-2xl font-bold">¡Bienvenido, Afiliado!</h2>
                  <p className="text-muted-foreground">Tu código de referido está listo</p>
                </div>

                <div className="bg-secondary/30 rounded-xl p-4 mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Tu enlace de afiliado:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-background px-4 py-2 rounded-lg text-sm font-mono">
                      rdturismo.com/?ref={affiliateCode}
                    </code>
                    <Button size="icon" variant="outline" onClick={handleCopyLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nivel actual</span>
                    <span className="font-bold text-orange-600">Bronce</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ventas este mes</span>
                    <span className="font-bold">0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Comisión actual</span>
                    <span className="font-bold text-primary">5%</span>
                  </div>
                  <ProgressBar value={0} max={10} label="Progreso al siguiente nivel" />
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    Comparte tu enlace en redes sociales, blogs o con amigos para empezar a ganar.
                  </p>
                </div>
              </motion.div>
            )}
          </section>

          {/* How it Works */}
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold mb-8 text-center">¿Cómo funciona?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "1", title: "Regístrate", desc: "Crea tu cuenta de afiliado en segundos" },
                { step: "2", title: "Comparte", desc: "Usa tu enlace único en cualquier plataforma" },
                { step: "3", title: "Gana", desc: "Recibe comisiones por cada reserva confirmada" },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
