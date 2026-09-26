import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  ChefHat, BookOpen, Clock, Heart, Users, Sparkles, 
  ChevronRight, UtensilsCrossed, Award, Flame, Check,
  Wine, Droplets, MapPin, Share2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { BetweenSectionsAd, CompactInlineAd, PanoramaAd } from "@/components/promo";

import { criolloRecipes, type CriolloRecipe, type Ingredient } from "@/data/criolloRecipesData";

export default function RecetasCriollas() {
  const [selectedRecipe, setSelectedRecipe] = useState<CriolloRecipe>(criolloRecipes[0]);
  const [servings, setServings] = useState<number>(4);
  const [activeCategory, setActiveCategory] = useState<string>("todas");
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  const filteredRecipes = criolloRecipes.filter(r => 
    activeCategory === "todas" ? true : r.category === activeCategory
  );

  const toggleIngredient = (name: string) => {
    setCheckedIngredients(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Receta de ${selectedRecipe.name}`,
        text: selectedRecipe.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  return (
    <PageTransition>
      <SEOHead
        title="Recetas Criollas Dominicanas - Paso a Paso con Calculadora de Porciones"
        description="Aprende a cocinar los platos más emblemáticos de la gastronomía dominicana: Mangú, Sancocho de 7 Carnes, Pescado al Coco de Samaná, Habichuelas con Dulce y Morir Soñando."
        keywords="recetas dominicanas, como hacer mangu, sancocho dominicano receta, habichuelas con dulce, pescado al coco samana, gastronomia dominicana"
      />

      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <section className="relative py-16 bg-gradient-to-b from-primary/15 via-background to-background border-b border-border/60">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <Badge className="mb-3 bg-primary/20 text-primary border-primary/40 text-xs uppercase tracking-wider font-semibold">
              <ChefHat className="h-3.5 w-3.5 mr-1.5" /> Sabor Autóctono & Tradición Culinaria
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl font-black text-foreground tracking-tight mb-4">
              Recetario Maestro de la Cocina Dominicana
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Descubre los secretos culinarios de nuestras abuelas, calcula porciones interactivas y cocina paso a paso los platos más reconocidos del Caribe.
            </p>
          </div>
        </section>

        {/* Category Tabs */}
        <section className="py-4 border-b border-border/80 bg-card/40 sticky top-16 z-20 backdrop-blur-md">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar">
              {[
                { id: "todas", label: "Todas las Recetas" },
                { id: "desayuno", label: "Desayunos Típicos" },
                { id: "fuerte", label: "Platos Fuertes" },
                { id: "postre", label: "Postres Criollos" },
                { id: "bebida", label: "Bebidas & Jugos" },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Main Interactive Cooking Studio */}
        <div className="container mx-auto px-4 py-10">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Recipe Selector (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Selecciona una Receta ({filteredRecipes.length})
              </span>
              
              <div className="space-y-2.5">
                {filteredRecipes.map(recipe => (
                  <button
                    key={recipe.id}
                    onClick={() => { setSelectedRecipe(recipe); setCheckedIngredients({}); }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      selectedRecipe.id === recipe.id
                        ? "bg-primary/10 border-primary shadow-sm"
                        : "bg-card border-border/70 hover:border-primary/40 hover:bg-secondary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-display font-bold text-sm text-foreground">
                        {recipe.name}
                      </span>
                      <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                        {recipe.difficulty}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {recipe.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-primary" /> {recipe.cookTime}
                      </span>
                      <span className="text-primary font-medium flex items-center gap-0.5">
                        Ver preparación <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Interactive Recipe View (8 cols) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Recipe Header Card */}
              <div className="bg-card border border-border/70 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-xs font-semibold">
                        {selectedRecipe.region}
                      </Badge>
                      <Badge variant="secondary" className="text-xs font-medium">
                        Calorías: {selectedRecipe.calories}
                      </Badge>
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                      {selectedRecipe.name}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/receta/${selectedRecipe.id}`}>
                      <Button 
                        size="sm" 
                        className="rounded-xl text-xs gap-1.5 font-semibold"
                      >
                        <UtensilsCrossed className="h-3.5 w-3.5" /> Ficha de Receta
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleShare}
                      className="rounded-xl text-xs gap-1.5"
                    >
                      <Share2 className="h-3.5 w-3.5" /> Compartir
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {selectedRecipe.description}
                </p>

                {/* Technical Metric Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/50">
                  <div className="bg-muted/30 p-3 rounded-xl text-center border border-border/40">
                    <Clock className="h-4 w-4 text-primary mx-auto mb-1" />
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Preparación</span>
                    <p className="text-xs font-bold text-foreground">{selectedRecipe.prepTime}</p>
                  </div>

                  <div className="bg-muted/30 p-3 rounded-xl text-center border border-border/40">
                    <Flame className="h-4 w-4 text-amber-500 mx-auto mb-1" />
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Cocción</span>
                    <p className="text-xs font-bold text-foreground">{selectedRecipe.cookTime}</p>
                  </div>

                  <div className="bg-muted/30 p-3 rounded-xl text-center border border-border/40">
                    <Award className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Dificultad</span>
                    <p className="text-xs font-bold text-foreground">{selectedRecipe.difficulty}</p>
                  </div>

                  <div className="bg-muted/30 p-3 rounded-xl text-center border border-border/40">
                    <UtensilsCrossed className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Porciones</span>
                    <p className="text-xs font-bold text-primary">{servings} personas</p>
                  </div>
                </div>

                {/* Wine & Drink Pairing */}
                {selectedRecipe.maridaje && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                    <Wine className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <div className="text-xs">
                      <span className="font-bold text-amber-800 dark:text-amber-300">Maridaje Típico Sugerido:</span>{" "}
                      <span className="text-muted-foreground">{selectedRecipe.maridaje}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Portions Calculator & Ingredients Checklist */}
              <div className="bg-card border border-border/70 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                  <div>
                    <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" /> Ingredientes Requeridos
                    </h3>
                    <p className="text-xs text-muted-foreground">Marca los ingredientes que ya tienes en tu cocina</p>
                  </div>

                  {/* Servings slider */}
                  <div className="flex items-center gap-3 bg-muted/40 px-4 py-2 rounded-2xl border border-border/50">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-foreground whitespace-nowrap">{servings} comensales</span>
                    <div className="w-24">
                      <Slider
                        value={[servings]}
                        onValueChange={(val) => setServings(val[0])}
                        min={1}
                        max={12}
                        step={1}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {selectedRecipe.ingredients.map((ing, idx) => {
                    const totalQty = (ing.amountPerServing * servings);
                    const formattedQty = totalQty % 1 === 0 ? totalQty.toString() : totalQty.toFixed(1).replace('.0', '');
                    const isChecked = !!checkedIngredients[ing.name];

                    return (
                      <button
                        key={idx}
                        onClick={() => toggleIngredient(ing.name)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isChecked 
                            ? "bg-emerald-500/10 border-emerald-500/30 text-muted-foreground"
                            : "bg-muted/20 border-border/50 hover:bg-muted/40 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                            isChecked ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground"
                          }`}>
                            {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span className={`text-xs font-medium ${isChecked ? "line-through opacity-70" : ""}`}>
                            {ing.name}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-primary ml-2 whitespace-nowrap">
                          {formattedQty} {ing.unit}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step by Step Instructions */}
              <div className="bg-card border border-border/70 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2 mb-1">
                    <ChefHat className="h-5 w-5 text-primary" /> Instrucciones de Preparación Paso a Paso
                  </h3>
                  <p className="text-xs text-muted-foreground">Sigue el método tradicional para un sabor 100% auténtico</p>
                </div>

                <div className="space-y-4">
                  {selectedRecipe.instructions.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3.5 p-4 rounded-2xl bg-muted/20 border border-border/40">
                      <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Panorama Banner Ad */}
        <section className="py-6">
          <div className="container mx-auto px-4 max-w-6xl">
            <PanoramaAd showDemo />
          </div>
        </section>

        <BetweenSectionsAd showDemo />
        <Footer />
      </div>
    </PageTransition>
  );
}
