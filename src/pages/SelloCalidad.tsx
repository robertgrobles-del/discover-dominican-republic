import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Shield,
  Star,
  Check,
  MapPin,
  ChevronRight,
  Building2,
  Utensils,
  Car,
  FileCheck,
  Search,
} from "lucide-react";

const certificationLevels = [
  {
    name: "Oro",
    icon: "🥇",
    color: "bg-amber-500",
    requirements: "Cumple 95%+ de estándares",
    benefits: ["Prioridad en búsquedas", "Sello premium visible", "Marketing incluido"],
  },
  {
    name: "Plata",
    icon: "🥈",
    color: "bg-slate-400",
    requirements: "Cumple 85%+ de estándares",
    benefits: ["Visibilidad destacada", "Sello verificado", "Soporte prioritario"],
  },
  {
    name: "Bronce",
    icon: "🥉",
    color: "bg-orange-700",
    requirements: "Cumple 75%+ de estándares",
    benefits: ["Listado verificado", "Sello básico", "Acceso a capacitaciones"],
  },
];

const categories = [
  { name: "Hoteles", icon: Building2, certified: 156 },
  { name: "Restaurantes", icon: Utensils, certified: 234 },
  { name: "Tour Operadores", icon: Car, certified: 89 },
  { name: "Guías", icon: Award, certified: 312 },
];

const criteria = [
  "Seguridad e higiene",
  "Calidad del servicio",
  "Sostenibilidad ambiental",
  "Accesibilidad",
  "Atención al cliente",
  "Infraestructura",
  "Responsabilidad social",
  "Capacitación del personal",
];

const certifiedBusinesses = [
  {
    name: "Hotel Casa del Mar",
    type: "Hotel",
    location: "Punta Cana",
    level: "Oro",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
  },
  {
    name: "Restaurante El Conuco",
    type: "Restaurante",
    location: "Santo Domingo",
    level: "Oro",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
  },
  {
    name: "Caribbean Adventures",
    type: "Tour Operador",
    location: "Samaná",
    level: "Plata",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
  },
];

export default function SelloCalidad() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-indigo-900/80 to-slate-900/90" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920')] bg-cover bg-center opacity-20" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <Award className="h-12 w-12 text-primary" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
                Sello de <span className="text-primary">Excelencia</span> RD
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Certificación oficial de calidad turística. Identifica establecimientos 
                que cumplen con los más altos estándares de servicio.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="gap-2">
                  <Search className="h-4 w-4" />
                  Buscar Certificados
                </Button>
                <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                  Solicitar Certificación
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-card border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-wrap justify-center gap-8">
              {categories.map((cat) => (
                <div key={cat.name} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <cat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{cat.certified}</p>
                    <p className="text-sm text-muted-foreground">{cat.name} certificados</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Certification Levels */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Niveles de <span className="text-gradient">Certificación</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Tres niveles de excelencia que garantizan calidad turística verificada.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {certificationLevels.map((level, index) => (
                <motion.div
                  key={level.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-6 border border-border text-center"
                >
                  <div className="text-5xl mb-4">{level.icon}</div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                    Sello {level.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">{level.requirements}</p>
                  <ul className="space-y-3 text-left">
                    {level.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Criteria */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                  Criterios de <span className="text-gradient">Evaluación</span>
                </h2>
                <p className="text-muted-foreground">
                  Evaluamos 8 dimensiones clave para garantizar la excelencia.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {criteria.map((criterion, index) => (
                  <motion.div
                    key={criterion}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-surface rounded-xl p-4 text-center"
                  >
                    <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">{criterion}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Certified Businesses */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-end justify-between mb-12"
            >
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                  Establecimientos <span className="text-gradient">Certificados</span>
                </h2>
              </div>
              <Button variant="outline" className="hidden md:flex gap-2">
                Ver directorio completo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {certifiedBusinesses.map((business, index) => (
                <motion.div
                  key={business.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={business.image}
                      alt={business.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className={`${business.level === 'Oro' ? 'bg-amber-500' : 'bg-slate-400'} text-white`}>
                        🏆 {business.level}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-semibold">{business.rating}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <Badge variant="outline" className="mb-2">{business.type}</Badge>
                    <h3 className="font-display text-lg font-bold text-foreground mb-1">{business.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-3.5 w-3.5" />
                      {business.location}
                    </div>
                    <Button className="w-full" variant="outline">
                      Ver Detalles
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Apply CTA */}
        <section className="py-20 bg-gradient-to-r from-blue-900 to-indigo-900">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <FileCheck className="h-16 w-16 text-blue-300 mx-auto mb-6" />
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                ¿Tienes un negocio turístico?
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Solicita la certificación de calidad y destaca tu establecimiento 
                entre los mejores de República Dominicana.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="gap-2 bg-white text-blue-900 hover:bg-white/90">
                  Solicitar Certificación
                </Button>
                <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                  Conocer Requisitos
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
