import { motion } from "framer-motion";
import { 
  MapPin, Share2, Award, Star, ChevronRight, Play, Clock, ExternalLink,
  Utensils, BookOpen, Trophy, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const chef = {
  name: "Inés Páez Nin",
  alias: '"Chef Tita"',
  title: "Embajadora de la Nueva Cocina Dominicana ante el mundo.",
  description: "Rescatando sabores ancestrales con técnicas de vanguardia para elevar nuestra identidad gastronómica.",
  location: "Santo Domingo, RD",
  restaurant: "Rest. Morisoñando",
  badges: ["Chef Ejecutiva", "Cocina Dominicana"],
  bio: 'Conocida como la "Embajadora de la Nueva Cocina Dominicana", Chef Tita ha dedicado más de 20 años de carrera al rescate del patrimonio gastronómico de la isla. Su cocina es un viaje por la historia, utilizando ingredientes de pequeños productores locales para contar el relato de nuestra tierra.',
  bioContinued: 'A través de su fundación IMAGINE, utiliza la gastronomía como un arma de cambio social, empoderando comunidades rurales y pescadores. Ha llevado los sabores dominicanos a escenarios como Madrid Fusión, India, y el Congreso de los Diputados de España.',
  quote: '"Mi misión es que cada bocado cuente una historia de nuestro suelo, de nuestra gente y de nuestra herencia taína, española y africana."',
  awards: [
    { icon: Award, title: "Medalla al Mérito Civil", year: "2018" },
    { icon: Star, title: "Top 100 Mujeres Poderosas", year: "2020" },
    { icon: Utensils, title: "Embajadora Gastronómica", year: "2021" },
    { icon: BookOpen, title: "Autora Best Seller", year: "2022" }
  ]
};

const recipes = [
  {
    title: "Sancocho de 7 Carnes Deconstruido",
    description: "Una interpretación ligera y aromática del plato nacional, utilizando tubérculos orgánicos...",
    time: "45m",
    tags: ["Tradicional", "Primo"],
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop"
  },
  {
    title: "Chivo Liniero al Ron",
    description: "Carne de chivo braseada lentamente en ron dominicano añejo, servida sobre chenchén...",
    time: "2h",
    tags: ["Gourmet", "Ricuras"],
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop"
  },
  {
    title: "Centollo de Montecristi",
    description: "Fresco, cítrico y vibrante. Carne de cangrejo real con vinagreta de chinola y crocante de...",
    time: "30m",
    tags: ["Mariscos", "Fresco"],
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop"
  }
];

const galleryImages = [
  "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=400&h=300&fit=crop"
];

export default function ChefPerfil() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-end">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=1920&h=800&fit=crop"
            alt={chef.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
        </div>
        
        <div className="relative container mx-auto px-4 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="flex gap-2 mb-4">
              {chef.badges.map((badge) => (
                <span key={badge} className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                  {badge}
                </span>
              ))}
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2">
              {chef.name}
            </h1>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-red-500 italic mb-4">
              {chef.alias}
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              {chef.title} {chef.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="gap-2 bg-red-600 hover:bg-red-700">
                <Utensils className="h-4 w-4" />
                Ver Recetas Firma
              </Button>
              <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Reservar en Morisoñando
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-16">
            {/* Biography */}
            <section>
              <span className="text-red-500 text-sm font-medium uppercase tracking-wide">Biografía Profesional</span>
              <h2 className="font-display text-3xl font-bold text-foreground mt-2 mb-6">
                La Voz Gastronómica del Caribe
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed text-lg">
                  <span className="text-5xl font-display text-foreground float-left mr-3 leading-none">C</span>
                  {chef.bio}
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {chef.bioContinued}
                </p>
              </div>
              
              <blockquote className="mt-8 p-6 bg-red-600/10 border-l-4 border-red-600 rounded-r-xl">
                <p className="text-lg text-foreground italic">
                  {chef.quote}
                </p>
              </blockquote>

              {/* Awards */}
              <div className="mt-12">
                <div className="flex items-center gap-2 mb-6">
                  <Trophy className="h-5 w-5 text-red-500" />
                  <h3 className="font-display font-bold text-foreground">Reconocimientos y Premios</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {chef.awards.map((award, index) => (
                    <motion.div
                      key={award.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="bg-card rounded-xl border border-border p-4 text-center hover:border-red-500/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
                        <award.icon className="h-5 w-5 text-red-500" />
                      </div>
                      <h4 className="text-sm font-medium text-foreground">{award.title}</h4>
                      <p className="text-xs text-muted-foreground">{award.year}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Signature Dishes */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-red-500 text-xs font-medium uppercase tracking-wide">Creaciones de Autor</span>
                  <h2 className="font-display text-2xl font-bold text-foreground mt-1">
                    Platos Firma & Recetas
                  </h2>
                </div>
                <Button variant="link" className="text-red-500 gap-1">
                  Ver todas las recetas <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {recipes.map((recipe, index) => (
                  <motion.div
                    key={recipe.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-card rounded-xl overflow-hidden border border-border group cursor-pointer hover:border-red-500/50 transition-colors"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img 
                        src={recipe.image} 
                        alt={recipe.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
                        <Clock className="h-3 w-3 text-red-500" />
                        <span className="text-xs font-medium">{recipe.time}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-bold text-foreground mb-2 group-hover:text-red-500 transition-colors">
                        {recipe.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{recipe.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {recipe.tags.map((tag) => (
                            <span key={tag} className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-red-500 transition-colors" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Gallery */}
            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">Maestra en Acción</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1 row-span-2">
                  <img 
                    src={galleryImages[0]} 
                    alt="Chef en acción"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                {galleryImages.slice(1).map((img, i) => (
                  <div key={i} className="relative">
                    <img 
                      src={img} 
                      alt={`Galería ${i + 1}`}
                      className="w-full h-full object-cover rounded-xl aspect-video"
                    />
                    {i === 1 && (
                      <Button 
                        size="sm" 
                        className="absolute bottom-3 right-3 gap-1"
                      >
                        <Play className="h-3 w-3" />
                        Galería
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Profile Card */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-red-700 mx-auto mb-4 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&h=200&fit=crop"
                    alt={chef.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                    <MapPin className="h-3 w-3 text-red-500" />
                    {chef.location}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <Utensils className="h-3 w-3 text-red-500" />
                    {chef.restaurant}
                  </div>
                </div>
                <Button variant="outline" className="w-full gap-2">
                  <Share2 className="h-4 w-4" />
                  Compartir Perfil
                </Button>
              </div>

              {/* CTA Card */}
              <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6 text-center">
                <h3 className="font-display text-xl font-bold text-white mb-2">
                  Vive la Experiencia Gastronómica
                </h3>
                <p className="text-red-100 text-sm mb-6">
                  Reserva una mesa en Morisoñando o descubre las rutas gastronómicas curadas por Chef Tita alrededor de la isla.
                </p>
                <div className="flex flex-col gap-3">
                  <Button className="w-full bg-white text-red-600 hover:bg-red-50">
                    Reservar Ahora
                  </Button>
                  <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">
                    Ver Rutas de Sabor
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}