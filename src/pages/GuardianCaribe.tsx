import { motion } from "framer-motion";
import { Waves, Fish, Anchor, Leaf, Camera, Heart, MapPin, Calendar, Users, Award } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import divingImg from "@/assets/diving.jpg";
import samanaImg from "@/assets/samana.jpg";
import puntaCanaImg from "@/assets/punta-cana.jpg";

const initiatives = [
  {
    title: "Protección de Arrecifes",
    description: "Restauración de corales en la costa norte y este.",
    progress: 68,
    goal: "10,000 fragmentos de coral",
    current: "6,800 plantados",
    icon: Waves,
  },
  {
    title: "Santuario de Ballenas",
    description: "Monitoreo de ballenas jorobadas en Samaná.",
    progress: 85,
    goal: "500 ballenas monitoreadas",
    current: "425 registradas",
    icon: Fish,
  },
  {
    title: "Limpieza de Playas",
    description: "Programa mensual de limpieza costera.",
    progress: 92,
    goal: "50 playas limpias",
    current: "46 completadas",
    icon: Leaf,
  },
  {
    title: "Protección de Tortugas",
    description: "Vigilancia de nidos en temporada de anidación.",
    progress: 75,
    goal: "1,000 nidos protegidos",
    current: "750 exitosos",
    icon: Heart,
  },
];

const experiences = [
  {
    title: "Buceo de Conservación",
    location: "Bayahíbe",
    duration: "4 horas",
    image: divingImg,
    description: "Ayuda a plantar corales mientras buceas en las aguas cristalinas.",
    price: "Desde $120",
  },
  {
    title: "Avistamiento de Ballenas",
    location: "Samaná",
    duration: "6 horas",
    image: samanaImg,
    description: "Observa ballenas jorobadas con guías científicos.",
    price: "Desde $85",
  },
  {
    title: "Voluntariado de Tortugas",
    location: "Playa Rincón",
    duration: "Noche completa",
    image: puntaCanaImg,
    description: "Vigila nidos de tortugas y ayuda a las crías a llegar al mar.",
    price: "Donación sugerida",
  },
];

const stats = [
  { value: "12", label: "Áreas Marinas Protegidas", icon: Anchor },
  { value: "3,500+", label: "Especies Marinas", icon: Fish },
  { value: "800km", label: "Costa Protegida", icon: Waves },
  { value: "50K+", label: "Voluntarios Activos", icon: Users },
];

export default function GuardianCaribe() {
  return (
    <PageTransition>
      <SEOHead
        title="Guardián del Caribe - Conservación Marina | Turismo RD"
        description="Únete a la misión de proteger los océanos y la vida marina de República Dominicana."
        keywords="conservación marina, arrecifes, ballenas, tortugas, República Dominicana, ecoturismo"
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative h-[80vh] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={divingImg}
              alt="Océano Dominicano"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#051114] via-[#051114]/80 to-transparent" />
          </div>
          
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
                <Waves className="h-5 w-5" />
                <span className="font-medium">Conservación Marina</span>
              </div>
              <h1 className="font-display text-5xl md:text-7xl font-bold mb-4 text-white">
                Guardián del{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">
                  Caribe
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Protege los océanos mientras vives experiencias únicas. 
                Cada visita contribuye a la conservación de nuestros ecosistemas marinos.
              </p>
              <div className="flex gap-4">
                <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600 gap-2">
                  <Heart className="h-5 w-5" />
                  Únete a la Misión
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Ver Experiencias
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Floating Stats */}
          <div className="absolute bottom-8 right-8 hidden lg:block">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-3 text-white">
                <Award className="h-8 w-8 text-cyan-400" />
                <div>
                  <p className="text-2xl font-bold">98%</p>
                  <p className="text-sm text-gray-400">Satisfacción de voluntarios</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-gradient-to-b from-[#051114] to-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 bg-card/50 backdrop-blur rounded-2xl border border-border"
                >
                  <stat.icon className="h-8 w-8 text-cyan-500 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Initiatives */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-4xl font-bold mb-4">
                Nuestras <span className="text-cyan-500">Iniciativas</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Proyectos activos de conservación marina en toda la costa dominicana.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {initiatives.map((initiative, index) => (
                <motion.div
                  key={initiative.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-cyan-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <initiative.icon className="h-7 w-7 text-cyan-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display text-xl font-bold mb-1">{initiative.title}</h3>
                          <p className="text-muted-foreground text-sm mb-4">{initiative.description}</p>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{initiative.current}</span>
                              <span className="font-medium text-cyan-500">{initiative.progress}%</span>
                            </div>
                            <Progress value={initiative.progress} className="h-2" />
                            <p className="text-xs text-muted-foreground">Meta: {initiative.goal}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Experiences */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-4xl font-bold mb-4">
                Experiencias de <span className="text-cyan-500">Conservación</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Vive aventuras que hacen la diferencia. Cada experiencia contribuye directamente a la protección marina.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {experiences.map((exp, index) => (
                <motion.div
                  key={exp.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Card className="overflow-hidden h-full">
                    <div className="relative h-56">
                      <img
                        src={exp.image}
                        alt={exp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <Badge className="absolute top-4 left-4 bg-cyan-500">{exp.duration}</Badge>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4" />
                        {exp.location}
                      </div>
                      <h3 className="font-display text-xl font-bold mb-2">{exp.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{exp.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-cyan-500">{exp.price}</span>
                        <Button size="sm">Reservar</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="relative rounded-3xl overflow-hidden">
              <img
                src={samanaImg}
                alt="Océano"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#051114]/95 to-[#051114]/70" />
              
              <div className="relative z-10 p-12 md:p-16 text-center">
                <Camera className="h-12 w-12 text-cyan-400 mx-auto mb-6" />
                <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                  Captura y Contribuye
                </h2>
                <p className="text-gray-300 max-w-2xl mx-auto mb-8">
                  Comparte tus fotos submarinas con el hashtag #GuardianDelCaribe 
                  y ayúdanos a documentar la biodiversidad marina.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600 gap-2">
                    <Camera className="h-5 w-5" />
                    Subir Foto
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    Ver Galería
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
