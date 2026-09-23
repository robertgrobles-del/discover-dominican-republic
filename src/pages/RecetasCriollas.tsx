import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  ChefHat, BookOpen, Clock, Heart, Users, Sparkles, 
  ChevronRight, UtensilsCrossed, Award, Flame
} from "lucide-react";

interface Ingredient {
  name: string;
  amountPerServing: number;
  unit: string;
}

interface Recipe {
  id: string;
  name: string;
  category: "fuerte" | "postre" | "bebida";
  prepTime: string;
  cookTime: string;
  difficulty: "Fácil" | "Medio" | "Complejo";
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
}

const recipes: Recipe[] = [
  {
    id: "1",
    name: "Mangú Dominicano (con los Tres Golpes)",
    category: "fuerte",
    prepTime: "15 min",
    cookTime: "20 min",
    difficulty: "Fácil",
    description: "El desayuno nacional oficial por excelencia. Plátanos verdes hervidos y machacados hasta lograr una textura suave, acompañados de salami frito, queso frito y huevos, coronado con cebollas rojas al vinagre.",
    ingredients: [
      { name: "Plátanos verdes medianos", amountPerServing: 1, unit: "unidad(es)" },
      { name: "Mantequilla", amountPerServing: 0.25, unit: "cucharada(s)" },
      { name: "Agua fría (para suavizar)", amountPerServing: 0.1, unit: "taza(s)" },
      { name: "Cebolla roja grande", amountPerServing: 0.25, unit: "unidad(es)" },
      { name: "Vinagre blanco", amountPerServing: 1, unit: "cucharadita(s)" },
      { name: "Queso de freír dominicano", amountPerServing: 2, unit: "rodaja(s)" },
      { name: "Salami dominicano", amountPerServing: 2, unit: "rodaja(s)" },
      { name: "Huevo", amountPerServing: 1, unit: "unidad(es)" }
    ],
    instructions: [
      "Pela los plátanos, córtalos por la mitad y ponlos a hervir en abundante agua con sal hasta que estén completamente suaves.",
      "Mientras tanto, corta la cebolla en aros y colócalas en vinagre con una pizca de sal durante 10 minutos. Luego sofríelas en una sartén con un poco de aceite.",
      "Fríe de forma independiente las rodajas de salami, el queso de freír y prepara el huevo al gusto (típicamente frito).",
      "Una vez los plátanos estén listos, retíralos del agua y machácalos agregando la mantequilla y agua fría gradualmente para lograr un puré extremadamente suave y libre de grumos.",
      "Sirve caliente, coloca las rodajas de salami, queso y huevo alrededor del mangú y corona con las cebollas salteadas por encima."
    ]
  },
  {
    id: "2",
    name: "Sancocho Dominicano de Siete Carnes",
    category: "fuerte",
    prepTime: "30 min",
    cookTime: "90 min",
    difficulty: "Complejo",
    description: "El rey de la gastronomía dominicana. Un espeso guisado de tubérculos locales (víveres) y carnes variadas sazonadas con cilantro y naranja agria.",
    ingredients: [
      { name: "Carne de res para guisar", amountPerServing: 80, unit: "g" },
      { name: "Carne de pollo", amountPerServing: 80, unit: "g" },
      { name: "Chuletas de cerdo", amountPerServing: 60, unit: "g" },
      { name: "Yuca en trozos", amountPerServing: 0.2, unit: "unidad(es)" },
      { name: "Plátano verde en trozos", amountPerServing: 0.2, unit: "unidad(es)" },
      { name: "Auyama (calabaza)", amountPerServing: 50, unit: "g" },
      { name: "Cilantro ancho (recaito)", amountPerServing: 0.25, unit: "atado(s)" },
      { name: "Zumo de naranja agria", amountPerServing: 1, unit: "cucharada(s)" }
    ],
    instructions: [
      "Sazona las carnes cortadas en trozos pequeños con ajo machacado, orégano, sal y un poco de zumo de naranja agria.",
      "En una olla grande, calienta aceite de oliva, agrega azúcar para caramelizar y sella las carnes hasta que doren.",
      "Agrega agua, tapa y deja cocer a fuego medio hasta que las carnes estén tiernas.",
      "Añade los víveres (yuca, plátano, auyama) y más agua caliente. Deja hervir a fuego medio-bajo hasta que se ablanden.",
      "Saca unos trozos de auyama y plátano, licúalos o machácalos y devuélvelos a la olla para espesar el caldo.",
      "Sazona al final con cilantro fresco picado y naranja agria al gusto. Sirve con arroz blanco y aguacate."
    ]
  },
  {
    id: "3",
    name: "Habichuelas con Dulce",
    category: "postre",
    prepTime: "20 min",
    cookTime: "40 min",
    difficulty: "Medio",
    description: "Postre único tradicional consumido durante la Cuaresma y Semana Santa. Crema de habichuelas rojas licuadas con leche, azúcar, batata dulce y especias.",
    ingredients: [
      { name: "Habichuelas rojas hervidas", amountPerServing: 0.5, unit: "taza(s)" },
      { name: "Leche evaporada", amountPerServing: 0.5, unit: "lata(s)" },
      { name: "Leche de coco", amountPerServing: 0.25, unit: "lata(s)" },
      { name: "Azúcar", amountPerServing: 0.25, unit: "taza(s)" },
      { name: "Batata (camote) hervida en cubos", amountPerServing: 50, unit: "g" },
      { name: "Pasas", amountPerServing: 10, unit: "g" },
      { name: "Galletitas de leche dominicanas", amountPerServing: 4, unit: "unidad(es)" },
      { name: "Astilla de canela", amountPerServing: 0.25, unit: "unidad(es)" }
    ],
    instructions: [
      "Licúa las habichuelas hervidas con su líquido de cocción y cuélalas para retirar las pieles.",
      "Vierte la crema de habichuelas en una olla grande e incorpora la leche evaporada, la leche de coco y el azúcar.",
      "Agrega la canela, los clavos de olor y los cubitos de batata previamente cocidos.",
      "Cocina a fuego medio-bajo removiendo constantemente para evitar que se pegue al fondo, hasta que la mezcla espese ligeramente.",
      "Añade las pasas y deja cocer 5 minutos más. Retira del fuego y retira las astillas de canela.",
      "Sirve tibia o fría, decorada por encima con galletitas de leche típicas con su cruz grabada."
    ]
  }
];

