import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Phone, MapPin, AlertCircle, Ambulance, Shield, Flame,
  Phone as PhoneIcon, Building2, Plane, Heart, ShieldAlert
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";

const emergencyNumbers = [
  {
    category: "Emergencias Generales",
    icon: AlertCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    numbers: [
      { name: "Emergencias Nacional (911)", number: "911", description: "Policía, Bomberos, Ambulancias" },
      { name: "Cruz Roja Dominicana", number: "809-682-4545", description: "Ambulancias y primeros auxilios" },
    ]
  },
  {
    category: "Policía",
    icon: Shield,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    numbers: [
      { name: "Policía Nacional", number: "809-682-2151", description: "Central de operaciones" },
      { name: "POLITUR (Policía Turística)", number: "809-689-6464", description: "Asistencia a turistas 24/7" },
      { name: "CESTUR", number: "809-200-3500", description: "Centro Especializado en Seguridad Turística" },
    ]
  },
  {
    category: "Bomberos",
    icon: Flame,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    numbers: [
      { name: "Cuerpo de Bomberos Santo Domingo", number: "809-682-2000", description: "Emergencias de fuego" },
      { name: "Defensa Civil", number: "809-472-8615", description: "Desastres naturales" },
    ]
  },
  {
    category: "Salud",
    icon: Heart,
    color: "text-emerald",
    bgColor: "bg-emerald/10",
    numbers: [
      { name: "Hospital General Plaza de la Salud", number: "809-565-7477", description: "Santo Domingo" },
      { name: "Centro Médico UCE", number: "809-221-0171", description: "Santo Domingo" },
      { name: "HOSPITEN Bávaro", number: "809-686-1414", description: "Punta Cana" },
      { name: "Centro Médico Punta Cana", number: "809-552-1506", description: "Punta Cana" },
    ]
  },
  {
    category: "Embajadas y Consulados",
    icon: Building2,
    color: "text-primary",
    bgColor: "bg-primary/10",
    numbers: [
      { name: "Embajada de Estados Unidos", number: "809-567-7775", description: "Santo Domingo" },
      { name: "Embajada de España", number: "809-535-6500", description: "Santo Domingo" },
      { name: "Embajada de Canadá", number: "809-262-3100", description: "Santo Domingo" },
      { name: "Embajada de México", number: "809-687-6444", description: "Santo Domingo" },
    ]
  },
  {
    category: "Aeropuertos",
    icon: Plane,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    numbers: [
      { name: "Aeropuerto Las Américas (SDQ)", number: "809-947-2225", description: "Santo Domingo" },
      { name: "Aeropuerto Punta Cana (PUJ)", number: "809-959-2376", description: "Punta Cana" },
      { name: "Aeropuerto Cibao (STI)", number: "809-233-8000", description: "Santiago" },
      { name: "Aeropuerto Gregorio Luperón (POP)", number: "809-586-0219", description: "Puerto Plata" },
    ]
  },
];

export default function Emergencias() {
  return (
    <PageTransition>
      <SEOHead
        title="Números de Emergencia en República Dominicana"
        description="Directorio completo de números de emergencia en RD. Policía, bomberos, hospitales, embajadas y más."
        keywords="emergencias, 911, República Dominicana, policía, bomberos, hospitales, embajadas"
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-16 bg-gradient-to-br from-destructive/20 via-background to-background">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <Badge className="mb-4 bg-destructive/10 text-destructive border-destructive/30">
                Información Vital
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Números de <span className="text-destructive">Emergencia</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Guarda estos números importantes para cualquier emergencia durante tu estadía en República Dominicana.
              </p>

              {/* Quick 911 */}
              <motion.a
                href="tel:911"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-4 bg-destructive text-destructive-foreground px-8 py-4 rounded-2xl font-bold text-xl"
              >
                <Phone className="h-8 w-8" />
                <div>
                  <p className="text-sm opacity-80">Emergencias Nacional</p>
                  <p className="text-3xl">911</p>
                </div>
              </motion.a>
            </motion.div>
          </div>
        </section>

        <main className="container mx-auto px-4 lg:px-8 py-12">
          <div className="grid gap-8">
            {emergencyNumbers.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
                className="bg-card rounded-2xl border border-border overflow-hidden"
              >
                <div className={`${category.bgColor} px-6 py-4 border-b border-border`}>
                  <div className="flex items-center gap-3">
                    <category.icon className={`h-6 w-6 ${category.color}`} />
                    <h2 className="font-display text-xl font-bold">{category.category}</h2>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {category.numbers.map((item, index) => (
                      <motion.a
                        key={index}
                        href={`tel:${item.number.replace(/-/g, "")}`}
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-colors group"
                      >
                        <div>
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {item.name}
                          </p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg text-primary">{item.number}</span>
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                      </motion.a>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Safety Tips */}
          <section className="mt-12 bg-muted/30 rounded-2xl p-8">
            <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-primary" />
              Consejos de Seguridad
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Guarda una copia de tus documentos importantes en tu email",
                "Comparte tu itinerario con familiares o amigos",
                "Contrata un seguro de viaje con cobertura médica",
                "Registra tu viaje en la embajada de tu país",
                "Ten siempre cargado tu teléfono móvil",
                "Conoce la ubicación del hospital más cercano",
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                  </div>
                  <p className="text-muted-foreground">{tip}</p>
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
