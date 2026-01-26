import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { 
  Search, Download, Image, FileText, Video, 
  Rss, ChevronLeft, ChevronRight, Mail, Phone,
  ArrowRight, User, Palmtree, Umbrella, Utensils, Mountain, Check
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import samanaImg from "@/assets/samana.jpg";
import gastronomiImg from "@/assets/gastronomy.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import heroBeachImg from "@/assets/hero-beach.jpg";

const resources = [
  {
    id: 1,
    icon: Download,
    title: "Logotipos Oficiales",
    description: "Vectores (SVG) y PNGs transparentes.",
    action: "DESCARGAR",
  },
  {
    id: 2,
    icon: FileText,
    title: "Guía de Marca",
    description: "Manual de usos, colores y tipografía.",
    action: "DESCARGAR PDF",
  },
  {
    id: 3,
    icon: Image,
    title: "Banco de Imágenes",
    description: "Fotografía editorial en alta resolución (300dpi+).",
    action: "ACCEDER",
  },
  {
    id: 4,
    icon: Video,
    title: "Videos B-Roll",
    description: "Clips 4K sin audio para edición y noticias.",
    action: "ACCEDER",
  },
];

const pressReleases = [
  {
    id: 1,
    date: { day: 12, month: "OCTUBRE", year: 2023 },
    category: "ESTADÍSTICAS",
    title: "República Dominicana rompe récord histórico de visitantes en el tercer trimestre",
    excerpt: "Descubre República Dominicana reportó un incremento del 15% en llegadas aéreas comparado con el año anterior.",
  },
  {
    id: 2,
    date: { day: 5, month: "SEPT", year: 2023 },
    category: "SOSTENIBILIDAD",
    title: "Lanzamiento de la nueva ruta de ecoturismo en la Península de Samaná",
    excerpt: "Un proyecto conjunto para promover el turismo responsable y la conservación de la biodiversidad.",
  },
  {
    id: 3,
    date: { day: 28, month: "AGOSTO", year: 2023 },
    category: "EVENTOS",
    title: "RD será sede de la próxima Cumbre Latinoamericana de Inversión Turística",
    excerpt: "Líderes de la industria de más de 20 países se reunirán en Punta Cana para discutir el futuro del sector.",
  },
];

const categories = [
  { id: "all", label: "Todas las noticias" },
  { id: "institutional", label: "Institucional" },
  { id: "international", label: "Eventos Internacionales" },
  { id: "sustainability", label: "Sostenibilidad" },
];

const teamMembers = [
  {
    id: 1,
    name: "María González",
    role: "Directora de Comunicaciones",
    email: "mgonzalez@descubrerd.com",
    phone: "+1 (809) 555-0123",
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    role: "Prensa Internacional",
    email: "crodriguez@descubrerd.com",
    phone: "+1 (809) 555-0124",
  },
  {
    id: 3,
    name: "Solicitudes Generales",
    role: "Oficina de Prensa",
    email: "prensa@descubrerd.com",
  },
];

const interests = [
  { id: "cultura", label: "Cultura", icon: Palmtree },
  { id: "playa", label: "Playa", icon: Umbrella },
  { id: "gastronomia", label: "Gastronomía", icon: Utensils },
  { id: "aventura", label: "Aventura", icon: Mountain },
];

export default function PrensaComunicacion() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState(["all"]);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});
  
  // Newsletter state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["cultura"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleImageLoad = (id: string) => {
    setImagesLoaded(prev => ({ ...prev, [id]: true }));
  };

  const toggleCategory = (id: string) => {
    if (id === "all") {
      setSelectedCategories(["all"]);
    } else {
      const newCategories = selectedCategories.filter(c => c !== "all");
      if (newCategories.includes(id)) {
        const filtered = newCategories.filter(c => c !== id);
        setSelectedCategories(filtered.length ? filtered : ["all"]);
      } else {
        setSelectedCategories([...newCategories, id]);
      }
    }
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubscribed(true);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Hero Section */}
        <section className="relative pt-20 pb-12 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={puntaCanaImg}
              alt="República Dominicana"
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
          </div>

          <div className="relative container mx-auto px-4 lg:px-8 pt-12 text-center">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1 bg-primary/20 text-primary text-sm font-medium rounded-full mb-6"
            >
              RECURSOS PARA MEDIOS Y SUSCRIPCIONES
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl font-bold mb-4"
            >
              Sala de Prensa y Comunicación
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground max-w-2xl mx-auto mb-8"
            >
              Acceda a comunicados oficiales, imágenes en alta resolución, 
              videos y suscríbase a nuestro newsletter para recibir las últimas novedades.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-xl mx-auto flex gap-2"
            >
              <Input
                type="text"
                placeholder="Buscar comunicados, temas o fechas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-card"
              />
              <Button>Buscar</Button>
            </motion.div>
          </div>
        </section>

        {/* Tabs */}
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <Tabs defaultValue="prensa" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="prensa">Sala de Prensa</TabsTrigger>
                <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
              </TabsList>

              {/* Prensa Tab */}
              <TabsContent value="prensa">
                {/* Resources Section */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mb-16"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Recursos Descargables</h2>
                    <Link to="#" className="text-sm text-primary hover:underline">
                      Ver todo →
                    </Link>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4">
                    {resources.map((resource, index) => (
                      <motion.div
                        key={resource.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-card rounded-xl p-6 border border-border hover:border-primary/30 transition-colors"
                      >
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                          <resource.icon className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-1">{resource.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                        <button className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                          {resource.action}
                          {resource.action === "ACCEDER" ? (
                            <ArrowRight className="h-4 w-4" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>

                {/* Press Releases Section */}
                <section className="mb-16">
                  <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar Filters */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="space-y-6"
                    >
                      <div>
                        <span className="text-xs text-muted-foreground tracking-wider">ACTUALIDAD</span>
                        <h2 className="text-2xl font-bold">Últimos Comunicados</h2>
                        <p className="text-sm text-muted-foreground mt-2">
                          Manténgase informado con las noticias oficiales más recientes.
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-3">CATEGORÍAS</h3>
                        <div className="space-y-2">
                          {categories.map((category) => (
                            <label
                              key={category.id}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Checkbox
                                checked={selectedCategories.includes(category.id)}
                                onCheckedChange={() => toggleCategory(category.id)}
                              />
                              <span className="text-sm">{category.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <Button variant="outline" className="w-full gap-2">
                        <Rss className="h-4 w-4" />
                        Suscribirse al Feed
                      </Button>
                    </motion.div>

                    {/* Press Releases List */}
                    <div className="lg:col-span-3 space-y-6">
                      {pressReleases.map((release, index) => (
                        <motion.article
                          key={release.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="flex gap-6 p-6 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors"
                        >
                          <div className="text-center flex-shrink-0">
                            <p className="text-3xl font-bold text-primary">{release.date.day}</p>
                            <p className="text-xs text-muted-foreground">{release.date.month}</p>
                            <p className="text-xs text-muted-foreground">{release.date.year}</p>
                          </div>
                          
                          <div className="flex-1">
                            <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded mb-2">
                              {release.category}
                            </span>
                            <h3 className="font-bold text-lg mb-2 hover:text-primary transition-colors cursor-pointer">
                              {release.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              {release.excerpt}
                            </p>
                            <Link 
                              to="#" 
                              className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1"
                            >
                              Leer comunicado completo
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </motion.article>
                      ))}

                      <Button variant="outline" className="w-full">
                        Cargar más noticias
                      </Button>
                    </div>
                  </div>
                </section>

                {/* Gallery Section */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mb-16"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Galería Destacada</h2>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 aspect-video rounded-xl overflow-hidden relative">
                      {!imagesLoaded['gallery-1'] && (
                        <Skeleton className="absolute inset-0" />
                      )}
                      <img
                        src={puntaCanaImg}
                        alt="Gallery"
                        className={`w-full h-full object-cover transition-opacity duration-500 ${
                          imagesLoaded['gallery-1'] ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => handleImageLoad('gallery-1')}
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="aspect-video rounded-xl overflow-hidden relative">
                        {!imagesLoaded['gallery-2'] && (
                          <Skeleton className="absolute inset-0" />
                        )}
                        <img
                          src={samanaImg}
                          alt="Gallery"
                          className={`w-full h-full object-cover transition-opacity duration-500 ${
                            imagesLoaded['gallery-2'] ? 'opacity-100' : 'opacity-0'
                          }`}
                          onLoad={() => handleImageLoad('gallery-2')}
                        />
                      </div>
                      <div className="aspect-video rounded-xl overflow-hidden relative">
                        {!imagesLoaded['gallery-3'] && (
                          <Skeleton className="absolute inset-0" />
                        )}
                        <img
                          src={gastronomiImg}
                          alt="Gallery"
                          className={`w-full h-full object-cover transition-opacity duration-500 ${
                            imagesLoaded['gallery-3'] ? 'opacity-100' : 'opacity-0'
                          }`}
                          onLoad={() => handleImageLoad('gallery-3')}
                        />
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* Team Section */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">Equipo de Comunicaciones</h2>
                    <p className="text-muted-foreground">
                      Para consultas de prensa, solicitudes de entrevistas o información adicional.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {teamMembers.map((member, index) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-card rounded-xl p-6 border border-border text-center"
                      >
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <User className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-bold">{member.name}</h3>
                        <p className="text-sm text-primary mb-4">{member.role}</p>
                        
                        <div className="space-y-2 text-sm">
                          <a 
                            href={`mailto:${member.email}`}
                            className="flex items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                          >
                            <Mail className="h-4 w-4" />
                            {member.email}
                          </a>
                          {member.phone && (
                            <a 
                              href={`tel:${member.phone}`}
                              className="flex items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                            >
                              <Phone className="h-4 w-4" />
                              {member.phone}
                            </a>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              </TabsContent>

              {/* Newsletter Tab */}
              <TabsContent value="newsletter">
                <div className="max-w-lg mx-auto">
                  {isSubscribed ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-card rounded-3xl p-10 text-center border border-border"
                    >
                      <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                        <Check className="h-10 w-10 text-emerald-500" />
                      </div>
                      <h2 className="font-display text-2xl font-bold mb-3">¡Bienvenido al paraíso!</h2>
                      <p className="text-muted-foreground mb-6">
                        Tu suscripción ha sido confirmada. Pronto recibirás las mejores ofertas y secretos de República Dominicana.
                      </p>
                      <Link to="/">
                        <Button className="w-full gap-2">
                          Explorar el sitio
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card rounded-3xl p-8 md:p-10 border border-border"
                    >
                      {/* Logo */}
                      <div className="flex justify-center mb-6">
                        <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-display font-bold tracking-wider">
                          🌴 RD NEWSLETTER
                        </div>
                      </div>

                      <h1 className="font-display text-2xl md:text-3xl font-bold text-center mb-3">
                        Recibe un poco de paraíso<br />en tu bandeja de entrada
                      </h1>

                      <p className="text-muted-foreground text-center mb-8">
                        Únete a nuestra comunidad exclusiva y sé el primero en descubrir los secretos mejor guardados de República Dominicana.
                      </p>

                      <form onSubmit={handleNewsletterSubmit} className="space-y-6">
                        {/* Name & Email */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                              Nombre completo
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="name"
                                type="text"
                                placeholder="Tu nombre"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="pl-10"
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="email" className="text-sm font-medium mb-2 block">
                              Correo electrónico
                            </Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="email"
                                type="email"
                                placeholder="ejemplo@correo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {/* Interests */}
                        <div>
                          <Label className="text-sm font-medium mb-3 block">
                            Personaliza tu experiencia:
                          </Label>
                          <div className="flex flex-wrap gap-3">
                            {interests.map((interest) => {
                              const Icon = interest.icon;
                              const isSelected = selectedInterests.includes(interest.id);
                              return (
                                <button
                                  key={interest.id}
                                  type="button"
                                  onClick={() => toggleInterest(interest.id)}
                                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all ${
                                    isSelected
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "bg-card border-border hover:border-primary/50"
                                  }`}
                                >
                                  <Icon className="h-4 w-4" />
                                  <span className="text-sm font-medium">{interest.label}</span>
                                  {isSelected && <Check className="h-3.5 w-3.5" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Submit */}
                        <Button
                          type="submit"
                          size="lg"
                          className="w-full gap-2"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                              Suscribiendo...
                            </>
                          ) : (
                            <>
                              Suscribirme ahora
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </Button>

                        <p className="text-xs text-muted-foreground text-center">
                          Al suscribirte, aceptas nuestra{" "}
                          <Link to="/terminos" className="text-primary hover:underline">
                            política de privacidad
                          </Link>
                          . Prometemos no enviar spam, solo sol y playa.
                        </p>
                      </form>
                    </motion.div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
