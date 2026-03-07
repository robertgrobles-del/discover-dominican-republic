import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import {
  PenLine, FileText, Eye, TrendingUp, Globe, CheckCircle,
  ChevronRight, Users, Award, BookOpen, Send
} from "lucide-react";
import { toast } from "sonner";

const beneficios = [
  { icon: Eye, title: "Audiencia masiva", desc: "Tu artículo será visto por miles de viajeros interesados en República Dominicana." },
  { icon: TrendingUp, title: "SEO y backlinks", desc: "Enlace dofollow a tu sitio web. Mejora tu autoridad de dominio." },
  { icon: Globe, title: "Alcance internacional", desc: "Lectores de USA, Canadá, Europa y Latinoamérica buscan información de RD." },
  { icon: Award, title: "Reconocimiento", desc: "Tu nombre y bio como autor experto en turismo dominicano." },
];

const temas = [
  "Destinos poco conocidos de RD",
  "Gastronomía dominicana",
  "Guías de viaje prácticas",
  "Turismo sostenible y comunitario",
  "Experiencias de aventura",
  "Cultura, historia y tradiciones",
  "Turismo de salud y bienestar",
  "Nómadas digitales en RD",
  "Bodas y lunas de miel",
  "Fotografía de viajes",
];

const requisitos = [
  "Artículo original, no publicado previamente en otro sitio.",
  "Mínimo 1,200 palabras, máximo 3,000.",
  "Incluir al menos 3 imágenes propias de alta resolución.",
  "Contenido relevante para viajeros a República Dominicana.",
  "Tono informativo, ameno y basado en experiencia real.",
  "No contenido promocional excesivo ni enlaces de afiliado.",
];

const autoresDestacados = [
  { nombre: "María Fernández", especialidad: "Ecoturismo", articulos: 12, avatar: "MF" },
  { nombre: "Carlos Mendoza", especialidad: "Gastronomía", articulos: 8, avatar: "CM" },
  { nombre: "Ana Rivera", especialidad: "Aventura", articulos: 15, avatar: "AR" },
  { nombre: "David Thompson", especialidad: "Destinos ocultos", articulos: 6, avatar: "DT" },
];

export default function AutorInvitado() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    website: "",
    tema: "",
    sinopsis: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.email || !formData.tema) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }
    toast.success("¡Propuesta enviada! Te contactaremos en 48 horas.");
    setFormData({ nombre: "", email: "", website: "", tema: "", sinopsis: "" });
  };

  return (
    <PageTransition>
      <SEOHead
        title="Escribir como Autor Invitado - DescubreRD"
        description="Publica tu artículo sobre turismo en República Dominicana. Comparte tu experiencia con miles de viajeros."
        keywords="autor invitado, guest post turismo, escribir sobre RD, blog turismo dominicano"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <PenLine className="h-3 w-3 mr-1" /> Guest Blogging
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Escribe como <span className="text-primary">Autor Invitado</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comparte tu conocimiento y experiencias sobre República Dominicana con nuestra comunidad de viajeros.
            </p>
          </div>
        </section>

        {/* Beneficios */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">¿Por qué escribir con nosotros?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {beneficios.map((b) => (
                <div key={b.title} className="bg-card rounded-xl p-6 border border-border text-center hover:border-primary/30 transition-colors">
                  <b.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Temas y Requisitos */}
        <section className="py-16 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Temas */}
              <div>
                <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" /> Temas que buscamos
                </h2>
                <div className="flex flex-wrap gap-2">
                  {temas.map((t) => (
                    <Badge key={t} variant="outline" className="text-sm py-1.5 px-3">{t}</Badge>
                  ))}
                </div>
              </div>

              {/* Requisitos */}
              <div>
                <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Requisitos
                </h2>
                <ul className="space-y-3">
                  {requisitos.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Autores Destacados */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">Autores Destacados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {autoresDestacados.map((a) => (
                <div key={a.nombre} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mx-auto mb-3 text-lg">
                    {a.avatar}
                  </div>
                  <p className="font-semibold text-foreground text-sm">{a.nombre}</p>
                  <p className="text-xs text-muted-foreground">{a.especialidad}</p>
                  <p className="text-xs text-primary mt-1">{a.articulos} artículos</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Formulario */}
        <section className="py-16 bg-card/50">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2 text-center">Envía tu propuesta</h2>
            <p className="text-muted-foreground text-center mb-8">Te responderemos en un máximo de 48 horas hábiles.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Nombre completo *</label>
                  <Input
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Tu nombre"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Email *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Sitio web / Portfolio</label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://tusitio.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Tema propuesto *</label>
                <Input
                  value={formData.tema}
                  onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
                  placeholder="Ej: 5 playas secretas en la costa sur de RD"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Sinopsis del artículo</label>
                <Textarea
                  value={formData.sinopsis}
                  onChange={(e) => setFormData({ ...formData, sinopsis: e.target.value })}
                  placeholder="Describe brevemente de qué tratará tu artículo (200-500 caracteres)"
                  rows={4}
                />
              </div>

              <Button type="submit" size="lg" className="w-full gap-2">
                <Send className="h-4 w-4" /> Enviar propuesta
              </Button>
            </form>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
