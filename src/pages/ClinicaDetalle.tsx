import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { 
  MapPin, Star, Phone, Mail, Globe, Clock, Users, 
  ChevronRight, Shield, Award, Calendar, MessageSquare, Check, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { FavoriteButton } from "@/components/FavoriteButton";

const clinica = {
  id: "centro-medico-punta-cana",
  name: "Centro Médico Punta Cana",
  type: "Hospital General",
  location: "Punta Cana, La Altagracia",
  address: "Blvd. Turístico del Este Km 28, Punta Cana",
  rating: 4.8,
  reviewCount: 892,
  description: "Centro Médico Punta Cana es un hospital de atención integral con tecnología de vanguardia y un equipo médico bilingüe especializado en atención a turistas. Contamos con servicios de emergencia 24/7, especialidades médicas y cirugías ambulatorias con los más altos estándares internacionales.",
  image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&h=800&fit=crop",
  certifications: ["JCI Accredited", "ISO 9001", "Turismo Médico RD"],
  languages: ["Español", "Inglés", "Francés", "Alemán", "Italiano"],
  specialties: [
    { name: "Emergencias 24/7", available: true },
    { name: "Cirugía Estética", available: true },
    { name: "Odontología", available: true },
    { name: "Cardiología", available: true },
    { name: "Traumatología", available: true },
    { name: "Medicina General", available: true },
  ],
  services: [
    "Emergencias 24 horas",
    "Laboratorio clínico",
    "Rayos X y Tomografía",
    "Farmacia 24 horas",
    "Ambulancia",
    "Coordinación con seguros",
  ],
  hours: {
    emergencies: "24/7",
    consultation: "8:00 AM - 6:00 PM",
    lab: "7:00 AM - 7:00 PM",
  },
  contact: {
    phone: "+1 809 552 1506",
    emergency: "+1 809 552 1911",
    email: "info@centromedicoPuntaCana.com",
    whatsapp: "+1 809 552 1506",
  },
  treatments: [
    { name: "Consulta General", priceFrom: 50, currency: "USD" },
    { name: "Emergencia", priceFrom: 100, currency: "USD" },
    { name: "Cirugía Dental", priceFrom: 200, currency: "USD" },
    { name: "Chequeo Ejecutivo", priceFrom: 350, currency: "USD" },
  ],
  testimonials: [
    { name: "James W.", country: "USA", rating: 5, treatment: "Emergencia", comment: "Excellent care during my vacation emergency. Staff was professional and bilingual." },
    { name: "Marie P.", country: "Canadá", rating: 5, treatment: "Dental", comment: "Had dental work done at a fraction of US costs. Modern facilities and great results." },
  ],
  nearbyHotels: ["Excellence Punta Cana", "Secrets Royal Beach", "Hard Rock Hotel"],
};

export default function ClinicaDetalle() {
  const { id } = useParams();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative h-[50vh] min-h-[400px] mt-16">
          <div className="absolute inset-0">
            <img src={clinica.image} alt={clinica.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8 container mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                  <Heart className="h-3 w-3 mr-1" /> {clinica.type}
                </Badge>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Shield className="h-3 w-3 mr-1" /> Emergencias 24/7
                </Badge>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">{clinica.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium text-foreground">{clinica.rating}</span>
                  <span>({clinica.reviewCount} reseñas)</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{clinica.location}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* About */}
              <section>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">Sobre la Clínica</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">{clinica.description}</p>
                
                {/* Certifications */}
                <div className="flex flex-wrap gap-3">
                  {clinica.certifications.map((cert) => (
                    <Badge key={cert} className="bg-primary/10 text-primary gap-1">
                      <Award className="h-3 w-3" /> {cert}
                    </Badge>
                  ))}
                </div>
              </section>

              {/* Specialties */}
              <section>
                <h3 className="font-display text-xl font-bold text-foreground mb-6">Especialidades</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {clinica.specialties.map((spec) => (
                    <div key={spec.name} className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${spec.available ? "bg-green-500/20" : "bg-red-500/20"}`}>
                        <Check className={`h-4 w-4 ${spec.available ? "text-green-500" : "text-red-500"}`} />
                      </div>
                      <span className="text-sm font-medium text-foreground">{spec.name}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Treatments & Prices */}
              <section>
                <h3 className="font-display text-xl font-bold text-foreground mb-6">Tratamientos y Precios Orientativos</h3>
                <div className="space-y-3">
                  {clinica.treatments.map((treatment) => (
                    <div key={treatment.name} className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
                      <span className="font-medium text-foreground">{treatment.name}</span>
                      <span className="text-primary font-bold">Desde ${treatment.priceFrom} {treatment.currency}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">* Los precios son orientativos y pueden variar según el caso.</p>
              </section>

              {/* Services */}
              <section>
                <h3 className="font-display text-xl font-bold text-foreground mb-6">Servicios</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {clinica.services.map((service) => (
                    <div key={service} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Testimonials */}
              <section>
                <h3 className="font-display text-xl font-bold text-foreground mb-6">Testimonios de Pacientes</h3>
                <div className="space-y-4">
                  {clinica.testimonials.map((review, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-card rounded-xl p-5 border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{review.name}</p>
                            <p className="text-xs text-muted-foreground">{review.country} · Tratamiento: {review.treatment}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className={`h-4 w-4 ${j < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm italic">"{review.comment}"</p>
                    </motion.div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Emergency Contact */}
              <div className="bg-red-500/10 rounded-xl border border-red-500/20 p-6">
                <h3 className="font-display font-bold text-foreground mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-500" /> Emergencias
                </h3>
                <p className="text-2xl font-bold text-red-500 mb-4">{clinica.contact.emergency}</p>
                <Button className="w-full bg-red-500 hover:bg-red-600 gap-2">
                  <Phone className="h-4 w-4" /> Llamar Emergencias
                </Button>
              </div>

              {/* Hours */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Horarios</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Emergencias</span>
                    <span className="font-medium text-foreground">{clinica.hours.emergencies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Consultas</span>
                    <span className="font-medium text-foreground">{clinica.hours.consultation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Laboratorio</span>
                    <span className="font-medium text-foreground">{clinica.hours.lab}</span>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Contacto</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full gap-2 justify-start">
                    <Phone className="h-4 w-4 text-primary" /> {clinica.contact.phone}
                  </Button>
                  <Button variant="outline" className="w-full gap-2 justify-start">
                    <MessageSquare className="h-4 w-4 text-green-500" /> WhatsApp
                  </Button>
                  <Button variant="outline" className="w-full gap-2 justify-start">
                    <Mail className="h-4 w-4 text-primary" /> Email
                  </Button>
                </div>
              </div>

              {/* Languages */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Idiomas</h3>
                <div className="flex flex-wrap gap-2">
                  {clinica.languages.map((lang) => (
                    <Badge key={lang} variant="outline">{lang}</Badge>
                  ))}
                </div>
              </div>

              {/* Nearby Hotels */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Hoteles Cercanos</h3>
                <div className="space-y-2">
                  {clinica.nearbyHotels.map((hotel) => (
                    <Link key={hotel} to="#" className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
                      <span className="text-sm text-foreground">{hotel}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Ubicación</h3>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">{clinica.address}</p>
              </div>

              {/* Consultation CTA */}
              <div className="bg-primary/10 rounded-xl border border-primary/20 p-6">
                <h3 className="font-display font-bold text-foreground mb-2">Consulta Online</h3>
                <p className="text-sm text-muted-foreground mb-4">Agenda una consulta virtual con nuestros especialistas.</p>
                <Button className="w-full gap-2">
                  <Calendar className="h-4 w-4" /> Agendar Consulta
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
}
