import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { BetweenSectionsAd } from "@/components/promo";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, BookOpen, Video, FileText, Award,
  Clock, Users, Star, Play, Check, Lock, ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

const cursos = [
  {
    id: 1,
    titulo: "Historia y Cultura Dominicana",
    descripcion: "Conoce las raíces taínas, la era colonial y la República moderna",
    duracion: "2 horas",
    modulos: 8,
    nivel: "Básico",
    imagen: "https://images.unsplash.com/photo-1582650579339-5e4e2c7c6a6e?w=400",
    progreso: 0,
    destacado: true
  },
  {
    id: 2,
    titulo: "Gastronomía Dominicana",
    descripcion: "Platos típicos, ingredientes locales y dónde comer",
    duracion: "1.5 horas",
    modulos: 6,
    nivel: "Básico",
    imagen: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
    progreso: 0,
    destacado: true
  },
  {
    id: 3,
    titulo: "Español para Viajeros",
    descripcion: "Frases esenciales y expresiones dominicanas",
    duracion: "3 horas",
    modulos: 12,
    nivel: "Básico",
    imagen: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400",
    progreso: 0,
    destacado: false
  },
  {
    id: 4,
    titulo: "Ecoturismo y Naturaleza",
    descripcion: "Parques nacionales, flora, fauna y conservación",
    duracion: "2 horas",
    modulos: 8,
    nivel: "Intermedio",
    imagen: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
    progreso: 0,
    destacado: false
  },
  {
    id: 5,
    titulo: "Música y Baile Dominicano",
    descripcion: "Merengue, bachata, son y sus orígenes",
    duracion: "1 hora",
    modulos: 5,
    nivel: "Básico",
    imagen: "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=400",
    progreso: 0,
    destacado: false
  },
  {
    id: 6,
    titulo: "Fotografía de Viajes en RD",
    descripcion: "Mejores spots, técnicas y consejos para capturar el Caribe",
    duracion: "2 horas",
    modulos: 7,
    nivel: "Intermedio",
    imagen: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400",
    progreso: 0,
    destacado: false
  },
];

const recursos = [
  { tipo: "Guía PDF", titulo: "Manual del Viajero RD 2024", descargas: 12500 },
  { tipo: "Infografía", titulo: "Mapa de Destinos Imperdibles", descargas: 8900 },
  { tipo: "Checklist", titulo: "Lista de Empaque Tropical", descargas: 15200 },
  { tipo: "Guía PDF", titulo: "Frases en Español Dominicano", descargas: 7800 },
  { tipo: "Video", titulo: "10 Errores a Evitar en RD", descargas: 23000 },
];

const certificaciones = [
  {
    nombre: "Explorador Certificado",
    descripcion: "Completa 3 cursos básicos",
    requisitos: 3,
    icono: "🎯"
  },
  {
    nombre: "Conocedor Cultural",
    descripcion: "Domina la historia y tradiciones",
    requisitos: 5,
    icono: "🏛️"
  },
  {
    nombre: "Embajador RD",
    descripcion: "Completa todos los cursos disponibles",
    requisitos: 10,
    icono: "🌴"
  },
];

