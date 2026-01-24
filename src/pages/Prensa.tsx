import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { 
  Search, Download, Image, FileText, Video, 
  Rss, ChevronLeft, ChevronRight, Mail, Phone,
  ArrowRight
} from "lucide-react";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import samanaImg from "@/assets/samana.jpg";
import gastronomiImg from "@/assets/gastronomy.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";

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
    excerpt: "Descubre República Dominicana reportó un incremento del 15% en llegadas aéreas comparado con el año anterior, consolidando el liderazgo en el Caribe.",
  },
  {
    id: 2,
    date: { day: 5, month: "SEPT", year: 2023 },
    category: "SOSTENIBILIDAD",
    title: "Lanzamiento de la nueva ruta de ecoturismo en la Península de Samaná",
    excerpt: "Un proyecto conjunto para promover el turismo responsable y la conservación de la biodiversidad en la región noreste.",
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

const galleryImages = [
  { id: 1, image: puntaCanaImg, size: "large" },
  { id: 2, image: samanaImg, size: "small" },
  { id: 3, image: gastronomiImg, size: "small" },
  { id: 4, image: santoDomingoImg, size: "large" },
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
    hours: "Lun-Vie: 9am - 5pm",
  },
];

export default function Prensa() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState(["all"]);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

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

  return (
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
            RECURSOS PARA MEDIOS
          </motion.span>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl font-bold mb-4"
          >
            Sala de Prensa Oficial
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Acceda a comunicados oficiales, imágenes en alta resolución, 
            videos y recursos exclusivos para periodistas y creadores de contenido.
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

      <main className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
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
                    Manténgase informado con las noticias oficiales más recientes sobre el 
                    turismo en República Dominicana.
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentGalleryIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentGalleryIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentGalleryIndex(prev => Math.min(1, prev + 1))}
                  disabled={currentGalleryIndex === 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
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
              <div className="col-span-3 aspect-[3/1] rounded-xl overflow-hidden relative">
                {!imagesLoaded['gallery-4'] && (
                  <Skeleton className="absolute inset-0" />
                )}
                <img
                  src={santoDomingoImg}
                  alt="Gallery"
                  className={`w-full h-full object-cover transition-opacity duration-500 ${
                    imagesLoaded['gallery-4'] ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => handleImageLoad('gallery-4')}
                />
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
                Para consultas de prensa, solicitudes de entrevistas o información adicional, 
                por favor contacte a nuestro equipo de Relaciones Públicas.
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
                    <span className="text-2xl">👤</span>
                  </div>
                  <h3 className="font-bold">{member.name}</h3>
                  <p className="text-sm text-primary mb-4">{member.role}</p>
                  
                  <div className="space-y-2 text-sm">
                    <a 
                      href={`mailto:${member.email}`}
                      className="flex items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      {member.email}
                    </a>
                    {member.phone && (
                      <a 
                        href={`tel:${member.phone}`}
                        className="flex items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        {member.phone}
                      </a>
                    )}
                    {member.hours && (
                      <p className="text-muted-foreground">
                        🕐 {member.hours}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
}