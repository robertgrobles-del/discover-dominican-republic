import { useState } from "react";
import { motion } from "framer-motion";
import { Scale, Plus, X, Star, MapPin, Clock, DollarSign, Check, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import samanaImg from "@/assets/samana.jpg";
import divingImg from "@/assets/diving.jpg";
import raftingImg from "@/assets/rafting.jpg";

interface Experience {
  id: string;
  name: string;
  category: string;
  location: string;
  duration: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  highlights: string[];
  includes: string[];
}

const availableExperiences: Experience[] = [
  {
    id: "isla-saona",
    name: "Excursión Isla Saona",
    category: "Playas",
    location: "Bayahíbe",
    duration: "8 horas",
    price: 85,
    rating: 4.8,
    reviews: 1250,
    image: puntaCanaImg,
    highlights: ["Playa virgen", "Piscina natural", "Almuerzo incluido", "Catamarán"],
    includes: ["Transporte", "Almuerzo", "Bebidas", "Snorkel"],
  },
  {
    id: "ballenas-samana",
    name: "Avistamiento de Ballenas",
    category: "Naturaleza",
    location: "Samaná",
    duration: "6 horas",
    price: 95,
    rating: 4.9,
    reviews: 890,
    image: samanaImg,
    highlights: ["Ballenas jorobadas", "Guía experto", "Temporada Ene-Mar", "Foto incluida"],
    includes: ["Transporte", "Guía", "Equipo", "Seguro"],
  },
  {
    id: "buceo-bayahibe",
    name: "Buceo en Arrecifes",
    category: "Aventura",
    location: "Bayahíbe",
    duration: "4 horas",
    price: 120,
    rating: 4.7,
    reviews: 456,
    image: divingImg,
    highlights: ["2 inmersiones", "Arrecifes vírgenes", "Certificación PADI", "Equipo incluido"],
    includes: ["Equipo completo", "Instructor", "Fotos", "Transporte"],
  },
  {
    id: "rafting-jarabacoa",
    name: "Rafting Río Yaque",
    category: "Aventura",
    location: "Jarabacoa",
    duration: "3 horas",
    price: 75,
    rating: 4.6,
    reviews: 678,
    image: raftingImg,
    highlights: ["Nivel II-III", "Paisajes montañosos", "Adrenalina pura", "Guías expertos"],
    includes: ["Equipo", "Guía", "Transporte", "Snack"],
  },
];

export default function ComparadorExperiencias() {
  const [selectedExperiences, setSelectedExperiences] = useState<Experience[]>([]);
  const [showSelector, setShowSelector] = useState(false);

  const addExperience = (exp: Experience) => {
    if (selectedExperiences.length < 3 && !selectedExperiences.find(e => e.id === exp.id)) {
      setSelectedExperiences([...selectedExperiences, exp]);
    }
    setShowSelector(false);
  };

  const removeExperience = (id: string) => {
    setSelectedExperiences(selectedExperiences.filter(e => e.id !== id));
  };

  const comparisonFields = [
    { key: "price", label: "Precio", format: (v: number) => `$${v}` },
    { key: "duration", label: "Duración", format: (v: string) => v },
    { key: "rating", label: "Valoración", format: (v: number) => `${v}/5` },
    { key: "reviews", label: "Reseñas", format: (v: number) => v.toLocaleString() },
    { key: "location", label: "Ubicación", format: (v: string) => v },
    { key: "category", label: "Categoría", format: (v: string) => v },
  ];

  return (
    <PageTransition>
      <SEOHead
        title="Comparador de Experiencias | Turismo RD"
        description="Compara experiencias turísticas en República Dominicana: precios, valoraciones y características."
        keywords="comparador, experiencias, tours, República Dominicana, turismo"
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="py-12 bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-2xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-4">
                <Scale className="h-5 w-5" />
                <span className="font-medium">Comparador</span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
                Compara <span className="text-primary">Experiencias</span>
              </h1>
              <p className="text-muted-foreground">
                Selecciona hasta 3 experiencias para comparar precios, valoraciones y características.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Comparison Area */}
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            {/* Selection Slots */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[0, 1, 2].map((slot) => {
                const experience = selectedExperiences[slot];
                return (
                  <motion.div
                    key={slot}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: slot * 0.1 }}
                  >
                    {experience ? (
                      <Card className="overflow-hidden relative">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeExperience(experience.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <div className="h-40 relative">
                          <img
                            src={experience.image}
                            alt={experience.name}
                            className="w-full h-full object-cover"
                          />
                          <Badge className="absolute bottom-2 left-2">{experience.category}</Badge>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-bold mb-1">{experience.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {experience.location}
                          </div>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="font-bold text-primary">${experience.price}</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                              <span className="text-sm">{experience.rating}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card 
                        className="h-full min-h-[280px] border-dashed flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                        onClick={() => setShowSelector(true)}
                      >
                        <div className="text-center p-6">
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                            <Plus className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground">Agregar experiencia</p>
                        </div>
                      </Card>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Comparison Table */}
            {selectedExperiences.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Comparación Detallada</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Característica</th>
                            {selectedExperiences.map((exp) => (
                              <th key={exp.id} className="text-left py-3 px-4 font-bold">{exp.name}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {comparisonFields.map((field) => (
                            <tr key={field.key} className="border-b last:border-0">
                              <td className="py-3 px-4 text-muted-foreground">{field.label}</td>
                              {selectedExperiences.map((exp) => (
                                <td key={exp.id} className="py-3 px-4 font-medium">
                                  {String(exp[field.key as keyof Experience])}
                                </td>
                              ))}
                            </tr>
                          ))}
                          <tr className="border-b">
                            <td className="py-3 px-4 text-muted-foreground">Incluye</td>
                            {selectedExperiences.map((exp) => (
                              <td key={exp.id} className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {exp.includes.map((item) => (
                                    <Badge key={item} variant="outline" className="text-xs">{item}</Badge>
                                  ))}
                                </div>
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-3 px-4 text-muted-foreground">Destacados</td>
                            {selectedExperiences.map((exp) => (
                              <td key={exp.id} className="py-3 px-4">
                                <ul className="space-y-1">
                                  {exp.highlights.map((h) => (
                                    <li key={h} className="flex items-center gap-2 text-sm">
                                      <Check className="h-4 w-4 text-primary" />
                                      {h}
                                    </li>
                                  ))}
                                </ul>
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-center gap-4 mt-8">
                      {selectedExperiences.map((exp) => (
                        <Button key={exp.id} className="gap-2">
                          Reservar {exp.name.split(' ')[0]}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Experience Selector Modal */}
            {showSelector && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                onClick={() => setShowSelector(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-card rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6 border-b border-border flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold">Seleccionar Experiencia</h2>
                    <Button size="icon" variant="ghost" onClick={() => setShowSelector(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="p-6 grid md:grid-cols-2 gap-4">
                    {availableExperiences
                      .filter(exp => !selectedExperiences.find(e => e.id === exp.id))
                      .map((exp) => (
                        <Card 
                          key={exp.id}
                          className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
                          onClick={() => addExperience(exp)}
                        >
                          <div className="flex">
                            <img
                              src={exp.image}
                              alt={exp.name}
                              className="w-24 h-24 object-cover"
                            />
                            <CardContent className="p-4 flex-1">
                              <h3 className="font-bold text-sm mb-1">{exp.name}</h3>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <MapPin className="h-3 w-3" />
                                {exp.location}
                                <Clock className="h-3 w-3 ml-2" />
                                {exp.duration}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-primary">${exp.price}</span>
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                  <span className="text-xs">{exp.rating}</span>
                                </div>
                              </div>
                            </CardContent>
                          </div>
                        </Card>
                      ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}