export default function EscuelaViajero() {
  const [activeTab, setActiveTab] = useState("cursos");

  return (
    <PageTransition>
      <SEOHead
        title="Escuela del Viajero - Aprende sobre República Dominicana"
        description="Cursos gratuitos sobre cultura, gastronomía, idioma y naturaleza dominicana. Prepárate para tu viaje al Caribe."
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-20">
          {/* Hero */}
          <section className="relative py-20 bg-gradient-to-br from-violet-500/10 to-indigo-500/10">
            <div className="container mx-auto px-4 text-center">
              <GraduationCap className="h-16 w-16 text-primary mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Escuela del Viajero</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Aprende todo sobre RD antes de tu viaje
              </p>
            </div>
          </section>

          {/* Stats */}
          <section className="py-8 bg-primary/5">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold text-primary">{cursos.length}</p>
                  <p className="text-sm text-muted-foreground">Cursos</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">25+</p>
                  <p className="text-sm text-muted-foreground">Horas de contenido</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">50+</p>
                  <p className="text-sm text-muted-foreground">Módulos</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">100%</p>
                  <p className="text-sm text-muted-foreground">Gratis</p>
                </div>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-6xl">
              <Tabs defaultValue="cursos" className="space-y-8">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="cursos">
                    <Video className="h-4 w-4 mr-2" />
                    Cursos
                  </TabsTrigger>
                  <TabsTrigger value="recursos">
                    <FileText className="h-4 w-4 mr-2" />
                    Recursos
                  </TabsTrigger>
                  <TabsTrigger value="certificaciones">
                    <Award className="h-4 w-4 mr-2" />
                    Certificaciones
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="cursos" className="space-y-8">
                  {/* Featured Courses */}
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Cursos Destacados</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      {cursos.filter(c => c.destacado).map((curso) => (
                        <Card key={curso.id} className="overflow-hidden group">
                          <div className="relative h-48">
                            <img 
                              src={curso.imagen} 
                              alt={curso.titulo}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <Badge className="absolute top-3 left-3">Destacado</Badge>
                            <div className="absolute bottom-3 left-3 text-white">
                              <h3 className="font-bold text-lg">{curso.titulo}</h3>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground mb-4">
                              {curso.descripcion}
                            </p>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {curso.duracion}
                                </span>
                                <span className="flex items-center gap-1">
                                  <BookOpen className="h-4 w-4" />
                                  {curso.modulos} módulos
                                </span>
                              </div>
                              <Badge variant="secondary">{curso.nivel}</Badge>
                            </div>
                            <Button className="w-full">
                              <Play className="h-4 w-4 mr-2" />
                              Comenzar Curso
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <BetweenSectionsAd showDemo />

                  {/* All Courses */}
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Todos los Cursos</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                      {cursos.map((curso) => (
                        <Card key={curso.id} className="group hover:shadow-lg transition-shadow">
                          <div className="relative h-36 overflow-hidden">
                            <img 
                              src={curso.imagen} 
                              alt={curso.titulo}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-bold mb-2">{curso.titulo}</h3>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {curso.descripcion}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                              <span>{curso.duracion}</span>
                              <span>{curso.modulos} módulos</span>
                              <Badge variant="outline" className="text-xs">{curso.nivel}</Badge>
                            </div>
                            {curso.progreso > 0 ? (
                              <div className="space-y-2">
                                <Progress value={curso.progreso} className="h-2" />
                                <p className="text-xs text-muted-foreground text-center">
                                  {curso.progreso}% completado
                                </p>
                              </div>
                            ) : (
                              <Button size="sm" className="w-full">
                                Empezar
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="recursos" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recursos Descargables</CardTitle>
                      <CardDescription>
                        Guías, checklists e infografías para tu viaje
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {recursos.map((recurso, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              {recurso.tipo === "Video" ? (
                                <Video className="h-5 w-5 text-primary" />
                              ) : recurso.tipo === "Infografía" ? (
                                <FileText className="h-5 w-5 text-primary" />
                              ) : (
                                <FileText className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium">{recurso.titulo}</h4>
                              <p className="text-xs text-muted-foreground">
                                {recurso.tipo} • {recurso.descargas.toLocaleString()} descargas
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Descargar
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="certificaciones" className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {certificaciones.map((cert, idx) => (
                      <Card key={idx} className="text-center">
                        <CardContent className="pt-8">
                          <div className="text-6xl mb-4">{cert.icono}</div>
                          <h3 className="text-xl font-bold mb-2">{cert.nombre}</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {cert.descripcion}
                          </p>
                          <div className="space-y-2">
                            <Progress value={0} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                              0 / {cert.requisitos} cursos completados
                            </p>
                          </div>
                          <Button variant="outline" className="mt-4" disabled>
                            <Lock className="h-4 w-4 mr-2" />
                            Bloqueado
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card className="bg-primary/5">
                    <CardContent className="p-6 text-center">
                      <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">¡Gana certificados!</h3>
                      <p className="text-muted-foreground mb-4">
                        Completa cursos y obtén certificados digitales para compartir 
                        en redes sociales. ¡Demuestra tu conocimiento sobre RD!
                      </p>
                      <Button>
                        Ver mi progreso
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