export default function RecetasCriollas() {
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState<number>(0);
  const [servings, setServings] = useState<number>(4);
  const [activeCategory, setActiveCategory] = useState<"all" | "fuerte" | "postre" | "bebida">("all");

  const filteredRecipes = recipes.filter(r => activeCategory === "all" || r.category === activeCategory);
  
  const currentRecipe = recipes[selectedRecipeIndex];

  return (
    <PageTransition>
      <SEOHead
        title="Recetario Dominicano Interactivo - Cocina Criolla"
        description="Aprende a cocinar Mangú, Sancocho y Habichuelas con Dulce con nuestro recetario tradicional interactivo. Ajusta porciones dinámicamente."
      />
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20">
          {/* Hero */}
          <section className="relative py-16 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border-b border-border">
            <div className="container mx-auto px-4 text-center">
              <Badge variant="secondary" className="mb-4 bg-orange-500/10 text-orange-600 border-orange-500/20 gap-1">
                <ChefHat className="h-3.5 w-3.5" /> Sabores de Quisqueya
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
                Recetario Dominicano
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Explora el sabor auténtico del Caribe en tu cocina. Ajusta el número de porciones y obtén las cantidades exactas de ingredientes de forma interactiva.
              </p>
            </div>
          </section>

          {/* Body */}
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-6xl">
              
              {/* Recipe Selector Panel */}
              <div className="grid lg:grid-cols-12 gap-8">
                
                {/* Left: Recipe List (Col 4) */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="flex gap-1.5 border-b border-border pb-3 overflow-x-auto">
                    <Button 
                      variant={activeCategory === "all" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setActiveCategory("all")}
                    >
                      Todos
                    </Button>
                    <Button 
                      variant={activeCategory === "fuerte" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setActiveCategory("fuerte")}
                    >
                      Platos
                    </Button>
                    <Button 
                      variant={activeCategory === "postre" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setActiveCategory("postre")}
                    >
                      Postres
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {filteredRecipes.map((recipe, index) => {
                      const globalIndex = recipes.findIndex(r => r.id === recipe.id);
                      return (
                        <button
                          key={recipe.id}
                          onClick={() => {
                            setSelectedRecipeIndex(globalIndex);
                            setServings(4); // reset to default
                          }}
                          className={`w-full p-3 text-left rounded-xl border text-xs transition-all flex items-center justify-between ${
                            selectedRecipeIndex === globalIndex 
                              ? "border-primary bg-primary/5 shadow-sm font-bold" 
                              : "border-border bg-card hover:bg-muted/50"
                          }`}
                        >
                          <div>
                            <span className="block font-medium">{recipe.name}</span>
                            <span className="text-[10px] text-muted-foreground block mt-1">Dificultad: {recipe.difficulty}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Recipe details and serving slider (Col 8) */}
                <div className="lg:col-span-8 space-y-6">
                  <Card className="border-2 border-primary/20">
                    <CardHeader className="bg-primary/5">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div>
                          <Badge variant="outline" className="mb-2 text-[10px] uppercase tracking-wider border-primary/30 text-primary">
                            {currentRecipe.category === "fuerte" ? "Plato Fuerte" : "Postre / Dulce"}
                          </Badge>
                          <CardTitle className="text-2xl font-display">{currentRecipe.name}</CardTitle>
                        </div>
                        <div className="flex gap-2 text-xs text-muted-foreground shrink-0">
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Prep: {currentRecipe.prepTime}</span>
                          <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5" /> Cocción: {currentRecipe.cookTime}</span>
                        </div>
                      </div>
                      <CardDescription className="text-sm pt-2">{currentRecipe.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      
                      {/* Portion slider */}
                      <div className="p-4 bg-muted/40 rounded-xl border border-border space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <label className="font-semibold flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            Ajustar Porciones (Personas)
                          </label>
                          <span className="font-bold text-primary font-mono text-base">{servings} Porciones</span>
                        </div>
                        <Slider 
                          value={[servings]}
                          onValueChange={(val) => setServings(val[0])}
                          min={1}
                          max={12}
                          step={1}
                          className="py-2"
                        />
                      </div>

                      {/* Ingredients List */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-base flex items-center gap-2">
                          <UtensilsCrossed className="h-4 w-4 text-primary" />
                          Ingredientes Necesarios
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-2 text-xs">
                          {currentRecipe.ingredients.map((ing, i) => {
                            const calculatedAmount = ing.amountPerServing * servings;
                            // Format fraction display nicely if applicable
                            const formatAmount = (num: number) => {
                              return num % 1 === 0 ? num.toString() : num.toFixed(2);
                            };
                            return (
                              <div key={i} className="flex justify-between p-2.5 bg-muted/30 rounded-lg border border-border/40">
                                <span className="text-muted-foreground">{ing.name}</span>
                                <span className="font-bold text-foreground font-mono">
                                  {formatAmount(calculatedAmount)} {ing.unit}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Step by step Instructions */}
                      <div className="space-y-3 pt-4 border-t border-border">
                        <h4 className="font-bold text-base flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          Preparación Paso a Paso
                        </h4>
                        <div className="space-y-3">
                          {currentRecipe.instructions.map((step, i) => (
                            <div key={i} className="flex gap-3 text-xs leading-relaxed">
                              <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold mt-0.5">
                                {i + 1}
                              </span>
                              <p className="text-muted-foreground">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                </div>

              </div>

            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
