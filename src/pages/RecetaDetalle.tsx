import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Clock, Users, ChefHat, Printer, Share2, Bookmark, Play, ChevronRight, 
  MapPin, UtensilsCrossed, ArrowLeft, Check, Sparkles, Flame, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { toast } from "sonner";
import { getRecipeBySlug, recipesData } from "@/data/recipesData";

export default function RecetaDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Retrieve current recipe dynamically
  const recipe = getRecipeBySlug(slug);

  // Reset checked ingredients when slug changes
  useEffect(() => {
    setCheckedIngredients([]);
    window.scrollTo(0, 0);
  }, [slug]);

  const toggleIngredient = (ingredient: string) => {
    setCheckedIngredients(prev => 
      prev.includes(ingredient) 
        ? prev.filter(i => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${recipe.title} - Receta Dominicana`,
        text: recipe.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? "Receta eliminada de favoritos" : "Receta guardada en tus favoritos criollos");
  };

  // Calculate ingredient completion percentage
  const allIngredientsCount = Object.values(recipe.ingredients).reduce((acc, curr) => acc + curr.length, 0);
  const completedPercent = allIngredientsCount > 0 
    ? Math.round((checkedIngredients.length / allIngredientsCount) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SEOHead
        title={`${recipe.title} - Receta Típica Dominicana`}
        description={`Aprende a preparar ${recipe.title}: ${recipe.tagline.replace(/"/g, "")} ${recipe.description}`}
        keywords={`${recipe.title}, receta dominicana, comida típica dominicana, gastronomia dominicana, ${recipe.badges.join(", ")}`}
      />
      <Header />
      
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-30 py-3">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">
            <Link to="/recetas-criollas" className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              <span>Recetario Criollo</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            <span className="font-semibold text-foreground truncate">{recipe.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShare}
              className="gap-1.5 h-8 text-xs font-medium"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Compartir</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrint}
              className="gap-1.5 h-8 text-xs font-medium hidden md:flex"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Imprimir</span>
            </Button>
            <Button 
              variant={isBookmarked ? "default" : "outline"} 
              size="sm" 
              onClick={handleBookmark}
              className="gap-1.5 h-8 text-xs font-medium"
            >
              <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? "fill-current" : ""}`} />
              <span className="hidden sm:inline">{isBookmarked ? "Guardada" : "Guardar"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[420px] md:min-h-[500px] flex items-end">
        <div className="absolute inset-0">
          <img
            src={recipe.heroImage}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/60 to-black/30" />
        </div>
        
        <div className="relative z-10 w-full container mx-auto px-4 pb-10 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl space-y-4"
          >
            <div className="flex flex-wrap gap-2">
              {recipe.badges.map((badge) => (
                <Badge 
                  key={badge} 
                  className="bg-primary hover:bg-primary text-primary-foreground font-semibold px-3 py-1 text-xs uppercase tracking-wider rounded-full shadow-lg"
                >
                  {badge}
                </Badge>
              ))}
              <Badge variant="outline" className="bg-background/40 backdrop-blur-md text-white border-white/20 gap-1 text-xs">
                <MapPin className="h-3 w-3 text-amber-400" /> {recipe.region}
              </Badge>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight drop-shadow-md">
              {recipe.title}
            </h1>

            <p className="text-base sm:text-lg text-white/90 italic font-serif leading-relaxed">
              {recipe.tagline}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Recipe Quick Meta Stats Bar */}
      <section className="bg-card border-y border-border py-4 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-2 rounded-lg">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">Tiempo Total</p>
                <p className="font-bold text-foreground text-sm sm:text-base">{recipe.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-lg">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                <ChefHat className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">Dificultad</p>
                <p className="font-bold text-foreground text-sm sm:text-base">{recipe.difficulty}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-lg">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">Rinde Para</p>
                <p className="font-bold text-foreground text-sm sm:text-base">{recipe.servings}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-lg">
              <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">Origen</p>
                <p className="font-bold text-foreground text-sm sm:text-base truncate">{recipe.region.split(',')[0]}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Recipe Content Layout */}
      <main className="container mx-auto px-4 py-10 flex-1">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column (Sticky Ingredients Checklist) */}
          <aside className="lg:col-span-4">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm sticky top-20 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                    <UtensilsCrossed className="h-5 w-5 text-primary" />
                    Ingredientes
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Marca los ingredientes que ya tienes listos</p>
                </div>
                <Badge variant="secondary" className="font-semibold text-xs">
                  {checkedIngredients.length}/{allIngredientsCount}
                </Badge>
              </div>

              {/* Progress Bar */}
              {allIngredientsCount > 0 && (
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${completedPercent}%` }}
                  />
                </div>
              )}

              {/* Categorized Ingredients */}
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
                {Object.entries(recipe.ingredients).map(([category, items]) => (
                  <div key={category} className="space-y-3">
                    <h3 className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/5 px-2.5 py-1 rounded-md inline-block">
                      {category}
                    </h3>
                    <div className="space-y-2.5">
                      {items.map((ing) => {
                        const isChecked = checkedIngredients.includes(ing);
                        return (
                          <label 
                            key={ing} 
                            className={`flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${
                              isChecked 
                                ? "bg-muted/40 border-border/50 opacity-60 line-through" 
                                : "bg-card hover:bg-muted/30 border-transparent hover:border-border"
                            }`}
                          >
                            <Checkbox 
                              checked={isChecked}
                              onCheckedChange={() => toggleIngredient(ing)}
                              className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <span className="text-sm text-foreground leading-snug select-none flex-1">
                              {ing}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Maridaje Tip Card */}
              {recipe.maridaje && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
                  <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1 text-amber-600 dark:text-amber-400">
                    <Sparkles className="h-3.5 w-3.5" /> Maridaje Criollo Sugerido
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {recipe.maridaje}
                  </p>
                </div>
              )}
            </div>
          </aside>

          {/* Right Column: History, Instructions & Related */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Description & Origin History Section */}
            <section className="bg-card rounded-2xl border border-border p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-5 w-5" />
                <h2 className="font-display text-2xl font-bold text-foreground">Historia y Tradición</h2>
              </div>
              
              <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line text-base sm:text-lg">
                {recipe.history}
              </div>

              {recipe.quote && (
                <blockquote className="p-5 bg-primary/5 border-l-4 border-primary rounded-r-2xl">
                  <p className="text-base sm:text-lg font-serif italic text-foreground leading-relaxed">
                    {recipe.quote}
                  </p>
                </blockquote>
              )}
            </section>

            {/* Step-by-Step Instructions */}
            <section className="bg-card rounded-2xl border border-border p-6 sm:p-8 space-y-8">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
                  <ChefHat className="h-7 w-7 text-primary" />
                  Instrucciones de Preparación
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Sigue cada paso con calma para obtener el auténtico sabor y sazón criollo.
                </p>
              </div>

              <div className="space-y-6">
                {recipe.steps.map((step, index) => (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    viewport={{ once: true }}
                    className="flex gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl bg-muted/20 border border-border/60 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground font-black flex items-center justify-center text-base shadow-md">
                        {step.number}
                      </div>
                    </div>
                    <div className="space-y-2 flex-1">
                      <h3 className="font-display font-bold text-lg text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Video / Culinary Experience Preview */}
            {recipe.videoImage && (
              <section className="relative rounded-2xl overflow-hidden border border-border aspect-video group">
                <img 
                  src={recipe.videoImage}
                  alt={`Preparación de ${recipe.title}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-6 text-center">
                  <Button 
                    size="lg" 
                    className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl transition-transform hover:scale-110"
                    onClick={() => toast.info("¡Video demostrativo próximamente disponible en nuestro canal oficial!")}
                  >
                    <Play className="h-8 w-8 fill-current ml-1" />
                  </Button>
                  <div className="mt-4 text-white">
                    <p className="font-bold text-lg sm:text-xl">Ver técnica tradicional en video</p>
                    <p className="text-xs sm:text-sm text-white/80">Aprende los secretos del sazón dominicano en caldero</p>
                  </div>
                </div>
              </section>
            )}

            {/* Related Recipes Carousel/Grid */}
            <section className="space-y-6 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Otros Sabores Dominicanos
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Explora más joyas de nuestra cocina criolla</p>
                </div>
                <Link to="/recetas-criollas">
                  <Button variant="ghost" size="sm" className="gap-1 text-primary text-xs font-bold">
                    Ver Todo <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {recipe.relatedRecipes.map((related, index) => (
                  <Link 
                    key={related.slug || index}
                    to={`/receta/${related.slug}`}
                    className="group"
                  >
                    <Card className="overflow-hidden border-border bg-card hover:border-primary/50 transition-all hover:shadow-md h-full flex flex-col">
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img 
                          src={related.image} 
                          alt={related.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <Badge className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white border-0 text-[10px] px-1.5 py-0.5">
                          {related.time}
                        </Badge>
                      </div>
                      <CardContent className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-primary tracking-wider">{related.category}</p>
                          <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors text-xs sm:text-sm line-clamp-2 mt-0.5">
                            {related.title}
                          </h3>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}