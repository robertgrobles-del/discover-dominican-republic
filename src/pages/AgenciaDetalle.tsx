import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { 
  MapPin, Star, Phone, Mail, Globe, Check, ChevronRight, 
  Users, Calendar, Award, MessageSquare, Clock, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";

const agencia = {
  id: "tropical-caribbean",
  name: "Tropical Caribbean Tours",
  type: "Tour Operador",
  rnt: "RNT: En trámite de validación",
  verified: false,
  isDemo: true,
  location: "Punta Cana, La Altagracia",
  description: "Especialistas en excursiones náuticas y safaris terrestres en la zona este de República Dominicana. (Ficha de demostración para operadores turísticos en proceso de homologación).",
  logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop",
  coverImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=600&fit=crop",
  rating: 4.9,
  reviewCount: 24,
  yearFounded: 2021,
  languages: ["Español", "Inglés", "Francés"],
  certifications: ["Perfil en Homologación", "Protocolo de Seguridad Náutica"],
  specialties: ["Excursiones Náuticas", "Safari", "Aventura", "Tours Privados"],
  contact: {
    phone: "+1 809 221 4660",
    email: "contacto@descubrerd.do",
    website: "https://descubrerd.do",
    whatsapp: "+18092214660",
  },
  tours: [
    { 
      name: "Isla Saona VIP", 
      price: 89, 
      duration: "8 horas", 
      rating: 4.9, 
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400" 
    },
    { 
      name: "Safari Buggies Macao", 
      price: 75, 
      duration: "4 horas", 
      rating: 4.8, 
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400" 
    },
    { 
      name: "Snorkeling Catalina", 
      price: 95, 
      duration: "6 horas", 
      rating: 4.9, 
      image: "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=400" 
    },
  ],
  stats: {
    toursRealizados: "250+",
    clientesSatisfechos: "99%",
    guiasExperimentados: 8,
  },
  reviews: [
    { name: "John D.", country: "USA", rating: 5, date: "Hace 1 semana", comment: "Excelente atención y coordinación para el grupo." },
    { name: "Sophie L.", country: "Francia", rating: 5, date: "Hace 2 semanas", comment: "Excellente organisation et guides très professionnels." },
  ],
};

export default function AgenciaDetalle() {
  const { slug: id } = useParams<{ slug: string }>();

  return (
    <PageTransition>
      <SEOHead
        title={`${agencia.name} - Agencia de Turismo en ${agencia.location}`}
        description={agencia.description}
        image={agencia.coverImage}
        keywords={`${agencia.name}, ${agencia.type}, ${agencia.location}, tours república dominicana, ${agencia.specialties.join(", ")}`}
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative h-[40vh] min-h-[300px]">
          <div className="absolute inset-0">
            <img src={agencia.coverImage} alt={agencia.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          </div>
        </section>

        {/* Profile Header */}
        <div className="container mx-auto px-4 -mt-20 relative z-10">
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <span className="font-display text-3xl font-bold text-primary">TC</span>
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">{agencia.name}</h1>
                  {agencia.isDemo ? (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                      Ficha Demostrativa B2B
                    </Badge>
                  ) : agencia.verified ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <Check className="h-3 w-3 mr-1" /> Verificado
                    </Badge>
                  ) : null}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="text-primary font-medium">{agencia.rnt}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {agencia.location}
                  </span>
                  <span>·</span>
                  <span>Desde {agencia.yearFounded}</span>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-foreground">{agencia.rating}</span>
                    <span className="text-muted-foreground">({agencia.reviewCount} reseñas)</span>
                  </div>
                  <div className="flex gap-2">
                    {agencia.specialties.slice(0, 3).map((s) => (
                      <Badge key={s} variant="outline">{s}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <a
                  href={`https://wa.me/${agencia.contact.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola, me interesa conocer más sobre los servicios de ${agencia.name} en Descubre RD.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full gap-2">
                    <MessageSquare className="h-4 w-4" /> Contactar Operador
                  </Button>
                </a>
                <a
                  href={agencia.contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="w-full gap-2">
                    <Globe className="h-4 w-4" /> Sitio Web
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* About */}
              <section>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">Sobre Nosotros</h2>
                <p className="text-muted-foreground leading-relaxed">{agencia.description}</p>
              </section>

              {/* Stats */}
              <section className="grid grid-cols-3 gap-4">
                <div className="bg-card rounded-xl p-6 border border-border text-center">
                  <p className="text-3xl font-bold text-primary mb-1">{agencia.stats.toursRealizados}</p>
                  <p className="text-sm text-muted-foreground">Tours Realizados</p>
                </div>
                <div className="bg-card rounded-xl p-6 border border-border text-center">
                  <p className="text-3xl font-bold text-primary mb-1">{agencia.stats.clientesSatisfechos}</p>
                  <p className="text-sm text-muted-foreground">Satisfacción</p>
                </div>
                <div className="bg-card rounded-xl p-6 border border-border text-center">
                  <p className="text-3xl font-bold text-primary mb-1">{agencia.stats.guiasExperimentados}</p>
                  <p className="text-sm text-muted-foreground">Guías Expertos</p>
                </div>
              </section>

              {/* Tours */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-xl font-bold text-foreground">Tours y Excursiones</h3>
                  <Button variant="link" className="text-primary gap-1">
                    Ver catálogo completo <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  {agencia.tours.map((tour) => (
                    <motion.div key={tour.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-card rounded-xl overflow-hidden border border-border group">
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <img src={tour.image} alt={tour.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <Badge className="absolute top-3 right-3 bg-primary">
                          Desde ${tour.price}
                        </Badge>
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-foreground mb-1">{tour.name}</h4>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {tour.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            {tour.rating}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Reviews */}
              <section>
                <h3 className="font-display text-xl font-bold text-foreground mb-6">Reseñas de Clientes</h3>
                <div className="space-y-4">
                  {agencia.reviews.map((review, i) => (
                    <div key={i} className="bg-card rounded-xl p-5 border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{review.name}</p>
                            <p className="text-xs text-muted-foreground">{review.country} · {review.date}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className={`h-4 w-4 ${j < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Contacto</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <span className="text-sm text-foreground">{agencia.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <span className="text-sm text-foreground">{agencia.contact.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-primary" />
                    <span className="text-sm text-foreground">{agencia.contact.website}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  <a
                    href={`https://wa.me/${agencia.contact.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${agencia.name}, solicito información sobre disponibilidad de excursiones y tarifas B2B.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full gap-2">
                      <MessageSquare className="h-4 w-4" /> WhatsApp Operador
                    </Button>
                  </a>
                  <a
                    href={`mailto:${agencia.contact.email}?subject=${encodeURIComponent(`Consulta Turística - ${agencia.name}`)}`}
                    className="block"
                  >
                    <Button variant="outline" className="w-full gap-2">
                      <Mail className="h-4 w-4" /> Enviar Email
                    </Button>
                  </a>
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Certificaciones</h3>
                <div className="space-y-3">
                  {agencia.certifications.map((cert) => (
                    <div key={cert} className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="text-sm text-foreground">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Idiomas</h3>
                <div className="flex flex-wrap gap-2">
                  {agencia.languages.map((lang) => (
                    <Badge key={lang} variant="outline">{lang}</Badge>
                  ))}
                </div>
              </div>

              {/* Specialties */}
              <div className="bg-primary/10 rounded-xl border border-primary/20 p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Especialidades</h3>
                <div className="flex flex-wrap gap-2">
                  {agencia.specialties.map((spec) => (
                    <Badge key={spec} className="bg-primary/20 text-primary">{spec}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
}
